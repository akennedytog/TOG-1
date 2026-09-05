#!/usr/bin/env python3
"""
Meeting Inbox Watcher — 2026.8.1 capability
===========================================
Watches a drop folder for meeting transcripts/recordings and auto-processes
them into Drive-ready notes with action items (via meeting_notes.py).

Drop any of these into the inbox and they get handled automatically:
  - Text transcripts:  .txt .md .vtt .srt .json
  - Audio/video:       .mp3 .wav .m4a .aac .ogg .mp4 .webm .mov .m4v
                       (transcribed locally with faster-whisper, no cloud)

Processed files move to <inbox>/processed/. A run log is written to
data/meeting_inbox_runs.json so the agent can report what was handled.

Usage:
  python3 agents/meeting_inbox_watcher.py            # process everything new
  python3 agents/meeting_inbox_watcher.py --dry-run  # list what would be handled
"""
import argparse, json, os, re, shutil, subprocess, sys, datetime
from pathlib import Path

WORKSPACE = Path(__file__).resolve().parent.parent
INBOX = WORKSPACE / "meeting-inbox"
PROCESSED = INBOX / "processed"
RUN_LOG = WORKSPACE / "data" / "meeting_inbox_runs.json"
MEETING_SCRIPT = Path(__file__).resolve().parent / "meeting_notes.py"

TEXT_EXTS = {".txt", ".md", ".vtt", ".srt", ".json", ".csv"}
AUDIO_EXTS = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".opus"}
VIDEO_EXTS = {".mp4", ".webm", ".mov", ".m4v", ".mkv", ".avi"}
MEDIA_EXTS = AUDIO_EXTS | VIDEO_EXTS

# Files we never touch
IGNORED = {".DS_Store", "Thumbs.db", ".gitkeep"}


def log_run(entry):
    RUN_LOG.parent.mkdir(parents=True, exist_ok=True)
    runs = []
    if RUN_LOG.exists():
        try:
            runs = json.loads(RUN_LOG.read_text())
        except Exception:
            runs = []
    runs.append(entry)
    RUN_LOG.write_text(json.dumps(runs, indent=2))


def transcribe_media(path):
    """Transcribe an audio/video file with faster-whisper (local, free)."""
    from faster_whisper import WhisperModel
    model = WhisperModel("base", device="cpu", compute_type="int8")
    segments, _info = model.transcribe(str(path), beam_size=5)
    lines = []
    for seg in segments:
        t = seg.start
        mm, ss = int(t // 60), int(t % 60)
        lines.append(f"[{mm:02d}:{ss:02d}] {seg.text.strip()}")
    return "\n".join(lines)


def guess_title(filename):
    """Derive a readable meeting title from the filename."""
    stem = Path(filename).stem
    stem = re.sub(r"[-_]+\s*", " ", stem)
    stem = re.sub(r"\s+", " ", stem).strip()
    # drop leading date like "2026-08-31" or "2026 08 31"
    stem = re.sub(r"^(?:20\d{2}[-_ ]\d{1,2}[-_ ]\d{1,2})\s*", "", stem)
    # drop trailing date/time noise like "2026-08-31" or "1730"
    stem = re.sub(r"\s(?:20\d{2}[-_ ]\d{1,2}[-_ ]\d{1,2}|[0-2]\d[0-5]\d)$", "", stem)
    return stem.title() if stem else "Meeting"


def process_file(path, dry_run=False):
    """Handle one inbox file. Returns a result dict."""
    ext = path.suffix.lower()
    name = path.name
    title = guess_title(name)

    if ext in TEXT_EXTS:
        # Read transcript text
        try:
            text = path.read_text(errors="replace")
        except Exception as e:
            return {"file": name, "status": "error", "error": f"read: {e}"}
        if not text.strip():
            return {"file": name, "status": "skipped", "reason": "empty file"}
        transcript_arg = f"@{path}"
    elif ext in MEDIA_EXTS:
        if dry_run:
            return {"file": name, "status": "would_transcribe", "title": title}
        try:
            text = transcribe_media(path)
        except Exception as e:
            return {"file": name, "status": "error", "error": f"transcribe: {e}"}
        if not text.strip():
            return {"file": name, "status": "skipped", "reason": "empty transcription"}
        # write transcript next to media for the notes script
        txt_path = path.with_suffix(".transcript.txt")
        txt_path.write_text(text)
        transcript_arg = f"@{txt_path}"
    else:
        return {"file": name, "status": "skipped", "reason": f"unsupported ext {ext}"}

    if dry_run:
        return {"file": name, "status": "would_process", "title": title}

    # Run meeting_notes.py
    cmd = [
        sys.executable, str(MEETING_SCRIPT),
        "--title", title,
        "--transcript", transcript_arg,
        "--no-draft",
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        ok = r.returncode == 0
        return {
            "file": name, "status": "ok" if ok else "error",
            "title": title,
            "output": (r.stdout or "")[-500:],
            "stderr": (r.stderr or "")[-500:],
        }
    except subprocess.TimeoutExpired:
        return {"file": name, "status": "error", "error": "timeout"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    INBOX.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)

    files = sorted(
        p for p in INBOX.iterdir()
        if p.is_file() and p.name not in IGNORED
    )
    if not files:
        print("No new files in inbox.")
        return

    results = []
    for f in files:
        res = process_file(f, dry_run=args.dry_run)
        results.append(res)
        # move to processed (unless dry-run or error)
        if not args.dry_run and res.get("status") in ("ok", "skipped"):
            try:
                dest = PROCESSED / f.name
                shutil.move(str(f), str(dest))
                res["moved_to"] = str(dest)
            except Exception as e:
                res["move_error"] = str(e)

    if not args.dry_run:
        log_run({
            "ts": datetime.datetime.now().isoformat(),
            "count": len(results),
            "results": results,
        })

    for r in results:
        print(json.dumps(r))


if __name__ == "__main__":
    main()
