# ThinkingData 웹 추적 시스템

Webflow용 ThinkingData 추적 시스템입니다. 50,000자 제한을 우회하기 위해 CDN으로 배포할 수 있도록 모듈화되어 있습니다.

## 🚀 사용법

### 1. GitHub에 업로드
1. 이 프로젝트를 GitHub 저장소에 업로드
2. 저장소를 public으로 설정

### 2. Webflow에 적용
Webflow의 Custom Code 섹션에 다음 코드를 추가:

```html
<!-- ThinkingData 웹 추적 시스템 -->
<script src="https://cdn.jsdelivr.net/gh/[YOUR_USERNAME]/webpage-thinking@main/index.js"></script>
```

`[YOUR_USERNAME]`을 실제 GitHub 사용자명으로 변경하세요.

## 📁 프로젝트 구조

```
webpage-thinking/
├── index.js                 # 메인 진입점
├── core/
│   ├── utils.js             # 공통 유틸리티 함수
│   ├── thinking-data-init.js    # ThinkingData SDK 초기화
│   └── session-manager.js       # 세션 관리
├── tracking/
│   ├── page-view.js         # 페이지 뷰 추적
│   ├── click.js             # 클릭 이벤트 추적
│   ├── scroll.js            # 스크롤 깊이 추적
│   ├── form.js              # 폼 제출 추적
│   ├── popup.js             # 팝업 추적
│   ├── video.js             # 비디오 추적
│   ├── resource.js          # 리소스 다운로드 추적
│   └── exit.js              # 페이지 종료 추적
└── user-attributes.js       # 유저 속성 추적 시스템
```

## 🔧 주요 기능

### 📊 기본 추적
- **페이지 뷰**: 자동 페이지 진입 추적
- **클릭 이벤트**: 버튼, 링크, 메뉴 클릭 추적
- **스크롤 깊이**: 25%, 50%, 75%, 90%, 100% 도달 추적
- **폼 제출**: 개인정보 마스킹 처리된 폼 제출 추적
- **팝업 상호작용**: 팝업 표시/닫기 추적
- **비디오 시청**: YouTube 비디오 시청 패턴 추적
- **리소스 다운로드**: PDF, 문서 등 다운로드 추적
- **페이지 종료**: 체류시간, 종료 방식 추적

### 👤 유저 속성 추적
- **방문자 생명주기**: Awareness → Consideration → Decision
- **참여도 수준**: Low, Medium, High
- **콘텐츠 선호도**: 관심 주제, 선호 깊이
- **시간 패턴**: 선호 방문 시간대, 요일
- **유입 소스**: UTM 파라미터, 리퍼러 추적

### 🔄 세션 관리
- **세션 자동 관리**: 30분 타임아웃
- **인게이지 세션**: 10초 이상 또는 2회 이상 상호작용
- **세션 복원**: 브라우저 새로고침 시 세션 유지

## 📈 추적 이벤트 목록

### 기본 이벤트
- `te_page_view`: 페이지 진입
- `te_session_start`: 세션 시작
- `te_element_click`: 요소 클릭
- `te_menu_click`: 메뉴 클릭
- `te_outbound_link_click`: 외부 링크 클릭
- `te_scroll_depth`: 스크롤 깊이 도달
- `te_form_submit`: 폼 제출
- `popup_shown`: 팝업 표시
- `popup_action`: 팝업 상호작용
- `video_play`: 비디오 재생
- `video_pause`: 비디오 일시정지
- `video_complete`: 비디오 완료
- `resource_download`: 리소스 다운로드
- `te_page_exit`: 페이지 종료

### 유저 속성
- `first_visit_timestamp`: 최초 방문 시점
- `total_sessions`: 총 세션 수
- `engagement_level`: 참여도 수준
- `visitor_lifecycle_stage`: 생명주기 단계
- `interested_topics`: 관심 주제
- `preferred_visit_time`: 선호 방문 시간대

## ⚙️ 설정

### ThinkingData 설정
`core/thinking-data-init.js`에서 다음 설정을 변경하세요:

```javascript
var config = {
  appId: "YOUR_APP_ID",  // 실제 App ID로 변경
  serverUrl: "https://te-receiver-naver.thinkingdata.kr/sync_js",
  autoTrack: {
    pageShow: true,
    pageHide: true
  }
};
```

### 세션 타임아웃 설정
`core/session-manager.js`에서 세션 타임아웃을 조정할 수 있습니다:

```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분 (밀리초)
```

## 🔒 개인정보 보호

- **이메일 마스킹**: `a***@g***.com` 형태
- **전화번호 마스킹**: `010-****-1234` 형태
- **이름 마스킹**: `김***철` 형태
- **민감한 필드 자동 제외**: password, ssn, birthday 등

## 🌐 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📝 로그 확인

브라우저 개발자 도구 콘솔에서 다음 로그를 확인할 수 있습니다:

```
✅ ThinkingData SDK initialized
✅ Session started
✅ Super properties set
✅ All tracking events initialized
✅ User Attribute Tracking System initialized
```

## 🚨 주의사항

1. **GitHub 저장소**: 반드시 public 저장소여야 CDN 접근이 가능합니다.
2. **App ID**: 실제 ThinkingData 프로젝트의 App ID로 변경해야 합니다.
3. **도메인 설정**: ThinkingData 콘솔에서 도메인을 등록해야 합니다.
4. **개인정보**: 민감한 개인정보는 자동으로 마스킹되지만, 추가 검토가 필요합니다.

## 🔄 업데이트

코드 수정 후 GitHub에 푸시하면 CDN이 자동으로 업데이트됩니다. 캐시 지연이 있을 수 있으니 몇 분 후 확인하세요.

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 브라우저 콘솔 에러 메시지
2. 네트워크 탭에서 요청 실패 여부
3. ThinkingData 콘솔에서 이벤트 수신 여부

## 🎬 유튜브 비디오 추적 문제 해결

### 문제 상황
유튜브 비디오 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **스크립트 로딩 순서 문제**
2. **ThinkingData SDK 초기화 실패**
3. **YouTube iframe 감지 실패**
4. **YouTube API 로드 실패**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugVideoTracking();
```

#### 2. 수동 비디오 추적 재시작
```javascript
// 비디오 추적 수동 재시작
trackVideoEvents();
```

#### 3. ThinkingData SDK 상태 확인
```javascript
// SDK 상태 확인
console.log('ThinkingData SDK:', {
  te: typeof window.te,
  thinkingdata: typeof thinkingdata
});
```

### 개선된 기능

#### ✅ 동적 YouTube iframe 감지
- MutationObserver를 사용하여 동적으로 로드되는 YouTube iframe 감지
- Webflow의 동적 콘텐츠 로딩에 대응

#### ✅ 안정적인 SDK 초기화
- ThinkingData SDK 로드 상태 확인
- 자동 재시도 메커니즘
- 초기화 완료 이벤트 발생

#### ✅ 포괄적인 iframe 선택자
- `youtube.com`
- `youtu.be`
- `youtube-nocookie.com`

#### ✅ 다중 실행 시점
- DOMContentLoaded
- load 이벤트
- ThinkingData 초기화 완료 이벤트

### 디버깅 가이드

#### 1. 콘솔 로그 확인
브라우저 개발자 도구에서 다음 로그들을 확인하세요:

```
🎬 비디오 추적 초기화 시작...
🎯 YouTube iframe 발견: X개
✅ YouTube API 준비 완료!
✅ YouTube 플레이어 준비 완료: youtube_player_X
```

#### 2. 일반적인 문제들

**문제**: "ThinkingData SDK가 로드되지 않음"
**해결**: 스크립트 로딩 순서 확인, `defer` 속성 제거 고려

**문제**: "YouTube iframe 발견: 0개"
**해결**: iframe이 동적으로 로드되는 경우 5초 후 자동 감지됨

**문제**: "YouTube API 준비 완료!" 로그 없음
**해결**: 네트워크 연결 확인, YouTube API 차단 여부 확인

#### 3. 수동 테스트
```javascript
// 1. iframe 확인
document.querySelectorAll('iframe[src*="youtube.com"]')

// 2. YouTube API 확인
window.YT && window.YT.Player

// 3. ThinkingData 확인
window.te && window.te.track
```

### 설치 및 설정

#### 1. Webflow Head 섹션에 추가
```html
<!-- ThinkingData SDK -->
<script defer src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
<script defer src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>

<!-- 추적 스크립트들 -->
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/session-manager.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/video.js"></script>
<!-- 기타 추적 스크립트들... -->
```

#### 2. YouTube iframe 설정
YouTube iframe에 고유 ID가 있는지 확인하세요:
```html
<iframe id="youtube_player_1" src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
```

### 지원되는 이벤트

- `video_ready`: 비디오 플레이어 준비 완료
- `video_play`: 비디오 재생 시작
- `video_pause`: 비디오 일시정지
- `video_ended`: 비디오 종료
- `video_complete`: 비디오 완전 시청
- `video_progress`: 진행률 마일스톤 (25%, 50%, 75%, 90%)
- `video_buffering`: 버퍼링
- `video_error`: 오류 발생

### 문의 및 지원

문제가 지속되는 경우:
1. 브라우저 콘솔 로그 확인
2. `debugVideoTracking()` 실행 결과 공유
3. YouTube iframe HTML 구조 확인

## 🎪 팝업 추적 문제 해결

### 문제 상황
ThinkingData 홈페이지의 팝업 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **팝업 구조 특이성**: `modal-container` 클래스와 특별한 닫기 버튼 구조
2. **동적 로딩**: 페이지 로드 후 JavaScript로 팝업이 표시되는 경우
3. **ThinkingData SDK 초기화 실패**
4. **이벤트 리스너 등록 시점 문제**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugPopupTracking();
```

#### 2. 수동 팝업 추적 재시작
```javascript
// 팝업 추적 수동 재시작
trackPopupEvents();
```

#### 3. 팝업 요소 수동 확인
```javascript
// 팝업 요소 확인
document.querySelectorAll('.modal-container, .modal, .popup, .overlay, [role="dialog"]')

// 혜택 확인하기 버튼 확인
document.querySelector('a[href*="thinkingdata-onestore-special-promotion"], .button-3')

// 닫기 버튼 확인
document.querySelector('.link-block-2, .close, .modal-close')
```

### 개선된 기능

#### ✅ ThinkingData 홈페이지 특화 감지
- `modal-container` 클래스 감지
- `+` 텍스트를 가진 닫기 버튼 감지
- `button-3` 클래스의 혜택 확인하기 버튼 감지

#### ✅ 다중 닫기 방법 감지
- 닫기 버튼 클릭
- ESC 키 입력
- 팝업 외부 클릭

#### ✅ 기존 팝업 감지
- 페이지 로드 시 이미 존재하는 팝업 자동 감지
- 중복 추적 방지

#### ✅ 상세한 팝업 정보 수집
- 팝업 타입, ID, 클래스
- 혜택 버튼 존재 여부
- 닫기 버튼 존재 여부
- 팝업 가시성 상태

### 디버깅 가이드

#### 1. 콘솔 로그 확인
브라우저 개발자 도구에서 다음 로그들을 확인하세요:

```
🎪 팝업 추적 초기화 시작...
🎪 기존 팝업 발견: X개
🎪 팝업 표시 추적: {...}
🎪 혜택 확인하기 버튼 클릭 추적
🎪 팝업 닫기 버튼 클릭 추적
```

#### 2. 일반적인 문제들

**문제**: "기존 팝업 발견: 0개"
**해결**: 팝업이 동적으로 로드되는 경우, 5초 후 자동 감지됨

**문제**: "ThinkingData SDK가 로드되지 않음"
**해결**: 스크립트 로딩 순서 확인, `defer` 속성 제거 고려

**문제**: 버튼 클릭이 감지되지 않음
**해결**: 이벤트 위임 방식으로 개선되어 대부분의 클릭 감지 가능

#### 3. 수동 테스트
```javascript
// 1. 팝업 요소 확인
document.querySelector('.modal-container')

// 2. 혜택 버튼 확인
document.querySelector('.button-3')

// 3. 닫기 버튼 확인
document.querySelector('.link-block-2')

// 4. ThinkingData 확인
window.te && window.te.track
```

### 지원되는 이벤트

- `popup_shown`: 팝업 표시
- `popup_action`: 팝업 상호작용
  - `action_type`: `benefit_check_click` (혜택 확인하기)
  - `action_type`: `popup_close` (팝업 닫기)
  - `close_method`: `button_click`, `escape_key`, `outside_click`

### 팝업 구조 분석

ThinkingData 홈페이지의 팝업 구조:
```html
<div class="modal-container">
  <div class="div-block-162">
    <!-- 팝업 이미지 -->
  </div>
  <div class="div-block-163">
    <a class="link-block-2">+</a> <!-- 닫기 버튼 -->
  </div>
  <div class="div-block-161">
    <a href="/thinkingdata-onestore-special-promotion-ko" class="button-3">
      <strong>혜택 확인하기</strong>
    </a>
  </div>
</div>
```

## 🎬 유튜브 비디오 추적 문제 해결

### 문제 상황
유튜브 비디오 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **스크립트 로딩 순서 문제**
2. **ThinkingData SDK 초기화 실패**
3. **YouTube iframe 감지 실패**
4. **YouTube API 로드 실패**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugVideoTracking();
```

#### 2. 수동 비디오 추적 재시작
```javascript
// 비디오 추적 수동 재시작
trackVideoEvents();
```

#### 3. ThinkingData SDK 상태 확인
```javascript
// SDK 상태 확인
console.log('ThinkingData SDK:', {
  te: typeof window.te,
  thinkingdata: typeof thinkingdata
});
```

### 개선된 기능

#### ✅ 동적 YouTube iframe 감지
- MutationObserver를 사용하여 동적으로 로드되는 YouTube iframe 감지
- Webflow의 동적 콘텐츠 로딩에 대응

#### ✅ 안정적인 SDK 초기화
- ThinkingData SDK 로드 상태 확인
- 자동 재시도 메커니즘
- 초기화 완료 이벤트 발생

#### ✅ 포괄적인 iframe 선택자
- `youtube.com`
- `youtu.be`
- `youtube-nocookie.com`

#### ✅ 다중 실행 시점
- DOMContentLoaded
- load 이벤트
- ThinkingData 초기화 완료 이벤트

### 디버깅 가이드

#### 1. 콘솔 로그 확인
브라우저 개발자 도구에서 다음 로그들을 확인하세요:

```
🎬 비디오 추적 초기화 시작...
🎯 YouTube iframe 발견: X개
✅ YouTube API 준비 완료!
✅ YouTube 플레이어 준비 완료: youtube_player_X
```

#### 2. 일반적인 문제들

**문제**: "ThinkingData SDK가 로드되지 않음"
**해결**: 스크립트 로딩 순서 확인, `defer` 속성 제거 고려

**문제**: "YouTube iframe 발견: 0개"
**해결**: iframe이 동적으로 로드되는 경우 5초 후 자동 감지됨

**문제**: "YouTube API 준비 완료!" 로그 없음
**해결**: 네트워크 연결 확인, YouTube API 차단 여부 확인

#### 3. 수동 테스트
```javascript
// 1. iframe 확인
document.querySelectorAll('iframe[src*="youtube.com"]')

// 2. YouTube API 확인
window.YT && window.YT.Player

// 3. ThinkingData 확인
window.te && window.te.track
```

### 설치 및 설정

#### 1. Webflow Head 섹션에 추가
```html
<!-- ThinkingData SDK -->
<script defer src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
<script defer src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>

<!-- 추적 스크립트들 -->
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/session-manager.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/video.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/popup.js"></script>
<!-- 기타 추적 스크립트들... -->
```

#### 2. YouTube iframe 설정
YouTube iframe에 고유 ID가 있는지 확인하세요:
```html
<iframe id="youtube_player_1" src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
```

### 지원되는 이벤트

#### 비디오 이벤트
- `video_ready`: 비디오 플레이어 준비 완료
- `video_play`: 비디오 재생 시작
- `video_pause`: 비디오 일시정지
- `video_ended`: 비디오 종료
- `video_complete`: 비디오 완전 시청
- `video_progress`: 진행률 마일스톤 (25%, 50%, 75%, 90%)
- `video_buffering`: 버퍼링
- `video_error`: 오류 발생

#### 팝업 이벤트
- `popup_shown`: 팝업 표시
- `popup_action`: 팝업 상호작용

### 문의 및 지원

문제가 지속되는 경우:
1. 브라우저 콘솔 로그 확인
2. `debugVideoTracking()` 또는 `debugPopupTracking()` 실행 결과 공유
3. YouTube iframe 또는 팝업 HTML 구조 확인

---

**Made with ❤️ for ThinkingData** 

# Webflow Tracking System

ThinkingData를 활용한 Webflow 웹사이트 추적 시스템

## 🖱️ 클릭 추적 문제 해결

### 문제 상황
ThinkingData 홈페이지의 클릭 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **ThinkingData SDK 초기화 실패**
2. **이벤트 리스너 등록 시점 문제**
3. **클릭 가능한 요소 선택자 불일치**
4. **Webflow 특화 클래스 미감지**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugClickTracking();
```

#### 2. 수동 클릭 추적 재시작
```javascript
// 클릭 추적 수동 재시작
trackClickEvents();
```

#### 3. 클릭 가능한 요소 수동 확인
```javascript
// 클릭 가능한 요소 확인
document.querySelectorAll('a, button, [role="button"], .btn, .button, .w-button, .link-block')

// ThinkingData 특화 버튼 확인
document.querySelectorAll('a[href*="demo"], button:contains("데모")')
document.querySelectorAll('a[href*="contact"], button:contains("문의")')
```

### 개선된 기능

#### ✅ ThinkingData 홈페이지 특화 버튼 감지
- `데모 신청하기` 버튼
- `문의하기` 버튼
- `자세히 알아보기` 버튼
- `바로가기` 버튼
- `혜택 확인하기` 버튼
- `게임더하기 신청하기` 버튼

#### ✅ Webflow 특화 클래스 지원
- `.w-button` (Webflow 버튼)
- `.link-block` (Webflow 링크 블록)

#### ✅ 버튼 카테고리 분류
- `content`: 블로그, 고객사례
- `company`: 회사소개, 기업문화, 뉴스
- `conversion`: 데모 신청, 문의하기
- `product`: 솔루션, 기능

## 📥 리소스 다운로드 추적 문제 해결

### 문제 상황
리소스 다운로드 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **파일 확장자 감지 실패**
2. **ThinkingData 특화 리소스 미감지**
3. **링크 구조 특이성**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugResourceTracking();
```

#### 2. 수동 리소스 추적 재시작
```javascript
// 리소스 추적 수동 재시작
trackResourceDownloads();
```

#### 3. 다운로드 링크 수동 확인
```javascript
// 다운로드 링크 확인
document.querySelectorAll('a[href*=".pdf"], a[href*=".doc"], a[href*=".xls"], a[href*=".ppt"], a[href*=".zip"]')

// ThinkingData 특화 리소스 확인
document.querySelectorAll('a[href*="api"], a[href*="docs"]')
document.querySelectorAll('a[href*="guide"], a[href*="onboarding"]')
```

### 개선된 기능

#### ✅ 파일 확장자 기반 분류
- `pdf_document`: PDF 문서
- `word_document`: Word 문서
- `excel_document`: Excel 문서
- `powerpoint_document`: PowerPoint 문서
- `compressed_file`: 압축 파일
- `csv_data`: CSV 데이터

#### ✅ ThinkingData 특화 리소스 감지
- `api_documentation`: API 문서
- `user_guide`: 사용자 가이드
- `case_study`: 고객사례
- `whitepaper`: 백서
- `demo_request`: 데모 신청
- `contact_form`: 문의 폼

## 📜 스크롤 추적 문제 해결

### 문제 상황
스크롤 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **스크롤 이벤트 리스너 등록 실패**
2. **페이지 높이 계산 오류**
3. **디바운싱 문제**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugScrollTracking();
```

#### 2. 수동 스크롤 추적 재시작
```javascript
// 스크롤 추적 수동 재시작
trackScrollDepth();
```

#### 3. 스크롤 상태 수동 확인
```javascript
// 현재 스크롤 상태 확인
const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
const windowHeight = window.innerHeight;
const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
const scrollPercentage = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
console.log('스크롤 퍼센트:', scrollPercentage + '%');
```

### 개선된 기능

#### ✅ 페이지 섹션 감지
- `hero`: 히어로 섹션
- `features`: 기능 섹션
- `solutions`: 솔루션 섹션
- `testimonials`: 고객사례 섹션
- `cta`: 행동 유도 섹션
- `footer`: 푸터 섹션

#### ✅ 안정적인 스크롤 계산
- 다양한 브라우저 호환성
- 디바운싱 적용
- 중복 추적 방지

## 🎪 팝업 추적 문제 해결

### 문제 상황
ThinkingData 홈페이지의 팝업 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **팝업 구조 특이성**: `modal-container` 클래스와 특별한 닫기 버튼 구조
2. **동적 로딩**: 페이지 로드 후 JavaScript로 팝업이 표시되는 경우
3. **ThinkingData SDK 초기화 실패**
4. **이벤트 리스너 등록 시점 문제**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugPopupTracking();
```

#### 2. 수동 팝업 추적 재시작
```javascript
// 팝업 추적 수동 재시작
trackPopupEvents();
```

#### 3. 팝업 요소 수동 확인
```javascript
// 팝업 요소 확인
document.querySelectorAll('.modal-container, .modal, .popup, .overlay, [role="dialog"]')

// 혜택 확인하기 버튼 확인
document.querySelector('a[href*="thinkingdata-onestore-special-promotion"], .button-3')

// 닫기 버튼 확인
document.querySelector('.link-block-2, .close, .modal-close')
```

### 개선된 기능

#### ✅ ThinkingData 홈페이지 특화 감지
- `modal-container` 클래스 감지
- `+` 텍스트를 가진 닫기 버튼 감지
- `button-3` 클래스의 혜택 확인하기 버튼 감지

#### ✅ 다중 닫기 방법 감지
- 닫기 버튼 클릭
- ESC 키 입력
- 팝업 외부 클릭

#### ✅ 기존 팝업 감지
- 페이지 로드 시 이미 존재하는 팝업 자동 감지
- 중복 추적 방지

#### ✅ 상세한 팝업 정보 수집
- 팝업 타입, ID, 클래스
- 혜택 버튼 존재 여부
- 닫기 버튼 존재 여부
- 팝업 가시성 상태

## 🎬 유튜브 비디오 추적 문제 해결

### 문제 상황
유튜브 비디오 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **스크립트 로딩 순서 문제**
2. **ThinkingData SDK 초기화 실패**
3. **YouTube iframe 감지 실패**
4. **YouTube API 로드 실패**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugVideoTracking();
```

#### 2. 수동 비디오 추적 재시작
```javascript
// 비디오 추적 수동 재시작
trackVideoEvents();
```

#### 3. ThinkingData SDK 상태 확인
```javascript
// SDK 상태 확인
console.log('ThinkingData SDK:', {
  te: typeof window.te,
  thinkingdata: typeof thinkingdata
});
```

### 개선된 기능

#### ✅ 동적 YouTube iframe 감지
- MutationObserver를 사용하여 동적으로 로드되는 YouTube iframe 감지
- Webflow의 동적 콘텐츠 로딩에 대응

#### ✅ 안정적인 SDK 초기화
- ThinkingData SDK 로드 상태 확인
- 자동 재시도 메커니즘
- 초기화 완료 이벤트 발생

#### ✅ 포괄적인 iframe 선택자
- `youtube.com`
- `youtu.be`
- `youtube-nocookie.com`

#### ✅ 다중 실행 시점
- DOMContentLoaded
- load 이벤트
- ThinkingData 초기화 완료 이벤트

### 디버깅 가이드

#### 1. 콘솔 로그 확인
브라우저 개발자 도구에서 다음 로그들을 확인하세요:

```
🎬 비디오 추적 초기화 시작...
🎯 YouTube iframe 발견: X개
✅ YouTube API 준비 완료!
✅ YouTube 플레이어 준비 완료: youtube_player_X
```

#### 2. 일반적인 문제들

**문제**: "ThinkingData SDK가 로드되지 않음"
**해결**: 스크립트 로딩 순서 확인, `defer` 속성 제거 고려

**문제**: "YouTube iframe 발견: 0개"
**해결**: iframe이 동적으로 로드되는 경우 5초 후 자동 감지됨

**문제**: "YouTube API 준비 완료!" 로그 없음
**해결**: 네트워크 연결 확인, YouTube API 차단 여부 확인

#### 3. 수동 테스트
```javascript
// 1. iframe 확인
document.querySelectorAll('iframe[src*="youtube.com"]')

// 2. YouTube API 확인
window.YT && window.YT.Player

// 3. ThinkingData 확인
window.te && window.te.track
```

### 설치 및 설정

#### 1. Webflow Head 섹션에 추가
```html
<!-- ThinkingData SDK -->
<script defer src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
<script defer src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>

<!-- 추적 스크립트들 -->
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/session-manager.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/video.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/popup.js"></script>
<!-- 기타 추적 스크립트들... -->
```

#### 2. YouTube iframe 설정
YouTube iframe에 고유 ID가 있는지 확인하세요:
```html
<iframe id="youtube_player_1" src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
```

### 지원되는 이벤트

#### 비디오 이벤트
- `video_ready`: 비디오 플레이어 준비 완료
- `video_play`: 비디오 재생 시작
- `video_pause`: 비디오 일시정지
- `video_ended`: 비디오 종료
- `video_complete`: 비디오 완전 시청
- `video_progress`: 진행률 마일스톤 (25%, 50%, 75%, 90%)
- `video_buffering`: 버퍼링
- `video_error`: 오류 발생

#### 팝업 이벤트
- `popup_shown`: 팝업 표시
- `popup_action`: 팝업 상호작용

### 문의 및 지원

문제가 지속되는 경우:
1. 브라우저 콘솔 로그 확인
2. `debugVideoTracking()` 또는 `debugPopupTracking()` 실행 결과 공유
3. YouTube iframe 또는 팝업 HTML 구조 확인

## 🎬 유튜브 비디오 추적 문제 해결

### 문제 상황
유튜브 비디오 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **스크립트 로딩 순서 문제**
2. **ThinkingData SDK 초기화 실패**
3. **YouTube iframe 감지 실패**
4. **YouTube API 로드 실패**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugVideoTracking();
```

#### 2. 수동 비디오 추적 재시작
```javascript
// 비디오 추적 수동 재시작
trackVideoEvents();
```

#### 3. ThinkingData SDK 상태 확인
```javascript
// SDK 상태 확인
console.log('ThinkingData SDK:', {
  te: typeof window.te,
  thinkingdata: typeof thinkingdata
});
```

### 개선된 기능

#### ✅ 동적 YouTube iframe 감지
- MutationObserver를 사용하여 동적으로 로드되는 YouTube iframe 감지
- Webflow의 동적 콘텐츠 로딩에 대응

#### ✅ 안정적인 SDK 초기화
- ThinkingData SDK 로드 상태 확인
- 자동 재시도 메커니즘
- 초기화 완료 이벤트 발생

#### ✅ 포괄적인 iframe 선택자
- `youtube.com`
- `youtu.be`
- `youtube-nocookie.com`

#### ✅ 다중 실행 시점
- DOMContentLoaded
- load 이벤트
- ThinkingData 초기화 완료 이벤트

### 디버깅 가이드

#### 1. 콘솔 로그 확인
브라우저 개발자 도구에서 다음 로그들을 확인하세요:

```
🎬 비디오 추적 초기화 시작...
🎯 YouTube iframe 발견: X개
✅ YouTube API 준비 완료!
✅ YouTube 플레이어 준비 완료: youtube_player_X
```

#### 2. 일반적인 문제들

**문제**: "ThinkingData SDK가 로드되지 않음"
**해결**: 스크립트 로딩 순서 확인, `defer` 속성 제거 고려

**문제**: "YouTube iframe 발견: 0개"
**해결**: iframe이 동적으로 로드되는 경우 5초 후 자동 감지됨

**문제**: "YouTube API 준비 완료!" 로그 없음
**해결**: 네트워크 연결 확인, YouTube API 차단 여부 확인

#### 3. 수동 테스트
```javascript
// 1. iframe 확인
document.querySelectorAll('iframe[src*="youtube.com"]')

// 2. YouTube API 확인
window.YT && window.YT.Player

// 3. ThinkingData 확인
window.te && window.te.track
```

### 설치 및 설정

#### 1. Webflow Head 섹션에 추가
```html
<!-- ThinkingData SDK -->
<script defer src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
<script defer src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>

<!-- 추적 스크립트들 -->
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/session-manager.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/video.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/popup.js"></script>
<!-- 기타 추적 스크립트들... -->
```

#### 2. YouTube iframe 설정
YouTube iframe에 고유 ID가 있는지 확인하세요:
```html
<iframe id="youtube_player_1" src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
```

### 지원되는 이벤트

#### 비디오 이벤트
- `video_ready`: 비디오 플레이어 준비 완료
- `video_play`: 비디오 재생 시작
- `video_pause`: 비디오 일시정지
- `video_ended`: 비디오 종료
- `video_complete`: 비디오 완전 시청
- `video_progress`: 진행률 마일스톤 (25%, 50%, 75%, 90%)
- `video_buffering`: 버퍼링
- `video_error`: 오류 발생

#### 팝업 이벤트
- `popup_shown`: 팝업 표시
- `popup_action`: 팝업 상호작용

### 문의 및 지원

문제가 지속되는 경우:
1. 브라우저 콘솔 로그 확인
2. `debugVideoTracking()` 또는 `debugPopupTracking()` 실행 결과 공유
3. YouTube iframe 또는 팝업 HTML 구조 확인

## 🎬 유튜브 비디오 추적 문제 해결

### 문제 상황
유튜브 비디오 추적이 작동하지 않는 경우 다음과 같은 원인이 있을 수 있습니다:

1. **스크립트 로딩 순서 문제**
2. **ThinkingData SDK 초기화 실패**
3. **YouTube iframe 감지 실패**
4. **YouTube API 로드 실패**

### 해결 방법

#### 1. 브라우저 콘솔에서 디버깅
```javascript
// 브라우저 개발자 도구 콘솔에서 실행
debugVideoTracking();
```

#### 2. 수동 비디오 추적 재시작
```javascript
// 비디오 추적 수동 재시작
trackVideoEvents();
```

#### 3. ThinkingData SDK 상태 확인
```javascript
// SDK 상태 확인
console.log('ThinkingData SDK:', {
  te: typeof window.te,
  thinkingdata: typeof thinkingdata
});
```

### 개선된 기능

#### ✅ 동적 YouTube iframe 감지
- MutationObserver를 사용하여 동적으로 로드되는 YouTube iframe 감지
- Webflow의 동적 콘텐츠 로딩에 대응

#### ✅ 안정적인 SDK 초기화
- ThinkingData SDK 로드 상태 확인
- 자동 재시도 메커니즘
- 초기화 완료 이벤트 발생

#### ✅ 포괄적인 iframe 선택자
- `youtube.com`
- `youtu.be`
- `youtube-nocookie.com`

#### ✅ 다중 실행 시점
- DOMContentLoaded
- load 이벤트
- ThinkingData 초기화 완료 이벤트

### 디버깅 가이드

#### 1. 콘솔 로그 확인
브라우저 개발자 도구에서 다음 로그들을 확인하세요:

```
🎬 비디오 추적 초기화 시작...
🎯 YouTube iframe 발견: X개
✅ YouTube API 준비 완료!
✅ YouTube 플레이어 준비 완료: youtube_player_X
```

#### 2. 일반적인 문제들

**문제**: "ThinkingData SDK가 로드되지 않음"
**해결**: 스크립트 로딩 순서 확인, `defer` 속성 제거 고려

**문제**: "YouTube iframe 발견: 0개"
**해결**: iframe이 동적으로 로드되는 경우 5초 후 자동 감지됨

**문제**: "YouTube API 준비 완료!" 로그 없음
**해결**: 네트워크 연결 확인, YouTube API 차단 여부 확인

#### 3. 수동 테스트
```javascript
// 1. iframe 확인
document.querySelectorAll('iframe[src*="youtube.com"]')

// 2. YouTube API 확인
window.YT && window.YT.Player

// 3. ThinkingData 확인
window.te && window.te.track
```

### 설치 및 설정

#### 1. Webflow Head 섹션에 추가
```html
<!-- ThinkingData SDK -->
<script defer src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
<script defer src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>

<!-- 추적 스크립트들 -->
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/session-manager.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/video.js"></script>
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/popup.js"></script>
<!-- 기타 추적 스크립트들... -->
```

#### 2. YouTube iframe 설정
YouTube iframe에 고유 ID가 있는지 확인하세요:
```html
<iframe id="youtube_player_1" src="https://www.youtube.com/embed/VIDEO_ID"></iframe>
```

### 지원되는 이벤트

#### 비디오 이벤트
- `video_ready`: 비디오 플레이어 준비 완료
- `video_play`: 비디오 재생 시작
- `video_pause`: 비디오 일시정지
- `video_ended`: 비디오 종료
- `video_complete`: 비디오 완전 시청
- `video_progress`: 진행률 마일스톤 (25%, 50%, 75%, 90%)
- `video_buffering`: 버퍼링
- `video_error`: 오류 발생

#### 팝업 이벤트
- `popup_shown`: 팝업 표시
- `popup_action`: 팝업 상호작용

### 문의 및 지원

문제가 지속되는 경우:
1. 브라우저 콘솔 로그 확인
2. `debugVideoTracking()` 또는 `debugPopupTracking()` 실행 결과 공유
3. YouTube iframe 또는 팝업 HTML 구조 확인

---

**Made with ❤️ for ThinkingData** 