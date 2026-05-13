#!/usr/bin/env python3
"""
Create Google Form for Miami Music Week - Using Service Account
"""

import json
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Path to credentials
CREDS_PATH = os.path.expanduser('~/.openclaw/workspace/google-credentials.json')

# Load credentials
try:
    with open(CREDS_PATH) as f:
        creds_info = json.load(f)
    print(f"✅ Loaded credentials from {CREDS_PATH}")
    print(f"   Project ID: {creds_info.get('project_id', 'N/A')}")
    print(f"   Client ID: {creds_info.get('client_id', 'N/A')[:20]}...")
except Exception as e:
    print(f"❌ Error loading credentials: {e}")
    exit(1)

# Check if it's a service account or OAuth client
if creds_info.get('type') == 'service_account':
    print("\n📋 Detected Service Account credentials")
    print("Service accounts can create forms/sheets directly!")
    
    # Service account flow
    SCOPES = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/forms',
        'https://www.googleapis.com/auth/spreadsheets'
    ]
    
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDS_PATH, scopes=SCOPES)
        
        # Build Forms service
        forms_service = build('forms', 'v1', credentials=credentials)
        
        # Create form
        form_body = {
            'info': {
                'title': 'Miami Music Week 2026 - Event Submission',
                'description': 'Submit an event for the community-powered MMW 2026 guide'
            }
        }
        
        form = forms_service.forms().create(body=form_body).execute()
        form_id = form['formId']
        form_url = f"https://docs.google.com/forms/d/{form_id}/viewform"
        
        print(f"\n✅ Form created!")
        print(f"   Form ID: {form_id}")
        print(f"   Form URL: {form_url}")
        
        # Add questions
        questions = [
            {
                'title': 'Event Name',
                'type': 'TEXT',
                'required': True
            },
            {
                'title': 'Venue / Location',
                'type': 'TEXT',
                'required': True
            },
            {
                'title': 'Event Date',
                'type': 'DATE',
                'required': True
            },
            {
                'title': 'Start Time',
                'type': 'TEXT',
                'helpText': 'e.g., 10:00 PM',
                'required': True
            },
            {
                'title': 'End Time',
                'type': 'TEXT',
                'helpText': 'e.g., 6:00 AM (Optional)',
                'required': False
            },
            {
                'title': 'Ticket Price',
                'type': 'TEXT',
                'helpText': 'e.g., $50-$100',
                'required': True
            },
            {
                'title': 'Genre / Music Style',
                'type': 'MULTIPLE_CHOICE',
                'options': ['House', 'Techno', 'Tech House', 'Deep House', 'EDM / Dance Pop', 
                           'Trance', 'Drum & Bass', 'Hip Hop / R&B', 'Multi-Genre', 'Other'],
                'required': True
            },
            {
                'title': 'Ticket Link',
                'type': 'TEXT',
                'helpText': 'Direct URL to buy tickets',
                'required': True
            },
            {
                'title': 'Event Description',
                'type': 'PARAGRAPH',
                'helpText': 'Lineup, special notes, etc. (Optional)',
                'required': False
            },
            {
                'title': 'Your Email',
                'type': 'TEXT',
                'helpText': 'For confirmation when added',
                'required': True
            },
            {
                'title': 'Your Twitter Handle',
                'type': 'TEXT',
                'helpText': 'e.g., @yourhandle - we will give you credit! (Optional)',
                'required': False
            }
        ]
        
        print("\n➕ Adding questions...")
        for q in questions:
            question_body = {
                'requests': [{
                    'createItem': {
                        'item': {
                            'title': q['title'],
                            'questionItem': {
                                'question': {
                                    'required': q.get('required', False)
                                }
                            }
                        },
                        'location': {'index': 0}
                    }
                }]
            }
            forms_service.forms().batchUpdate(formId=form_id, body=question_body).execute()
        
        print(f"   Added {len(questions)} questions")
        
        # Create spreadsheet for responses
        sheets_service = build('sheets', 'v4', credentials=credentials)
        
        sheet_body = {
            'properties': {
                'title': 'MMW 2026 Event Submissions'
            }
        }
        
        sheet = sheets_service.spreadsheets().create(body=sheet_body).execute()
        sheet_id = sheet['spreadsheetId']
        sheet_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/edit"
        
        print(f"\n✅ Spreadsheet created!")
        print(f"   Sheet ID: {sheet_id}")
        print(f"   Sheet URL: {sheet_url}")
        
        # Make sheet public
        drive_service = build('drive', 'v3', credentials=credentials)
        
        drive_service.permissions().create(
            fileId=sheet_id,
            body={
                'role': 'reader',
                'type': 'anyone'
            }
        ).execute()
        
        print("   Sheet is now public (anyone with link can view)")
        
        # Link form to spreadsheet
        forms_service.forms().batchUpdate(
            formId=form_id,
            body={
                'includeFormInResponseEmail': True,
                'destination': {
                    'spreadsheetId': sheet_id
                }
            }
        ).execute()
        
        print("   Form linked to spreadsheet")
        
        # Save URLs to file
        output = f"""# Miami Music Week 2026 - Google Form URLs

Form URL (for submissions): {form_url}
Form ID: {form_id}

Spreadsheet URL (public view): {sheet_url}
Sheet ID: {sheet_id}

# Update your mmw-2026.html with:
# Form URL: {form_url}
# Sheet ID: {sheet_id}
"""
        
        with open(os.path.expanduser('~/.openclaw/workspace/MMW-FORM-URLS.txt'), 'w') as f:
            f.write(output)
        
        print(f"\n📄 URLs saved to: MMW-FORM-URLS.txt")
        print("\n" + "="*60)
        print("NEXT STEPS:")
        print("="*60)
        print(f"1. Update mmw-2026.html with these URLs")
        print(f"2. Deploy: cd theonegroup-site && bash deploy.sh prod")
        print(f"3. Tweet the form URL to get community submissions")
        
    except HttpError as e:
        print(f"\n❌ API Error: {e}")
        print("The credentials may not have Forms/Sheets API enabled.")
        print("\nTo fix:")
        print("1. Go to https://console.cloud.google.com/apis/library")
        print("2. Enable 'Google Forms API'")
        print("3. Enable 'Google Sheets API'")
        print("4. Enable 'Google Drive API'")
        print("5. Try again")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()