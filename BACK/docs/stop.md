# stop.sh

`start.sh`로 기동한 서비스(API 서버 프로세스 + DB 컨테이너)를 정리하는 스크립트.

## 동작 순서

1. 스크립트가 위치한 `BACK` 디렉터리로 이동한다.
2. `pgrep -f "node .*server\.js"`로 실행 중인 `server.js` 프로세스를 찾는다.
   - 있으면 `SIGTERM`을 보내고 1초 대기 후, 여전히 살아있는 PID는 `SIGKILL`로 강제 종료한다.
   - 없으면 "실행 중인 프로세스 없음"을 출력하고 넘어간다.
3. `docker compose down`으로 DB 컨테이너를 종료/삭제한다 (데이터는 `./mysql/data` 바인드 마운트에 보존됨).
4. 모든 단계가 끝나면 완료 메시지를 출력한다.

## 실행

```bash
./stop.sh
```

## 실패 처리

`docker compose down`이 실패하면(컨테이너가 없거나 docker 데몬이 꺼져 있는 경우 등) 오류 메시지를 출력하고 0이 아닌 코드로 종료한다.

## 관련

서비스를 다시 시작하려면 [start.md](./start.md)의 `start.sh`를 사용한다.
