#!/usr/bin/env python3
"""
Scout Calendar Integration - Google Calendar API
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    CALENDAR_AVAILABLE = True
except ImportError:
    CALENDAR_AVAILABLE = False
    print("Warning: Google Calendar API not available")

from scout_db import ScoutDatabase, Activity, Contact, Deal, db

# Calendar API scopes
SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events']

class ScoutCalendar:
    """Google Calendar integration for Scout CRM"""
    
    def __init__(self):
        self.service = None
        self.db = db
        self.token_file = Path('/Users/aleckennedy/.openclaw/workspace/calendar_token.json')
        self.credentials_file = Path('/Users/aleckennedy/.openclaw/workspace/calendar_credentials.json')
    
    def authenticate(self) -> bool:
        """Authenticate with Google Calendar"""
        if not CALENDAR_AVAILABLE:
            print("Calendar API not available")
            return False
        
        creds = None
        
        if self.token_file.exists():
            creds = Credentials.from_authorized_user_file(str(self.token_file), SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not self.credentials_file.exists():
                    print(f"Error: {self.credentials_file} not found")
                    return False
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(self.credentials_file), SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open(self.token_file, 'w') as token:
                token.write(creds.to_json())
        
        self.service = build('calendar', 'v3', credentials=creds)
        return True
    
    def create_meeting(self, title: str, start_time: datetime, end_time: datetime,
                      attendees: List[str], description: str = "",
                      contact_id: Optional[str] = None,
                      deal_id: Optional[str] = None) -> Optional[Dict]:
        """Create a calendar event"""
        if not self.service:
            if not self.authenticate():
                return None
        
        event = {
            'summary': title,
            'description': description,
            'start': {
                'dateTime': start_time.isoformat(),
                'timeZone': 'America/New_York'
            },
            'end': {
                'dateTime': end_time.isoformat(),
                'timeZone': 'America/New_York'
            },
            'attendees': [{'email': email} for email in attendees],
            'conferenceData': {
                'createRequest': {
                    'requestId': f"scout-{datetime.now().timestamp()}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 60},
                    {'method': 'popup', 'minutes': 10}
                ]
            }
        }
        
        try:
            event = self.service.events().insert(
                calendarId='primary',
                body=event,
                conferenceDataVersion=1
            ).execute()
            
            # Log as activity
            activity = Activity(
                id=f"meeting_{event['id']}",
                type='meeting',
                contact_id=contact_id,
                deal_id=deal_id,
                subject=title,
                description=description,
                scheduled_at=start_time.isoformat(),
                metadata={
                    'calendar_event_id': event['id'],
                    'meet_link': event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri', ''),
                    'attendees': attendees
                }
            )
            self.db.create_activity(activity)
            
            return {
                'id': event['id'],
                'html_link': event['htmlLink'],
                'meet_link': event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri', '')
            }
            
        except HttpError as e:
            print(f"Error creating event: {e}")
            return None
    
    def get_upcoming_meetings(self, days: int = 7) -> List[Dict]:
        """Get upcoming meetings"""
        if not self.service:
            if not self.authenticate():
                return []
        
        now = datetime.utcnow()
        time_min = now.isoformat() + 'Z'
        time_max = (now + timedelta(days=days)).isoformat() + 'Z'
        
        try:
            events_result = self.service.events().list(
                calendarId='primary',
                timeMin=time_min,
                timeMax=time_max,
                maxResults=50,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            meetings = []
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                meetings.append({
                    'id': event['id'],
                    'title': event['summary'],
                    'start': start,
                    'description': event.get('description', ''),
                    'attendees': [a.get('email') for a in event.get('attendees', [])],
                    'link': event.get('htmlLink', ''),
                    'meet_link': event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri', '')
                })
            
            return meetings
            
        except HttpError as e:
            print(f"Error fetching events: {e}")
            return []
    
    def sync_meetings_to_activities(self, days: int = 30) -> int:
        """Sync calendar meetings to CRM activities"""
        meetings = self.get_upcoming_meetings(days=days)
        synced = 0
        
        for meeting in meetings:
            # Match attendees to contacts
            for attendee_email in meeting['attendees']:
                contact = self.db.get_contact_by_email(attendee_email)
                if contact:
                    # Check if activity already exists
                    existing = self.db.get_activities(
                        contact_id=contact.id,
                        activity_type='meeting',
                        limit=10
                    )
                    
                    # Avoid duplicates
                    if not any(a.metadata.get('calendar_event_id') == meeting['id'] for a in existing):
                        activity = Activity(
                            id=f"cal_{meeting['id']}_{synced}",
                            type='meeting',
                            contact_id=contact.id,
                            subject=meeting['title'],
                            description=meeting['description'],
                            scheduled_at=meeting['start'],
                            metadata={
                                'calendar_event_id': meeting['id'],
                                'meet_link': meeting.get('meet_link', ''),
                                'source': 'google_calendar'
                            }
                        )
                        self.db.create_activity(activity)
                        synced += 1
        
        return synced


# Initialize
scout_calendar = ScoutCalendar()


if __name__ == "__main__":
    print("Scout Calendar Integration")
    print("=" * 50)
    
    if scout_calendar.authenticate():
        print("✓ Calendar authenticated!")
        
        print("\nUpcoming meetings:")
        meetings = scout_calendar.get_upcoming_meetings(days=7)
        for m in meetings[:5]:
            print(f"  {m['start'][:10]}: {m['title']}")
    else:
        print("✗ Calendar auth failed")
