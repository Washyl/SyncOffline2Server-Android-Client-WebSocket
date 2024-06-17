#!/bin/bash

# Path to your Node.js application
APP_PATH="/path/to/your/server.js"

# Find the process ID (PID) of the running Node.js application
PID=$(pgrep -f $APP_PATH)

# If the application is running, kill the process
if [ -n "$PID" ]; then
  echo "Stopping Node.js application (PID: $PID)"
  kill $PID
fi

# Wait for a second to ensure the process has stopped
sleep 1

# Start the Node.js application
echo "Starting Node.js application"
nohup node $APP_PATH > /dev/null 2>&1 &
