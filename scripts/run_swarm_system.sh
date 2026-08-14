#!/bin/bash
# The One Group - Agent Swarm System Runner
# Starts webhook server and file poller

WORKSPACE="$HOME/.openclaw/workspace"
LOG_DIR="$WORKSPACE/logs/swarm"
mkdir -p "$LOG_DIR"

echo "=== The One Group Agent Swarm ==="
echo "Starting at $(date)"

# Check if already running
if pgrep -f "webhook_server.py --server" > /dev/null; then
    echo "Webhook server already running"
else
    echo "Starting webhook server on port 8765..."
    nohup python3 "$WORKSPACE/triggers/webhook_server.py" --server > "$LOG_DIR/webhook_server.log" 2>&1 &
    echo $! > "$LOG_DIR/webhook_server.pid"
    echo "Webhook server started (PID: $(cat $LOG_DIR/webhook_server.pid))"
fi

# Start file poller in background
if pgrep -f "webhook_server.py --poll" > /dev/null; then
    echo "File poller already running"
else
    echo "Starting file trigger poller..."
    nohup python3 "$WORKSPACE/triggers/webhook_server.py" --poll > "$LOG_DIR/poller.log" 2>&1 &
    echo $! > "$LOG_DIR/poller.pid"
    echo "File poller started (PID: $(cat $LOG_DIR/poller.pid))"
fi

echo ""
echo "Swarm system active!"
echo "Webhook: http://localhost:8765"
echo "Trigger files: $WORKSPACE/triggers/pending/"
echo "Logs: $LOG_DIR/"
