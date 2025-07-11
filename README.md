# ThinkingData 웹사이트 트래킹 시스템

## 개요
이 프로젝트는 [ThinkingData](https://www.thinkingdata.kr) 기반의 웹사이트 행동/속성 트래킹 시스템입니다. 모든 트래킹 로직은 **ES 모듈 패턴**으로 일관성 있게 구성되어 있으며, 유지보수성과 확장성이 뛰어납니다.

---

## 주요 트래킹 항목 및 수집 시점

| 트래킹 항목      | 언제/어떻게 수집되는가?                                                                 |
|------------------|--------------------------------------------------------------------------------------|
| **클릭**         | 버튼, 링크, 메뉴 등 주요 클릭 발생 시 (자동/커스텀 선택 가능)                          |
| **폼**           | 폼 제출 시(개인정보 마스킹, 동의 체크 등 포함), 유효성 오류 발생 시                    |
| **팝업**         | 팝업이 열릴 때, 닫힐 때(버튼, ESC 등), "혜택 확인하기" 등 주요 액션 발생 시           |
| **리소스 다운로드** | PDF, 문서, 이미지, 동영상 등 주요 파일 다운로드 클릭 시                              |
| **스크롤**       | 25%, 50%, 75%, 90%, 100% 등 임계값 도달 시                                             |
| **비디오**       | YouTube/HTML5 비디오 재생, 일시정지, 종료, 진행률(25/50/75/90%) 등 이벤트 발생 시      |
| **페이지뷰**     | 페이지 진입 시(명시적 호출), SPA 라우트 변경 시                                        |
| **세션**         | 페이지 진입, 30분 이상 비활동, UTM/사용자ID 변경 등 세션 분리 조건 발생 시             |
| **유저 속성**    | 최초 방문, 세션/페이지/행동 누적, 관심사/선호도/생명주기 등 속성 변화 시              |

---

## 구조 및 사용법

- **main.js**: 모든 트래킹 모듈을 import/초기화하는 진입점
- **config.js**: 중앙화된 설정 관리(모듈별 on/off, 세부 옵션 등)
- **core/**: SDK 초기화, 세션/유틸리티 함수 등 핵심 로직
- **tracking/**: 각 트래킹별 모듈(click, form, popup, resource, scroll, exit, pageview)
- **user-attributes.js**: 유저 속성 추적 시스템(관심사, 세션, 행동 누적 등)

### 사용 예시
```js
import { initFormTracking } from './tracking/form.js';
initFormTracking();
```
> main.js에서 각 모듈별로 1회만 호출하면 자동으로 트래킹이 동작합니다.

---

## 주요 특징
- **ES 모듈 패턴**: 전역 오염 없이 유지보수/확장 용이
- **중앙 설정(config.js)**: 모듈별 on/off, 세부 옵션, 디버그 등 일괄 관리
- **SPA 대응**: 라우트 변경 시에도 트래킹 정상 동작
- **개인정보 보호**: 폼 제출 시 개인정보 마스킹, 동의 체크 등 내장
- **유저 속성 자동화**: 방문/세션/행동 기반 관심사, 선호도, 생명주기 등 자동 추적
- **ThinkingData SDK**: 공식 JS SDK 기반, 서버와 실시간 연동

---

## 커스텀/확장
- 새로운 트래킹 항목 추가, 속성 확장, 이벤트 네이밍 등은 각 모듈에서 손쉽게 커스터마이즈 가능
- config.js에서 모듈별 옵션/임계값/플랫폼 등 자유롭게 조정

---

## 문의
- 담당: 진우(jinwoo@thinkingdata.kr)
- 공식사이트: https://www.thinkingdata.kr 

# Webpage Thinking - Google Search Console API 통합

이 프로젝트는 Google Search Console API를 통합하여 웹사이트의 검색 성과를 분석하고 모니터링하는 도구입니다.

## 🚀 주요 기능

- **검색 분석 데이터 조회**: 검색어, 페이지별 성과 분석
- **URL 검사 도구**: 개별 URL의 인덱싱 상태 확인
- **사이트맵 관리**: 사이트맵 제출 및 목록 조회
- **지역별/디바이스별 성과**: 국가 및 디바이스별 검색 성과 분석
- **자동화된 데이터 수집**: 정기적인 데이터 수집 및 캐싱

## 📋 설치 및 설정

### 1. 의존성 설치

```bash
npm install googleapis
```

### 2. Google Cloud Console 설정

1. **프로젝트 생성**: [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트 생성
2. **API 활성화**: Search Console API 활성화
3. **서비스 계정 생성**: IAM 및 관리 → 서비스 계정에서 새 서비스 계정 생성
4. **키 파일 다운로드**: JSON 키 파일을 다운로드하여 `credentials/` 폴더에 저장

### 3. Search Console 설정

1. **속성 추가**: [Search Console](https://search.google.com/search-console)에서 웹사이트 속성 추가
2. **권한 부여**: 속성 설정 → 소유자 및 사용자에서 서비스 계정 이메일 추가 (소유자 권한)

### 4. 설정 파일 수정

`config/search-console-config.js` 파일에서 다음 설정을 수정하세요:

```javascript
sites: {
    default: 'https://your-website.com', // 실제 웹사이트 URL로 변경
    properties: [
        'https://your-website.com',
        'https://www.your-website.com'
    ]
}
```

## 🔧 사용 방법

### 기본 사용법

```javascript
const GoogleSearchConsoleAPI = require('./google-search-console');

// API 인스턴스 생성
const searchConsole = new GoogleSearchConsoleAPI(
    './credentials/service-account-key.json',
    'https://your-website.com'
);

// 사이트 소유권 확인
const ownership = await searchConsole.verifySiteOwnership();

// 검색 분석 데이터 조회
const data = await searchConsole.getSearchAnalytics(
    '2024-01-01',
    '2024-01-31',
    ['query', 'page'],
    1000
);
```

### 상위 검색어 조회

```javascript
const topQueries = await searchConsole.getTopQueries(
    '2024-01-01',
    '2024-01-31',
    10
);

console.log('상위 검색어:');
topQueries.forEach((query, index) => {
    console.log(`${index + 1}. "${query.keys[0]}" - 클릭: ${query.clicks}`);
});
```

### URL 검사

```javascript
const inspectionResult = await searchConsole.inspectUrl(
    'https://your-website.com/specific-page'
);

console.log('인덱싱 상태:', inspectionResult.inspectionResult.indexStatusResult?.verdict);
```

### 사이트맵 제출

```javascript
await searchConsole.submitSitemap('https://your-website.com/sitemap.xml');
```

## 📊 데이터 구조

### 검색 분석 데이터

```javascript
{
    rows: [
        {
            keys: ['검색어', '페이지URL'],
            clicks: 100,
            impressions: 1000,
            ctr: 0.1,
            position: 5.2
        }
    ],
    responseAggregationType: 'byProperty'
}
```

### URL 검사 결과

```javascript
{
    inspectionResult: {
        inspectionResultLink: 'https://search.google.com/search-console/inspect?...',
        indexStatusResult: {
            verdict: 'PASS',
            coverageState: 'Submitted and indexed'
        },
        mobileUsabilityResult: {
            verdict: 'PASS'
        }
    }
}
```

## 🛠️ 고급 기능

### 캐싱 시스템

데이터 조회 성능 향상을 위해 캐싱 시스템을 제공합니다:

```javascript
// 캐시 설정
const config = require('./config/search-console-config');
console.log('캐시 TTL:', config.caching.ttl); // 60분
```

### 에러 처리

자동 재시도 및 에러 처리가 포함되어 있습니다:

```javascript
// 재시도 설정
const config = require('./config/search-console-config');
console.log('최대 재시도:', config.errorHandling.maxRetries); // 3회
```

### 데이터 내보내기

CSV 및 JSON 형태로 데이터를 내보낼 수 있습니다:

```javascript
// 내보내기 설정
const config = require('./config/search-console-config');
console.log('내보내기 디렉토리:', config.export.directory);
```

## 📁 프로젝트 구조

```
webpage-thinking/
├── google-search-console.js          # 메인 API 클래스
├── search-console-example.js         # 사용 예시
├── config/
│   └── search-console-config.js      # 설정 파일
├── credentials/
│   └── service-account-key.json      # 서비스 계정 키 (별도 생성 필요)
├── cache/
│   └── search-console/               # 캐시 파일들
├── logs/
│   └── search-console.log            # 로그 파일
└── exports/
    └── search-console/               # 내보내기 파일들
```

## ⚠️ 주의사항

1. **API 할당량**: Google Search Console API는 일일 할당량이 있습니다
2. **데이터 지연**: 검색 데이터는 최대 3일 지연될 수 있습니다
3. **권한 관리**: 서비스 계정 키 파일을 안전하게 보관하세요
4. **사이트 소유권**: API 사용 전 반드시 사이트 소유권을 확인하세요

## 🔗 관련 링크

- [Google Search Console API 문서](https://developers.google.com/webmaster-tools/search-console-api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Search Console](https://search.google.com/search-console)

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 