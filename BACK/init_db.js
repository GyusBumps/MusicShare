const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const tables = [
  {
    name: 'Users',
    sql: `CREATE TABLE Users (
      username VARCHAR(32) NOT NULL,
      password VARCHAR(64) NOT NULL,
      PRIMARY KEY (username)
    )`,
  },
  {
    name: 'Songs',
    sql: `CREATE TABLE Songs (
      songid INT NOT NULL,
      name VARCHAR(64) NOT NULL,
      writer VARCHAR(32) NOT NULL,
      location VARCHAR(64) NOT NULL,
      bpm INT,
      \`release\` DATE,
      PRIMARY KEY (songid)
    )`,
  },
  {
    name: 'Genres',
    sql: `CREATE TABLE Genres (
      genreid INT NOT NULL,
      genre VARCHAR(32) NOT NULL,
      \`explain\` VARCHAR(512),
      PRIMARY KEY (genreid)
    )`,
  },
  {
    name: 'Playlists',
    sql: `CREATE TABLE Playlists (
      listid INT NOT NULL,
      name VARCHAR(32) NOT NULL,
      \`explain\` VARCHAR(512),
      PRIMARY KEY (listid)
    )`,
  },
  {
    name: 'songGenres',
    sql: `CREATE TABLE songGenres (
      id INT NOT NULL,
      genreid INT NOT NULL,
      songid INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (genreid) REFERENCES Genres(genreid),
      FOREIGN KEY (songid) REFERENCES Songs(songid)
    )`,
  },
  {
    name: 'songPlaylists',
    sql: `CREATE TABLE songPlaylists (
      id INT NOT NULL,
      listid INT NOT NULL,
      songid INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (listid) REFERENCES Playlists(listid),
      FOREIGN KEY (songid) REFERENCES Songs(songid)
    )`,
  },
  {
    name: 'Likes',
    sql: `CREATE TABLE Likes (
      username VARCHAR(32) NOT NULL,
      targettable INT NOT NULL,
      targetid INT NOT NULL,
      PRIMARY KEY (username, targettable, targetid),
      FOREIGN KEY (username) REFERENCES Users(username)
    )`,
  },
  {
    name: 'Videos',
    sql: `CREATE TABLE Videos (
      videoid INT NOT NULL,
      name VARCHAR(32) NOT NULL,
      \`explain\` VARCHAR(512),
      username VARCHAR(32) NOT NULL,
      location VARCHAR(64) NOT NULL,
      PRIMARY KEY (videoid),
      FOREIGN KEY (username) REFERENCES Users(username)
    )`,
  },
];

async function createTable(connection, table) {
  try {
    await connection.query(table.sql);
    console.log(`[init_db] ${table.name} 테이블 생성 완료`);
  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log(`[init_db] ${table.name} 테이블이 이미 존재하여 생성을 건너뜁니다.`);
    } else {
      console.error(`[init_db] ${table.name} 테이블 생성 중 오류 발생:`, err.message);
    }
  }
}

async function initDb() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('[init_db] DB 연결 성공');
  } catch (err) {
    console.error('[init_db] DB 연결 실패:', err.message);
    return;
  }

  for (const table of tables) {
    await createTable(connection, table);
  }

  await connection.end();
  console.log('[init_db] 초기화 완료');
}

initDb();
