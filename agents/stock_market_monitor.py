#!/usr/bin/env python3
"""
Stock Market Monitor — $HIVE, $KEEL, $ASTS
===========================================
Scrapes live price data (Yahoo Finance free chart API) + checks fresh news
(Tavily) for the tracked tickers, and queues a tweet whenever there's a
significant move (>3% daily) or material news. Posts at most ONE tweet per
ticker per run to avoid spamming, and keeps a state file to dedupe.

Scheduling intent:
  - Run every-other-day (or daily) via cron for market checks.
  - Post updates in near-real-time when a big move/news hits.
"""
import os
import json
import sys
import re
import time
import urllib.request
import urllib.parse
from pathlib import Path
from datetime import datetime, timedelta

WORKSPACE = Path(os.path.expanduser("~/.openclaw/workspace"))
STATE_FILE = WORKSPACE / "state.json"
MONITOR_STATE = WORKSPACE / "data" / "stock_monitor_state.json"
sys.path.insert(0, str(WORKSPACE))
sys.path.insert(0, str(WORKSPACE / "skills" / "tavily" / "scripts"))

# Tickers we track: symbol -> (display name, one-line thesis)
TRACKED = {
    "HIVE": ("$HIVE", "AI-compute pivot from a Bitcoin miner"),
    "KEEL": ("$KEEL", "data-center/AI-infrastructure landlord pivot"),
    "ASTS": ("$ASTS", "direct-to-cell satellite connectivity"),
    "TE":   ("$TE",   "US solar manufacturing / T1 Energy"),
}

# Daily % move threshold to trigger a tweet
MOVE_THRESHOLD = 3.0

# US stock market holidays (MM-DD) — never tweet stocks on these days.
# NYSE/Nasdaq are closed; posting then looks stale/behind.
US_MARKET_HOLIDAYS = {
    "01-01",  # New Year's Day
    "01-19",  # MLK Day (2026)
    "02-16",  # Presidents Day (2026)
    "04-03",  # Good Friday (2026)
    "05-25",  # Memorial Day (2026)
    "07-03",  # Independence Day observed (2026)
    "09-07",  # Labor Day (2026)
    "11-26",  # Thanksgiving (2026)
    "12-25",  # Christmas Day
}
# Cache dir for price snapshots (used to compute day-over-day)
PRICE_CACHE = WORKSPACE / "data" / "stock_prices.json"

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

NEWS_QUERIES = {
    "HIVE": "HIVE Digital Technologies stock news today",
    "KEEL": "Keel Infrastructure KEEL stock news",
    "ASTS": "AST SpaceMobile ASTS stock news today",
    "TE":   "T1 Energy TE solar stock news today",
}


def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode("utf-8"))


def compute_prev_close(history, today_str):
    """Return (prev_close, is_reliable) derived ONLY from daily close history.

    Rules (all to avoid posting stale/Friday data as if it were today's move):
      * If the last bar is TODAY -> prev close = the bar before it (prior
        trading day). Requires >=2 bars to be trustworthy.
      * If the last bar is NOT today (feed lag / pre-open / the today bar
        hasn't landed in the daily series yet) -> prev close = the last
        completed bar (that IS the true prior close).
      * If we have fewer than 2 bars total -> (None, False): cannot compute a
        reliable move, so the caller must SKIP the live move tweet rather than
        fall back to Yahoo's chartPreviousClose.
    Returns (prev_close or None, is_reliable_bool).
    """
    if not history:
        return None, False
    last_date, last_close = history[-1]
    if last_date == today_str:
        # today's bar is in the series -> need the bar before it as prior close
        if len(history) >= 2:
            return history[-2][1], True
        return None, False
    # last bar is NOT today (stale/partial feed) -> prior close = last bar
    return last_close, True


def get_stock_data(symbol):
    """Return price meta + 5-day close history via Yahoo chart API."""
    url = (f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
           f"?interval=1d&range=10d")
    try:
        data = fetch_json(url)
        result = data["chart"]["result"][0]
        meta = result["meta"]
        closes = result.get("indicators", {}).get("quote", [{}])[0].get("close", [])
        ts = result.get("timestamp", [])
        # Build list of (date, close) dropping None closes
        history = []
        for t, c in zip(ts, closes):
            if c is not None:
                history.append((datetime.fromtimestamp(t).strftime("%Y-%m-%d"), c))
        # NOTE: we deliberately do NOT use meta['chartPreviousClose'] as the
        # baseline. That field is frequently stale/garbage (e.g. it returned
        # 2.60 for $HIVE when the true prior close was $3.03, and 5.31 for $TE
        # when the true prior close was $4.42), which caused WRONG % moves and
        # even wrong direction in the 2026-08-24 morning tweets. The prior
        # close is derived ONLY from the daily history bars below.
        _prev_close, _prev_rel = compute_prev_close(history, datetime.now().strftime("%Y-%m-%d"))
        return {
            "symbol": meta.get("symbol", symbol),
            "price": meta.get("regularMarketPrice"),
            # prior close + a data-freshness flag, computed from history only
            "prev_close": _prev_close,
            "prev_reliable": _prev_rel,
            "high_52w": meta.get("fiftyTwoWeekHigh"),
            "low_52w": meta.get("fiftyTwoWeekLow"),
            "currency": meta.get("currency", "USD"),
            "history": history,
        }
    except Exception as e:
        log(f"  ⚠️ {symbol} price fetch failed: {e}")
        return None


def get_tavily_news(symbol):
    """Return top fresh news headline+url for a ticker, or None."""
    try:
        from tavily_search import search
    except ImportError:
        return None
    query = NEWS_QUERIES.get(symbol, f"{symbol} stock news")
    try:
        res = search(query, api_key=os.getenv("TAVILY_API_KEY"),
                     topic="news", search_depth="basic", max_results=4)
        if not res.get("success"):
            return None
        for item in res.get("results", []):
            title = item.get("title", "").strip()
            url = item.get("url", "")
            if title and url:
                return {"title": title, "url": url, "source": item.get("source", "")}
    except Exception as e:
        log(f"  ⚠️ {symbol} news fetch failed: {e}")
    return None


def load_state():
    if MONITOR_STATE.exists():
        try:
            return json.loads(MONITOR_STATE.read_text())
        except Exception:
            pass
    return {"last_posts": {}, "price_cache": {}}


def save_state(state):
    MONITOR_STATE.parent.mkdir(parents=True, exist_ok=True)
    MONITOR_STATE.write_text(json.dumps(state, indent=2))


def load_twitter_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"twitterQueue": [], "queuedPosts": [], "postedLog": []}


def save_twitter_state(state):
    state["queuedPosts"] = state.get("twitterQueue", [])
    STATE_FILE.write_text(json.dumps(state, indent=2))


def is_dup(text, posted_log):
    """Rough dedup against recent posted log."""
    def norm(t):
        t = (t or "").lower()
        t = re.sub(r"https?://\S+", "", t)
        t = re.sub(r"[^a-z0-9\s]", " ", t)
        return re.sub(r"\s+", " ", t).strip()
    n = norm(text)
    for e in posted_log[-40:]:
        et = e.get("text") or e.get("content") or ""
        en = norm(et)
        if en and (n == en or (len(n) > 40 and n[:40] == en[:40])):
            return True
    return False


def queue_tweet(text, source_url="", dedup_key=""):
    state = load_twitter_state()
    posted_log = state.get("postedLog", [])
    if is_dup(text, posted_log):
        log("  ⏭️ Duplicate, not queuing")
        return False
    state.setdefault("twitterQueue", []).append({
        "id": f"market-{dedup_key}",
        "text": text,
        "content": text,
        "source": source_url,
        "type": "market_update",
        "queuedAt": datetime.now().isoformat(),
    })
    save_twitter_state(state)
    log(f"  ✅ Queued tweet for posting")
    return True


def post_now(text, dedup_key=""):
    """Post a market-update tweet IMMEDIATELY (real-time), not into the FIFO queue.
    Falls back to queuing if direct posting fails."""
    try:
        import post_tweet as pt
    except Exception as e:
        log(f"  ⚠️ cannot import post_tweet ({e}); queuing instead")
        return queue_tweet(text, dedup_key=dedup_key)
    state = pt.load_state()
    posted_log = state.get("postedLog", [])
    if is_dup(text, posted_log):
        log("  ⏭️ Duplicate, skipping")
        return False
    result = pt.post_to_twitter(text, posted_log)
    if result and result != "duplicate":
        state.setdefault("postedLog", []).append({
            "id": f"market-{dedup_key}", "text": text,
            "postedAt": datetime.now().isoformat(),
            "storyTitle": dedup_key, "type": "market_update"})
        state.setdefault("todayPosts", []).append({
            "id": f"market-{dedup_key}", "text": text,
            "postedAt": datetime.now().isoformat(), "type": "market_update"})
        state["postedToday"] = len(state.get("todayPosts", []))
        state["date"] = datetime.now().strftime("%Y-%m-%d")
        pt.save_state(state)
        log("  ✅ POSTED immediately (real-time)")
        return True
    else:
        log(f"  ⚠️ direct post returned {result}; queuing instead")
        return queue_tweet(text, dedup_key=dedup_key)


def build_move_tweet(symbol, disp, data, pct_change, prev_close):
    direction = "up" if pct_change >= 0 else "down"
    emoji = "🚀" if pct_change >= 0 else "📉"
    pct = abs(pct_change)
    return (f"{emoji} {disp} {pct:.1f}% {direction} today to "
            f"${data['price']:.2f} (prev close ${prev_close:.2f}).\n\n"
            f"52-wk range: ${data['low_52w']:.2f}–${data['high_52w']:.2f}.\n"
            f"Tracking the {TRACKED[symbol][1]} thesis as it plays out.")


def build_dip_tweet(symbol, disp, data, pct_change, prev_close):
    """Constructive framing for a meaningful down-move — keeps positive tone."""
    pct = abs(pct_change)
    return (f"{disp} is off {pct:.1f}% today to ${data['price']:.2f} — "
            f"but the {TRACKED[symbol][1]} thesis hasn't changed.\n\n"
            f"52-wk range ${data['low_52w']:.2f}–${data['high_52w']:.2f} — "
            f"volatility is the price of admission on small-cap infrastructure.\n"
            f"Position sizing matters more than the day's print.")


def main():
    monitor = load_state()
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    today_posts = monitor.setdefault("last_posts", {})
    posted_any = False

    # Market-closed guard: NEVER tweet about stocks when the market is closed.
    # Includes weekends AND US market holidays. Posting when closed makes the
    # feed look behind/stale, so we skip ALL stock posts (moves AND news).
    # (Alec's rule, 2026-08-23: "never tweet about stocks when the market is
    # closed, that means the weekends.")
    weekday = now.weekday()  # 0=Mon .. 6=Sun
    is_weekend = weekday >= 5
    is_holiday = now.strftime("%m-%d") in US_MARKET_HOLIDAYS
    market_closed = is_weekend or is_holiday
    if market_closed:
        log("🌐 Market closed (weekend" + (" or holiday" if is_holiday else "") +
            ") — skipping ALL stock tweets this run.")
        # Record the run in monitor state but post nothing.
        save_state(monitor)
        return

    for symbol, (disp, thesis) in TRACKED.items():
        log(f"📊 {disp} ({symbol})")
        data = get_stock_data(symbol)
        if not data or not data.get("price"):
            log("  ⚠️ no data, skipping")
            continue

        # Skip if we already posted for this ticker today
        if today_posts.get(symbol) == today:
            log("  ⏭️ already posted today, skipping")
            continue

        # Compute day-over-day change from the ACTUAL close history ONLY.
        # NEVER from Yahoo's chartPreviousClose (which is stale/garbage and
        # caused the wrong 2026-08-24 morning tweets). compute_prev_close
        # returns (prev_close, reliable): if reliable is False we SKIP the
        # live-move tweet entirely rather than post a wrong %.
        hist = data.get("history", [])
        prev_close, prev_reliable = data.get("prev_close"), data.get("prev_reliable", False)
        cur = data.get("price") or (hist[-1][1] if hist else None)
        pct_change = 0.0
        if prev_reliable and prev_close and cur:
            pct_change = (cur - prev_close) / prev_close * 100.0

        posted = False

        # 1) Significant move? Post immediately (real-time). Only when market
        # open AND we have a reliable history-derived prior close. If the data
        # is stale/unreliable we skip rather than tweet Friday numbers as if
        # they were today's move (Alec's rule, 2026-08-24).
        if not market_closed and prev_reliable and abs(pct_change) >= MOVE_THRESHOLD:
            if pct_change < 0:
                text = build_dip_tweet(symbol, disp, data, pct_change, prev_close)
            else:
                text = build_move_tweet(symbol, disp, data, pct_change, prev_close)
            if post_now(text, dedup_key=f"{symbol}-move-{today}"):
                posted = True
                posted_any = True
        elif not market_closed and not prev_reliable:
            log(f"  ⏭️ {symbol}: prior-close not reliable from history, "
                f"skipping live move tweet (avoid stale/Friday data).")

        # 2) Fresh news (Tavily) — only when market open, and only if no move tweet
        if not market_closed and not posted:
            news = get_tavily_news(symbol)
            if news:
                title = news["title"]
                url = news["url"]
                text = (f"{disp} update: {title}\n\n"
                        f"{thesis}. Tracking it live.\n\n{url}")
                if post_now(text, dedup_key=f"{symbol}-news-{today}-{abs(hash(title))%1000}"):
                    posted = True
                    posted_any = True

        if posted:
            today_posts[symbol] = today

    # Save monitor state (price cache + today markers)
    save_state(monitor)

    # Update price cache for history
    pc = load_price_cache()
    for symbol in TRACKED:
        data = get_stock_data(symbol)
        if data:
            pc[symbol] = {"price": data["price"], "date": today}
    save_price_cache(pc)

    if posted_any:
        log("🎯 Queued new market-update tweets.")
    else:
        log("ℹ️ No new posts needed this run.")


def load_price_cache():
    if PRICE_CACHE.exists():
        try:
            return json.loads(PRICE_CACHE.read_text())
        except Exception:
            pass
    return {}


def save_price_cache(cache):
    PRICE_CACHE.parent.mkdir(parents=True, exist_ok=True)
    PRICE_CACHE.write_text(json.dumps(cache, indent=2))


if __name__ == "__main__":
    main()
