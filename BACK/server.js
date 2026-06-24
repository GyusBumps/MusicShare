const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

const pool = mysql.createPool(config);

// 음원/비디오 location이 가리키는 실제 파일이 저장되는 위치
const MEDIA_ROOT = path.join(__dirname, 'media');
const MEDIA_DIRS = {
  songs: path.join(MEDIA_ROOT, 'songs'),
  videos: path.join(MEDIA_ROOT, 'videos'),
};
for (const dir of Object.values(MEDIA_DIRS)) {
  fs.mkdirSync(dir, { recursive: true });
}

const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, MEDIA_DIRS.videos);
    } else {
      cb(null, MEDIA_DIRS.songs);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

const app = express();
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// 음악/비디오 재생을 위한 정적 파일 서빙 (express.static이 Range 요청을 자동 처리)
app.use('/media/songs', express.static(MEDIA_DIRS.songs));
app.use('/media/videos', express.static(MEDIA_DIRS.videos));

// 프론트엔드 정적 파일 서빙
app.use(express.static(path.join(__dirname, '../FRONT')));

// 루트 경로로 접속 시 메인 페이지로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/MAIN/main.html');
});

const PORT = process.env.PORT || 3000;

// README의 targettable 값 (Likes 테이블이 가리키는 대상 테이블)
const TARGET_TABLE = {
  songs: 0,
  genres: 1,
  playlists: 2,
  videos: 3,
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function randomId() {
  return Math.floor(Math.random() * 1_000_000_000);
}

// 랜덤 id로 INSERT를 시도하고, 중복이면 재시도한다.
async function insertWithRandomId(table, idColumn, columns, values) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = randomId();
    try {
      await pool.query(
        `INSERT INTO ${table} (${idColumn}, ${columns.join(', ')}) VALUES (?, ${columns.map(() => '?').join(', ')})`,
        [id, ...values]
      );
      return id;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') continue;
      throw err;
    }
  }
  throw new Error(`${table}에 대한 랜덤 id 생성 실패`);
}

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// ---------- Users ----------

app.post('/api/users/register', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username, password는 필수입니다.' });
  }
  try {
    await pool.query('INSERT INTO Users (username, password) VALUES (?, ?)', [
      username,
      hashPassword(password),
    ]);
    res.status(201).json({ username });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '이미 존재하는 username입니다.' });
    }
    throw err;
  }
}));

app.post('/api/users/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username, password는 필수입니다.' });
  }
  const [rows] = await pool.query('SELECT username, password FROM Users WHERE username = ?', [
    username,
  ]);
  if (rows.length === 0 || rows[0].password !== hashPassword(password)) {
    return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
  }
  res.json({ username });
}));

// ---------- Songs ----------

app.get('/api/songs', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Songs');
  res.json(rows);
}));

app.get('/api/songs/:songid', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Songs WHERE songid = ?', [req.params.songid]);
  if (rows.length === 0) return res.status(404).json({ error: '곡을 찾을 수 없습니다.' });
  res.json(rows[0]);
}));

app.post('/api/songs', asyncHandler(async (req, res) => {
  const { name, writer, location, bpm, release } = req.body;
  if (!name || !writer || !location) {
    return res.status(400).json({ error: 'name, writer, location은 필수입니다.' });
  }
  const songid = await insertWithRandomId(
    'Songs',
    'songid',
    ['name', 'writer', 'location', 'bpm', '`release`'],
    [name, writer, location, bpm ?? null, release ?? null]
  );
  res.status(201).json({ songid, name, writer, location, bpm, release });
}));

app.put('/api/songs/:songid', asyncHandler(async (req, res) => {
  const { name, writer, location, bpm, release } = req.body;
  const [result] = await pool.query(
    'UPDATE Songs SET name = COALESCE(?, name), writer = COALESCE(?, writer), location = COALESCE(?, location), bpm = COALESCE(?, bpm), `release` = COALESCE(?, `release`) WHERE songid = ?',
    [name ?? null, writer ?? null, location ?? null, bpm ?? null, release ?? null, req.params.songid]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: '곡을 찾을 수 없습니다.' });
  res.json({ updated: true });
}));

app.delete('/api/songs/:songid', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM Songs WHERE songid = ?', [req.params.songid]);
  if (result.affectedRows === 0) return res.status(404).json({ error: '곡을 찾을 수 없습니다.' });
  res.status(204).end();
}));

// ---------- Genres ----------

app.get('/api/genres', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Genres');
  res.json(rows);
}));

app.get('/api/genres/:genreid', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Genres WHERE genreid = ?', [req.params.genreid]);
  if (rows.length === 0) return res.status(404).json({ error: '장르를 찾을 수 없습니다.' });
  res.json(rows[0]);
}));

app.post('/api/genres', asyncHandler(async (req, res) => {
  const { genre, explain } = req.body;
  if (!genre) return res.status(400).json({ error: 'genre는 필수입니다.' });
  const genreid = await insertWithRandomId('Genres', 'genreid', ['genre', '`explain`'], [genre, explain ?? null]);
  res.status(201).json({ genreid, genre, explain });
}));

app.put('/api/genres/:genreid', asyncHandler(async (req, res) => {
  const { genre, explain } = req.body;
  const [result] = await pool.query(
    'UPDATE Genres SET genre = COALESCE(?, genre), `explain` = COALESCE(?, `explain`) WHERE genreid = ?',
    [genre ?? null, explain ?? null, req.params.genreid]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: '장르를 찾을 수 없습니다.' });
  res.json({ updated: true });
}));

app.delete('/api/genres/:genreid', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM Genres WHERE genreid = ?', [req.params.genreid]);
  if (result.affectedRows === 0) return res.status(404).json({ error: '장르를 찾을 수 없습니다.' });
  res.status(204).end();
}));

// 장르에 속한 곡 목록 / 등록 / 삭제
app.get('/api/genres/:genreid/songs', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT s.* FROM Songs s JOIN songGenres sg ON s.songid = sg.songid WHERE sg.genreid = ?',
    [req.params.genreid]
  );
  res.json(rows);
}));

app.post('/api/genres/:genreid/songs', asyncHandler(async (req, res) => {
  const { songid } = req.body;
  if (!songid) return res.status(400).json({ error: 'songid는 필수입니다.' });
  const id = await insertWithRandomId('songGenres', 'id', ['genreid', 'songid'], [req.params.genreid, songid]);
  res.status(201).json({ id, genreid: Number(req.params.genreid), songid });
}));

app.delete('/api/genres/:genreid/songs/:songid', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM songGenres WHERE genreid = ? AND songid = ?', [
    req.params.genreid,
    req.params.songid,
  ]);
  if (result.affectedRows === 0) return res.status(404).json({ error: '연결을 찾을 수 없습니다.' });
  res.status(204).end();
}));

// ---------- Playlists ----------

app.get('/api/playlists', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Playlists');
  res.json(rows);
}));

app.get('/api/playlists/:listid', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Playlists WHERE listid = ?', [req.params.listid]);
  if (rows.length === 0) return res.status(404).json({ error: '플레이리스트를 찾을 수 없습니다.' });
  res.json(rows[0]);
}));

app.post('/api/playlists', asyncHandler(async (req, res) => {
  const { name, explain } = req.body;
  if (!name) return res.status(400).json({ error: 'name은 필수입니다.' });
  const listid = await insertWithRandomId('Playlists', 'listid', ['name', '`explain`'], [name, explain ?? null]);
  res.status(201).json({ listid, name, explain });
}));

app.put('/api/playlists/:listid', asyncHandler(async (req, res) => {
  const { name, explain } = req.body;
  const [result] = await pool.query(
    'UPDATE Playlists SET name = COALESCE(?, name), `explain` = COALESCE(?, `explain`) WHERE listid = ?',
    [name ?? null, explain ?? null, req.params.listid]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: '플레이리스트를 찾을 수 없습니다.' });
  res.json({ updated: true });
}));

app.delete('/api/playlists/:listid', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM Playlists WHERE listid = ?', [req.params.listid]);
  if (result.affectedRows === 0) return res.status(404).json({ error: '플레이리스트를 찾을 수 없습니다.' });
  res.status(204).end();
}));

// 플레이리스트에 속한 곡 목록 / 등록 / 삭제
app.get('/api/playlists/:listid/songs', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT s.* FROM Songs s JOIN songPlaylists sp ON s.songid = sp.songid WHERE sp.listid = ?',
    [req.params.listid]
  );
  res.json(rows);
}));

app.post('/api/playlists/:listid/songs', asyncHandler(async (req, res) => {
  const { songid } = req.body;
  if (!songid) return res.status(400).json({ error: 'songid는 필수입니다.' });
  const id = await insertWithRandomId('songPlaylists', 'id', ['listid', 'songid'], [req.params.listid, songid]);
  res.status(201).json({ id, listid: Number(req.params.listid), songid });
}));

app.delete('/api/playlists/:listid/songs/:songid', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM songPlaylists WHERE listid = ? AND songid = ?', [
    req.params.listid,
    req.params.songid,
  ]);
  if (result.affectedRows === 0) return res.status(404).json({ error: '연결을 찾을 수 없습니다.' });
  res.status(204).end();
}));

// ---------- Likes ----------

app.get('/api/likes', asyncHandler(async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'username 쿼리 파라미터가 필요합니다.' });
  const [rows] = await pool.query('SELECT * FROM Likes WHERE username = ?', [username]);
  res.json(rows);
}));

app.post('/api/likes', asyncHandler(async (req, res) => {
  const { username, target, targetid } = req.body;
  const targettable = TARGET_TABLE[target];
  if (!username || targettable === undefined || !targetid) {
    return res.status(400).json({ error: 'username, target(songs|genres|playlists|videos), targetid는 필수입니다.' });
  }
  try {
    await pool.query('INSERT INTO Likes (username, targettable, targetid) VALUES (?, ?, ?)', [
      username,
      targettable,
      targetid,
    ]);
    res.status(201).json({ username, target, targetid });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: '이미 좋아요를 눌렀습니다.' });
    }
    throw err;
  }
}));

app.delete('/api/likes', asyncHandler(async (req, res) => {
  const { username, target, targetid } = req.body;
  const targettable = TARGET_TABLE[target];
  if (!username || targettable === undefined || !targetid) {
    return res.status(400).json({ error: 'username, target(songs|genres|playlists|videos), targetid는 필수입니다.' });
  }
  const [result] = await pool.query(
    'DELETE FROM Likes WHERE username = ? AND targettable = ? AND targetid = ?',
    [username, targettable, targetid]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: '좋아요를 찾을 수 없습니다.' });
  res.status(204).end();
}));

// ---------- Videos ----------

app.get('/api/videos', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT v.*, COUNT(l.targetid) AS likeCount
    FROM Videos v
    LEFT JOIN Likes l ON v.videoid = l.targetid AND l.targettable = 3
    GROUP BY v.videoid
  `);
  res.json(rows);
}));

app.get('/api/videos/:videoid', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM Videos WHERE videoid = ?', [req.params.videoid]);
  if (rows.length === 0) return res.status(404).json({ error: '비디오를 찾을 수 없습니다.' });
  res.json(rows[0]);
}));

app.post('/api/videos', asyncHandler(async (req, res) => {
  const { name, explain, username, location } = req.body;
  if (!name || !username || !location) {
    return res.status(400).json({ error: 'name, username, location은 필수입니다.' });
  }
  const videoid = await insertWithRandomId(
    'Videos',
    'videoid',
    ['name', '`explain`', 'username', 'location'],
    [name, explain ?? null, username, location]
  );
  res.status(201).json({ videoid, name, explain, username, location });
}));

app.put('/api/videos/:videoid', asyncHandler(async (req, res) => {
  const { name, explain, location } = req.body;
  const [result] = await pool.query(
    'UPDATE Videos SET name = COALESCE(?, name), `explain` = COALESCE(?, `explain`), location = COALESCE(?, location) WHERE videoid = ?',
    [name ?? null, explain ?? null, location ?? null, req.params.videoid]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: '비디오를 찾을 수 없습니다.' });
  res.json({ updated: true });
}));

app.delete('/api/videos/:videoid', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM Videos WHERE videoid = ?', [req.params.videoid]);
  if (result.affectedRows === 0) return res.status(404).json({ error: '비디오를 찾을 수 없습니다.' });
  res.status(204).end();
}));

app.post('/api/upload', upload.single('file'), asyncHandler(async (req, res) => {
  const { title, description, username } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: '파일이 제공되지 않았습니다.' });
  }
  if (!title || !username) {
    return res.status(400).json({ error: '제목과 사용자 아이디는 필수입니다.' });
  }

  const isVideo = req.file.mimetype.startsWith('video/');
  if (isVideo) {
    const relativeLocation = `/media/videos/${req.file.filename}`;
    const videoid = await insertWithRandomId(
      'Videos',
      'videoid',
      ['name', '`explain`', 'username', 'location'],
      [title, description ?? null, username, relativeLocation]
    );
    res.status(201).json({ type: 'video', videoid, name: title, explain: description, username, location: relativeLocation });
  } else {
    const relativeLocation = `/media/songs/${req.file.filename}`;
    const songid = await insertWithRandomId(
      'Songs',
      'songid',
      ['name', 'writer', 'location', 'bpm', '`release`'],
      [title, username, relativeLocation, null, null]
    );
    res.status(201).json({ type: 'song', songid, name: title, writer: username, location: relativeLocation });
  }
}));

// ---------- 공통 에러 처리 ----------

app.use((req, res) => {
  res.status(404).json({ error: '요청한 경로를 찾을 수 없습니다.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// ---------- 서버 시작 / 종료 ----------

async function start() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('[server] DB 연결 확인 완료');
  } catch (err) {
    console.error('[server] DB 연결 실패, 서버를 시작할 수 없습니다:', err.message);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`[server] ${PORT}번 포트에서 실행 중`);
  });

  const shutdown = async (signal) => {
    console.log(`[server] ${signal} 수신, 종료 중...`);
    server.close(async () => {
      await pool.end();
      console.log('[server] 정상 종료되었습니다.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
