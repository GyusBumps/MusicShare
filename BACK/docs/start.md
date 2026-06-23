# start.sh

서비스 전체(DB 컨테이너 + API 서버)를 한 번에 기동하는 스크립트.

## 동작 순서

1. 스크립트가 위치한 `BACK` 디렉터리로 이동한다.
2. `.env` 파일이 없으면 안내 메시지를 출력하고 종료(`.env_example` 참고).
3. 있으면 `.env`를 로드(`set -a; source .env; set +a`)한다.
4. `docker compose up -d --build`로 DB 컨테이너를 빌드 및 백그라운드 실행한다.
5. `docker compose exec -T db mysqladmin ping`을 최대 30회(1초 간격) 재시도하며 MySQL이 준비될 때까지 대기한다.
6. `node_modules`가 없으면 `npm install`을 실행한다.
7. `node init_db.js`로 테이블을 초기화한다.
8. `node server.js`로 API 서버를 실행한다(포그라운드, `Ctrl+C`로 종료 시 서버만 종료되며 DB 컨테이너는 계속 실행됨).

## 실행

```bash
./start.sh
```

## 실패 처리

각 단계는 실패 시 적절한 메시지를 출력하고 0이 아닌 코드로 종료한다 (DB 빌드 실패, MySQL 준비 시간 초과, `npm install` 실패, `init_db.js` 오류, `server.js` 비정상 종료 등). `server.js` 종료 코드는 그대로 전달된다.

## 관련

DB 컨테이너만 종료하려면 [stop.md](./stop.md)의 `stop.sh`를 사용한다.
