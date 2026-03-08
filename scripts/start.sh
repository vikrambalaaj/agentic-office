#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-3333}"
PID_FILE="/tmp/bala-agentic-office.pid"
LOG_FILE="/tmp/bala-agentic-office.log"

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Bala Agentic Office already running (PID: $(cat "$PID_FILE"))"
  exit 1
fi

cd "$SCRIPT_DIR/.."
nohup env PORT="$PORT" node core/server.js >"$LOG_FILE" 2>&1 < /dev/null &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"
sleep 1

if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "Failed to start Bala Agentic Office"
  exit 1
fi

echo "Bala Agentic Office running at http://localhost:$PORT"
echo "PID: $SERVER_PID"
echo "Log: $LOG_FILE"
