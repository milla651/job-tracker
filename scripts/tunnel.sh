#!/bin/bash
# SSH tunnel: localhost:5434 → VPS PostgreSQL:5432
# Auto-reconnects if the connection drops.
VPS="root@173.212.209.92"
LOCAL_PORT=5434
REMOTE_PORT=5432

echo "[tunnel] Starting SSH tunnel localhost:${LOCAL_PORT} → ${VPS}:${REMOTE_PORT}"

while true; do
  ssh -N \
    -o StrictHostKeyChecking=no \
    -o ServerAliveInterval=15 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -L "${LOCAL_PORT}:127.0.0.1:${REMOTE_PORT}" \
    "${VPS}"

  EXIT=$?
  if [ $EXIT -eq 0 ]; then
    echo "[tunnel] Closed cleanly."
    break
  fi
  echo "[tunnel] Disconnected (exit ${EXIT}), reconnecting in 3s..."
  sleep 3
done
