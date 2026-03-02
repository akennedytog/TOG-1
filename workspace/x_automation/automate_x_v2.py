import os
import requests
from dotenv import load_dotenv
from requests_oauthlib import OAuth1

# Load env vars
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

CONSUMER_KEY = os.getenv('CONSUMER_KEY')
CONSUMER_SECRET = os.getenv('CONSUMER_SECRET')
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')
ACCESS_TOKEN_SECRET = os.getenv('ACCESS_TOKEN_SECRET')
BEARER_TOKEN = os.getenv('BEARER_TOKEN')

# OAuth1 for v1.1 fallback
AUTH1 = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
# Headers for v2
HEADERS2 = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "Content-Type": "application/json"
}

API_V2_URL = "https://api.twitter.com/2"

# v2 endpoints
def post_tweet(text):
    url = f"{API_V2_URL}/tweets"
    payload = {"text": text}
    r = requests.post(url, auth=AUTH1, headers=HEADERS2, json=payload)
    r.raise_for_status()
    return r.json()

def follow_user_v2(source_user_id, target_user_id):
    url = f"{API_V2_URL}/users/{source_user_id}/following"
    payload = {"target_user_id": str(target_user_id)}
    r = requests.post(url, auth=AUTH1, headers=HEADERS2, json=payload)
    r.raise_for_status()
    return r.json()

def like_tweet_v2(source_user_id, tweet_id):
    url = f"{API_V2_URL}/users/{source_user_id}/likes"
    payload = {"tweet_id": str(tweet_id)}
    r = requests.post(url, auth=AUTH1, headers=HEADERS2, json=payload)
    r.raise_for_status()
    return r.json()

if __name__ == '__main__':
    # test v2 posting
    print(post_tweet("Test v2 fallback: Hello world!"))
    # test follow and like fallback (replace with real IDs)
    source_id = os.getenv('ACCESS_TOKEN').split('-')[0]
    print(follow_user_v2(source_id, 2244994945))  # TwitterDev user id
    print(like_tweet_v2(source_id, 1486510936232163330))  # sample tweet
