#!/bin/bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || { echo "[stop] BACK 디렉터리로 이동 실패"; exit 1; }

echo "[stop] server.js 프로세스 종료 중..."
SERVER_PIDS=$(pgrep -f "node .*server\.js" || true)
if [ -n "$SERVER_PIDS" ]; then
  if kill -TERM $SERVER_PIDS 2>/dev/null; then
    sleep 1
    for pid in $SERVER_PIDS; do
      if kill -0 "$pid" 2>/dev/null; then
        echo "[stop] PID $pid 정상 종료 실패, 강제 종료 시도"
        kill -KILL "$pid" 2>/dev/null || echo "[stop] PID $pid 강제 종료 실패 (이미 종료됨)"
      fi
    done
    echo "[stop] server.js 종료 완료"
  else
    echo "[stop] server.js 종료 신호 전송 실패 (이미 종료된 것으로 추정)"
  fi
else
  echo "[stop] 실행 중인 server.js 프로세스 없음"
fi

echo "[stop] DB 컨테이너 종료 중..."
if docker compose down; then
  echo "[stop] DB 컨테이너 종료 완료"
else
  echo "[stop] DB 컨테이너 종료 실패 (컨테이너가 없거나 docker가 꺼져 있을 수 있음)"
  exit 1
fi

echo "[stop] 모든 프로세스가 정상적으로 종료되었습니다"
