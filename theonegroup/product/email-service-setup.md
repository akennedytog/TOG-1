# Email Service Setup Guide for TheOneGroupAI

**Date:** March 14, 2026  
**Purpose:** Newsletter and beta signup notifications

---

## Executive Summary

After comparing ConvertKit (Kit), Mailchimp, and Substack for TheOneGroupAI's needs, **ConvertKit (Kit)** is the recommended choice for the following reasons:

- **Generous free tier:** Up to 10,000 subscribers (vs Mailchimp's 250 contacts)
- **Full API access on free tier:** Unlike Mailchimp which requires paid plans for API
- **Creator-focused:** Built specifically for newsletters and content creators
- **Simple automation:** Visual automation builder included on free tier
- **No platform lock-in:** Easy to export subscribers if needed

---

## Service Comparison

### 1. ConvertKit (Kit) - RECOMMENDED

| Feature | Details |
|---------|---------|
| **Free Tier Limit** | Up to 10,000 subscribers |
| **Monthly Email Sends** | Unlimited (on free tier) |
| **API Access** | ✅ Full API access on free tier |
| **Automation** | ✅ 1 email sequence on free, unlimited on paid |
| **Landing Pages** | ✅ Unlimited |
| **Forms** | ✅ Unlimited |
| **Cost at 100 subs** | $0 (free) |
| **Cost at 1,000 subs** | $0 (free) |
| **Paid Plan Start** | $33/month (Creator plan) |

**Pros:**
- Best free tier for growing newsletters
- Full API access without paying
- Built for creators/newsletters
- Clean, simple interface
- Excellent deliverability
- Tag-based segmentation

**Cons:**
- Limited to 1 automated sequence on free tier
- Fewer e-commerce features than Mailchimp

---

### 2. Mailchimp

| Feature | Details |
|---------|---------|
| **Free Tier Limit** | Up to 250 contacts |
| **Monthly Email Sends** | Max 500/month or 250/day |
| **API Access** | ❌ Requires paid plan ($13+/month) |
| **Automation** | ❌ Limited on free (4 flow steps max) |
| **Landing Pages** | ✅ Available |
| **Forms** | ✅ Available |
| **Cost at 100 subs** | $0 (free) |
| **Cost at 1,000 subs** | $13-20/month (Essentials/Standard) |
| **Paid Plan Start** | $13/month (Essentials) |

**Pros:**
- Mature platform with extensive features
- Great for e-commerce integration
- Advanced reporting
- 300+ integrations

**Cons:**
- API locked behind paid plans
- Very limited free tier (250 contacts)
- More complex interface
- Gets expensive quickly

---

### 3. Substack

| Feature | Details |
|---------|---------|
| **Free Tier Limit** | Unlimited subscribers (free newsletters) |
| **Monthly Email Sends** | Unlimited |
| **API Access** | ❌ No official API for automation |
| **Automation** | ❌ No automation features |
| **Landing Pages** | ✅ Built-in publication page |
| **Forms** | ✅ Basic embeddable form |
| **Cost at 100 subs** | $0 |
| **Cost at 1,000 subs** | $0 (free tier) |
| **Paid Plan** | Revenue share model (10% of paid subscriptions) |

**Pros:**
- Completely free for free newsletters
- Built-in discovery/network effects
- Simple setup
- Great for writers/creators

**Cons:**
- **No API for programmatic subscriber management**
- No automation capabilities
- Limited customization
- Not suitable for beta signup workflows
- Platform lock-in (harder to migrate)

---

## Recommendation: ConvertKit (Kit)

**Why ConvertKit wins for TheOneGroupAI:**

1. **API Access for Beta Signups:** You can programmatically add beta users via API
2. **Scalable Free Tier:** 10,000 subscribers gives you room to grow without immediate costs
3. **Newsletter + Automation:** Can handle both newsletter broadcasts and welcome sequences
4. **Tag-Based Segmentation:** Easy to separate "Newsletter" vs "Beta" subscribers
5. **Future-Proof:** When you need paid features, pricing is reasonable ($33/month)

---

## ConvertKit Setup Instructions

### Step 1: Create Account

1. Go to https://kit.com (formerly convertkit.com)
2. Click "Get Started Free"
3. Enter your email address
4. Create a password
5. Complete the onboarding wizard:
   - Select "I'm a creator/entrepreneur"
   - Choose "Newsletter" as your primary goal
   - Enter "TheOneGroupAI" as your brand name

### Step 2: Set Up Newsletter List

1. **Create a Form:**
   - Go to **Grow → Forms**
   - Click "Create New Form"
   - Choose "Inline" or "Modal" style
   - Customize the form:
     - Title: "TheOneGroupAI Newsletter"
     - Description: "Get the latest updates on AI-powered group coordination"
   - Save the form

2. **Set Up Your Newsletter:**
   - Go to **Send → Broadcasts**
   - Click "Create Broadcast"
   - Choose your template
   - Set sender name: "TheOneGroupAI Team"
   - Set sender email: (your verified domain email)

### Step 3: Create Beta Signup Segment

1. **Create a Tag for Beta Users:**
   - Go to **Grow → Tags**
   - Click "Create Tag"
   - Name: "Beta Signup"
   - Color: Choose a distinct color (e.g., blue)
   - Save

2. **Create a Beta Signup Form:**
   - Go to **Grow → Forms**
   - Click "Create New Form"
   - Choose style (recommend Inline for website embed)
   - Customize:
     - Title: "Join TheOneGroupAI Beta"
     - Description: "Be among the first to try our AI-powered group coordination platform"
   - Under "Settings → Incentives":
     - Set "Add tag" to "Beta Signup"
   - Save the form

3. **Create a Segment (Optional but recommended):**
   - Go to **Grow → Segments**
   - Click "Create Segment"
   - Name: "Beta Users"
   - Condition: "Tag is Beta Signup"
   - Save

### Step 4: Get API Key

1. Go to **Settings → Advanced**
2. Scroll to "API" section
3. Click "Show API Key"
4. Copy your **API Key** (starts with `ck_`)
5. **Important:** Store this securely - it grants full account access

**API Key Location:**
- URL: https://app.kit.com/account_settings/advanced
- Look for "API" section
- Key format: `ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## API Integration Code

### Python Example

```python
import requests

# Configuration
API_KEY = "your_api_key_here"
BASE_URL = "https://api.kit.com/v4"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def add_newsletter_subscriber(email, first_name=None):
    """Add a subscriber to the newsletter list."""
    url = f"{BASE_URL}/subscribers"
    
    data = {
        "email_address": email,
        "state": "active"  # or "confirming" for double opt-in
    }
    
    if first_name:
        data["first_name"] = first_name
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

def add_beta_subscriber(email, first_name=None):
    """Add a subscriber and tag them as beta user."""
    # First, add the subscriber
    subscriber = add_newsletter_subscriber(email, first_name)
    
    if not subscriber:
        return None
    
    subscriber_id = subscriber["subscriber"]["id"]
    
    # Then tag them as beta
    url = f"{BASE_URL}/tags/YOUR_BETA_TAG_ID/subscribers"
    data = {
        "id": subscriber_id
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

def get_subscriber(email):
    """Get subscriber details by email."""
    url = f"{BASE_URL}/subscribers"
    params = {"email_address": email}
    
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# Example usage
if __name__ == "__main__":
    # Add a newsletter subscriber
    result = add_newsletter_subscriber("user@example.com", "John")
    print(result)
    
    # Add a beta subscriber
    beta_result = add_beta_subscriber("betauser@example.com", "Jane")
    print(beta_result)
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://api.kit.com/v4';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

async function addNewsletterSubscriber(email, firstName = null) {
  const url = `${BASE_URL}/subscribers`;
  
  const data = {
    email_address: email,
    state: 'active'
  };
  
  if (firstName) {
    data.first_name = firstName;
  }
  
  try {
    const response = await axios.post(url, data, { headers });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

async function addBetaSubscriber(email, firstName = null) {
  // Add subscriber first
  const subscriber = await addNewsletterSubscriber(email, firstName);
  
  if (!subscriber) return null;
  
  const subscriberId = subscriber.subscriber.id;
  const tagId = 'YOUR_BETA_TAG_ID';
  
  // Apply beta tag
  const url = `${BASE_URL}/tags/${tagId}/subscribers`;
  
  try {
    const response = await axios.post(url, { id: subscriberId }, { headers });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

// Example usage
addBetaSubscriber('betauser@example.com', 'Jane')
  .then(result => console.log(result));
```

### cURL Example

```bash
# Add a subscriber
 curl -X POST https://api.kit.com/v4/subscribers \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email_address": "user@example.com",
    "first_name": "John",
    "state": "active"
  }'

# Tag a subscriber (replace TAG_ID and SUBSCRIBER_ID)
curl -X POST https://api.kit.com/v4/tags/TAG_ID/subscribers \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "SUBSCRIBER_ID"
  }'
```

---

## Important API Notes

### Finding Your Tag ID

To get the tag ID for the beta tag:

```python
import requests

API_KEY = "your_api_key"
headers = {"Authorization": f"Bearer {API_KEY}"}

response = requests.get(
    "https://api.kit.com/v4/tags",
    headers=headers
)

tags = response.json()["tags"]
for tag in tags:
    print(f"ID: {tag['id']}, Name: {tag['name']}")
```

### Rate Limits

- Kit API v4 has rate limits based on your plan
- Free tier: 100 requests per minute
- Implement exponential backoff for retries

### Webhooks (Optional)

For real-time updates when subscribers join:

1. Go to **Settings → Webhooks**
2. Add webhook URL: `https://yourapp.com/webhooks/kit`
3. Select events: `subscriber.subscribed`, `subscriber.tagged`

---

## Next Steps

1. ✅ Sign up at https://kit.com
2. ✅ Create newsletter and beta forms
3. ✅ Get your API key
4. ✅ Implement the API integration in your app
5. ✅ Test with a few email addresses
6. ✅ Embed forms on your website

---

## Alternative: If You Need to Start Immediately

If you need a solution **today** without API setup:

1. **Use ConvertKit forms directly** - Embed the provided HTML/JS on your website
2. **Manual export/import** - Export CSV from ConvertKit, import to your app
3. **Zapier integration** - Connect ConvertKit to your app via Zapier (no code)

---

## Cost Projection

| Subscribers | ConvertKit Cost | Mailchimp Cost | Substack Cost |
|-------------|-----------------|----------------|---------------|
| 0-250 | $0 | $0 | $0 |
| 500 | $0 | $13/mo | $0 |
| 1,000 | $0 | $20/mo | $0 |
| 5,000 | $0 | $40/mo | $0 |
| 10,000 | $0 | $70/mo | $0 |
| 10,001+ | $33/mo | $100+/mo | $0 |

**Winner for 100-1,000 subscribers:** ConvertKit (free)

---

*Document created: March 14, 2026*
*For questions or updates, contact the product team*
