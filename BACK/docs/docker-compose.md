# docker-compose.yml

DB 컨테이너(`db` 서비스)를 정의하고 실행하는 Compose 설정.

## 구성

| 항목 | 설명 |
| --- | --- |
| `build: .` | 같은 디렉터리의 `Dockerfile`로 이미지를 빌드 |
| `env_file: .env` | `.env`에 정의된 `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT` 등을 컨테이너에 주입 (`.env_example` 참고) |
| `ports: "3307:3306"` | 호스트의 3307 포트를 컨테이너의 MySQL 기본 포트(3306)에 매핑 |
| `volumes: ./mysql/data:/var/lib/mysql` | DB 데이터를 호스트에 영속화 |

## 사용법

```bash
docker compose up -d --build   # 빌드 + 백그라운드 실행
docker compose down            # 컨테이너 종료/삭제 (데이터는 ./mysql/data에 유지)
docker compose exec -T db mysqladmin ping -h localhost --silent   # 헬스체크
```

`start.sh`/`stop.sh` 스크립트가 위 명령들을 자동으로 수행한다.

## 주의

- `server.js`가 DB에 접속할 때 사용하는 `MYSQL_PORT`는 호스트 기준 포트(`.env`의 값, 기본 3307)이며, 컨테이너 내부 포트(3306)와 다르다.
- `.env` 파일은 git에 커밋되지 않으며(.gitignore), 실행 전 `.env_example`을 참고해 직접 생성해야 한다.
