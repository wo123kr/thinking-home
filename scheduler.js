const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 로그 디렉토리 생성
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 로그 함수
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage);
    
    // 로그 파일에 저장
    fs.appendFileSync(path.join(logDir, 'scheduler.log'), logMessage);
}

// 스크립트 실행 함수
function runScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
        const command = `node ${scriptPath} ${args.join(' ')}`;
        log(`🚀 실행: ${command}`);
        
        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                log(`❌ 오류: ${error.message}`);
                reject(error);
                return;
            }
            
            if (stderr) {
                log(`⚠️ 경고: ${stderr}`);
            }
            
            log(`✅ 완료: ${stdout}`);
            resolve(stdout);
        });
    });
}

// 스케줄러 초기화
function initScheduler() {
    log('🕐 Google Search Console → ThinkingData 스케줄러 시작');
    
    // 1. 매일 새벽 2시 - 어제 데이터 전송
    cron.schedule('0 2 * * *', async () => {
        log('📅 일일 데이터 전송 시작 (어제)');
        try {
            await runScript('tracking/search-performance.js', ['yesterday']);
            log('✅ 일일 데이터 전송 완료');
        } catch (error) {
            log(`❌ 일일 데이터 전송 실패: ${error.message}`);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Seoul"
    });
    
    // 2. 매주 일요일 새벽 3시 - 지난 주 데이터 전송
    cron.schedule('0 3 * * 0', async () => {
        log('📊 주간 데이터 전송 시작 (지난 주)');
        try {
            await runScript('tracking/search-performance.js', ['last-week']);
            log('✅ 주간 데이터 전송 완료');
        } catch (error) {
            log(`❌ 주간 데이터 전송 실패: ${error.message}`);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Seoul"
    });
    
    // 3. 매월 1일 새벽 4시 - 지난 달 데이터 전송
    cron.schedule('0 4 1 * *', async () => {
        log('📈 월간 데이터 전송 시작 (지난 달)');
        try {
            await runScript('tracking/search-performance.js', ['last-month']);
            log('✅ 월간 데이터 전송 완료');
        } catch (error) {
            log(`❌ 월간 데이터 전송 실패: ${error.message}`);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Seoul"
    });
    
    // 4. 매시간 정각 - 상태 체크 (선택사항)
    cron.schedule('0 * * * *', () => {
        log('💓 스케줄러 상태 체크 - 정상 동작 중');
    });
    
    log('✅ 모든 스케줄 등록 완료');
    log('📅 스케줄:');
    log('   - 매일 02:00: 어제 데이터 전송');
    log('   - 매주 일요일 03:00: 지난 주 데이터 전송');
    log('   - 매월 1일 04:00: 지난 달 데이터 전송');
    log('   - 매시간 정각: 상태 체크');
}

// PM2 프로세스 관리 (선택사항)
if (process.env.NODE_ENV === 'production') {
    // PM2 Graceful Shutdown
    process.on('SIGINT', () => {
        log('🛑 스케줄러 종료 신호 수신');
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        log('🛑 스케줄러 강제 종료 신호 수신');
        process.exit(0);
    });
}

// 스케줄러 시작
initScheduler();

// 수동 실행을 위한 HTTP 서버 (선택사항)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// 수동 실행 엔드포인트
app.post('/api/trigger-sync', async (req, res) => {
    const { type = 'yesterday' } = req.body;
    
    log(`🔧 수동 실행 요청: ${type}`);
    
    try {
        await runScript('tracking/search-performance.js', [type]);
        res.json({ success: true, message: `${type} 데이터 전송 완료` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 상태 확인 엔드포인트
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    log(`🌐 HTTP 서버 시작: http://localhost:${PORT}`);
    log(`📡 API 엔드포인트:`);
    log(`   - POST /api/trigger-sync (수동 실행)`);
    log(`   - GET /api/status (상태 확인)`);
});

module.exports = { runScript, log }; 