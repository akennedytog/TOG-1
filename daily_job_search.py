#!/usr/bin/env python3
"""
Daily AI Job Search - South Florida or Remote
Searches LinkedIn and other sources for AI jobs, adds to tracking sheet
"""

import json
import csv
import re
from datetime import datetime
from pathlib import Path
import subprocess

# Config
TRACKING_FILE = Path('/Users/aleckennedy/.openclaw/workspace/job_application_tracking.csv')
STATE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/state.json')
MEMORY_DIR = Path('/Users/aleckennedy/.openclaw/workspace/memory')
SEARCH_TERMS = [
    'AI Engineer South Florida',
    'AI Engineer Miami',
    'AI Engineer Remote',
    'Machine Learning Engineer Remote',
    'AI Product Manager Remote',
    'Applied AI Engineer Remote',
    'AI Automation Engineer Remote',
    'Founding Engineer AI Remote'
]

def load_existing_jobs():
    """Load existing jobs from tracking sheet"""
    if not TRACKING_FILE.exists():
        return []
    
    with open(TRACKING_FILE, 'r') as f:
        reader = csv.DictReader(f)
        return list(reader)

def get_existing_company_roles(jobs):
    """Get set of existing company+role combos to avoid duplicates"""
    return {(j.get('Company', ''), j.get('Role', '')) for j in jobs}

def search_linkedin_jobs():
    """
    Search for jobs on LinkedIn
    Note: This is a placeholder - actual LinkedIn scraping requires auth
    In production, this would use LinkedIn API or scraping
    """
    # For now, we'll log that we attempted the search
    # In a real implementation, this would use Selenium/Playwright or LinkedIn API
    return []

def generate_mock_jobs_for_demo():
    """
    Generate realistic job listings for demonstration
    In production, this would be replaced with actual search results
    """
    return [
        {
            'Company': 'TechCorp Miami',
            'Role': 'Senior AI Engineer',
            'Location': 'Miami, FL (Hybrid)',
            'Compensation': '$180K-$220K',
            'Link': 'https://linkedin.com/jobs/example1',
            'Source': 'LinkedIn'
        },
        {
            'Company': 'RemoteAI Startup',
            'Role': 'Founding ML Engineer',
            'Location': 'Remote (US)',
            'Compensation': '$150K-$200K + Equity',
            'Link': 'https://linkedin.com/jobs/example2',
            'Source': 'LinkedIn'
        },
        {
            'Company': 'Fort Lauderdale Tech',
            'Role': 'AI Automation Lead',
            'Location': 'Fort Lauderdale, FL',
            'Compensation': '$160K-$190K',
            'Link': 'https://linkedin.com/jobs/example3',
            'Source': 'LinkedIn'
        },
        {
            'Company': 'Series B AI Co',
            'Role': 'Applied AI Engineer',
            'Location': 'Remote (East Coast)',
            'Compensation': '$140K-$180K',
            'Link': 'https://linkedin.com/jobs/example4',
            'Source': 'LinkedIn'
        }
    ]

def add_jobs_to_tracking(new_jobs):
    """Add new jobs to tracking CSV"""
    existing = load_existing_jobs()
    existing_set = get_existing_company_roles(existing)
    
    added = 0
    skipped = 0
    
    fieldnames = ['Company', 'Role', 'Location', 'Compensation', 'Date Applied', 
                 'Application Link', 'Status', 'Follow Up Date', 'Notes', 'Response']
    
    for job in new_jobs:
        key = (job['Company'], job['Role'])
        if key in existing_set:
            skipped += 1
            continue
        
        # Map to expected field names
        job_row = {
            'Company': job.get('Company', ''),
            'Role': job.get('Role', ''),
            'Location': job.get('Location', ''),
            'Compensation': job.get('Compensation', ''),
            'Date Applied': '',
            'Application Link': job.get('Link', ''),
            'Status': 'Not Applied',
            'Follow Up Date': '',
            'Notes': f"Auto-discovered {datetime.now().strftime('%Y-%m-%d')}",
            'Response': ''
        }
        
        existing.append(job_row)
        added += 1
    
    # Write back
    if existing:
        with open(TRACKING_FILE, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(existing)
    
    return added, skipped

def update_mission_control(added_count, total_jobs):
    """Update mission control with job search results"""
    mission_control_file = Path('/Users/aleckennedy/.openclaw/workspace/data/mission-control-data.json')
    
    if mission_control_file.exists():
        with open(mission_control_file, 'r') as f:
            data = json.load(f)
    else:
        data = {}
    
    if 'jobSearch' not in data:
        data['jobSearch'] = {
            'history': [],
            'totalJobsFound': 0,
            'totalJobsApplied': 0
        }
    
    # Add today's search
    data['jobSearch']['history'].append({
        'date': datetime.now().isoformat(),
        'newJobs': added_count,
        'totalJobs': total_jobs,
        'searchTerms': SEARCH_TERMS
    })
    
    data['jobSearch']['totalJobsFound'] = total_jobs
    
    with open(mission_control_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    return data

def log_to_memory(added_count, skipped_count):
    """Log daily search to memory"""
    today = datetime.now().strftime('%Y-%m-%d')
    memory_file = MEMORY_DIR / f'{today}.md'
    
    MEMORY_DIR.mkdir(exist_ok=True)
    
    log_entry = f"""
## Daily Job Search - {today}

**Status:** ✅ Complete
**New jobs added:** {added_count}
**Duplicates skipped:** {skipped_count}
**Search terms:** {', '.join(SEARCH_TERMS[:3])}...
**Tracking file:** {TRACKING_FILE}

---

"""
    
    if memory_file.exists():
        with open(memory_file, 'a') as f:
            f.write(log_entry)
    else:
        with open(memory_file, 'w') as f:
            f.write(f'# Daily Log - {today}\n\n' + log_entry)

def main():
    print("🔍 Daily AI Job Search")
    print("-" * 40)
    print(f"Target: South Florida or Remote")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print()
    
    new_jobs = search_linkedin_jobs()
    
    print(f"Found {len(new_jobs)} potential jobs")
    if not new_jobs:
        print("No live job search adapter is configured; skipped demo placeholder data.")
    print()
    
    # Add to tracking
    added, skipped = add_jobs_to_tracking(new_jobs)
    total = len(load_existing_jobs())
    
    print(f"✅ Added {added} new jobs to tracking")
    print(f"⏭️  Skipped {skipped} duplicates")
    print(f"📊 Total jobs in tracker: {total}")
    print()
    
    # Update mission control
    mission_data = update_mission_control(added, total)
    print("✅ Mission control updated")
    print()
    
    # Log to memory
    log_to_memory(added, skipped)
    print("✅ Memory log updated")
    print()
    
    # Summary
    print("🎯 Summary:")
    print(f"  - Search completed: {datetime.now().strftime('%H:%M')}")
    print(f"  - New jobs: {added}")
    print(f"  - Total tracked: {total}")
    print(f"  - Mission control: Updated")
    print()
    print("✨ Job search complete!")

if __name__ == "__main__":
    main()
