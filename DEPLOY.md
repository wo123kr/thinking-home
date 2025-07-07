# 🚀 배포 가이드

## 1. GitHub 저장소 생성

1. GitHub에서 새 저장소 생성
2. 저장소 이름: `webpage-thinking`
3. **반드시 Public으로 설정** (CDN 접근을 위해)

## 2. 파일 업로드

다음 파일들을 GitHub 저장소에 업로드:

```
webpage-thinking/
├── index.js
├── README.md
├── DEPLOY.md
├── core/
│   ├── thinking-data-init.js
│   └── session-manager.js
├── tracking/
│   ├── page-view.js
│   ├── click.js
│   ├── scroll.js
│   ├── form.js
│   ├── popup.js
│   ├── video.js
│   ├── resource.js
│   └── exit.js
└── user-attributes.js
```

## 3. App ID 설정

`core/thinking-data-init.js` 파일에서 App ID를 실제 값으로 변경:

```javascript
var config = {
  appId: "cf003f81e4564662955fc0e0d914cef9", // 실제 App ID로 변경
  serverUrl: "https://te-receiver-naver.thinkingdata.kr/sync_js",
  autoTrack: {
    pageShow: true,
    pageHide: true
  }
};
```

## 4. Webflow 적용

### 4.1 Webflow 프로젝트 설정
1. Webflow 프로젝트 편집기 접속
2. **Project Settings** → **Custom Code**
3. **Head Code** 섹션에 다음 코드 추가:

```html
<!-- ThinkingData 웹 추적 시스템 -->
<script src="https://cdn.jsdelivr.net/gh/[YOUR_USERNAME]/webpage-thinking@main/index.js"></script>
```

### 4.2 GitHub 사용자명 변경
`[YOUR_USERNAME]`을 실제 GitHub 사용자명으로 변경

예시:
```html
<script src="https://cdn.jsdelivr.net/gh/johndoe/webpage-thinking@main/index.js"></script>
```

## 5. 테스트

### 5.1 브라우저 콘솔 확인
1. 웹사이트 접속
2. F12 → Console 탭
3. 다음 로그 확인:
```
✅ ThinkingData SDK initialized
✅ Session started
✅ Super properties set
✅ All tracking events initialized
✅ User Attribute Tracking System initialized
```

### 5.2 ThinkingData 콘솔 확인
1. ThinkingData 콘솔 접속
2. **데이터 관리** → **이벤트** 탭
3. `te_page_view` 이벤트 수신 확인

## 6. 문제 해결

### 6.1 CDN 접근 오류
- GitHub 저장소가 Public인지 확인
- 파일 경로가 정확한지 확인
- 브라우저 캐시 삭제 후 재시도

### 6.2 이벤트 수신 안됨
- App ID가 올바른지 확인
- 도메인이 ThinkingData에 등록되었는지 확인
- 네트워크 탭에서 요청 실패 여부 확인

### 6.3 콘솔 에러
- JavaScript 에러 메시지 확인
- 모듈 로드 순서 확인
- 브라우저 호환성 확인

## 7. 업데이트

코드 수정 후:
1. GitHub에 푸시
2. 몇 분 대기 (CDN 캐시 갱신)
3. 웹사이트에서 테스트

## 8. 보안 체크리스트

- [ ] App ID가 올바르게 설정됨
- [ ] 개인정보 마스킹이 작동함
- [ ] 민감한 데이터가 노출되지 않음
- [ ] HTTPS 환경에서 테스트됨
- [ ] 도메인이 ThinkingData에 등록됨

---

**배포 완료 후 반드시 테스트를 진행하세요!** 