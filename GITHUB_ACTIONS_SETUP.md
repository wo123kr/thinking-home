# 🚀 GitHub Actions 설정 가이드

## 📋 **필요한 설정**

### **1. Google Service Account 키 설정**

GitHub Repository에서 다음 설정이 필요합니다:

1. **Repository로 이동**
2. **Settings → Secrets and variables → Actions**
3. **New repository secret** 클릭
4. **다음 정보 추가:**

```
Name: GOOGLE_SERVICE_ACCOUNT_KEY
Value: [Google Service Account JSON 전체 내용]
```

### **2. Slack 알림 설정 (선택사항)**

Slack 알림을 받고 싶다면:

```
Name: SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/YOUR_WEBHOOK_URL
```

---

## 🔧 **설정 완료 후 동작**

### **자동 실행**
- **매일 새벽 2시 (UTC)** = **한국 시간 11시**에 자동 실행
- 어제 Google Search Console 데이터를 ThinkingData로 전송

### **수동 실행**
1. **Repository → Actions 탭**
2. **"Google Search Console → ThinkingData Daily Sync"** 워크플로우 선택
3. **"Run workflow"** 버튼 클릭
4. **동기화 타입 선택:**
   - `yesterday`: 어제 데이터
   - `last-week`: 지난 주 데이터
   - `last-month`: 지난 달 데이터

---

## 📊 **모니터링 방법**

### **실행 상태 확인**
1. **Repository → Actions 탭**
2. **워크플로우 실행 기록 확인**
3. **각 실행의 상세 로그 확인**

### **로그 다운로드**
- 각 실행 후 **Artifacts**에서 로그 파일 다운로드 가능
- `logs/` 폴더의 모든 로그 파일 포함

### **ThinkingData에서 확인**
- TE 대시보드 → 이벤트 테이블
- `gsc_search_performance` 이벤트 확인
- 전송된 데이터 분석

---

## ⚠️ **주의사항**

### **Google Service Account 키**
- JSON 파일의 **전체 내용**을 Secret에 복사
- 키는 **절대 코드에 직접 포함하지 말 것**
- 정기적으로 키 로테이션 권장

### **실행 시간**
- GitHub Actions는 **UTC 시간 기준**
- 한국 시간과 9시간 차이 있음
- 매일 새벽 2시 UTC = 한국 시간 11시

### **무료 사용량**
- GitHub Actions 무료: **월 2,000분**
- 현재 설정: **약 5분/실행**
- 월 400회 실행 가능 (매일 13회)

---

## 🔍 **문제 해결**

### **인증 오류**
```bash
# Google Service Account 키 확인
echo "${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}" | jq '.client_email'

# ThinkingData 인증 확인
echo "TE_APP_ID: 79ed7051fc51493798b16328c0ebd0bc"
echo "TE_SERVER_URL: https://te-receiver-naver.thinkingdata.kr/sync_js"
```

### **실행 실패 시**
1. **Actions 탭에서 오류 로그 확인**
2. **Artifacts에서 상세 로그 다운로드**
3. **수동으로 테스트 실행**

### **수동 테스트**
```bash
# 로컬에서 테스트
node tracking/search-performance.js yesterday
```

---

## 📈 **성능 최적화**

### **실행 시간 단축**
- 현재 예상 실행 시간: **3-5분**
- Google API 호출: **1-2분**
- ThinkingData 전송: **1-2분**
- 로그 업로드: **30초**

### **비용 최적화**
- **무료 사용량**: 월 2,000분
- **현재 사용량**: 월 약 150분 (매일 5분)
- **여유분**: 충분함

---

## 🎯 **체크리스트**

### **초기 설정**
- [ ] Google Service Account 키 생성
- [ ] GitHub Repository Secrets 설정
- [ ] 코드 푸시 (main 브랜치)
- [ ] 첫 번째 수동 실행 테스트
- [ ] ThinkingData에서 데이터 확인

### **정기 점검**
- [ ] Actions 실행 상태 확인 (주 1회)
- [ ] 로그 파일 검토 (월 1회)
- [ ] 성공률 모니터링 (월 1회)
- [ ] Google API 할당량 확인 (월 1회)

---

## 🚀 **시작하기**

### **1단계: Repository Secrets 설정**
```
GOOGLE_SERVICE_ACCOUNT_KEY = [Google Service Account JSON]
SLACK_WEBHOOK_URL = [Slack Webhook URL] (선택사항)
```

### **2단계: 코드 푸시**
```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push origin main
```

### **3단계: 첫 번째 실행 테스트**
1. **Actions 탭**으로 이동
2. **"Run workflow"** 클릭
3. **동기화 타입**: `yesterday` 선택
4. **실행 확인**

### **4단계: 자동 실행 확인**
- **다음날 11시**에 자동 실행 확인
- **Actions 탭**에서 실행 로그 확인

---

## 📞 **지원**

### **문제 발생 시**
1. **Actions 로그 확인**
2. **로컬 테스트 실행**
3. **Google API 할당량 확인**
4. **ThinkingData 연결 상태 확인**

### **성공적인 설정 완료!** 🎉

이제 매일 자동으로 Google Search Console 데이터가 ThinkingData로 전송됩니다! 