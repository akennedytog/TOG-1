#!/usr/bin/env python3
"""
Scout Email Integration - Gmail API wrapper
"""

import os
import base64
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Gmail API imports
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GMAIL_AVAILABLE = True
except ImportError:
    GMAIL_AVAILABLE = False
    print("Warning: Google API libraries not installed. Run: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")

from scout_db import ScoutDatabase, Contact, Deal, Activity, db

# Gmail API scopes
SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
]

class ScoutEmail:
    """Gmail integration for Scout CRM"""
    
    def __init__(self):
        self.service = None
        self.db = db
        self.token_file = Path('/Users/aleckennedy/.openclaw/workspace/gmail_token.json')
        self.credentials_file = Path('/Users/aleckennedy/.openclaw/workspace/gmail_credentials.json')
    
    def authenticate_gmail(self) -> bool:
        """Authenticate with Gmail using OAuth2"""
        if not GMAIL_AVAILABLE:
            print("Gmail API not available. Install required packages.")
            return False
        
        creds = None
        
        # Load existing token
        if self.token_file.exists():
            creds = Credentials.from_authorized_user_file(str(self.token_file), SCOPES)
        
        # If no valid credentials, let user log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not self.credentials_file.exists():
                    print(f"Error: {self.credentials_file} not found.")
                    print("Create it from Google Cloud Console > APIs & Services > Credentials")
                    return False
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(self.credentials_file), SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save token for future runs
            with open(self.token_file, 'w') as token:
                token.write(creds.to_json())
        
        self.service = build('gmail', 'v1', credentials=creds)
        return True
    
    def send_email(self, to: str, subject: str, body: str, 
                   from_address: Optional[str] = None,
                   html_body: Optional[str] = None) -> Optional[Dict]:
        """Send an email via Gmail API"""
        if not self.service:
            if not self.authenticate_gmail():
                return None
        
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['to'] = to
            message['subject'] = subject
            
            if from_address:
                message['from'] = from_address
            
            # Attach plain text
            message.attach(MIMEText(body, 'plain'))
            
            # Attach HTML if provided
            if html_body:
                message.attach(MIMEText(html_body, 'html'))
            
            # Encode and send
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            sent_message = self.service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            print(f"Email sent! ID: {sent_message['id']}")
            
            return {
                'id': sent_message['id'],
                'thread_id': sent_message.get('threadId'),
                'label_ids': sent_message.get('labelIds', [])
            }
            
        except HttpError as e:
            print(f"Error sending email: {e}")
            return None
    
    def sync_inbox(self, days_back: int = 7) -> List[Dict]:
        """Sync Gmail inbox and match emails to contacts"""
        if not self.service:
            if not self.authenticate_gmail():
                return []
        
        synced_emails = []
        
        try:
            # Calculate date for query
            since_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y/%m/%d')
            
            # Search for emails after date
            query = f'after:{since_date}'
            
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=100
            ).execute()
            
            messages = results.get('messages', [])
            
            for msg in messages:
                # Get full message
                message = self.service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='full'
                ).execute()
                
                # Extract email data
                email_data = self._parse_email(message)
                
                # Match to contact
                matched_contact = self._match_email_to_contact(email_data['from'])
                
                if matched_contact:
                    # Log as activity
                    activity = Activity(
                        id=f"email_{msg['id']}",
                        type='email',
                        contact_id=matched_contact.id,
                        subject=email_data['subject'][:200],
                        description=email_data['snippet'][:500],
                        metadata={
                            'gmail_id': msg['id'],
                            'thread_id': message.get('threadId'),
                            'labels': message.get('labelIds', [])
                        }
                    )
                    self.db.create_activity(activity)
                    
                    synced_emails.append({
                        'gmail_id': msg['id'],
                        'contact_id': matched_contact.id,
                        'subject': email_data['subject'],
                        'from': email_data['from'],
                        'synced': True
                    })
                else:
                    synced_emails.append({
                        'gmail_id': msg['id'],
                        'subject': email_data['subject'],
                        'from': email_data['from'],
                        'synced': False
                    })
            
            return synced_emails
            
        except HttpError as e:
            print(f"Error syncing inbox: {e}")
            return []
    
    def _parse_email(self, message: Dict) -> Dict:
        """Parse Gmail message to extract relevant data"""
        headers = message.get('payload', {}).get('headers', [])
        
        email_data = {
            'id': message['id'],
            'thread_id': message.get('threadId'),
            'labels': message.get('labelIds', []),
            'snippet': message.get('snippet', ''),
            'from': '',
            'to': '',
            'subject': '',
            'date': ''
        }
        
        for header in headers:
            name = header['name'].lower()
            if name == 'from':
                email_data['from'] = header['value']
            elif name == 'to':
                email_data['to'] = header['value']
            elif name == 'subject':
                email_data['subject'] = header['value']
            elif name == 'date':
                email_data['date'] = header['value']
        
        return email_data
    
    def _match_email_to_contact(self, from_address: str) -> Optional[Contact]:
        """Match email address to a contact in the database"""
        # Extract email from "Name <email@example.com>" format
        import re
        email_match = re.search(r'<([^>]+)>', from_address)
        if email_match:
            email = email_match.group(1).lower()
        else:
            email = from_address.lower().strip()
        
        return self.db.get_contact_by_email(email)
    
    def log_sent_email(self, to: str, subject: str, body: str, 
                       contact_id: Optional[str] = None,
                       deal_id: Optional[str] = None) -> Optional[Activity]:
        """Log a sent email as an activity"""
        activity = Activity(
            id=f"sent_email_{datetime.now().timestamp()}",
            type='email',
            contact_id=contact_id,
            deal_id=deal_id,
            subject=f"Sent: {subject[:200]}",
            description=body[:500],
            outcome='sent',
            metadata={
                'to': to,
                'sent_at': datetime.now().isoformat()
            }
        )
        
        return self.db.create_activity(activity)
    
    def get_email_thread(self, thread_id: str) -> Optional[Dict]:
        """Get full email thread by ID"""
        if not self.service:
            return None
        
        try:
            thread = self.service.users().threads().get(
                userId='me',
                id=thread_id
            ).execute()
            
            messages = []
            for msg in thread.get('messages', []):
                messages.append(self._parse_email(msg))
            
            return {
                'id': thread_id,
                'messages': messages
            }
            
        except HttpError as e:
            print(f"Error getting thread: {e}")
            return None


# Initialize singleton
scout_email = ScoutEmail()


if __name__ == "__main__":
    print("Scout Email Integration")
    print("=" * 50)
    
    # Test authentication
    if scout_email.authenticate_gmail():
        print("✓ Gmail authenticated successfully!")
        
        # Test sync
        print("\nSyncing inbox (last 7 days)...")
        synced = scout_email.sync_inbox(days_back=7)
        print(f"Synced {len(synced)} emails")
        for email in synced[:5]:
            status = "✓" if email['synced'] else "○"
            print(f"  {status} {email.get('subject', 'No subject')[:50]}")
    else:
        print("✗ Gmail authentication failed")
        print("\nSetup required:")
        print("1. Go to https://console.cloud.google.com/")
        print("2. Create project or select existing")
        print("3. Enable Gmail API")
        print("4. Create OAuth2 credentials (Desktop app)")
        print("5. Download JSON as gmail_credentials.json")
        print("6. Place in ~/.openclaw/workspace/")
