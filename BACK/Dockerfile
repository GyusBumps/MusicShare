# 1. 베이스 이미지 지정 (도커 허브에서 가져올 기본 밀키트)
FROM mysql:8.0

# 2. 환경 변수 설정
# 비밀번호 등 민감한 값은 .env 파일을 통해 docker-compose에서 주입합니다.
ENV TZ=Asia/Seoul

# 3. 로컬 PC의 설정 파일 및 초기화 스크립트를 컨테이너 내부로 복사 (굽기)
COPY ./mysql/conf/my.cnf /etc/mysql/conf.d/my.cnf

VOLUME ["/var/lib/mysql"]

# 4. 컨테이너가 켜질 때 실행할 기본 명령어 (한글 깨짐 방지 설정)
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]
