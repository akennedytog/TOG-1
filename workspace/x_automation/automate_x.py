import os
import tweepy
from dotenv import load_dotenv

# Load env vars
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

CONSUMER_KEY = os.getenv('CONSUMER_KEY')
CONSUMER_SECRET = os.getenv('CONSUMER_SECRET')
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')
ACCESS_TOKEN_SECRET = os.getenv('ACCESS_TOKEN_SECRET')

# Authenticate
auth = tweepy.OAuth1UserHandler(
    CONSUMER_KEY, CONSUMER_SECRET,
    ACCESS_TOKEN, ACCESS_TOKEN_SECRET
)
api = tweepy.API(auth)

# Test endpoint: post a hello tweet
if __name__ == '__main__':
    status = api.update_status("Hello world from automated Tweepy script! #Testing")
    print(f"Posted tweet ID {status.id}")
