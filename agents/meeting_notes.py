#!/usr/bin/env python3
"""
Meeting Notes Workflow — 2026.8.1 capability
============================================
Turns a meeting transcript (or topic + description) into:
  - Structured action items (owner, due date, status)
  - Key decisions + open questions
  - A formatted notes doc saved to Google Drive (OpenClaw-Deliverables/Meeting-Notes/)
  - Optional: a Gmail draft follow-up with assigned action items

Trigger: any client call (The One Group), Pit Row Miami meeting, or internal sync.
The actual meeting-join (Zoom/Teams browser guest + transcript) is handled by the
zoom-meetings / teams-meetings plugins; this script is the POST-PROCESSING step.

Usage:
  python3 agents/meeting_notes.py --title "Pit Row — Monthly Ops" \
      --client "Pit Row Miami" \
      --transcript "text or @file" \
      [--output-dir "..."]

  python3 agents/meeting_notes.py --title "..." --transcript @notes_raw.txt --no-draft
"""
import argparse, re, json, os, subprocess, sys, datetime
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
DRIVE_ROOT = Path(os.environ.get(
    "DRIVE_ROOT",
    "/Users/aleckennedy/Library/CloudStorage/GoogleDrive-akennedy@theonegroup.info/My Drive/OpenClaw-Deliverables",
))
DEFAULT_OUT = DRIVE_ROOT / "Meeting-Notes"


# ---------- helpers ----------

def strip_meta(t):
    """Remove common transcript noise: timestamps, speaker labels kept lightly."""
    t = re.sub(r"\[\d{2}:\d{2}(?::\d{2})?\]", "", t)
    t = re.sub(r"\(\d{2}:\d{2}\)", "", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t.strip()


def segment_transcript(text, max_chars=2400):
    """Split long transcripts into chunks for processing/summarization."""
    words = text.split()
    chunks, cur = [], []
    cur_len = 0
    for w in words:
        if cur_len + len(w) + 1 > max_chars and cur:
            chunks.append(" ".join(cur)); cur, cur_len = [], 0
        cur.append(w); cur_len += len(w) + 1
    if cur:
        chunks.append(" ".join(cur))
    return chunks


# ---------- action-item extraction (heuristic + LLM-friendly) ----------
# We attempt a small local extraction first, then leave a clear LLM prompt
# block for the agent to refine when invoked interactively.

ACTION_PATTERNS = [
    r"(?:we|I|Alec|you|team|everyone|someone)\s+(?:need|need to|should|will|gonna|going to|have to)\s+([^.,;]{4,90})",
    r"(?:action[^\n:]{0,20}?:?\s*)([^\n]{4,90})",
    r"(?:to[- ]?do|todo|follow[- ]?up|next steps?)[:\- ]\s*([^\n]{4,120})",
    r"(?:send|schedule|research|follow up|reach out|review|finalize|draft|set up|book|update)\s+([^.,;\n]{4,90})",
]

def extract_actions(text):
    found = []
    for pat in ACTION_PATTERNS:
        for m in re.finditer(pat, text, re.I):
            cand = m.group(1).strip().rstrip(".:;,")
            if len(cand) >= 5 and cand not in found:
                found.append(cand)
    # dedupe near-dups
    uniq = []
    for f in found:
        if not any(f.lower()[:30] in u.lower() or u.lower()[:30] in f.lower() for u in uniq):
            uniq.append(f)
    return uniq[:20]


def detect_client(client):
    """Attach a sector/CRM hint based on client name."""
    c = client.lower()
    if "pit row" in c or "pitrow" in c:
        return "Pit Row Miami | client-facing ops/dining"
    if "one group" in c or "tog" in c:
        return "The One Group | AI agency"
    return client


# ---------- main ----------

def refine_with_ollama(text, title, client):
    """Use a local Ollama model to produce structured meeting refinement.
    Returns (actions, decisions, questions, summary). Falls back to heuristics on any failure."""
    import urllib.request, json as _json
    actions_h = extract_actions(text)
    prompt = (
        "You extract structured meeting notes. Respond ONLY as:"
        "###ACTIONS###\n- action|owner|due|status\n...\n"
        "###DECISIONS###\n- <decision>\n...\n"
        "###QUESTIONS###\n- <question>\n...\n"
        "###SUMMARY###\n- <bullet>\n...\n"
        f"Meeting: {title}" + (f" | Client: {client}" if client else "") + "\n\nTranscript:\n" + text[:6000]
    )
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:11434/api/generate",
            data=_json.dumps({
                "model": "llama3:latest",
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 1200},
            }).encode(),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=180) as r:
            out = _json.loads(r.read().decode())
        raw = out.get("response", "")
    except Exception as e:
        return [{"action": a, "owner": "", "due": "", "status": "open"} for a in actions_h], [], [], [f"(refinement unavailable: {e})"]

    def grab(section):
        m = re.search(r"###\s*" + section + r"\s*###([\s\S]*?)(?=###|\Z)", raw)
        if not m:
            return []
        out_lines = []
        for l in m.group(1).split("\n"):
            s = l.strip().lstrip("- ").lstrip("*").strip()
            if s and s.lower() not in ("none", "n/a"):
                out_lines.append(s)
        return out_lines[:8]

    act_raw = grab("ACTIONS")
    acts = []
    for a in act_raw:
        parts = [p.strip() for p in a.split("|")]
        if len(parts) >= 1 and len(parts[0]) >= 5:
            acts.append({"action": parts[0], "owner": parts[1] if len(parts) > 1 else "",
                         "due": parts[2] if len(parts) > 2 else "", "status": "open"})
    if not acts:
        acts = [{"action": a, "owner": "", "due": "", "status": "open"} for a in actions_h]
    return acts, grab("DECISIONS"), grab("QUESTIONS"), grab("SUMMARY")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--title", required=True)
    ap.add_argument("--client", default="")
    ap.add_argument("--transcript", default="")
    ap.add_argument("--output-dir", default=str(DEFAULT_OUT))
    ap.add_argument("--no-draft", action="store_true", help="skip Gmail draft")
    ap.add_argument("--json", action="store_true", help="emit machine JSON")
    ap.add_argument("--no-refine", action="store_true", help="skip local LLM refinement (fallback to heuristic)")
    args = ap.parse_args()

    # load transcript from arg or file (prefix @)
    trans = args.transcript
    if trans.startswith("@"):
        p = Path(trans[1:])
        if not p.is_absolute():
            p = WORKSPACE / p
        trans = p.read_text() if p.exists() else ""

    trans_clean = strip_meta(trans)

    actions = extract_actions(trans_clean)
    chunks = segment_transcript(trans_clean)

    # Local model refinement (free, Ollama) — fills decisions/questions/summary + owners/due
    refined_actions, decisions, questions, summary = [], [], [], []
    if not args.no_refine and trans_clean:
        refined_actions, decisions, questions, summary = refine_with_ollama(trans_clean, args.title, args.client)
        if refined_actions:
            actions = refined_actions  # use owner/due-enriched version

    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    ts = now.strftime("%Y-%m-%d %H:%M")

    client_hint = detect_client(args.client) if args.client else ""

    # Build notes doc
    md = []
    md.append(f"# {args.title}")
    md.append("")
    md.append(f"**Date:** {ts}")
    if args.client:
        md.append(f"**Client:** {args.client}")
    if client_hint:
        md.append(f"**Context:** {client_hint}")
    md.append("")
    md.append("## Executive Summary")
    md.append("")
    if summary:
        for s in summary:
            md.append(f"- {s}")
    else:
        md.append("- _(generated on refine)_")
    md.append("")
    md.append("## Action Items")
    md.append("")
    md.append("| # | Action | Owner | Due | Status |")
    md.append("|---|--------|-------|-----|--------|")
    for i, a in enumerate(actions, 1):
        owner = a.get("owner", "") if isinstance(a, dict) else ""
        due = a.get("due", "") if isinstance(a, dict) else ""
        act_txt = a.get("action", "") if isinstance(a, dict) else a
        md.append(f"| {i} | {act_txt} | {owner} | {due} | open |")
    if not actions:
        md.append("| 1 | _(no explicit action items auto-extracted)_ |  |  |  |")
    md.append("")
    md.append("## Key Decisions")
    md.append("")
    for d in decisions:
        md.append(f"- {d}")
    if not decisions:
        md.append("- _none recorded_")
    md.append("")
    md.append("## Open Questions")
    md.append("")
    for q in questions:
        md.append(f"- {q}")
    if not questions:
        md.append("- _none_")
    md.append("")
    md.append("---")
    md.append("")
    if chunks:
        md.append("## Transcript (reference)")
        for i, c in enumerate(chunks[:4], 1):
            md.append(f"\n### Segment {i}\n```\n{c}\n```")

    body = "\n".join(md)

    # Write to output dir
    outdir = Path(args.output_dir)
    outdir.mkdir(parents=True, exist_ok=True)
    safe_title = re.sub(r"[^\w\-]+", "_", args.title)
    outfile = outdir / f"{date_str}_{safe_title}.md"
    outfile.write_text(body)
    print(f"NOTES_SAVED: {outfile}")

    # Build machine-readable structured payload
    result_actions = []
    for a in actions:
        if isinstance(a, dict):
            result_actions.append(a)
        else:
            result_actions.append({"action": a, "owner": "", "due": "", "status": "open"})
    result = {
        "title": args.title,
        "client": args.client,
        "date": date_str,
        "actions": result_actions,
        "notes_file": str(outfile),
        "chunks": len(chunks),
        "decisions": decisions,
        "open_questions": questions,
        "summary": summary,
    }

    # Gmail draft (optional)
    draft_status = "skipped"
    if not args.no_draft:
        draft_status = _draft_gmail(result_actions)

    result["gmail_draft"] = draft_status
    if args.json:
        print(json.dumps(result, indent=2))

    # Persist a run record for later reconciliation
    run_record = {
        "title": args.title, "client": args.client, "date": now.isoformat(),
        "actions": actions, "notes_file": str(outfile), "draft": draft_status,
    }
    runs_file = WORKSPACE / "data" / "meeting_notes_runs.json"
    runs_file.parent.mkdir(exist_ok=True)
    existing = []
    if runs_file.exists():
        try: existing = json.loads(runs_file.read_text())
        except Exception: existing = []
    existing.append(run_record)
    runs_file.write_text(json.dumps(existing, indent=2))
    print(f"RUN_RECORD_UPDATED: {runs_file}")


def _draft_gmail(args, actions):
    """Create a Gmail draft with follow-up items. Returns status string."""
    try:
        import gog  # gog skill helper if present in workspace
        return "gog-available-not-auto-drafted"
    except Exception:
        # Attempt simple gmail send via CLI if configured; otherwise note it
        return "draft-not-auto-created-(open gog/gmail to finalize)"


if __name__ == "__main__":
    main()
