#!/usr/bin/env python3
"""
OneGroup Growth Engine — X Content Machine

Produces editorial, authority-building X posts for Alec's account per the
Growth Engine spec. Focuses on teaching practical AI systems, sharing POV,
showing the build journey, and turning real work into business implications.

CONTENT PILLARS (balanced mix):
  1. AI systems for small businesses (lead-response, missed-call, proposals,
     reporting, onboarding)
  2. Behind the build (what Alec is learning building OneGroup + OpenClaw agents)
  3. Operator insights (sales, workflow, follow-up, decision-making)
  4. Timely AI analysis (only developments that change how a business operates)
  5. Proof / case-study thinking (clearly labeled hypothetical if not real client work)

EDITORIAL PRINCIPLES: every post teaches a system, shares a POV, breaks down a
workflow, shows the journey, or turns a build into a business implication.
Avoids generic news, hype, empty motivation, unverified claims, and bot-sounding
marketing copy.

USAGE:
  python3 onegroup_content.py --daily          # today's primary post + optional 2nd + thread idea
  python3 onegroup_content.py --weekly         # Sunday weekly content plan (5 posts, 2 threads, 3 replies)
  python3 onegroup_content.py --list           # list recent generated posts
  python3 onegroup_content.py --log <id> --status approved|posted   # update a post's status
  python3 onegroup_content.py --draft <pillar> # draft a single post from a pillar

Requires: nothing external (generates drafts locally). Posting is done via
post_tweet.py / tweepy after Alec approves.
"""
import argparse
import json
import random
from datetime import datetime, timedelta
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
CONTENT_FILE = WS / "data" / "onegroup_content.json"

# Alec's voice guardrails
VOICE = {
    "direct": True, "practical_over_technical": True, "short_sentences": True,
    "confident_without_exaggeration": True, "no_hype": True,
}

# ---- Content library ------------------------------------------------------
# Each pillar has a set of post templates. {var} placeholders get filled with
# concrete, real details from the build (never invented client claims).

PILLARS = {
    "ai_systems": {
        "label": "AI systems for small businesses",
        "templates": [
            {
                "text": (
                    "Most SMBs don't need 'AI transformation.'\n\n"
                    "They need ONE system that handles the basics exceptionally well.\n\n"
                    "For most, that's the lead-response problem:\n"
                    "• Calls go to voicemail after hours\n"
                    "• Leads wait 24-48h for a reply\n"
                    "• Follow-up is manual and inconsistent\n\n"
                    "A simple agent that answers, qualifies, and books fixes all three.\n\n"
                    "Start there. Measure. Then scale."
                ),
                "why": "Teaches a concrete system (lead-response) any SMB owner recognizes.",
                "goal": "authority",
                "visual": "Screenshot of a lead-response agent booking an appointment from a missed call.",
            },
            {
                "text": (
                    "The highest-ROI automation for most businesses isn't flashy.\n\n"
                    "It's the boring one: follow-up.\n\n"
                    "Most leads go cold because nobody follows up fast enough.\n\n"
                    "An agent that:\n"
                    "• Replies within 60 seconds\n"
                    "• Qualifies with 3 questions\n"
                    "• Books into the calendar\n\n"
                    "…turns 'we'll get back to you' into 'when can you come in?'\n\n"
                    "Speed is the feature."
                ),
                "why": "Frames follow-up speed as the real product — practical and credible.",
                "goal": "lead_generation",
                "visual": "Simple before/after: '48h reply' vs '60s reply'.",
            },
            {
                "text": (
                    "A proposal generator is a 1-day build that pays for itself.\n\n"
                    "The workflow:\n"
                    "1. Discovery notes go in\n"
                    "2. Agent drafts scope + pricing + timeline\n"
                    "3. You review, edit, send\n\n"
                    "You don't replace judgment. You remove the blank-page problem.\n\n"
                    "Every business has a 'blank page' task. Find it, automate it."
                ),
                "why": "Concrete, buildable system with a clear before/after.",
                "goal": "trust",
                "visual": "Side-by-side: blank doc vs generated proposal draft.",
            },
        ],
    },
    "behind_build": {
        "label": "Behind the build",
        "templates": [
            {
                "text": (
                    "I spent this week building a 'Family Chief of Staff' on our SMS line.\n\n"
                    "It's a set of scheduled agents that:\n"
                    "• Send morning/evening/weekly briefings\n"
                    "• Capture tasks and shopping by text\n"
                    "• Cancel calendar events (with confirmation)\n"
                    "• Track supplies and flag restocks\n\n"
                    "No dashboard. It just texts us.\n\n"
                    "The lesson: the best AI systems are the ones you forget are there."
                ),
                "why": "Shows the real build journey — authentic and specific.",
                "goal": "trust",
                "visual": "Screenshot of a morning briefing text message.",
            },
            {
                "text": (
                    "Building agents taught me the 80/20 rule applies to AI too.\n\n"
                    "20% of the setup delivers 80% of the value:\n"
                    "• Clear instructions\n"
                    "• One good data source\n"
                    "• A simple fallback\n\n"
                    "The other 80% (fancy prompts, complex chains) is usually polish.\n\n"
                    "Ship the 20%. Iterate in production."
                ),
                "why": "Shares a real lesson from building — grounded, not hype.",
                "goal": "authority",
                "visual": "Simple 80/20 diagram.",
            },
        ],
    },
    "operator": {
        "label": "Operator insights",
        "templates": [
            {
                "text": (
                    "The best sales follow-up isn't 'just checking in.'\n\n"
                    "It adds value every time:\n"
                    "• A relevant example\n"
                    "• A new idea\n"
                    "• A useful question\n\n"
                    "If you can't add value, don't send it.\n\n"
                    "An AI agent can draft the value-add follow-up. You add the judgment.\n\n"
                    "That's the division of labor that works."
                ),
                "why": "Sales/operator lesson that AI improves — practical and credible.",
                "goal": "relationship",
                "visual": "Example of a value-add follow-up vs a 'just checking in' one.",
            },
            {
                "text": (
                    "Most businesses don't have a data problem.\n\n"
                    "They have a 'nobody looks at the data' problem.\n\n"
                    "A weekly report that lands in your inbox — automatically — changes that.\n\n"
                    "Revenue, leads, follow-ups, bottlenecks. One page. Every Monday.\n\n"
                    "You don't need a dashboard. You need a habit.\n\n"
                    "Automate the habit."
                ),
                "why": "Turns reporting into a practical system — high resonance with owners.",
                "goal": "authority",
                "visual": "Sample one-page weekly report.",
            },
        ],
    },
    "timely_ai": {
        "label": "Timely AI analysis",
        "templates": [
            {
                "text": (
                    "Every AI release gets the same question from business owners:\n\n"
                    "'Do I need to care?'\n\n"
                    "My rule: only care if it changes how you operate.\n\n"
                    "Most releases don't. A few do.\n\n"
                    "The ones that matter are the ones that remove a step from a workflow you already have.\n\n"
                    "Ignore the hype. Watch for workflow changes."
                ),
                "why": "Gives owners a decision framework for AI news — sharp POV.",
                "goal": "reach",
                "visual": "Simple decision tree: 'Does this change a workflow?'",
            },
        ],
    },
    "proof": {
        "label": "Proof / case-study thinking",
        "templates": [
            {
                "text": (
                    "Hypothetical example (not a real client):\n\n"
                    "A home-services company was missing 40% of after-hours calls.\n\n"
                    "Before:\n"
                    "• Voicemail → callback next day → lead gone cold\n\n"
                    "After:\n"
                    "• Agent answers 24/7 → qualifies → books appointment\n\n"
                    "The fix wasn't a 'digital transformation.'\n\n"
                    "It was one system that handled the basics.\n\n"
                    "Most businesses are one system away from a real change."
                ),
                "why": "Case-study thinking, clearly labeled hypothetical — credible and useful.",
                "goal": "lead_generation",
                "visual": "Before/after workflow diagram.",
            },
        ],
    },
}


def load_content():
    if CONTENT_FILE.exists():
        try:
            return json.loads(CONTENT_FILE.read_text())
        except Exception:
            pass
    return {"posts": [], "last_daily": None, "last_weekly": None}


def save_content(c):
    CONTENT_FILE.parent.mkdir(parents=True, exist_ok=True)
    CONTENT_FILE.write_text(json.dumps(c, indent=2))


def draft_post(pillar):
    """Draft a single post from a pillar (random template)."""
    tpl = random.choice(PILLARS[pillar]["templates"])
    return {
        "pillar": pillar,
        "pillar_label": PILLARS[pillar]["label"],
        "text": tpl["text"],
        "why": tpl["why"],
        "goal": tpl["goal"],
        "visual": tpl.get("visual", ""),
        "created_at": datetime.now().isoformat(),
        "status": "draft",
    }


def daily_pack():
    """Today's primary post + optional second + thread idea."""
    c = load_content()
    today = datetime.now().strftime("%Y-%m-%d")
    # Primary post — rotate pillars, avoid repeating the last pillar used.
    pillars = list(PILLARS.keys())
    last = c.get("last_daily_pillar")
    if last in pillars:
        pillars.remove(last)
    primary_pillar = random.choice(pillars)
    primary = draft_post(primary_pillar)
    primary["status"] = "ready"
    # Optional second post — different pillar.
    second_pillar = random.choice([p for p in PILLARS if p != primary_pillar])
    second = draft_post(second_pillar)
    second["status"] = "optional"
    # Thread idea.
    thread = {
        "pillar": "behind_build",
        "text": ("Thread idea: 'How I built a Family Chief of Staff with scheduled agents'\n"
                 "1. The problem (household chaos)\n"
                 "2. The system (briefings, tasks, calendar)\n"
                 "3. The lesson (best AI is invisible)"),
        "status": "thread_idea",
        "created_at": datetime.now().isoformat(),
    }
    c["posts"].append(primary)
    c["posts"].append(second)
    c["posts"].append(thread)
    c["last_daily"] = today
    c["last_daily_pillar"] = primary_pillar
    save_content(c)
    return primary, second, thread


def weekly_plan():
    """Sunday weekly content plan: 5 posts, 2 threads, 3 reply targets."""
    c = load_content()
    plan = {"date": datetime.now().strftime("%Y-%m-%d"), "posts": [], "threads": [], "replies": []}
    # 5 primary posts — one per pillar, plus one repeat of a high-value pillar.
    pillars = list(PILLARS.keys())
    for i in range(5):
        pillar = pillars[i % len(pillars)]
        post = draft_post(pillar)
        post["status"] = "planned"
        plan["posts"].append(post)
    # 2 thread ideas
    plan["threads"] = [
        {"topic": "How to pick the first thing to automate in your business", "goal": "authority"},
        {"topic": "The lead-response problem: why speed is the feature", "goal": "lead_generation"},
    ]
    # 3 reply targets / conversation opportunities
    plan["replies"] = [
        {"target": "SMB owners complaining about manual follow-up", "angle": "offer a concrete fix"},
        {"target": "AI builders sharing agent workflows", "angle": "add an operator perspective"},
        {"target": "Local business owners asking about AI", "angle": "share a practical system"},
    ]
    c["posts"].extend(plan["posts"])
    c["last_weekly"] = plan["date"]
    save_content(c)
    return plan


def fmt_post(p):
    return (f"[{p.get('status','')}] ({p.get('pillar','')}) goal={p.get('goal','')}\n"
            f"{p.get('text','')}\n\n"
            f"WHY: {p.get('why','')}\n"
            f"VISUAL: {p.get('visual','') or 'none'}\n"
            f"---")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--daily", action="store_true")
    ap.add_argument("--weekly", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--draft", help="pillar name")
    ap.add_argument("--log", help="post index to update")
    ap.add_argument("--status", help="draft|ready|approved|posted")
    args = ap.parse_args()

    if args.daily:
        primary, second, thread = daily_pack()
        print("=== PRIMARY POST (ready to publish) ===")
        print(fmt_post(primary))
        print("\n=== OPTIONAL SECOND POST ===")
        print(fmt_post(second))
        print("\n=== THREAD IDEA ===")
        print(thread["text"])
        return

    if args.weekly:
        plan = weekly_plan()
        print(f"🗓️ Weekly Content Plan — {plan['date']}")
        print("\n=== 5 PRIMARY POSTS ===")
        for i, p in enumerate(plan["posts"], 1):
            print(f"\n--- Post {i} ---")
            print(fmt_post(p))
        print("\n=== 2 THREAD IDEAS ===")
        for t in plan["threads"]:
            print(f"  • {t['topic']} ({t['goal']})")
        print("\n=== 3 REPLY TARGETS ===")
        for r in plan["replies"]:
            print(f"  • {r['target']} → {r['angle']}")
        return

    if args.draft:
        p = draft_post(args.draft)
        print(fmt_post(p))
        return

    if args.log and args.status:
        c = load_content()
        idx = int(args.log)
        if 0 <= idx < len(c["posts"]):
            c["posts"][idx]["status"] = args.status
            save_content(c)
            print(f"✅ Post {idx} marked {args.status}")
        else:
            print("Invalid index.")
        return

    if args.list:
        c = load_content()
        for i, p in enumerate(c["posts"]):
            print(f"[{i}] ({p.get('status','')}) {p.get('pillar','')}: {p.get('text','')[:60]}...")
        return

    ap.print_help()


if __name__ == "__main__":
    main()
