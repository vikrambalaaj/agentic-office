#!/bin/bash

PID_FILE="/tmp/bala-agentic-office.pid"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    echo "Stopped Bala Agentic Office (PID: $PID)"
  fi
  rm -f "$PID_FILE"
fi

pkill -f "node.*core/server.js" 2>/dev/null || true
