#!/bin/bash
# Blind Spot Engine - Deploy Script
# Deploys the web UI to a publicly accessible location

set -e

echo "🔍 Blind Spot Engine - Deploy"
echo "=============================="

# Check if we should deploy locally or to a server
MODE="${1:-local}"

if [ "$MODE" = "local" ]; then
    echo "Starting local server on port 8766..."
    echo "Access at: http://localhost:8766"
    echo ""
    echo "To run in background: nohup python3 -m uvicorn web.app:app --host 0.0.0.0 --port 8766 &"
    echo "To stop: pkill -f 'uvicorn web.app:app'"
    echo ""
    cd "$(dirname "$0")"
    python3 -m uvicorn web.app:app --host 0.0.0.0 --port 8766 --reload
fi

if [ "$MODE" = "ngrok" ]; then
    echo "Starting with ngrok tunnel..."
    # Check if ngrok is installed
    if ! command -v ngrok &> /dev/null; then
        echo "ngrok not found. Install with: brew install ngrok"
        exit 1
    fi
    
    # Start the server in background
    echo "Starting server..."
    cd "$(dirname "$0")"
    nohup python3 -m uvicorn web.app:app --host 0.0.0.0 --port 8766 > /tmp/blindspot-server.log 2>&1 &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
    
    # Start ngrok
    echo "Starting ngrok tunnel..."
    ngrok http 8766 --log=stdout > /tmp/blindspot-ngrok.log 2>&1 &
    NGROK_PID=$!
    echo "Ngrok PID: $NGROK_PID"
    
    # Wait for ngrok to be ready
    sleep 3
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])")
    echo ""
    echo "✅ Deployed!"
    echo "   Public URL: $NGROK_URL"
    echo "   Server PID: $SERVER_PID"
    echo "   Ngrok PID: $NGROK_PID"
    echo ""
    echo "To stop: kill $SERVER_PID $NGROK_PID"
fi

if [ "$MODE" = "fly" ]; then
    echo "Deploying to Fly.io..."
    cd "$(dirname "$0")"
    
    # Create fly.toml if it doesn't exist
    if [ ! -f fly.toml ]; then
        cat > fly.toml << 'FLYEOF'
app = "blindspot-engine"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8766
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
FLYEOF
    fi
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f Dockerfile ]; then
        cat > Dockerfile << 'DOCKEOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8766

CMD ["uvicorn", "web.app:app", "--host", "0.0.0.0", "--port", "8766"]
DOCKEOF
    fi
    
    fly deploy
    echo "✅ Deployed to Fly.io!"
fi
