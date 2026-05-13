# Telegram Integration Setup Guide

## Overview
Connect OpenClaw to Telegram so you can chat with me from your iPhone anywhere.

## Step 1: Create Telegram Bot

1. Open Telegram app on your iPhone
2. Search for "@BotFather" (official Telegram bot creator)
3. Start chat and send: `/newbot`
4. Follow prompts:
   - Name your bot (e.g., "The One Group AI")
   - Choose username (e.g., "theonegroup_ai_bot")
5. BotFather will give you a **TOKEN** (looks like: `123456789:ABCdefGHIjklMNOpqrSTUvwxyz`)
6. **SAVE THIS TOKEN** - you'll need it

## Step 2: Get Your Chat ID

1. Message your new bot
2. Visit: `https://api.telegram.org/botYOUR_TOKEN/getUpdates`
   (replace YOUR_TOKEN with actual token)
3. Look for `"chat":{"id":12345678` - that number is your Chat ID

## Step 3: Configure OpenClaw

Add to your `~/.openclaw/openclaw.json`:

```json
{
  "integrations": {
    "telegram": {
      "enabled": true,
      "bot_token": "YOUR_BOT_TOKEN_HERE",
      "chat_id": "YOUR_CHAT_ID_HERE",
      "webhook_url": "https://your-ngrok-url.ngrok.io/webhook/telegram"
    }
  }
}
```

## Step 4: Start the Telegram Bridge

Run: `node ~/.openclaw/workspace/telegram-bridge.js`

## Features

✅ Message me from iPhone anywhere
✅ Get notifications when agents complete tasks
✅ Send commands to spawn agents
✅ Receive grant reminders
✅ Dashboard alerts

## Commands

- `/status` - Check system status
- `/agents` - List running agents
- `/grant` - Show next grant deadline
- `/help` - Show all commands