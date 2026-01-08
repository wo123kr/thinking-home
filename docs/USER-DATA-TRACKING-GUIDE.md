# ThinkingData 유저 데이터 추적 시스템 가이드

> 이 문서는 ThinkingData 홈페이지 추적 시스템에서 유저 데이터가 어떻게 계산되고 집계되는지 설명합니다.

---

## 목차

1. [시스템 아키텍처](#1-시스템-아키텍처)
2. [유저 속성 (User Attributes)](#2-유저-속성-user-attributes)
3. [세션 관리](#3-세션-관리)
4. [이벤트 추적](#4-이벤트-추적)
5. [데이터 흐름](#5-데이터-흐름)
6. [계산 로직 상세](#6-계산-로직-상세)

---

## 1. 시스템 아키텍처

### 1.1 파일 구조

```
thinking-home/
├── main.js                    # 진입점 - 모든 모듈 초기화
├── config.js                  # 중앙 설정 관리
├── user-attributes.js         # 유저 속성 추적 시스템
├── core/
│   ├── thinking-data-init.js  # ThinkingData SDK 초기화
│   ├── session-manager.js     # 세션 관리
│   └── utils.js               # 공통 유틸리티
└── tracking/
    ├── pageview.js            # 페이지뷰 추적
    ├── click.js               # 클릭 추적
    ├── scroll.js              # 스크롤 깊이 추적
    ├── form.js                # 폼 제출 추적
    ├── exit.js                # 페이지 종료 추적
    └── ...
```

### 1.2 초기화 순서

```
1. registerGlobalUtils()      → 공통 유틸리티 전역 등록
2. initSDK()                  → ThinkingData SDK 초기화
3. initSession()              → 세션 관리자 초기화
4. 각 추적 모듈 초기화        → click, scroll, form, exit 등
5. initUserAttributes()       → 유저 속성 추적 시작
6. trackPageView()            → 초기 페이지뷰 이벤트 전송
```

---

## 2. 유저 속성 (User Attributes)

### 2.1 방문 기본 정보

| 속성명 | 타입 | 계산 방식 | SDK 메서드 |
|--------|------|-----------|------------|
| `first_visit_timestamp` | timestamp | 최초 방문 시 1회만 기록 | `userSetOnce` |
| `total_sessions` | number | 세션 시작마다 +1 | `userAdd` |
| `session_count_today` | number | 당일 세션 수 (날짜 변경 시 리셋) | `userSet/userAdd` |
| `is_returning_visitor` | boolean | `total_sessions >= 2`일 때 `true` | `userSet` |
| `last_visit_date` | string | 마지막 방문 날짜 (YYYY-MM-DD) | `userSet` |

**계산 로직** (`user-attributes.js:202-231`):
```javascript
// 세션 수 증가
this.sendImmediate('userAdd', { total_sessions: 1 });

// 재방문자 체크 (2번째 세션부터)
if (this.attributes.total_sessions >= 2) {
    this.sendImmediate('userSet', { is_returning_visitor: true });
}
```

---

### 2.2 유입 채널 정보 (First Touch Attribution)

| 속성명 | 타입 | 계산 방식 | 저장 시점 |
|--------|------|-----------|-----------|
| `first_channel` | string | UTM/gclid/referrer 기반 채널 결정 | 최초 방문 1회 |
| `first_source` | string | utm_source 또는 referrer hostname | 최초 방문 1회 |
| `first_medium` | string | utm_medium | 최초 방문 1회 |
| `first_campaign` | string | utm_campaign | 최초 방문 1회 |
| `first_term` | string | utm_term (유료 키워드) | 최초 방문 1회 |
| `first_content` | string | utm_content | 최초 방문 1회 |
| `first_gclid` | string | Google Click ID | 최초 방문 1회 |
| `first_referrer` | string | document.referrer | 최초 방문 1회 |
| `first_landing_page_url` | string | 최초 랜딩 페이지 URL | 최초 방문 1회 |
| `first_organic_keyword` | string | 자연 검색어 (q 파라미터) | 최초 방문 1회 |
| `traffic_sources_used` | array | 사용된 모든 유입 소스 (중복 제거) | `userUniqAppend` |

**채널 결정 로직** (`user-attributes.js:361-406`):

```javascript
function determineChannel(utmSource, utmMedium, gclid, referrer) {
    // 1. Paid Search: gclid 있거나 medium이 cpc/ppc
    if (gclid) return 'Paid Search';
    if (utmMedium && ['cpc', 'ppc', 'paidsearch'].includes(utmMedium.toLowerCase())) {
        return 'Paid Search';
    }

    // 2. Paid Social: medium이 cpm/cpa
    if (utmMedium && ['cpm', 'cpa', 'paid-social'].includes(utmMedium.toLowerCase())) {
        return 'Paid Social';
    }

    // 3. Organic Search: referrer가 검색엔진
    if (referrer) {
        const searchEngines = ['google', 'naver', 'daum', 'bing', 'yahoo'];
        if (searchEngines.some(engine => referrer.includes(engine))) {
            return 'Organic Search';
        }
    }

    // 4. Social: medium이 social이거나 referrer가 SNS
    // 5. Referral: referrer만 있고 UTM 없음
    // 6. Direct: 아무것도 없음
    // 7. Other: 기타
}
```

---

### 2.3 참여도 지표

| 속성명 | 타입 | 계산 방식 | 트리거 |
|--------|------|-----------|--------|
| `total_form_submissions` | number | 폼 제출 시 +1 | `trackFormSubmission()` |
| `total_downloads` | number | 리소스 다운로드 시 +1 | `trackDownload()` |
| `total_scroll_depth_100` | number | 100% 스크롤 도달 시 +1 | `trackFullScroll()` |
| `popup_interactions` | number | 팝업 상호작용 시 +1 | `trackPopupInteraction()` |
| `external_link_clicks` | number | 외부 링크 클릭 시 +1 | `trackExternalLinkClick()` |

---

### 2.4 참여도 레벨 계산

| 속성명 | 타입 | 계산 방식 |
|--------|------|-----------|
| `engagement_score` | number | 행동별 가중치 점수 합산 |
| `engagement_level` | string | 점수 기반 레벨 분류 |

**점수 계산 공식** (`user-attributes.js:733-741`):

```javascript
let score = 0;

// 행동별 가중치
score += (total_form_submissions || 0) * 50;    // 폼 제출: 50점
score += (total_downloads || 0) * 30;           // 다운로드: 30점
score += (total_scroll_depth_100 || 0) * 15;    // 100% 스크롤: 15점
score += (popup_interactions || 0) * 10;        // 팝업 상호작용: 10점
score += (external_link_clicks || 0) * 5;       // 외부 링크 클릭: 5점

// 세션/체류시간 보정
score += Math.min((total_sessions || 0) * 10, 100);        // 세션당 10점, 최대 100점
score += Math.min((total_time_spent || 0) / 60, 200);      // 분당 1점, 최대 200점
```

**레벨 분류** (`user-attributes.js:744-746`):

| 점수 범위 | 레벨 |
|-----------|------|
| 0 ~ 49 | `low` |
| 50 ~ 199 | `medium` |
| 200+ | `high` |

---

### 2.5 방문자 생명주기 단계

| 속성명 | 타입 | 계산 방식 |
|--------|------|-----------|
| `visitor_lifecycle_stage` | string | 행동 기반 퍼널 단계 |

**단계 결정 로직** (`user-attributes.js:810-834`):

| 단계 | 조건 |
|------|------|
| `decision` | 폼 제출 > 0 **또는** 회사 소개 2회+ 방문 **또는** 고객사례 2회+ 방문 |
| `consideration` | 세션 3회+ **또는** 다운로드 > 0 **또는** 회사/고객사례 1회+ 방문 |
| `awareness` | 위 조건에 해당하지 않음 (기본값) |

---

### 2.6 상호작용 빈도

| 속성명 | 타입 | 계산 방식 |
|--------|------|-----------|
| `interaction_frequency` | string | 세션당 평균 상호작용 비율 |

**계산 공식** (`user-attributes.js:847-858`):

```javascript
const totalInteractions =
    (total_form_submissions || 0) +
    (total_downloads || 0) +
    (popup_interactions || 0) +
    (external_link_clicks || 0);

const interactionRate = totalInteractions / total_sessions;
```

| 비율 | 빈도 레벨 |
|------|-----------|
| 0 ~ 0.99 | `low` |
| 1 ~ 2.99 | `medium` |
| 3+ | `high` |

---

### 2.7 시간 관련 속성

| 속성명 | 타입 | 계산 방식 |
|--------|------|-----------|
| `preferred_visit_time` | string | 방문 시간대 (morning/afternoon/evening/night) |
| `last_visit_day_of_week` | string | 마지막 방문 요일 (monday, tuesday...) |
| `total_time_spent` | number | 누적 체류 시간 (초) |
| `longest_session_duration` | number | 최장 세션 시간 (초) |
| `average_session_duration` | number | 평균 세션 시간 (초) |

**시간대 분류** (`user-attributes.js:677-682`):

| 시간 범위 | 시간대 |
|-----------|--------|
| 06:00 ~ 11:59 | `morning` |
| 12:00 ~ 17:59 | `afternoon` |
| 18:00 ~ 21:59 | `evening` |
| 22:00 ~ 05:59 | `night` |

---

### 2.8 페이지 관심사

| 속성명 | 타입 | 계산 방식 |
|--------|------|-----------|
| `interested_topics` | array | 방문한 페이지 카테고리 목록 (중복 제거) |
| `viewed_pages` | array | 최근 방문 페이지 (최대 20개, LIFO) |
| `most_visited_section` | string | 가장 많이 방문한 섹션 |
| `section_visits` | object | 섹션별 방문 횟수 |

**페이지 섹션 매핑** (`user-attributes.js:57-68`):

```javascript
sectionMapping = {
    '/': 'home',
    '/blog': 'blog',
    '/user-case': 'user_case',
    '/company': 'company',
    '/culture': 'culture',
    '/news': 'news',
    '/solution': 'solution',
    '/feature': 'feature',
    '/form-demo': 'demo_form',
    '/form-ask': 'contact_form'
};
```

---

### 2.9 콘텐츠 선호도

| 속성명 | 타입 | 계산 방식 |
|--------|------|-----------|
| `content_depth_preference` | string | 콘텐츠 소비 깊이 선호도 |
| `content_engagement` | object | 깊이별 참여 횟수 |

**깊이 측정 기준** (`user-attributes.js:884-911`):

| 조건 | 깊이 레벨 |
|------|-----------|
| 페이지 10초 이상 체류 | `medium` |
| 페이지 30초 이상 체류 | `surface` |
| 100% 스크롤 도달 | `deep` |

---

## 3. 세션 관리

### 3.1 세션 생성 조건

새 세션이 생성되는 경우 (`session-manager.js`):

1. **최초 방문**: 저장된 세션 정보 없음
2. **세션 타임아웃**: 마지막 활동 후 30분 경과
3. **UTM 변경**: 새로운 마케팅 캠페인으로 유입
4. **사용자 ID 변경**: 로그인/로그아웃

### 3.2 세션 속성

| 속성명 | 타입 | 설명 | 저장 위치 |
|--------|------|------|-----------|
| `session_id` | number | Epoch 타임스탬프 기반 고유 ID | localStorage |
| `session_number` | number | 누적 세션 번호 (1부터 시작) | localStorage |
| `session_start_time` | timestamp | 세션 시작 시간 | localStorage |
| `last_activity_time` | timestamp | 마지막 활동 시간 | localStorage |
| `is_engaged_session` | boolean | 참여 세션 여부 | localStorage |

### 3.3 참여 세션 (Engaged Session) 조건

`session-manager.js:319-337`:

```javascript
// 참여 세션 조건 (GA4 방식)
const timeSpent = Date.now() - sessionStartTime;
if (timeSpent >= 10000 ||           // 10초 이상 체류
    interactionCount >= 2) {         // 2회 이상 상호작용
    isEngagedSession = true;
}
```

### 3.4 세션 통계

| 속성명 | 타입 | 계산 방식 | localStorage 키 |
|--------|------|-----------|-----------------|
| `te_total_sessions` | number | 세션 종료 시 +1 | te_total_sessions |
| `te_total_session_time` | number | 세션 시간 누적 | te_total_session_time |
| `te_average_session_time` | number | 총시간 / 총세션 | te_average_session_time |
| `te_longest_session_time` | number | 최대값 갱신 | te_longest_session_time |
| `te_engaged_sessions` | number | 참여 세션 종료 시 +1 | te_engaged_sessions |

---

## 4. 이벤트 추적

### 4.1 이벤트 목록

| 이벤트명 | 설명 | 모듈 | 트리거 |
|----------|------|------|--------|
| `te_pageview` | 페이지 조회 | pageview.js | 페이지 로드 |
| `te_element_click` | 요소 클릭 | click.js | 클릭 이벤트 |
| `te_scroll_depth` | 스크롤 깊이 | scroll.js | 임계값 도달 (0,25,50,75,90,100%) |
| `te_form_submit` | 폼 제출 | form.js | 폼 submit |
| `te_form_submit_error` | 폼 오류 | form.js | 유효성 검사 실패 |
| `te_form_field_interaction` | 필드 상호작용 | form.js | input/focus/blur |
| `te_page_exit` | 페이지 이탈 | exit.js | beforeunload |
| `te_browser_exit` | 브라우저 종료 | exit.js | unload |
| `te_page_visibility_exit` | 탭 전환 | exit.js | visibilitychange |
| `te_session_start` | 세션 시작 | session-manager.js | 새 세션 생성 |
| `te_session_end` | 세션 종료 | session-manager.js | 페이지 이탈/타임아웃 |
| `te_session_engaged` | 참여 세션 | session-manager.js | 참여 조건 달성 |

### 4.2 공통 속성 (Super Properties)

모든 이벤트에 자동 포함되는 속성 (`session-manager.js:596-611`):

```javascript
const superProperties = {
    // 세션
    session_id,
    session_number,

    // 페이지
    page_host,
    page_protocol,
    page_hash,
    page_query,

    // 뷰포트
    viewport_width,
    viewport_height,
    viewport_ratio,
    device_pixel_ratio,
    orientation,

    // 브라우저 기능
    local_storage_enabled,
    cookies_enabled,
    webgl_enabled,
    is_touch_device,

    // 네트워크
    connection_type,
    connection_downlink,
    connection_rtt,
    is_online,

    // 마케팅 (있는 경우)
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    gclid,
    fbclid,

    // 타이밍
    timestamp,
    local_time
};
```

### 4.3 봇 감지 속성

이벤트에 추가되는 봇 정보 (`utils.js:870-884`):

| 속성명 | 타입 | 설명 |
|--------|------|------|
| `is_bot` | boolean | 봇 여부 |
| `bot_type` | string | 봇 유형 (search_engine, social_media, automation 등) |
| `bot_name` | string | 봇 이름 (Googlebot, Selenium 등) |
| `bot_confidence` | number | 봇 판정 신뢰도 (0-100) |
| `bot_detection_methods` | array | 감지 방법 목록 |
| `is_ai_chatbot` | boolean | AI 챗봇 여부 |
| `ai_chatbot_name` | string | AI 챗봇 이름 |

---

## 5. 데이터 흐름

### 5.1 유저 속성 업데이트 흐름

```
┌─────────────────┐
│   사용자 행동    │
│  (클릭, 스크롤)  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  이벤트 핸들러   │
│ (click.js 등)   │
└────────┬────────┘
         ▼
┌─────────────────┐
│ updateSessionActivity() │
│ (세션 활동 업데이트)     │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 유저 속성 추적   │
│ (trackFormSubmission 등) │
└────────┬────────┘
         ▼
┌─────────────────┐
│ 배치 처리 큐     │
│ (queueUpdate)   │
└────────┬────────┘
         ▼ (2초 후)
┌─────────────────┐
│ flushUpdates()  │
│ (SDK로 전송)    │
└─────────────────┘
```

### 5.2 배치 처리 시스템

중복 전송 방지를 위한 배치 처리 (`user-attributes.js:119-166`):

```javascript
// 업데이트를 큐에 추가
queueUpdate(method, data) {
    this.pendingUpdates[method].push(data);

    // 2초 후 자동 전송
    this.batchTimer = setTimeout(() => {
        this.flushUpdates();
    }, 2000);
}

// 배치 전송
flushUpdates() {
    // userSet: 마지막 값만 전송 (덮어쓰기)
    // userAdd, userUniqAppend: 개별 전송
}
```

### 5.3 중복 방지 메커니즘

| 메커니즘 | 위치 | 설명 |
|----------|------|------|
| 세션별 초기화 플래그 | `localStorage + window` | 동일 세션 내 중복 초기화 방지 |
| 시간 기반 쓰로틀링 | `lastUpdates Map` | 동일 속성 10-15초 내 중복 업데이트 방지 |
| 배치 처리 | `pendingUpdates` | 2초 단위 묶어서 전송 |
| Set 자료구조 | `scrollDepthTracked` | 동일 임계값 중복 전송 방지 |

---

## 6. 계산 로직 상세

### 6.1 시간 형식 변환

ThinkingData 호환 시간 형식 (`utils.js:887-938`):

```javascript
// 입력: Date 객체, ISO 문자열, 타임스탬프 (밀리초/초)
// 출력: "yyyy-MM-dd HH:mm:ss.SSS"

convertToTETimeFormat(dateInput) {
    // 입력 타입 자동 감지 및 변환
    // 10자리면 초, 13자리면 밀리초로 판단
}
```

### 6.2 개인정보 마스킹

| 함수 | 입력 예시 | 출력 예시 |
|------|-----------|-----------|
| `maskEmail()` | user@example.com | u***@e***.com |
| `maskPhone()` | 010-1234-5678 | 010-****-5678 |
| `maskName()` | 홍길동 | 홍***동 |

### 6.3 페이지 카테고리 분류

`user-attributes.js:524-550`:

| URL 패턴 | 카테고리 |
|----------|----------|
| `/blog/*feature*` | feature |
| `/blog/*industry*` | industry |
| `/blog/*playbook*` | playbook |
| `/blog/*` | analytics (기본) |
| `/solution/game` | game_solution |
| `/solution/ecommerce` | ecommerce_solution |
| `/solution/media` | media_solution |
| `/user-case` | user_case |
| `/company` | company |
| `/` | landing |

---

## 부록: localStorage 키 목록

| 키 | 용도 | 모듈 |
|----|------|------|
| `te_user_attributes` | 유저 속성 캐시 | user-attributes.js |
| `te_session_id` | 현재 세션 ID | session-manager.js |
| `te_session_number` | 누적 세션 번호 | session-manager.js |
| `te_session_start_time` | 세션 시작 시간 | session-manager.js |
| `te_last_activity_time` | 마지막 활동 시간 | session-manager.js |
| `te_is_engaged_session` | 참여 세션 여부 | session-manager.js |
| `te_session_date` | 세션 날짜 | session-manager.js |
| `te_previous_utm` | 이전 UTM 정보 | session-manager.js |
| `te_previous_user` | 이전 사용자 ID | session-manager.js |
| `te_total_sessions` | 총 세션 수 | session-manager.js |
| `te_total_session_time` | 총 체류 시간 | session-manager.js |
| `te_average_session_time` | 평균 세션 시간 | session-manager.js |
| `te_longest_session_time` | 최장 세션 시간 | session-manager.js |
| `te_engaged_sessions` | 참여 세션 수 | session-manager.js |
| `te_pending_events` | 대기 중인 이벤트 | utils.js |
| `te_user_initialized` | 유저 초기화 여부 | user-attributes.js |
| `te_init_*` | 세션별 초기화 플래그 | user-attributes.js |

---

*최종 업데이트: 2026-01-06*
