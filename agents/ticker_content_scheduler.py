#!/usr/bin/env python3
"""
Ticker Content Scheduler — $HIVE / $KEEL / $ASTS
==================================================
Queues a pre-written, non-duplicate thesis/update post for ONE tracked
ticker per run. Designed to be called 3x/week (Mon/Wed/Fri) so each of the
three tickers gets consistent coverage as part of Alec's "leading voice"
positioning.

The pool holds evergreen thesis posts per ticker. Each run:
  - picks the next ticker in rotation (HIVE -> KEEL -> ASTS -> ...)
  - picks a fresh (non-duplicate) post from that ticker's pool
  - queues it into state.json for the next scheduled posting slot
"""
import json
import re
import sys
from pathlib import Path
from datetime import datetime

WORKSPACE = Path(__file__).resolve().parent.parent
STATE_FILE = WORKSPACE / "state.json"
# Ensure the workspace root is importable so `import post_tweet` resolves.
sys.path.insert(0, str(WORKSPACE))

# One evergreen post per ticker per rotation. Extend pool over time.
# Angles: thesis / contrarian / milestone / power-lens / risk-honesty.
TICKER_POSTS = {
    "HIVE": [
        "Why I'm long $HIVE into the AI buildout:\n\nA Bitcoin miner repurposing its data centers + power into GPU/AI compute. Q1 revenue up 74%, GPU cloud ARR ~$110M.\n\nThe market still prices it like a miner. It's becoming an AI-compute play. That gap is the opportunity.",
        "$HIVE isn't a crypto play anymore — it's an AI-infrastructure one.\n\nThe data centers, the power contracts, the GPU cloud pipeline. Same assets, new business model.\n\nWhen the market reprices it for what it's becoming, that's the thesis compounding.",
        "The $HIVE bull case in one line:\n\nThey're turning crypto-mining infrastructure into AI compute — and the market hasn't caught up to the pivot yet.\n\nRepurposed power + data centers + GPU cloud = the pick-and-shovel of the AI buildout.",
        "$HIVE signed a $350M AI cloud deal with an investment-grade enterprise customer.\n\nThat's not a retail narrative — that's contracted demand validating the pivot.\n\nThe hard part of the AI-infra story is getting the customer. HIVE just did.",
        "The contrarian $HIVE take:\n\nEveryone frames it as 'a Bitcoin miner with AI aspirations.' I frame it as an AI-compute company with a mining history.\n\nSame assets. The difference is where the market thinks the revenue is going.",
        "$HIVE's real moat isn't the GPUs — it's the power.\n\nIn AI infrastructure, power is the constraint. HIVE owns facilities with energy access already in place.\n\nCompute can be bought. Power and location can't be.",
        "Risk-honesty on $HIVE:\n\nIt's a capital-heavy transition in a volatile sector. The pivot is real but it takes time and money.\n\nI size it for a multi-year buildout, not a quarter. That's the honest frame for a small-cap infra play.",
        "The $HIVE metric I watch most: GPU cloud ARR growth.\n\nNot the crypto hash rate, not BTC price. Recurring AI-compute revenue is the signal that the pivot is compounding.\n\nAt ~$110M ARR and climbing, that's the number that reprices the stock.",
        "$HIVE: when a Bitcoin miner's infrastructure becomes worth more as AI compute than as mining — that's the repricing moment.\n\nPower + data centers + GPU cloud, all already built.\n\nThe market is slowly catching up to the new business model.",
        "What I'm actually betting on with $HIVE:\n\nNot that AI 'wins.' That AI infrastructure — power, compute, connectivity — is the constrained asset class of the decade.\n\nHIVE owns a piece of that constraint. That's the thesis.",
    ],
    "KEEL": [
        "The $KEEL transition is the story:\n\nDecommissioning ALL US crypto mining to pivot to data-center/AI-infrastructure leasing — backed by ~$819M liquidity.\n\nThe market sold it off on lease-shortfall noise. The strategy is clear: become the AI-infra landlord. Thesis intact.",
        "$KEEL: crypto miner → AI infrastructure landlord.\n\nFull pivot, funded balance sheet, and site development on track. The '2027 capacity across PJM and Washington' is the roadmap.\n\nThis is a long-term buildout, and volatility is the price of admission.",
        "What excites me about $KEEL:\n\nNot the charts — the transformation. A company deliberately walking away from crypto mining to lease data-center capacity to AI.\n\nThat's a management team with conviction. I'm tracking it for exactly that reason.",
        "$KEEL's CEO put it best: 'Power is the constraint. Everything else is downstream of it.'\n\nThree priority sites nearing full permitting, multiple tenants negotiating each. ~$819M liquidity to fund construction.\n\nThat's the AI-landlord play, and it's just getting started.",
        "The $KEEL contrarian angle:\n\nThe market sold it off ~12% on Q2 lease-shortfall noise. But the strategy — decommission mining, lease to AI — is exactly what a rational transition looks like.\n\nThe selloff is the entry, not the signal to leave.",
        "$KEEL backs PA's GRID standards for responsible data-center development.\n\nWhy that matters: it signals they're building for the long term with community + grid alignment — not chasing a fast buck.\n\nResponsible infra is sticky infra.",
        "Risk-honesty on $KEEL:\n\nLeasing revenue isn't booked yet — it's pre-revenue on the AI side while it winds down mining. That's the risk.\n\nThe bet is that ~$819M liquidity bridges to signed leases. If it executes, the landlord thesis compounds. If not, capital burns.",
        "The $KEEL number I watch: liquidity vs. time-to-first-lease.\n\n~$819M in the bank, site construction underway. The clock is: can they sign tenants before the cash runs low?\n\nThat's the whole ballgame for a pre-revenue infra pivot.",
        "$KEEL is the 'pick-and-shovel' of the AI buildout in its purest form:\n\nIt owns the land, the power capacity, and the permitting — then leases to whoever needs compute.\n\nYou don't bet on which AI company wins. You bet on the landlord renting to all of them.",
        "What I'm actually betting on with $KEEL:\n\nThat owning power + land + permitting is the scarcest asset class in AI infra.\n\nMiners are exiting, landlords are entering. $KEEL is front of that line with a funded balance sheet.",
    ],
    "ASTS": [
        "Here's what excites me most about $ASTS:\n\nDirect-to-cell on the phones we already carry — same spectrum, no new hardware. 60+ mobile operators, 3B+ subscribers covered.\n\nWhen the network is the bottleneck, capacity wins.",
        "$ASTS is a connectivity-infrastructure bet, and it's underappreciated:\n\n45 satellites targeted by early 2027, a 400k sq ft Midland facility supercharging production, and MNO partnerships already signed.\n\nDirect-to-cell from space is the endgame.",
        "The $ASTS thesis I keep coming back to:\n\nNo dead zones. A normal phone connects to a satellite with zero new hardware. That's not a product hunting for a market — the operators are already signed on.\n\nSpace connectivity, simplified.",
        "$ASTS isn't a satellite company competing with SpaceX — it's a partner to the telcos.\n\n60+ MNOs don't see it as a threat; they see it as coverage they can't otherwise afford.\n\nWhen your customers are the incumbents, you're the infrastructure.",
        "The $ASTS contrarian take:\n\nEveryone fixates on the satellite count. The real unlock is the spectrum + the MNO partnerships.\n\n3B+ subscribers already covered by signed operators. Capacity wins when the network is the bottleneck.",
        "$ASTS's Midland expansion is the quiet tell:\n\nA 400k sq ft facility to supercharge BlueBird production. That's them scaling for commercial launch, not just R&D.\n\nProduction capacity is the proof the business is getting real.",
        "Risk-honesty on $ASTS:\n\nThe satellite launch campaign has slipped to 2027 with a ~$1B raise planned. The '45 by early 2027' is a target, not a guarantee.\n\nThesis intact — 60+ MNOs, 3B+ subscribers, Midland production — but the timeline is the risk. I hold the line honestly.",
        "The $ASTS metric I watch: MNO partnerships + production throughput.\n\nNot the stock price. Are the operators still signing? Is BlueBird production scaling at Midland?\n\nThose two tell you if the network buildout is on track.",
        "$ASTS is the connectivity layer of the AI era:\n\nEvery AI agent, every IoT device, every off-grid edge case needs a network. Direct-to-cell from space is the backstop.\n\nWhen the network is the bottleneck, the company that owns capacity wins.",
        "What I'm actually betting on with $ASTS:\n\nThat ubiquitous connectivity — a normal phone connecting anywhere on Earth — becomes table stakes for the next decade.\n\nSigned MNOs, 3B+ subscribers, and a production ramp put $ASTS at the center of that.",
    ],
}

# $TE is a SEPARATE thesis (US solar manufacturing) from the AI-infra trio.
# Kept in its own pool; rotation includes it but it's framed on clean-energy /
# US domestic solar supply chain, not AI infrastructure.
TICKER_POSTS_TE = [
    "Why $TE?\n\nT1 Energy — a former battery maker (FREYR) now building US solar modules. Multi-GW domestic manufacturing ramp, ~$250M Q2 sales.\n\nThe bet: America's solar supply chain gets built domestically, and T1 is one of the purest plays on that build.",
    "$TE is a US manufacturing story, not just a solar one.\n\nVertical integration across polysilicon, wafers, cells, and modules — with a multi-GW US ramp underway.\n\nDomestic capacity + policy tailwind. That's the long-game thesis.",
    "What I like about $TE:\n\nIt's betting on American-made solar when the market assumes panels stay imported.\n\nMulti-GW US manufacturing + a Clearway offtake deal = real demand, not just a story. The US solar supply chain is getting built either way — T1 wants to be its factory.",
    "The $TE contrarian angle:\n\nSolar manufacturing is crowded globally, but US domestic capacity is the scarce piece.\n\nT1's ramp (multi-GW, vertically integrated) is positioning for the onshore buildout. Crowd in China, scarce in America.",
    "$TE's Clearway offtake deal is the quiet signal:\n\nA strategic supply agreement for traceable modules built with domestic cells.\n\nThat's an anchor customer validating the US-made thesis — and it's the kind of demand that compounds.",
    "Risk-honesty on $TE:\n\nUS solar manufacturing is capital-heavy and policy-dependent. Tariffs, IRA fate, and execution on the multi-GW ramp are real swing factors.\n\nI size it as a manufacturing-turnaround play with upside if the onshore buildout hits — but the timeline is the risk.",
    "The $TE number I watch: quarterly sales and module output.\n\n~$250M in Q2 shows the ramp is real. The question is scale — can the US plants hit multi-GW and drive margin?\n\nOutput is the tell on whether this is a story or a business.",
    "$TE = a cleaner 'onshore the supply chain' bet:\n\nPanels, cells, and modules made in America, backed by offtake demand. The FREYR-to-T1 pivot took it from batteries to solar manufacturing.\n\nSame infrastructure DNA, new end market.",
    "What I'm actually betting on with $TE:\n\nThat reshoring solar manufacturing is a decade-long tailwind, and T1 is positioned in the US at scale.\n\nMulti-GW ramp + domestic cells + offtake demand. If onshoring compounds, so does this.",
    "The $TE bull case in one line:\n\nAmerica needs domestic solar capacity, T1 is building it at multi-GW scale, and the market hasn't priced the onshore ramp in yet.\n\nManufacturing-turnaround with a policy tailwind.",
]

# Rotation order across scheduled runs
ROTATION = ["HIVE", "KEEL", "ASTS", "TE"]

# Max total tweets posted today before the scheduler holds off (avoid spam).
# Market-monitor real-time posts + manual posts count against this.
MAX_DAILY_POSTS = 6


def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")


def load_state():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {"twitterQueue": [], "queuedPosts": [], "postedLog": []}


def save_state(state):
    state["queuedPosts"] = state.get("twitterQueue", [])
    STATE_FILE.write_text(json.dumps(state, indent=2))


def normalize(t):
    t = (t or "").lower()
    t = re.sub(r"https?://\S+", "", t)
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def is_dup(text, posted_log):
    n = normalize(text)
    for e in posted_log[-50:]:
        et = e.get("text") or e.get("content") or ""
        en = normalize(et)
        if en and (n == en or (len(n) > 40 and n[:40] == en[:40])):
            return True
    return False


def main():
    # Decide which ticker to schedule today. Use the day of year modulo 3.
    # This rotates HIVE -> KEEL -> ASTS -> HIVE... on successive scheduled runs.
    doy = datetime.now().timetuple().tm_yday
    symbol = ROTATION[doy % len(ROTATION)]
    log(f"Rotation picks: {symbol}")

    state = load_state()
    posted_log = state.get("postedLog", [])

    # Daily cap: if we've already posted a lot today, hold off so we don't spam.
    today_count = state.get("postedToday", 0) or len(state.get("todayPosts", []))
    if today_count >= MAX_DAILY_POSTS:
        log(f"⚠️ Already posted {today_count} today (cap {MAX_DAILY_POSTS}) — skipping this run.")
        return

    # Combined pool: AI-infra trio + $TE solar pool.
    pool = dict(TICKER_POSTS)
    pool["TE"] = TICKER_POSTS_TE

    # Pick the first non-duplicate post from this ticker's pool
    for text in pool[symbol]:
        if not is_dup(text, posted_log):
            _post_direct(text, symbol, state)
            log(f"✅ Posted {symbol} rotation post")
            return
    log(f"⚠️ No fresh {symbol} post left in pool (all dup) — nothing queued.")


def _post_direct(text, symbol, state):
    """Post immediately (real-time) rather than into the FIFO queue, so the
    3x/week ticker posts reliably go out instead of waiting behind other queued
    content. Falls back to queueing if direct post fails."""
    try:
        import post_tweet as pt
        result = pt.post_to_twitter(text, state.get("postedLog", []))
        if result and result != "duplicate":
            now = datetime.now().isoformat()
            state.setdefault("postedLog", []).append({
                "id": f"sched-{symbol}-{datetime.now().strftime('%Y%m%d')}",
                "text": text, "postedAt": now, "storyTitle": symbol,
                "type": "ticker_rotation"})
            state.setdefault("todayPosts", []).append({
                "id": f"sched-{symbol}-{datetime.now().strftime('%Y%m%d')}",
                "text": text, "postedAt": now, "type": "ticker_rotation"})
            state["postedToday"] = len(state.get("todayPosts", []))
            state["date"] = datetime.now().strftime("%Y-%m-%d")
            save_state(state)
            log(f"  ✅ POSTED directly")
            return
        log(f"  ⚠️ direct post returned {result}; queuing instead")
    except Exception as e:
        log(f"  ⚠️ post error ({e}); queuing instead")
    # Fallback: queue it
    state.setdefault("twitterQueue", []).append({
        "id": f"sched-{symbol}-{datetime.now().strftime('%Y%m%d')}",
        "text": text, "content": text, "source": "evergreen",
        "type": "ticker_rotation", "queuedAt": datetime.now().isoformat(),
    })
    save_state(state)


if __name__ == "__main__":
    main()
