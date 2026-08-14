#!/usr/bin/env python3
"""
Feedback Loop — makes Arlo learn from Iris's outreach results.

CLOSES THE LOOP: Iris records which outreach actually gets a reply/booking, and
Arlo uses that signal to bias future lead discovery toward industries + cities
that respond — while still exploring the rest so it doesn't tunnel-vision.

Why this matters (2026-08-10): agents were producing but not coordinating.
Nothing told Arlo "stop finding X, Y replies 4x better." This is the outcome-linked
loop that turns the 8-agent system from a producer into a learner.

Files:
  - data/reply_signals.json  : the rolling signal log + derived weights
  - Written by Iris (record_reply_signal) on reply/booking signals
  - Read by Arlo (weighted_rotation_pairs / industry_weight) to bias discovery
"""
import json, os
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
SIGNALS_FILE = WS / "data/reply_signals.json"
MAX_SIGNALS = 500  # keep the rolling log bounded

# Outcome types we track, weighted by how strongly they prove the market wants this
OUTCOME_WEIGHT = {
    "reply":       1.0,   # got a reply (warm signal)
    "positive":    1.5,   # interested / asked for more
    "booking":     3.0,   # booked a call / meeting (strongest)
    "audit":       3.0,   # requested an audit (paid-ish signal)
    "converted":   5.0,   # became a customer (strongest)
    "no_reply":   -0.5,   # no response (slight negative — still not proof of "bad")
}


def _load():
    if SIGNALS_FILE.exists():
        try:
            return json.load(open(SIGNALS_FILE))
        except Exception:
            pass
    return {"signals": [], "weights": {}}


def _save(d):
    json.dump(d, open(SIGNALS_FILE, "w"), indent=2)


def record_reply_signal(lead, outcome, detail=""):
    """Iris calls this when outreach gets a reply/booking/etc.
    lead: dict with at least 'industry' and 'city'.
    outcome: one of OUTCOME_WEIGHT keys (reply/positive/booking/audit/converted/no_reply).
    """
    if outcome not in OUTCOME_WEIGHT:
        print(f"  ⚠️ unknown outcome '{outcome}' — ignoring")
        return
    industry = (lead.get("industry") or "unknown").strip().lower()
    city = (lead.get("city") or "unknown").strip().lower()
    d = _load()
    d["signals"].append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "industry": industry,
        "city": city,
        "outcome": outcome,
        "weight": OUTCOME_WEIGHT[outcome],
        "detail": detail,
        "lead": lead.get("name", ""),
    })
    # bound the rolling log
    if len(d["signals"]) > MAX_SIGNALS:
        d["signals"] = d["signals"][-MAX_SIGNALS:]
    # recompute weights from the window (decay older signals)
    d["weights"] = _compute_weights(d["signals"])
    _save(d)
    print(f"  🔁 recorded reply signal: {industry}/{city} = {outcome} ({OUTCOME_WEIGHT[outcome]})")


def _compute_weights(signals, decay_half_life_days=21.0):
    """Derive per-(industry,city) and per-industry weights from the signal log.
    Older signals decay so the model tracks current reality, not ancient history."""
    from collections import defaultdict
    now = datetime.now(timezone.utc).timestamp()
    ind = defaultdict(float)
    pair = defaultdict(float)
    ind_count = defaultdict(int)
    for s in signals:
        try:
            age_days = (now - datetime.fromisoformat(s["ts"]).timestamp()) / 86400.0
        except Exception:
            age_days = 0
        decay = 0.5 ** (age_days / decay_half_life_days)
        w = s["weight"] * decay
        ind[s["industry"]] += w
        ind_count[s["industry"]] += 1
        pair[(s["industry"], s["city"])] += w
    # normalize industry weights to a ~[-1, 3] band for easy use
    ind_w = {k: max(-1.0, min(3.0, v / max(1, ind_count[k]))) for k, v in ind.items()}
    return {"industry": ind_w, "pair": {f"{i}::{c}": w for (i, c), w in pair.items()}}


def industry_weight(industry):
    """Return the learned weight for an industry (0 = neutral baseline)."""
    return _load().get("weights", {}).get("industry", {}).get(industry.lower(), 0.0)


def weighted_rotation_pairs(n, industries=None, cities=None, explore_frac=0.3):
    """Arlo's discovery rotation, biased by reply signals.

    Returns n (industry, city) pairs. With probability explore_frac it picks a
    random combo (exploration so we don't tunnel-vision). Otherwise it samples
    combos weighted by learned industry+pair signals, so we lean into what works.

    industries/cities: override Arlo's defaults (for testing or when the grid changes).
    """
    import random
    industries = industries or ["HVAC", "Plumbing", "Electrical", "Dental", "Legal",
                                "Accounting", "Real Estate", "Home Services", "Medical",
                                "Roofing", "Landscaping", "Pest Control"]
    cities = cities or ["West Palm Beach", "Boca Raton", "Fort Lauderdale", "Delray Beach",
                        "Boynton Beach", "Lake Worth", "Palm Beach Gardens", "Jupiter",
                        "Wellington", "Coral Springs"]
    weights = _load().get("weights", {})
    ind_w = weights.get("industry", {})
    combos = [(i, c) for i in industries for c in cities]

    def combo_weight(combo):
        i, c = combo
        # base from industry signal, plus a bonus if that specific pair has done well
        w = ind_w.get(i.lower(), 0.0)
        pair_w = weights.get("pair", {}).get(f"{i.lower()}::{c.lower()}", 0.0)
        return max(0.0, 1.0 + w + pair_w)

    picked = []
    for _ in range(n):
        if random.random() < explore_frac or not any(ind_w.values()):
            picked.append(random.choice(combos))
        else:
            # weighted choice over combos
            ws = [combo_weight(c) for c in combos]
            total = sum(ws)
            if total <= 0:
                picked.append(random.choice(combos))
            else:
                r = random.random() * total
                acc = 0.0
                chosen = combos[-1]
                for c, w in zip(combos, ws):
                    acc += w
                    if r <= acc:
                        chosen = c
                        break
                picked.append(chosen)
    return picked


def build_feedback_report():
    """Human-readable summary of what outreach is working — surfaced to Alec."""
    d = _load()
    sig = d.get("signals", [])
    if not sig:
        return "No reply signals recorded yet. (Iris will log replies/books as they come in.)"
    from collections import defaultdict
    by_outcome = defaultdict(int)
    by_ind = defaultdict(int)
    for s in sig:
        by_outcome[s["outcome"]] += 1
        by_ind[s["industry"]] += 1
    lines = ["📊 FEEDBACK REPORT — what outreach is working"]
    lines.append(f"Total signals: {len(sig)}")
    lines.append("By outcome: " + ", ".join(f"{k}={v}" for k, v in sorted(by_outcome.items())))
    lines.append("By industry: " + ", ".join(
        f"{k}={v}" for k, v in sorted(by_ind.items(), key=lambda x: -x[1])))
    lines.append("Learned industry weights (top): " + ", ".join(
        f"{k}={round(v,2)}" for k, v in sorted(
            d.get("weights", {}).get("industry", {}).items(),
            key=lambda x: -x[1])[:5]))
    return "\n".join(lines)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "report":
        print(build_feedback_report())
    else:
        # quick self-test
        print(build_feedback_report())
        print("\n-- sample weighted rotation (10) --")
        for p in weighted_rotation_pairs(10, explore_frac=0.3):
            print("  ", p)
