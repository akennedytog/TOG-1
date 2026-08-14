#!/usr/bin/env python3
"""
Morpheus - Morning Market Brief Agent
Pre-market analysis for $ASTS & $TE
"""

import json
import subprocess
from datetime import datetime
from pathlib import Path

# Paths
MARKET_BRIEF_DIR = Path('/Users/aleckennedy/.openclaw/workspace/market-brief')
OUTPUT_DIR = MARKET_BRIEF_DIR / 'output'
TWEETS_DIR = OUTPUT_DIR / 'tweets'
SCRIPT_DIR = MARKET_BRIEF_DIR / 'scripts'

def run_script(script_name):
    """Execute a market-brief shell script"""
    script_path = SCRIPT_DIR / script_name
    try:
        result = subprocess.run(
            ['bash', str(script_path)],
            capture_output=True,
            text=True,
            timeout=120
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def load_live_prices():
    """Load current prices from live-prices.json"""
    prices_file = OUTPUT_DIR / 'live-prices.json'
    if prices_file.exists():
        try:
            data = json.loads(prices_file.read_text())
            return data
        except:
            pass
    return None

def generate_market_brief():
    """Generate the morning market brief"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    print(f"📊 Morpheus Market Brief - {timestamp}")
    print("=" * 50)
    
    # Step 1: Fetch live prices
    print("\n🔥 Fetching live prices...")
    success, stdout, stderr = run_script('fetch-live-prices.sh')
    if success:
        print("  ✅ Live prices fetched")
    else:
        print(f"  ⚠️ Price fetch issue: {stderr}")
    
    prices = load_live_prices()
    
    # Step 2: Generate analysis
    print("\n📈 Running analysis...")
    
    # Greeks analysis
    run_script('greeks-analyzer.sh')
    
    # Dark pool tracker
    run_script('darkpool-tracker.sh')
    
    # Options flow
    run_script('options-flow.sh')
    
    # Price alerts
    run_script('price-alerts.sh')
    
    # Short interest
    run_script('short-interest.sh')
    
    print("  ✅ Analysis complete")
    
    # Step 3: Generate tweets
    print("\n🐦 Generating tweets...")
    run_script('generate-tweets.sh')
    print("  ✅ Tweets generated")
    
    # Step 4: Load results
    greeks_file = OUTPUT_DIR / 'greeks-analysis.json'
    darkpool_file = OUTPUT_DIR / 'darkpool-flow.json'
    options_file = OUTPUT_DIR / 'options-alerts.json'
    price_alerts_file = OUTPUT_DIR / 'price-alerts.json'
    short_interest_file = OUTPUT_DIR / 'short-interest.json'
    
    # Build brief
    brief = f"""
🌅 MORNING MARKET BRIEF - {timestamp}
{'='*50}

📊 PRICE DATA
Source: {prices.get('source', 'N/A') if prices else 'N/A'}
• ASTS: ${prices.get('asts', {}).get('price', 'N/A') if prices else 'N/A'}
• TE: ${prices.get('te', {}).get('price', 'N/A') if prices else 'N/A'}

📁 FILES GENERATED
"""
    
    # Check which files were generated
    files_generated = []
    for f, label in [
        (greeks_file, "Greeks Analysis"),
        (darkpool_file, "Dark Pool Flow"),
        (options_file, "Options Alerts"),
        (price_alerts_file, "Price Alerts"),
        (short_interest_file, "Short Interest"),
    ]:
        if f.exists():
            files_generated.append(f"✅ {label}: {f.name}")
        else:
            files_generated.append(f"⚠️  {label}: Not generated")
    
    brief += "\n".join(files_generated)
    
    # Add tweet files
    today = datetime.now().strftime("%Y-%m-%d")
    tweet_file = TWEETS_DIR / f'tweets-{today}.txt'
    if tweet_file.exists():
        brief += f"\n\n🐦 DAILY TWEETS: {tweet_file}"
        
        # Show tweet preview
        try:
            tweet_content = tweet_file.read_text()
            brief += "\n\n--- TWEET PREVIEW ---\n"
            brief += tweet_content[:800]
            if len(tweet_content) > 800:
                brief += "\n... (truncated)"
        except:
            pass
    
    brief += "\n\n✅ MARKET BRIEF COMPLETE\n"
    brief += f"📁 Location: {OUTPUT_DIR}\n"
    brief += f"📁 Tweets: {TWEETS_DIR}\n"
    
    return brief

if __name__ == "__main__":
    brief = generate_market_brief()
    print(brief)
