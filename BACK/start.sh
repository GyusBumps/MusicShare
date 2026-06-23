#!/bin/bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || { echo "[start] BACK 디렉터리로 이동 실패"; exit 1; }

if [ -f ".env" ]; then
  set -a
  source .env
  set +a
else
  echo "[start] .env 파일이 없습니다. .env_example을 참고해 생성해주세요"
  exit 1
fi

echo "[start] DB 컨테이너 빌드 및 실행 중..."
if ! docker compose up -d --build; then
  echo "[start] docker compose 실행 실패"
  exit 1
fi

echo "[start] MySQL 준비 대기 중..."
RETRIES=30
until docker compose exec -T db mysqladmin ping -h localhost --silent >/dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "[start] MySQL이 제한 시간 내에 준비되지 않았습니다"
    exit 1
  fi
  sleep 1
done
echo "[start] MySQL 준비 완료"

if [ ! -d "node_modules" ]; then
  echo "[start] node_modules가 없어 npm install 실행 중..."
  if ! npm install; then
    echo "[start] npm install 실패"
    exit 1
  fi
fi

echo "[start] DB 초기화(init_db.js) 실행 중..."
if ! node init_db.js; then
  echo "[start] init_db.js 실행 중 오류 발생"
  exit 1
fi

echo "[start] server.js 실행 중..."
node server.js
SERVER_EXIT_CODE=$?
if [ "$SERVER_EXIT_CODE" -ne 0 ]; then
  echo "[start] server.js가 오류와 함께 종료되었습니다 (exit code: $SERVER_EXIT_CODE)"
  exit "$SERVER_EXIT_CODE"
fi
