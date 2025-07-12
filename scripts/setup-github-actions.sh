#!/bin/bash

# GitHub Actions 설정 가이드 스크립트
echo "🚀 GitHub Actions 설정 가이드"
echo "================================"
echo ""

echo "📋 필요한 설정 단계:"
echo ""
echo "1️⃣ Google Service Account 키 설정"
echo "   - GitHub Repository → Settings → Secrets and variables → Actions"
echo "   - New repository secret 추가:"
echo "     Name: GOOGLE_SERVICE_ACCOUNT_KEY"
echo "     Value: [Google Service Account JSON 전체 내용]"
echo ""

echo "2️⃣ ThinkingData 인증 정보 (이미 설정됨)"
echo "   - TE_APP_ID: 79ed7051fc51493798b16328c0ebd0bc"
echo "   - TE_SERVER_URL: https://te-receiver-naver.thinkingdata.kr/sync_js"
echo ""

echo "3️⃣ Slack 알림 설정 (선택사항)"
echo "   - Name: SLACK_WEBHOOK_URL"
echo "   - Value: https://hooks.slack.com/services/YOUR_WEBHOOK_URL"
echo ""

echo "🔧 설정 완료 후 동작:"
echo "   - 매일 새벽 2시 (UTC) = 한국 시간 11시 자동 실행"
echo "   - 어제 Google Search Console 데이터를 ThinkingData로 전송"
echo ""

echo "📊 모니터링:"
echo "   - Repository → Actions 탭에서 실행 상태 확인"
echo "   - ThinkingData 대시보드에서 daily_* 이벤트들 확인"
echo ""

echo "⚠️ 주의사항:"
echo "   - GitHub Actions는 UTC 시간 기준 (한국 시간 -9시간)"
echo "   - 무료 사용량: 월 2,000분 (충분함)"
echo "   - Google Service Account 키는 절대 코드에 포함하지 말 것"
echo ""

echo "🎯 다음 단계:"
echo "   1. Google Service Account 키를 GitHub Secrets에 추가"
echo "   2. 코드를 main 브랜치에 푸시"
echo "   3. Actions 탭에서 첫 번째 수동 실행 테스트"
echo "   4. 다음날 11시에 자동 실행 확인"
echo ""

echo "📞 문제 발생 시:"
echo "   - Actions 탭에서 오류 로그 확인"
echo "   - 로컬에서 'node tracking/search-performance.js yesterday' 테스트"
echo "   - Google API 할당량 확인"
echo ""

echo "✅ 설정 완료! 매일 자동으로 데이터가 전송됩니다! 🎉" 