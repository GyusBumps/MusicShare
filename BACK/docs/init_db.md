# init_db.js

README.md의 DB 구성에 따라 MySQL 테이블을 생성하는 일회성 초기화 스크립트.

## 동작

1. 환경 변수(`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_ROOT_PASSWORD`/`MYSQL_PASSWORD`, `MYSQL_DATABASE`)로 DB에 연결한다.
2. 다음 테이블을 순서대로 생성한다 (외래키 의존성을 고려한 순서):
   - `Users`
   - `Songs`
   - `Genres`
   - `Playlists`
   - `songGenres` (Genres, Songs 참조)
   - `songPlaylists` (Playlists, Songs 참조)
   - `Likes` (Users 참조)
   - `Videos` (Users 참조)
3. 테이블이 이미 존재하면(`ER_TABLE_EXISTS_ERROR`) 건너뛰고 로그만 남긴다. 그 외 오류는 콘솔에 출력한다.
4. 모든 테이블 처리 후 연결을 종료한다.

## 실행 방법

```bash
node init_db.js
```

`start.sh`가 DB 컨테이너 준비 완료 후 자동으로 호출한다.

## 주의

- 이 스크립트는 멱등적이다 (이미 존재하는 테이블은 재생성하지 않음). 단, 스키마 변경 시 직접 `ALTER TABLE` 하거나 테이블을 삭제 후 재실행해야 한다.
- 비밀번호(Users.password)는 평문이 아닌 SHA-256 해시 값(64자)을 저장하는 컬럼이며, 해싱 자체는 `server.js`에서 수행한다.
