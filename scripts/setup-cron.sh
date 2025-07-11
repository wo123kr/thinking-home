#!/bin/bash

# Google Search Console → ThinkingData 자동 전송 Cron Job 설정
# 이 스크립트를 실행하면 매일 새벽 2시에 자동으로 데이터가 전송됩니다.

echo "🕐 Google Search Console → ThinkingData 자동 전송 Cron Job 설정"
echo "=================================================="

# 현재 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 프로젝트 디렉토리: $PROJECT_DIR"

# Node.js 경로 확인
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    echo "❌ Node.js가 설치되지 않았습니다."
    exit 1
fi

echo "✅ Node.js 경로: $NODE_PATH"

# 로그 디렉토리 생성
LOG_DIR="$PROJECT_DIR/logs"
mkdir -p "$LOG_DIR"

# 실행 스크립트 생성
EXEC_SCRIPT="$PROJECT_DIR/scripts/run-daily-sync.sh"

cat > "$EXEC_SCRIPT" << EOF
#!/bin/bash

# Google Search Console → ThinkingData 일일 동기화 스크립트
# 매일 새벽 2시에 실행됨

cd "$PROJECT_DIR"
export NODE_ENV=production

# 전날 데이터 전송 (어제)
echo "\$(date): 🚀 어제 데이터 전송 시작" >> "$LOG_DIR/daily-sync.log"
$NODE_PATH tracking/search-performance.js yesterday >> "$LOG_DIR/daily-sync.log" 2>&1

# 지난 주 데이터 전송 (일요일인 경우)
if [ "\$(date +%u)" = "1" ]; then
    echo "\$(date): 📊 지난 주 데이터 전송 시작" >> "$LOG_DIR/daily-sync.log"
    $NODE_PATH tracking/search-performance.js last-week >> "$LOG_DIR/daily-sync.log" 2>&1
fi

# 지난 달 데이터 전송 (1일인 경우)
if [ "\$(date +%d)" = "01" ]; then
    echo "\$(date): 📈 지난 달 데이터 전송 시작" >> "$LOG_DIR/daily-sync.log"
    $NODE_PATH tracking/search-performance.js last-month >> "$LOG_DIR/daily-sync.log" 2>&1
fi

echo "\$(date): ✅ 일일 동기화 완료" >> "$LOG_DIR/daily-sync.log"
EOF

chmod +x "$EXEC_SCRIPT"

echo "✅ 실행 스크립트 생성: $EXEC_SCRIPT"

# Cron Job 추가
CRON_JOB="0 2 * * * $EXEC_SCRIPT"

# 기존 Cron Job 제거 (중복 방지)
(crontab -l 2>/dev/null | grep -v "$EXEC_SCRIPT") | crontab -

# 새 Cron Job 추가
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo "✅ Cron Job 설정 완료!"
echo "📅 매일 새벽 2시에 자동 실행됩니다."
echo "📝 로그 파일: $LOG_DIR/daily-sync.log"
echo ""
echo "🔍 Cron Job 확인:"
crontab -l | grep "$EXEC_SCRIPT"
echo ""
echo "💡 수동 실행 테스트:"
echo "   $EXEC_SCRIPT"
echo ""
echo "💡 Cron Job 제거:"
echo "   crontab -e (편집기에서 해당 라인 삭제)" 