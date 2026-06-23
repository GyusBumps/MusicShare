# Dockerfile

MySQL 8.0 기반 이미지를 빌드해 프로젝트용 DB 컨테이너를 구성한다.

## 내용

1. **베이스 이미지**: `mysql:8.0`
2. **환경 변수**: `TZ=Asia/Seoul`로 컨테이너 시간대 설정. 비밀번호 등 민감한 값은 이미지에 직접 넣지 않고 `docker-compose.yml`이 `.env` 파일을 통해 런타임에 주입한다.
3. **설정 파일 복사**: 로컬의 `./mysql/conf/my.cnf`를 컨테이너의 `/etc/mysql/conf.d/my.cnf`로 복사한다.
4. **볼륨**: `/var/lib/mysql`을 볼륨으로 선언해 데이터가 컨테이너 재생성 후에도 유지되도록 한다 (`docker-compose.yml`에서 `./mysql/data`에 바인드 마운트).
5. **기본 실행 명령**: `mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`로 한글 등 다국어 깨짐을 방지한다.

## 빌드/실행

직접 빌드하지 않고 `docker-compose.yml`(`db` 서비스의 `build: .`)을 통해 빌드 및 실행되며, `start.sh`/`stop.sh`가 이를 감싸서 호출한다.
