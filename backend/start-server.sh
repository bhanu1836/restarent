#!/bin/bash

# Kill any existing server processes
pkill -f "node server.js" 2>/dev/null

# Start the server
cd "$(dirname "$0")"
node server.js > /tmp/backend-server.log 2>&1 &

echo "Backend server started. Check logs at /tmp/backend-server.log"
echo "Server PID: $!"
