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
| Name     | Type        | Constraint | Explanation |
| -------- | ----------- | ---------- | ----------- |
| userid   | int         | primary    | 숫자아이디 (랜덤)  |
| username | varchar(30) |            | 이름, 20자이내   |
| password | varchar(64) |            | SHA-256     |

### Songs 테이블
| Name     | Type        | Constraint | Explanation     |
| -------- | ----------- | ---------- | --------------- |
| songid   | int         | primary    | 숫자아이디 (랜덤)      |
| name     | varchar(50) |            | 이름              |
| writer   | varchar(30) |            | 작곡가             |
| location | varchar(40) |            | 음원 위치           |
| listid   | int         |            | 음원 위치           |
| genre    | varchar(20) | foreign    | 장르 (Genres 테이블) |

### Genres 테이블

### Playlists 테이블

### Videos 테이블