# 주제 음악 추천 웹사이트

## 필수 기능
1. 음악 추천 ( 릴스처럼 )
2. 장르별 페이지
3. 음악 재생

## 부가 기능 ( 실현 안될 수도 있음 )
1. 로그인 기능
2. 애플뮤직보다 좋은 AI기반 플레이리스트 자동 생성
3. 매우 강력한(최소 3대 500) 음악 검색 기능
4. 매우 객관적이면서 주관적인 음악 랭킹
5. 사용자 개인정보 판매(공식)

## 페이지 구성

## DB 구성

### Users 테이블
- 유저 생성

| Name     | Type        | Constraint | Explanation |
| -------- | ----------- | ---------- | ----------- |
| username | varchar(32) | primary    | 이름, 30자이내   |
| password | varchar(64) |            | SHA-256     |

### Songs 테이블
- 음악 생성
- tablename = 0

| Name     | Type        | Constraint | Explanation     |
| -------- | ----------- | ---------- | --------------- |
| songid   | int         | primary    | 숫자아이디 (랜덤)      |
| name     | varchar(64) |            | 이름              |
| writer   | varchar(32) |            | 작곡가             |
| location | varchar(64) |            | 음원 위치           |
| bpm      | int         |            | 곡의 템포           |
| release  | date        |            | 발매일             |

### Genres 테이블
- 장르 생성
- tablename = 1

| Name    | Type         | Constraint | Explanation |
| ------- | ------------ | ---------- | ----------- |
| genreid | int          | primary    | 숫자아이디 (랜덤)  |
| genre   | varchar(32)  |            | 장르 이름       |
| explain | varchar(512) |            | 장르 설명       |

### songGenres 테이블
- 장르에 음악을 넣고 내려

| Name    | Type | Constraint      | Explanation |
| ------- | ---- | --------------- | ----------- |
| id      | int  | primary         | 숫자아이디 (랜덤)  |
| genreid | int  | foreign         | 장르 이름       |
| songid  | int  | foreign         | 곡 이름        |

### Playlists 테이블
- 플레이리스트 생성
- tablename = 2

| Name    | Type         | Constraint | Explanation |
| ------- | ------------ | ---------- | ----------- |
| listid  | int          | primary    | 숫자아이디 (랜덤)   |
| name    | varchar(32)  |            | 플리 이름       |
| explain | varchar(512) |            | 장르 설명       |

### songPlaylists 테이블
- 플레이리스트에 음악 등록

| Name   | Type | Constraint      | Explanation |
| ------ | ---- | --------------- | ----------- |
| id     | int  | primary         | 숫자아이디 (랜덤)  |
| listid | int  | foreign         | 플레이리스트      |
| songid | int  | foreign         | 곡 이름        |

### Likes 테이블
- 유저가 좋아요 등록

| Name      | Type        | Constraint | Explanation |
| ----------- | ----------- | ---------- | ----------- |
| username    | varchar(32) | primary    | 좋아한 유저      |
| targettable | int         | primary    | readme 참고   |
| targetid    | int         | primary    | readme 참고   |

### Videos 테이블
- tablename = 3
- 서버에서 음원 불러오고 편집 한 후 오디오를 포함한 비디오를 저장

| Name     | Type         | Constraint | Explanation |
| -------- | ------------ | ---------- | ----------- |
| videoid  | int          | primary    | 숫자 아이디 (랜덤) |
| name     | varchar(32)  |            | 비디오 이름      |
| explain  | varchar(512) |            | 비디오 설명      |
| username | varchar(32)  | foreign    | 만든 이        |
| location | varchar(64)  |            | 비디오 위치      |