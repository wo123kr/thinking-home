# 🎯 ThinkingData 웹 추적 시스템

ThinkingData SDK를 활용한 완전한 웹사이트 사용자 행동 추적 시스템입니다. Webflow, 일반 웹사이트 등 모든 환경에서 사용할 수 있습니다.

## 📋 목차

- [🚀 빠른 시작](#-빠른-시작)
- [📦 주요 기능](#-주요-기능)
- [🔧 설치 방법](#-설치-방법)
- [📊 수집 이벤트](#-수집-이벤트)
- [🎛️ 설정 옵션](#️-설정-옵션)
- [🐛 디버깅](#-디버깅)
- [📈 성능 최적화](#-성능-최적화)
- [🤝 기여하기](#-기여하기)

---

## 🚀 빠른 시작

### ✅ Webflow 사용자 (간단한 설정)

**Head Code에 추가**
```html
<!-- ThinkingData SDK -->
<script src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
<script src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>

<!-- 🚀 모든 추적 기능이 포함된 하나의 파일 (안정화 버전) -->
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@43a3452/core/thinking-data-init.js"></script>

<!-- 네이버 전환 추적 및 폼 제출 성공 이벤트 -->
<script defer>
    // 네이버 전환 스크립트 로드 함수
    function loadNaverConversionScript(conversionType) {
        console.log('네이버 전환 스크립트 로드:', conversionType);
    }

    // 페이지 URL에 따라 네이버 전환 스크립트 로드
    document.addEventListener('DOMContentLoaded', function() {
        var currentUrl = window.location.href;

        if (currentUrl.includes('/form-ask')) {
            loadNaverConversionScript('custom001');  // 상담하기 페이지 진입
        }

        if (currentUrl.includes('/form-demo')) {
            loadNaverConversionScript('custom003');  // 데모버전 페이지 진입
        }

        const successMessage = document.querySelector('.brix---success-message.w-form-done');
        const demoSuccessMessage = document.querySelector('.brix---success-message-3.w-form-done');

        const trackFormSubmission = (formName, formTitle, conversionType) => {
            if (window.te && typeof window.te.track === 'function') {
                window.te.track('form_submit_success', {
                    form_name: formName,
                    title: formTitle,
                    page_url: window.location.href,
                    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 23)
                });
            }
            loadNaverConversionScript(conversionType);
        };

        if (successMessage) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'style' && successMessage.style.display === 'block') {
                        trackFormSubmission('ask_Contact Form', 'ask_contact_form', 'custom002');
                    }
                });
            });
            observer.observe(successMessage, { attributes: true });
        }

        if (demoSuccessMessage) {
            const demoObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'style' && demoSuccessMessage.style.display === 'block') {
                        trackFormSubmission('demo_form', 'demo_form', 'custom004');
                    }
                });
            });
            demoObserver.observe(demoSuccessMessage, { attributes: true });
        }
    });
</script>
```

**끝!** 🎉 이것만으로 모든 추적이 자동 시작됩니다.

### ✅ 일반 웹사이트 사용자

```html
<!DOCTYPE html>
<html>
<head>
    <!-- ThinkingData SDK -->
    <script src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
    <script src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>
    
    <!-- 🚀 모든 추적 기능이 포함된 하나의 파일 (안정화 버전) -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@43a3452/core/thinking-data-init.js"></script>
</head>
<body>
    <!-- 웹사이트 콘텐츠 -->
</body>
</html>
```

---

## 📦 주요 기능

### 🎯 자동 이벤트 수집
- **페이지뷰**: `ta_page_show` (SDK 자동)
- **클릭 추적**: 모든 클릭 가능한 요소 자동 감지
- **폼 제출**: 폼 제출 이벤트 자동 추적
- **외부 링크**: 외부 사이트 링크 클릭 추적
- **스크롤 깊이**: 25%, 50%, 75%, 90%, 100% 도달 추적

### 🎬 비디오 추적
- **YouTube 비디오**: 재생, 일시정지, 완료, 진행률 추적
- **자동 감지**: YouTube iframe 자동 감지 및 추적
- **상세 분석**: 시청 시간, 일시정지 횟수, 완료율 등

### 📄 페이지 종료 추적
- **다중 이벤트**: `beforeunload`, `unload`, `pagehide`, `visibilitychange`
- **안정적 전송**: Beacon API, Image 객체, 동기 전송 다중 방식
- **중복 방지**: 이벤트 중복 전송 방지 시스템

### 👤 유저 속성 추적
- **생명주기**: Awareness → Consideration → Decision 단계 추적
- **참여도**: 상호작용 기반 참여도 수준 분석
- **콘텐츠 선호도**: 방문 페이지, 체류 시간 기반 분석
- **재방문자**: 최초 방문 vs 재방문 구분

### 🎪 팝업 추적
- **자동 감지**: 모달, 팝업 요소 자동 감지
- **상호작용**: 팝업 표시, 닫기, 혜택 확인 버튼 추적
- **ESC 키**: 키보드 ESC 키로 팝업 닫기 추적

### 📥 리소스 다운로드
- **파일 형식**: PDF, DOC, XLS, PPT, ZIP 등 자동 감지
- **다운로드 추적**: 파일 다운로드 클릭 이벤트 추적

---

## 🔧 설치 방법

### ✅ 간단한 CDN 방식 (권장)
```html
<!-- ThinkingData SDK -->
<script src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
<script src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>

<!-- 🚀 모든 추적 기능이 포함된 하나의 파일 (안정화 버전) -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@43a3452/core/thinking-data-init.js"></script>
```

### 🎯 포함된 모든 기능
- ✅ **자동 페이지뷰 추적** (ta_page_show, ta_page_hide)
- ✅ **클릭 이벤트 추적** (버튼, 링크, CTA)
- ✅ **폼 제출 추적** (데모 신청, 문의하기)
- ✅ **외부 링크 추적** (아웃바운드 클릭)
- ✅ **스크롤 깊이 추적** (25%, 50%, 75%, 100%)
- ✅ **비디오 상호작용 추적** (YouTube 플레이, 완료)
- ✅ **팝업 상호작용 추적** (표시, 닫기)
- ✅ **리소스 다운로드 추적** (PDF, 문서 등)
- ✅ **페이지 종료 추적** (이탈, 세션 시간)
- ✅ **사용자 속성 추적** (참여도, 선호도 등)

### 🛠️ 로컬 개발용 설치
```bash
git clone https://github.com/wo123kr/webflow-tracking.git
cd webflow-tracking
# core/thinking-data-init.js 파일을 사용
```

### 📌 **버전 관리 (중요!)**

#### ✅ **안정화 버전 사용 (권장)**
```html
<!-- 🔒 특정 커밋 해시 사용 (안정성 보장) -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@43a3452/core/thinking-data-init.js"></script>
```

#### ⚠️ **최신 버전 사용 (주의)**
```html
<!-- ⚠️ 개발/테스트용만 사용 (프로덕션 비권장) -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>
```

#### 🔄 **버전 업데이트 방법**
1. [GitHub 릴리스](https://github.com/wo123kr/webflow-tracking/commits/main)에서 최신 커밋 확인
2. 새 커밋 해시로 URL 변경
3. 테스트 환경에서 검증 후 프로덕션 적용

---

## 📊 수집 이벤트

### SDK 자동 이벤트
| 이벤트명 | 설명 | 주요 속성 |
|---------|------|-----------|
| `ta_page_show` | 페이지 표시 | `#url`, `#title`, `#referrer` |
| `ta_page_hide` | 페이지 숨김 | `#duration` (체류시간) |

### 커스텀 이벤트
| 이벤트명 | 설명 | 주요 속성 |
|---------|------|-----------|
| `te_page_view` | 페이지뷰 | `page_url`, `page_title`, `page_section` |
| `te_element_click` | 요소 클릭 | `name`, `element_tag`, `element_id` |
| `te_form_submit` | 폼 제출 | `form_name`, `form_type`, `page_url` |
| `te_scroll_depth` | 스크롤 깊이 | `scroll_depth_percentage`, `page_name` |
| `te_video_play` | 비디오 재생 | `video_name`, `video_url`, `platform` |
| `te_video_complete` | 비디오 완료 | `video_duration`, `total_watch_time` |
| `te_popup_shown` | 팝업 표시 | `popup_type`, `popup_id` |
| `te_resource_download` | 리소스 다운로드 | `download_url`, `resource_type` |
| `te_page_exit` | 페이지 종료 | `exit_type`, `total_visible_time` |
| `te_session_start` | 세션 시작 | `session_id`, `session_start_time` |
| `te_session_end` | 세션 종료 | `session_duration_seconds`, `end_reason` |

### 유저 속성
| 속성명 | 설명 | 타입 |
|--------|------|------|
| `first_visit_timestamp` | 최초 방문 시점 | String (ISO) |
| `total_sessions` | 총 세션 수 | Number |
| `is_returning_visitor` | 재방문자 여부 | Boolean |
| `engagement_level` | 참여도 수준 | String |
| `visitor_lifecycle_stage` | 생명주기 단계 | String |
| `interested_topics` | 관심 주제 | Array |
| `most_visited_section` | 가장 많이 방문한 섹션 | String |

---

## 🎛️ 설정 옵션

### 기본 설정
```javascript
// ThinkingData 설정
var config = {
  appId: "dc61b4c238a048fb953b77b1fa1329c3",
  serverUrl: "https://te-receiver-naver.thinkingdata.kr/sync_js",
  autoTrack: {
    pageShow: true,
    pageHide: true
  }
};
```

### 세션 설정
```javascript
// 세션 타임아웃 설정 (기본: 30분)
window.sessionTimeout = 30 * 60 * 1000;

// 세션 추적 활성화/비활성화
window.isSessionTrackingEnabled = true;
```

### 이벤트 필터링
```javascript
// 특정 이벤트만 수집
window.trackingConfig = {
  enableClickTracking: true,
  enableScrollTracking: true,
  enableFormTracking: true,
  enableVideoTracking: true,
  enablePopupTracking: true,
  enableResourceTracking: true
};
```

---

## 🐛 디버깅

### 콘솔 로그 확인
```javascript
// 디버깅 정보 출력
window.debugTracking();

// 세션 정보 확인
window.debugSession();

// 유저 속성 확인
window.debugUserAttributes();
```

### 이벤트 테스트
```javascript
// 테스트 이벤트 전송
window.testTracking();

// 페이지 종료 시뮬레이션
window.testPageExit();
```

### ThinkingData SDK 상태 확인
```javascript
// SDK 로드 상태
console.log('ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');

// 현재 설정 확인
console.log('현재 설정:', window.te ? window.te.getSuperProperties() : '설정 없음');
```

---

## 📈 성능 최적화

### 1. 모듈별 로딩
```html
<!-- 필요한 모듈만 로드 -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@0fd140c/core/thinking-data-init.js"></script>
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@0fd140c/tracking/page-view.js"></script>
```

### 2. 이벤트 디바운싱
- 스크롤 이벤트: 100ms 디바운싱
- 클릭 이벤트: 즉시 처리
- 페이지 종료: 다중 전송 방식으로 안정성 확보

### 3. 중복 실행 방지
- 모든 모듈에 중복 실행 방지 플래그 적용
- 무한 재귀 호출 방지 시스템

---

## 🔧 최근 업데이트

### v2.1.0 (2025-02-24)
- ✅ **데이터 타입 오류 완전 해결**
  - 모든 시간 속성을 ISO 문자열 형식으로 통일
  - null/undefined 값을 빈 문자열 또는 0으로 수정
  - session_id를 문자열로 통일
- ✅ **appId 업데이트**: `dc61b4c238a048fb953b77b1fa1329c3`
- ✅ **무한 재귀 호출 수정**: resource.js 문제 해결
- ✅ **중복 추적 방지**: 모든 모듈에 안전장치 추가

### v2.0.0 (2025-02-23)
- ✅ **ThinkingData SDK v2.0.3 통합**
- ✅ **자동 이벤트 수집 시스템**
- ✅ **유저 속성 추적 시스템**
- ✅ **페이지 종료 추적 강화**

---

## 🤝 기여하기

### 버그 리포트
1. GitHub Issues에서 버그 리포트
2. 콘솔 로그와 함께 상세한 설명 제공
3. 재현 가능한 단계 명시

### 기능 요청
1. 새로운 추적 기능 제안
2. 기존 기능 개선 아이디어
3. 성능 최적화 제안

### 개발 환경 설정
```bash
git clone https://github.com/wo123kr/webflow-tracking.git
cd webflow-tracking
# 로컬 서버에서 테스트
```

---

## 📞 지원

- **GitHub Issues**: [이슈 리포트](https://github.com/wo123kr/webflow-tracking/issues)
- **문서**: 이 README 파일 참조
- **예시**: 코드 내 주석 및 예시 참조

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

**최신 안정화 버전**: `43a3452` (2025-01-08)  
**ThinkingData SDK**: v2.0.3  
**지원 환경**: 모든 모던 브라우저 (IE 9+)
