#!/usr/bin/env python3
"""
The One Group - Webhook Server
Receives external triggers and spawns agent swarms
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import threading
import time

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "agents" / "swarm"))

try:
    from agent_orchestrator import AgentSwarm, TriggerType
except ImportError:
    print("AgentSwarm not available, running in stub mode")
    AgentSwarm = None
    TriggerType = None

class TriggerHandler(BaseHTTPRequestHandler):
    """Handle incoming webhook triggers"""
    
    def log_message(self, format, *args):
        """Custom logging"""
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")
    
    def do_POST(self):
        """Process POST requests as triggers"""
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
            trigger_type = data.get('trigger')
            payload = data.get('payload', {})
            priority = data.get('priority', 5)
            
            # Log the trigger
            self.log_message(f"Received trigger: {trigger_type}")
            
            # Process if we have the swarm
            if AgentSwarm and TriggerType:
                swarm = AgentSwarm()
                try:
                    trigger_enum = TriggerType(trigger_type)
                    results = swarm.process_trigger(trigger_enum, payload, priority)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        "status": "ok",
                        "trigger": trigger_type,
                        "agents_spawned": len(results),
                        "results": results
                    }).encode())
                    return
                except ValueError:
                    self.send_error(400, f"Unknown trigger type: {trigger_type}")
                    return
            else:
                # Stub mode - just acknowledge
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "queued",
                    "trigger": trigger_type,
                    "message": "AgentSwarm not loaded, trigger queued"
                }).encode())
                
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
        except Exception as e:
            self.send_error(500, str(e))
    
    def do_GET(self):
        """Health check endpoint"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            "status": "running",
            "service": "The One Group Trigger Server",
            "version": "1.0.0"
        }).encode())

class TriggerPoller:
    """Poll for triggers from various sources"""
    
    def __init__(self):
        self.workspace = Path(os.path.expanduser("~/.openclaw/workspace"))
        self.trigger_dir = self.workspace / "triggers" / "pending"
        self.trigger_dir.mkdir(parents=True, exist_ok=True)
        
    def check_file_triggers(self):
        """Check for trigger files dropped in pending directory"""
        for trigger_file in self.trigger_dir.glob("*.json"):
            try:
                with open(trigger_file) as f:
                    data = json.load(f)
                
                trigger_type = data.get('trigger')
                payload = data.get('payload', {})
                priority = data.get('priority', 5)
                
                print(f"Processing file trigger: {trigger_type}")
                
                if AgentSwarm and TriggerType:
                    swarm = AgentSwarm()
                    trigger_enum = TriggerType(trigger_type)
                    results = swarm.process_trigger(trigger_enum, payload, priority)
                    print(f"Spawned {len(results)} agents")
                
                # Archive processed trigger
                archive_dir = self.workspace / "triggers" / "processed"
                archive_dir.mkdir(parents=True, exist_ok=True)
                trigger_file.rename(archive_dir / trigger_file.name)
                
            except Exception as e:
                print(f"Error processing trigger {trigger_file}: {e}")
                # Move to failed
                failed_dir = self.workspace / "triggers" / "failed"
                failed_dir.mkdir(parents=True, exist_ok=True)
                trigger_file.rename(failed_dir / trigger_file.name)
    
    def run(self):
        """Main polling loop"""
        print("Trigger Poller started")
        while True:
            self.check_file_triggers()
            time.sleep(10)  # Check every 10 seconds

def run_server(port=8765):
    """Run the webhook server"""
    server = HTTPServer(('localhost', port), TriggerHandler)
    print(f"Trigger Server running on http://localhost:{port}")
    print("Endpoints:")
    print(f"  GET  http://localhost:{port}/health - Health check")
    print(f"  POST http://localhost:{port}/trigger - Send triggers")
    server.serve_forever()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="The One Group Trigger Server")
    parser.add_argument('--server', action='store_true', help='Run HTTP server')
    parser.add_argument('--poll', action='store_true', help='Run file poller')
    parser.add_argument('--port', type=int, default=8765, help='Server port')
    args = parser.parse_args()
    
    if args.server:
        run_server(args.port)
    elif args.poll:
        poller = TriggerPoller()
        poller.run()
    else:
        print("Usage:")
        print("  python webhook_server.py --server    # Run HTTP server")
        print("  python webhook_server.py --poll        # Run file poller")
