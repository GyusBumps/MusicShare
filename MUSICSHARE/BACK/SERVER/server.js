const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors()); 
app.use(express.json()); 

// 로그인 라우터 등록
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 작동 중입니다.`);
});