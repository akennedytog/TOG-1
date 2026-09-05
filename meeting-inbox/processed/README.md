# 📥 Meeting Inbox

Drop meeting transcripts or recordings here and they'll be auto-processed
into Drive-ready notes with action items (owners + due dates).

## What you can drop in
- **Text transcripts:** `.txt` `.md` `.vtt` `.srt` `.json`
- **Audio/video:** `.mp3` `.wav` `.m4a` `.aac` `.ogg` `.mp4` `.webm` `.mov`
  (transcribed locally — nothing leaves your machine)

## How it works
1. Drop a file here (any time, Mon–Fri 8am–8pm)
2. Within ~15 min it's processed automatically
3. Notes land in Google Drive → `OpenClaw-Deliverables/Meeting-Notes/`
4. The source file moves to `processed/`

## Naming tip
Name the file with the meeting, e.g. `2026-08-31-pitrow-ops.txt` →
notes titled "Pitrow Ops". The date prefix is stripped automatically.

## Manual run
`python3 agents/meeting_inbox_watcher.py` (from the workspace)
