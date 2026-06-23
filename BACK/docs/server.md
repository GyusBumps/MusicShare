# server.js

Express 기반 REST API 서버. README.md에 정의된 DB 스키마(Users, Songs, Genres, Playlists, songGenres, songPlaylists, Likes, Videos)에 대한 CRUD API와, 서비스 구동에 필요한 인프라 기능을 제공한다.

## 환경 변수

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `MYSQL_HOST` | DB 호스트 | `localhost` |
| `MYSQL_PORT` | DB 포트 | `3306` |
| `MYSQL_USER` | DB 사용자 | `root` |
| `MYSQL_ROOT_PASSWORD` / `MYSQL_PASSWORD` | DB 비밀번호 | - |
| `MYSQL_DATABASE` | 사용할 DB 이름 | - |
| `PORT` | API 서버 포트 | `3000` |

## 인프라 기능

- **정적 파일 서빙**: `media/songs`, `media/videos` 디렉터리를 시작 시 자동 생성하고 각각 `/media/songs`, `/media/videos` 경로로 서빙. `express.static`이 HTTP Range 요청을 처리하므로 음악/비디오 재생(구간 탐색)을 지원한다.
- **CORS**: `cors()` 미들웨어로 다른 도메인/포트의 프론트엔드에서 API 호출 허용.
- **보안 헤더**: `helmet()` 미들웨어 적용.
- **요청 바디 제한**: JSON 바디 크기 1mb로 제한.
- **DB 연결 확인**: 서버 시작 전 `pool.getConnection()`으로 연결을 검증, 실패 시 프로세스를 종료(exit code 1)한다.
- **Graceful shutdown**: `SIGINT`/`SIGTERM` 수신 시 HTTP 서버와 DB 커넥션 풀을 순서대로 정리한 뒤 종료한다.
- **404 / 에러 핸들러**: 정의되지 않은 경로는 404, 처리되지 않은 예외는 500 JSON 응답으로 반환한다.

## API 엔드포인트

### Users
- `POST /api/users/register` — `{ username, password }`. 비밀번호는 SHA-256으로 해싱해 저장.
- `POST /api/users/login` — `{ username, password }`.

### Songs
- `GET /api/songs`, `GET /api/songs/:songid`
- `POST /api/songs` — `{ name, writer, location, bpm?, release? }`. songid는 랜덤 생성.
- `PUT /api/songs/:songid`, `DELETE /api/songs/:songid`

### Genres
- `GET /api/genres`, `GET /api/genres/:genreid`
- `POST /api/genres` — `{ genre, explain? }`
- `PUT /api/genres/:genreid`, `DELETE /api/genres/:genreid`
- `GET /api/genres/:genreid/songs` — 장르에 속한 곡 목록 (songGenres 조인)
- `POST /api/genres/:genreid/songs` — `{ songid }` 곡을 장르에 연결
- `DELETE /api/genres/:genreid/songs/:songid` — 연결 해제

### Playlists
- `GET /api/playlists`, `GET /api/playlists/:listid`
- `POST /api/playlists` — `{ name, explain? }`
- `PUT /api/playlists/:listid`, `DELETE /api/playlists/:listid`
- `GET /api/playlists/:listid/songs`, `POST /api/playlists/:listid/songs` — `{ songid }`
- `DELETE /api/playlists/:listid/songs/:songid`

### Likes
- `GET /api/likes?username=` — 해당 유저의 좋아요 목록
- `POST /api/likes` — `{ username, target, targetid }` (`target`: `songs`|`genres`|`playlists`|`videos`)
- `DELETE /api/likes` — 동일 바디로 좋아요 취소

### Videos
- `GET /api/videos`, `GET /api/videos/:videoid`
- `POST /api/videos` — `{ name, explain?, username, location }`
- `PUT /api/videos/:videoid`, `DELETE /api/videos/:videoid`

## 랜덤 PK 생성

`songid`, `genreid`, `listid`, `videoid`, `songGenres.id`, `songPlaylists.id`는 README 명세상 랜덤 정수다. `insertWithRandomId` 헬퍼가 랜덤 id로 INSERT를 시도하고, 중복(`ER_DUP_ENTRY`) 시 최대 5회까지 재시도한다.
