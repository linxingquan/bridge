#!/bin/bash

# Find the PID of any process listening on port 3000
PIDS=$(lsof -t -i :3000)

if [ -z "$PIDS" ]; then
  echo "No processes are listening on port 3000"
else
  echo "Killing processes on port 3000: $PIDS"

  for PID in $PIDS; do
    kill -9 "$PID"
    echo "Killed PID $PID"
  done
fi

#cd "$(dirname "$0")"
npm run dev
