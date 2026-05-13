#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime

# Create tweet
state = json.loads(Path('/Users/aleckennedy/.openclaw/workspace/state.json').read_text())

tweet = """Just finished rebuilding our entire site.

What's new:
✨ New logo + branding
📊 Clear pricing ($250 audit → $1,997 full system)
🎓 Free workshop page (May 20th)
🤖 8-agent system showcased
📈 Analytics + SEO everywhere

Built the whole thing using agents. Felt appropriate.

Check it out: https://theonegroup.info

#AIautomation #SMB #SouthFlorida #buildinpublic"""

print(tweet)

# Save to state
state['twitterQueue'].append({
    'id': f"manual_{int(datetime.now().timestamp())}",
    'status': 'queued',
    'text': tweet,
    'scheduledFor': 'now',
    'source': 'Manual',
    'createdAt': datetime.now().isoformat()
})

Path('/Users/aleckennedy/.openclaw/workspace/state.json').write_text(json.dumps(state, indent=2))

print("\n✅ Tweet queued!")
