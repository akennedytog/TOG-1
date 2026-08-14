# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

### Google Drive

- Account mount: `/Users/aleckennedy/Library/CloudStorage/GoogleDrive-akennedy@theonegroup.info`
- Default deliverables folder: `/Users/aleckennedy/Library/CloudStorage/GoogleDrive-akennedy@theonegroup.info/My Drive/OpenClaw-Deliverables`
- Working rule: copy user-facing output files to the default deliverables folder unless Alec requests a different Drive folder.

### Alec's Email Signature (canonical — always use exactly this)

```
--
Alec Kennedy | The One Group.AI
Founder | CEO | (c) 502.403.7201 | akennedy@theonegroup.info
```

### ⚠️ LESSON (2026-07-31): Never bulk-delete Gmail drafts
list_drafts returns null subjects at top level — subject/to live nested in `message`. A delete filter on subject silently matched everything and wiped drafts, including 2 of Alec's pre-existing personal drafts. Rule: only delete draft IDs we captured at creation time; store created draft IDs in findings/state. Never delete by list-scan.
