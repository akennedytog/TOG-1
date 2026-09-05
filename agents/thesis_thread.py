#!/usr/bin/env python3
"""
Thesis Thread Generator — turns a stock conviction into the proven 5-tweet arc.

Uses the format that produced the best-performing post on @TheOneGroupAI
($TE, 40+ likes). See THESIS_THREAD_FORMAT.md for the full breakdown.

Two modes:
  1. Structured:  --ticker $TE --company "T1 Energy" --what "US solar mfg" \
                  --opportunity "..." --signal "..." --risk "..."
  2. Free-form:   --thesis "I'm building a position around the onshoring of
                  America's solar supply chain..."  (LLM structures it)

Output: prints the 5-tweet thread. With --post, posts it as a reply-chained
thread via the Twitter API. Default is dry-run (prints only, never posts).

Usage:
  python3 agents/thesis_thread.py --ticker '$TE' --company 'T1 Energy' \
      --what 'US solar manufacturing' --opportunity '...' --signal '...' \
      --risk '...' [--post]
  python3 agents/thesis_thread.py --thesis '...' [--post]
  python3 agents/thesis_thread.py --ticker '$HIVE' --from-file thesis.json
"""
import argparse, json, os, re, sys
from datetime import datetime
from pathlib import Path

WS = Path(__file__).resolve().parent.parent


# ---------- Structured builder ----------

def build_structured(ticker, company, what, opportunity, signal, risk,
                     hook=None, bet=None, number=None):
    """Assemble the 5-tweet arc from structured inputs."""
    ticker = ticker.strip()
    company = company.strip()
    what = what.strip()

    t1 = hook or (
        f"Adding a conviction to my board: {what}."
    )
    t2 = (
        f"{ticker} — {company}, {what}.\n\n"
        f"{number or ''}".strip() + "\n\n"
        f"The bet: {bet or f'{company} is one of the purest plays on {what.lower()}.'}"
    )
    t3 = (
        f"Why the opportunity for {ticker}:\n\n{opportunity}\n\n"
        f"That's the edge."
    )
    t4 = (
        f"The quiet signal I like on {ticker}:\n\n{signal}\n\n"
        f"Real demand, not a story."
    )
    t5 = (
        f"The honest part on {ticker}:\n\n{risk}\n\n"
        f"I size it as a bet, not a sure thing.\n\n"
        f"Not financial advice — just the thesis I'm tracking."
    )
    return [t1, t2, t3, t4, t5]


# ---------- Free-form (LLM) builder ----------

def build_from_thesis(thesis, ticker=""):
    """Use a local Ollama model to structure a free-form thesis into the arc."""
    import urllib.request
    prompt = (
        "You write stock thesis threads for Twitter. Convert the thesis below into "
        "exactly 5 tweets following this proven arc (reply-chained thread):\n"
        "1 HOOK: conviction statement, no cashtag needed\n"
        "2 IDENTITY: ticker + company + what it does + 1-2 concrete numbers + one-line bet\n"
        "3 OPPORTUNITY: why the setup exists (structural reason)\n"
        "4 DEMAND SIGNAL: a specific concrete tell that validates the thesis\n"
        "5 HONESTY + CLOSE: real risks + 'Not financial advice — just the thesis I'm tracking.'\n\n"
        "Rules: each tweet under 280 chars; concrete numbers; honest risk; no pump energy.\n"
        "Output ONLY the 5 tweets, separated by a line containing exactly '---'.\n\n"
        f"Ticker: {ticker}\nThesis:\n{thesis}"
    )
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:11434/api/generate",
            data=json.dumps({
                "model": "llama3:latest",
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.4, "num_predict": 1200},
            }).encode(),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=180) as r:
            out = json.loads(r.read().decode())
        raw = out.get("response", "")
        tweets = [t.strip() for t in re.split(r"\n---+\n|\n---\n", raw) if t.strip()]
        # fallback: split on numbered lines
        if len(tweets) < 5:
            tweets = [t.strip() for t in re.split(r"\n\d[.)]\s*", raw) if t.strip()]
        return tweets[:5]
    except Exception as e:
        print(f"⚠️ LLM refinement failed: {e}", file=sys.stderr)
        return []


# ---------- Posting ----------

def post_thread(tweets):
    import tweepy
    api_key = os.getenv("TWITTER_API_KEY")
    api_secret = os.getenv("TWITTER_API_SECRET")
    at = os.getenv("TWITTER_ACCESS_TOKEN")
    ats = os.getenv("TWITTER_ACCESS_SECRET")
    if not all([api_key, api_secret, at, ats]):
        print("❌ Twitter credentials missing in env"); return False
    client = tweepy.Client(consumer_key=api_key, consumer_secret=api_secret,
                           access_token=at, access_token_secret=ats)
    reply_to = None
    ids = []
    for i, text in enumerate(tweets, 1):
        kw = {"text": text}
        if reply_to:
            kw["in_reply_to_tweet_id"] = reply_to
        resp = client.create_tweet(**kw)
        tid = resp.data["id"]
        ids.append(tid)
        reply_to = tid
        print(f"  ✅ posted tweet {i}: {tid}")
    print("DONE: " + ", ".join(ids))
    return True


# ---------- main ----------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ticker", default="")
    ap.add_argument("--company", default="")
    ap.add_argument("--what", default="")
    ap.add_argument("--opportunity", default="")
    ap.add_argument("--signal", default="")
    ap.add_argument("--risk", default="")
    ap.add_argument("--hook", default="")
    ap.add_argument("--bet", default="")
    ap.add_argument("--number", default="")
    ap.add_argument("--thesis", default="")
    ap.add_argument("--from-file", default="")
    ap.add_argument("--post", action="store_true", help="actually post (default: dry-run)")
    args = ap.parse_args()

    # load from file if given
    if args.from_file:
        d = json.load(open(args.from_file))
        for k, v in d.items():
            setattr(args, k, v)

    if args.thesis:
        tweets = build_from_thesis(args.thesis, args.ticker)
        if not tweets:
            print("❌ Could not structure thesis. Use structured mode instead.")
            return
    elif args.ticker and args.company and args.what:
        tweets = build_structured(
            args.ticker, args.company, args.what,
            args.opportunity, args.signal, args.risk,
            hook=args.hook, bet=args.bet, number=args.number,
        )
    else:
        print("Need either --thesis OR --ticker/--company/--what (+ opportunity/signal/risk).")
        return

    print(f"\n=== Thesis thread ({len(tweets)} tweets) ===")
    for i, t in enumerate(tweets, 1):
        print(f"\n[{i}] ({len(t)} chars)\n{t}")

    if args.post:
        print("\nPosting thread...")
        post_thread(tweets)
    else:
        print("\n(dry-run — add --post to actually post)")


if __name__ == "__main__":
    main()
