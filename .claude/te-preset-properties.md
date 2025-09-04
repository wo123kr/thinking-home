# JavaScript SDK 프리셋 속성 완전 가이드

## 📋 1. 모든 이벤트 포함 프리셋 속성

모든 이벤트에 자동으로 포함되는 기본 속성들입니다.

### 1.1 지리적 정보 (서버 측 분석)

| 속성명 | 이름 | 타입 | 설명 | 예시 |
|--------|------|------|------|------|
| `#ip` | IP 주소 | String | 사용자 IP 주소 | `192.168.1.1` |
| `#country` | 국가 | String | IP 기반 국가명 | `대한민국` |
| `#country_code` | 국가 코드 | String | ISO 3166-1 alpha-2 형식 | `KR`, `US` |
| `#province` | 주/도 | String | IP 기반 지역 | `서울특별시` |
| `#city` | 도시 | String | IP 기반 도시 | `강남구` |

### 1.2 디바이스 정보

| 속성명 | 이름 | 타입 | 설명 | 예시 |
|--------|------|------|------|------|
| `#os` | 운영체제 | String | OS 종류 | `Mac OS X`, `Windows` |
| `#os_version` | OS 버전 | String | 상세 OS 버전 | `macOS 12.6`, `Windows 10` |
| `#manufacturer` | 제조사 | String | 디바이스 제조사 | `Apple`, `Samsung` |
| `#device_id` | 디바이스 ID | String | 고유 디바이스 식별자 | `17a3858fafd9b4-...` |
| `#screen_width` | 화면 너비 | Number | 픽셀 단위 화면 너비 | `1920` |
| `#screen_height` | 화면 높이 | Number | 픽셀 단위 화면 높이 | `1080` |

### 1.3 SDK 및 네트워크 정보

| 속성명 | 이름 | 타입 | 설명 | 예시 |
|--------|------|------|------|------|
| `#lib` | SDK 유형 | String | 사용 중인 SDK | `JavaScript` |
| `#lib_version` | SDK 버전 | String | SDK 버전 정보 | `1.6.2` |
| `#carrier` | 통신사 | String | 네트워크 사업자 | `SKT`, `KT`, `LGU+` |
| `#zone_offset` | 시간대 오프셋 | Number | UTC와의 시간 차이 | `9` (한국 시간) |
| `#system_language` | 시스템 언어 | String | ISO 639-1 형식 | `ko`, `en` |

### 1.4 브라우저 및 마케팅 정보

| 속성명 | 이름 | 타입 | 설명 | 예시 |
|--------|------|------|------|------|
| `#ua` | 유저 에이전트 | String | 브라우저 상세 정보 | `Mozilla/5.0 (Macintosh...)` |
| `#utm` | UTM 파라미터 | String | 광고 캠페인 정보 | `utm_source=google&utm_medium=cpc` |

---

## 🌐 2. 자동 수집 이벤트 전용 프리셋 속성

자동 수집 이벤트(`ta_pageview`, `ta_page_show`, `ta_page_hide` 등)에만 포함되는 속성들입니다.

| 속성명 | 이름 | 타입 | 설명 | 예시 |
|--------|------|------|------|------|
| `#url` | 페이지 주소 | String | 현재 페이지 전체 URL | `https://example.com/product?id=123` |
| `#url_path` | 페이지 경로 | String | URL의 경로 부분 | `/product` |
| `#referrer` | 이전 페이지 주소 | String | 이전 페이지 전체 URL | `https://google.com/search` |
| `#referrer_host` | 이전 페이지 호스트 | String | 이전 페이지 도메인 | `google.com` |
| `#title` | 페이지 제목 | String | HTML 문서 제목 | `상품 상세 페이지` |

---

## 🔍 3. 프리셋 속성 조회 및 활용

### 3.1 전체 프리셋 속성 조회

```javascript
// 프리셋 속성 객체 가져오기
var presetProperties = ta.getPresetProperties();

// 이벤트용 프리셋 속성 변환
var properties = presetProperties.toEventPresetProperties();

console.log(properties);
/*
{
  "#os": "Mac OS X",
  "#screen_width": 1920,
  "#screen_height": 1080,
  "#browser": "chrome",
  "#browser_version": "91.0.4472.114",
  "#device_id": "17a3858fafd9b4-0693d07132e2d1-34657600-2073600-17a3858fafea9b",
  "#zone_offset": 9
}
*/
```

### 3.2 개별 프리셋 속성 조회

```javascript
var presetProperties = ta.getPresetProperties();

// 개별 속성 접근
var os = presetProperties.os;                    // "Mac OS X"
var screenWidth = presetProperties.screenWidth;  // 1920
var screenHeight = presetProperties.screenHeight;// 1080
var browser = presetProperties.browser;          // "chrome"
var browserVersion = presetProperties.browserVersion; // "91.0.4472.114"
var deviceId = presetProperties.deviceId;        // "17a3858fafd9b4-..."
var zoneOffset = presetProperties.zoneOffset;    // 9
```

### 3.3 서버 사이드 트래킹에서 활용

```javascript
// 서버로 전송할 때 프리셋 속성 포함
function sendToServer(eventName, customProperties) {
    var presetProperties = ta.getPresetProperties();
    var eventProperties = presetProperties.toEventPresetProperties();
    
    // 커스텀 속성과 프리셋 속성 병합
    var finalProperties = Object.assign({}, eventProperties, customProperties);
    
    // 서버로 전송
    fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: eventName,
            properties: finalProperties
        })
    });
}

// 사용 예시
sendToServer('purchase', {
    product_id: 'P001',
    amount: 29.99
});
```

---

## 🚫 4. 프리셋 속성 수집 비활성화

### 4.1 기본 비활성화 설정

```javascript
var config = {
    appId: "APP_ID",
    serverUrl: "https://YOUR_SERVER_URL/sync_js",
    batch: true,
    autoTrack: {
        pageShow: true,
        pageHide: true,
    },
    disablePresetProperties: [
        '#os',              // 운영체제
        '#lib_version',     // SDK 버전
        '#lib',             // SDK 유형
        '#screen_height',   // 화면 높이
        '#screen_width',    // 화면 너비
        '#browser',         // 브라우저
        '#browser_version', // 브라우저 버전
        '#system_language', // 시스템 언어
        '#ua',              // 유저 에이전트
        '#utm',             // UTM 파라미터
        '#referrer',        // 이전 페이지 주소
        '#referrer_host',   // 이전 페이지 호스트
        '#url',             // 페이지 주소
        '#url_path',        // 페이지 경로
        '#title',           // 페이지 제목
        '#element_type'     // 요소 타입
    ]
};

ta.init(config);
```

### 4.2 카테고리별 비활성화 예시

#### 개인정보 보호 강화

```javascript
// 개인정보 관련 속성 비활성화
var privacyConfig = {
    appId: "APP_ID",
    serverUrl: "https://YOUR_SERVER_URL/sync_js",
    disablePresetProperties: [
        '#device_id',       // 디바이스 ID
        '#ua',              // 유저 에이전트
        '#system_language', // 시스템 언어
        '#carrier'          // 통신사
    ]
};
```

#### 성능 최적화 (불필요한 속성 제거)

```javascript
// 불필요한 기술적 속성 비활성화
var performanceConfig = {
    appId: "APP_ID",
    serverUrl: "https://YOUR_SERVER_URL/sync_js",
    disablePresetProperties: [
        '#lib',             // SDK 유형
        '#lib_version',     // SDK 버전
        '#browser_version', // 브라우저 버전
        '#ua'               // 유저 에이전트
    ]
};
```

#### 마케팅 추적 비활성화

```javascript
// 마케팅 관련 속성 비활성화
var marketingConfig = {
    appId: "APP_ID",
    serverUrl: "https://YOUR_SERVER_URL/sync_js",
    disablePresetProperties: [
        '#utm',         // UTM 파라미터
        '#referrer',    // 이전 페이지 주소
        '#referrer_host'// 이전 페이지 호스트
    ]
};
```

---

## ⚠️ 5. 중요 주의사항

### 5.1 서버 측 분석 속성

```javascript
// ❌ 클라이언트에서 접근 불가
var ip = presetProperties.ip;           // undefined
var country = presetProperties.country; // undefined
var city = presetProperties.city;       // undefined
```

**서버에서만 생성되는 속성들:**
- `#ip` - IP 주소
- `#country` - 국가
- `#country_code` - 국가 코드
- `#province` - 주/도
- `#city` - 도시

### 5.2 디바이스 ID 비활성화 시 주의사항

```javascript
// 디바이스 ID 비활성화 시
var config = {
    appId: "APP_ID",
    serverUrl: "https://YOUR_SERVER_URL/sync_js",
    disablePresetProperties: ['#device_id']
};

// 최초 이벤트 사용 시 반드시 first_check_id 설정 필요
ta.trackFirst({
    eventName: "first_visit",
    firstCheckId: "user_unique_id", // ⚠️ 필수 설정
    properties: { source: "organic" }
});
```

---

## 📊 6. 프리셋 속성 활용 시나리오

### 6.1 디바이스 분석

```javascript
var presetProps = ta.getPresetProperties();

// 모바일/데스크톱 구분
var isMobile = presetProps.screenWidth < 768;

// 이벤트에 디바이스 정보 추가
ta.track("page_view", {
    device_type: isMobile ? "mobile" : "desktop",
    screen_resolution: `${presetProps.screenWidth}x${presetProps.screenHeight}`,
    os_info: presetProps.os
});
```

### 6.2 지역별 컨텐츠 개인화

```javascript
// 시간대 기반 개인화
var presetProps = ta.getPresetProperties();
var userTimezone = presetProps.zoneOffset;

ta.track("content_view", {
    content_id: "article_001",
    user_timezone: userTimezone,
    local_time: new Date().toLocaleString()
});
```

### 6.3 브라우저 호환성 추적

```javascript
var presetProps = ta.getPresetProperties();

ta.track("feature_usage", {
    feature_name: "advanced_chart",
    browser: presetProps.browser,
    browser_version: presetProps.browserVersion,
    is_supported: checkBrowserSupport(presetProps.browser, presetProps.browserVersion)
});
```

---

## 🎯 7. 프리셋 속성 최적화 가이드

### 7.1 필수 속성만 유지

```javascript
// 최소한의 필수 속성만 수집
var minimalConfig = {
    appId: "APP_ID",
    serverUrl: "https://YOUR_SERVER_URL/sync_js",
    disablePresetProperties: [
        '#ua',              // 유저 에이전트 (용량 큰 속성)
        '#utm',             // UTM (마케팅 불필요시)
        '#referrer',        // 리퍼러 (분석 불필요시)
        '#referrer_host',   // 리퍼러 호스트
        '#element_type'     // 요소 타입 (클릭 추적 불필요시)
    ]
};
```

### 7.2 동적 속성 필터링

```javascript
// 런타임에 필요한 속성만 추출
function getFilteredPresetProperties(requiredProps) {
    var allProps = ta.getPresetProperties().toEventPresetProperties();
    var filtered = {};
    
    requiredProps.forEach(prop => {
        if (allProps[prop] !== undefined) {
            filtered[prop] = allProps[prop];
        }
    });
    
    return filtered;
}

// 사용 예시
var essentialProps = getFilteredPresetProperties([
    '#os', '#device_id', '#screen_width', '#screen_height'
]);

ta.track("app_launch", essentialProps);
```