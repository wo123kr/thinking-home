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

### Webflow 사용자

**1단계: Head Code 추가**
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PQLVHLN5');</script>
<!-- End Google Tag Manager -->

<!-- ThinkingData SDK -->
<script src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
<script src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>

<!-- ThinkingData 트래킹 코드 -->
<script defer src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>

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
                    timestamp: Date.now()
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

**2단계: Footer Code 추가**
```html
<!-- Webflow 추적 시스템 -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/index.js"></script>
```

### 일반 웹사이트 사용자

```html
<!DOCTYPE html>
<html>
<head>
    <!-- ThinkingData SDK -->
    <script src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>
    <script src="https://te-receiver-naver.thinkingdata.kr/te-sdk/latest/ta.js"></script>
    
    <!-- 추적 시스템 -->
    <script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/index.js"></script>
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

### 1. CDN 방식 (권장)
```html
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/index.js"></script>
```

### 2. 특정 모듈만 로드
```html
<!-- 코어 모듈 -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>

<!-- 개별 추적 모듈 -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/page-view.js"></script>
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/click.js"></script>
```

### 3. 로컬 설치
```bash
git clone https://github.com/wo123kr/webflow-tracking.git
cd webflow-tracking
# 파일들을 웹사이트에 복사
```

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
| `te_video_complete` | 비디오 완료 | `video_name`, `completion_rate`, `total_watch_time` |
| `te_popup_shown` | 팝업 표시 | `popup_type`, `popup_id` |
| `te_popup_action` | 팝업 상호작용 | `action_type`, `close_method` |
| `te_resource_download` | 리소스 다운로드 | `download_url`, `download_filename` |
| `te_page_exit` | 페이지 종료 | `exit_type`, `total_visible_time`, `session_duration` |

### 유저 속성
| 속성명 | 설명 | 타입 |
|--------|------|------|
| `first_visit_timestamp` | 최초 방문 시점 | Number |
| `total_sessions` | 총 세션 수 | Number |
| `is_returning_visitor` | 재방문자 여부 | Boolean |
| `visitor_lifecycle_stage` | 생명주기 단계 | String |
| `engagement_level` | 참여도 수준 | String |
| `most_visited_section` | 가장 많이 방문한 섹션 | String |
| `interested_topics` | 관심 주제 | Array |

---

## 🎛️ 설정 옵션

### ThinkingData SDK 설정
```javascript
var config = {
    appId: "b33016b8b26f4798aee67722ed4438be",
    serverUrl: "https://te-receiver-naver.thinkingdata.kr/sync_js",
    autoTrack: {
        pageShow: true,  // 페이지 진입 자동 추적
        pageHide: true   // 페이지 이탈 자동 추적
    }
};
```

### 커스텀 설정
```javascript
// 페이지 분류 함수 커스터마이징
window.getPageSection = function() {
    const path = window.location.pathname;
    if (path.includes('/product')) return 'product';
    if (path.includes('/blog')) return 'blog';
    return 'other';
};

// 폼 타입 분류 커스터마이징
window.getFormType = function() {
    const path = window.location.pathname;
    if (path.includes('/contact')) return 'contact';
    if (path.includes('/demo')) return 'demo';
    return 'other';
};
```

---

## 🐛 디버깅

### 콘솔 로그 확인
브라우저 개발자 도구 → Console에서 다음 메시지들을 확인하세요:

```
✅ ThinkingData SDK initialized
🚀 Webflow Tracking System 시작...
✅ 모든 모듈 로드 완료
✅ All tracking events initialized
```

### 디버깅 함수 사용
```javascript
// 비디오 추적 디버깅
window.debugVideoTracking();

// 팝업 추적 디버깅
window.debugPopupTracking();

// 페이지 종료 추적 디버깅
window.debugExitTracking();

// 테스트 이벤트 전송
window.testExitEvent();
```

### 네트워크 탭 확인
- **URL**: `te-receiver-naver.thinkingdata.kr`
- **메서드**: POST
- **상태**: 200 OK

---

## 📈 성능 최적화

### 1. 모듈별 로딩
필요한 모듈만 선택적으로 로드:
```html
<!-- 기본 추적만 -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/core/thinking-data-init.js"></script>

<!-- 비디오 추적 추가 -->
<script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main/tracking/video.js"></script>
```

### 2. 이벤트 중복 방지
- SDK 자동 이벤트와 커스텀 이벤트 중복 방지
- 동일한 이벤트의 중복 전송 방지
- 페이지 종료 이벤트의 다중 전송 방식

### 3. 메모리 최적화
- 이벤트 리스너 정리
- 불필요한 DOM 관찰자 해제
- 주기적 메모리 정리

---

## 🤝 기여하기

### 버그 리포트
1. GitHub Issues에서 버그 리포트
2. 브라우저 콘솔 로그 첨부
3. 재현 단계 상세 설명

### 기능 제안
1. GitHub Issues에서 기능 제안
2. 사용 사례 및 요구사항 설명
3. 구현 우선순위 논의

### 코드 기여
1. Fork 후 개발 브랜치 생성
2. 코드 작성 및 테스트
3. Pull Request 생성

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 🔗 관련 링크

- [ThinkingData 공식 문서](https://docs.thinkingdata.cn/)
- [JavaScript SDK 가이드](https://docs.thinkingdata.cn/ta-manual/latest/installation/installation_menu/client_sdk/js_sdk_installation/js_sdk_installation.html)
- [GitHub 저장소](https://github.com/wo123kr/webflow-tracking)

---

## 📞 지원

문제가 있으시면 GitHub Issues를 통해 문의해주세요!

**마지막 업데이트**: 2025년 2월 24일
**버전**: 2.1.1 