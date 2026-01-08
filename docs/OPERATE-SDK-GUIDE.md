# 운영 SDK & 팝업 모듈 가이드

> 클라이언트 트리거 과제를 웹사이트에서 팝업으로 표시하는 시스템

---

## 1. 개요

### 운영 SDK (operate-sdk-init.js)
**역할:** TE 콘솔에서 설정한 "클라이언트 트리거 과제"를 받아오는 역할

### 팝업 모듈 (operate-popup.js)
**역할:** 운영 SDK가 받아온 과제를 예쁜 팝업 UI로 표시

```
┌──────────────┐
│  TE 콘솔     │  ← 마케터가 과제 설정
│  과제 생성   │     "신규 유저에게 쿠폰 팝업"
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  운영 SDK    │  ← 조건 확인 (신규 유저인가?)
│  조건 체크   │
└──────┬───────┘
       │ 조건 충족!
       ▼
┌──────────────┐
│  팝업 모듈   │  ← 자동으로 팝업 표시
│  UI 표시     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  이벤트 전송 │  ← ops_show, ops_click, ops_close
│  (자동)      │     자동으로 TE에 기록
└──────────────┘
```

---

## 2. 팝업 타입

| 타입 | 모양 | 용도 |
|------|------|------|
| `modal` | 화면 중앙 오버레이 | 중요 공지, 프로모션 |
| `banner` | 상단/하단 고정 배너 | 간단한 알림 |
| `toast` | 우측 하단 알림 | 가벼운 메시지 |
| `slide` | 측면 슬라이드인 | 상세 콘텐츠 |

---

## 3. 자동 이벤트

팝업 모듈이 **자동으로 전송하는 이벤트:**

| 이벤트 | 시점 | 설명 |
|--------|------|------|
| `ops_receive` | 과제 수신 시 | SDK가 과제를 받았을 때 |
| `ops_show` | 팝업 표시 시 | 사용자에게 팝업이 보일 때 |
| `ops_click` | 버튼 클릭 시 | CTA 버튼 클릭 |
| `ops_close` | 팝업 닫을 때 | X 버튼, 오버레이 클릭, ESC 키 등 |

---

## 4. 빈도 제한

동일한 과제가 반복해서 표시되지 않도록 자동 제한:

```javascript
// config.js 설정
popup: {
  maxDisplayCount: 1,              // 같은 과제 최대 1회 표시
  limitPeriod: 24 * 60 * 60 * 1000 // 24시간 기준
}
```

- localStorage에 표시 이력 저장
- 설정된 기간 내 최대 표시 횟수 제한

---

## 5. TE 콘솔에서 과제 설정하기

### Step 1: 운영 메뉴 접근
1. TE 콘솔 로그인
2. 좌측 메뉴에서 **"운영" → "과제 관리"** 클릭

### Step 2: 새 과제 생성
1. **"새 과제 만들기"** 버튼 클릭
2. 과제 유형: **"클라이언트 트리거"** 선택

### Step 3: 트리거 조건 설정
타겟 사용자 조건을 설정합니다:

| 조건 예시 | 설명 |
|----------|------|
| `total_sessions == 1` | 첫 방문자 |
| `engagement_level == "high"` | 참여도 높은 사용자 |
| `visitor_lifecycle_stage == "consideration"` | 고려 단계 사용자 |

### Step 4: 콘텐츠 설정 (JSON)
팝업에 표시될 내용을 JSON으로 설정:

```json
{
  "popupType": "modal",
  "image": "https://example.com/promo-banner.jpg",
  "title": "신규 가입 혜택",
  "body": "지금 가입하시면 20% 할인 쿠폰을 드립니다!",
  "primaryButton": "쿠폰 받기",
  "primaryButtonUrl": "https://example.com/signup",
  "secondaryButton": "나중에"
}
```

### Step 5: 콘텐츠 필드 설명

| 필드 | 필수 | 설명 |
|------|------|------|
| `popupType` | X | 팝업 타입: `modal`, `banner`, `toast`, `slide` (기본: modal) |
| `image` | X | 팝업 상단 이미지 URL |
| `title` | X | 팝업 제목 |
| `body` | X | 팝업 본문 |
| `primaryButton` | X | 메인 버튼 텍스트 |
| `primaryButtonUrl` | X | 메인 버튼 클릭 시 이동 URL |
| `secondaryButton` | X | 보조 버튼 텍스트 |
| `secondaryButtonUrl` | X | 보조 버튼 클릭 시 이동 URL |
| `position` | X | banner 타입일 때 위치: `top`, `bottom` |
| `style` | X | 디자인 커스터마이징 - 객체 그룹 1 (아래 참조) |
| `styleText` | X | 디자인 커스터마이징 - 객체 그룹 2 (아래 참조) |

### Step 6: 디자인 커스터마이징 (style + styleText 옵션)

TE 콘솔에서 팝업 디자인을 자유롭게 변경할 수 있습니다.
객체 그룹 10개 제한으로 인해 `style`과 `styleText` 두 그룹으로 분리됩니다:

```json
{
  "popupType": "modal",
  "title": "프로모션",
  "body": "할인 이벤트!",
  "style": {
    "maxWidth": "500px",
    "backgroundColor": "#ffffff",
    "primaryColor": "#4F46E5",
    "primaryHoverColor": "#4338CA",
    "secondaryColor": "#E5E7EB",
    "secondaryHoverColor": "#D1D5DB",
    "borderRadius": "16px",
    "titleColor": "#333333",
    "titleFontSize": "20px",
    "bodyColor": "#666666"
  },
  "styleText": {
    "bodyFontSize": "15px",
    "imageWidth": "100%",
    "imageHeight": "200px",
    "imageFit": "cover"
  }
}
```

**style 객체 그룹 (10개):**

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `maxWidth` | 팝업 최대 너비 | 480px |
| `backgroundColor` | 팝업 배경색 | #ffffff |
| `primaryColor` | 메인 버튼 색 | #4F46E5 |
| `primaryHoverColor` | 메인 버튼 호버 색 | #4338CA |
| `secondaryColor` | 보조 버튼 색 | #E5E7EB |
| `secondaryHoverColor` | 보조 버튼 호버 색 | #D1D5DB |
| `borderRadius` | 모서리 둥글기 | 12px |
| `titleColor` | 제목 색상 | #333333 |
| `titleFontSize` | 제목 글자 크기 | 18px |
| `bodyColor` | 본문 색상 | #666666 |

**styleText 객체 그룹 (4개):**

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `bodyFontSize` | 본문 글자 크기 | 14px |
| `imageWidth` | 이미지 너비 | 100% |
| `imageHeight` | 이미지 높이 | auto |
| `imageFit` | 이미지 맞춤 방식 | cover |

**배너 전용 스타일 옵션:**

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `bannerBackground` | 배너 배경 (단색 또는 그라데이션) | linear-gradient(135deg, #667eea 0%, #764ba2 100%) |
| `bannerTextColor` | 배너 텍스트 색상 | #ffffff |
| `bannerBtnTextColor` | 배너 버튼 텍스트 색상 | #667eea |

**imageFit 옵션:**
- `cover`: 비율 유지하며 영역 꽉 채움 (잘릴 수 있음)
- `contain`: 비율 유지하며 전체 보이게
- `fill`: 비율 무시하고 영역에 맞춤
- `none`: 원본 크기 그대로

### Step 7: 과제 활성화
1. **"저장"** 클릭
2. **"활성화"** 토글 ON

---

## 6. 팝업 타입별 예시

### Modal (기본)
```json
{
  "popupType": "modal",
  "image": "https://example.com/banner.jpg",
  "title": "특별 프로모션",
  "body": "지금 구매하시면 30% 할인!",
  "primaryButton": "지금 구매",
  "primaryButtonUrl": "https://example.com/shop",
  "style": {
    "maxWidth": "500px",
    "primaryColor": "#FF6B35",
    "borderRadius": "20px",
    "imageHeight": "180px"
  }
}
```

### Banner (상단 고정)
```json
{
  "popupType": "banner",
  "position": "top",
  "title": "무료 배송 이벤트",
  "body": "5만원 이상 구매 시 무료 배송",
  "primaryButton": "자세히 보기",
  "primaryButtonUrl": "https://example.com/event",
  "style": {
    "bannerBackground": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "bannerTextColor": "#ffffff",
    "bannerBtnTextColor": "#f5576c"
  }
}
```

### Toast (우측 하단)
```json
{
  "popupType": "toast",
  "title": "새 메시지",
  "body": "고객센터에서 답변이 도착했습니다.",
  "primaryButton": "확인하기",
  "style": {
    "primaryColor": "#10B981",
    "titleFontSize": "16px"
  }
}
```

### Slide (측면)
```json
{
  "popupType": "slide",
  "image": "https://example.com/product.jpg",
  "title": "추천 상품",
  "body": "고객님이 관심 가질만한 상품을 준비했습니다.",
  "primaryButton": "상품 보기",
  "primaryButtonUrl": "https://example.com/product"
}
```

---

## 7. 클라이언트 파라미터 활용

웹사이트에서 추가 조건을 설정할 수 있습니다:

```javascript
// 클라이언트 파라미터 설정
window.TEOperate.setClientParams({
  user_level: 'vip',
  cart_value: 50000,
  has_coupon: false
});
```

TE 콘솔에서 이 파라미터를 조건으로 사용:
- `user_level == "vip"` → VIP만 타겟
- `cart_value >= 30000` → 장바구니 3만원 이상

---

## 8. 커스텀 이벤트 리스닝

팝업 동작에 따른 커스텀 로직 추가:

```javascript
// 팝업 표시 시
window.addEventListener('te:popup:show', (e) => {
  console.log('팝업 표시됨:', e.detail.taskId);
});

// 버튼 클릭 시
window.addEventListener('te:popup:click', (e) => {
  console.log('버튼 클릭:', e.detail.action, e.detail.buttonText);
});

// 팝업 닫힐 때
window.addEventListener('te:popup:close', (e) => {
  console.log('팝업 닫힘:', e.detail.closeMethod);
});
```

---

## 9. 수동 팝업 표시

운영 SDK 없이 직접 팝업 표시:

```javascript
window.TEPopup.show({
  taskId: 'manual-popup-001',
  content: {
    popupType: 'modal',
    title: '직접 호출 팝업',
    body: '코드에서 직접 팝업을 표시합니다.',
    primaryButton: '확인'
  }
});
```

---

## 10. 문제 해결

### 팝업이 안 뜨는 경우

1. **SDK 로드 확인**
   ```javascript
   console.log(window.TDApp);      // undefined면 SDK 미로드
   console.log(window.TEOperate);  // undefined면 운영 SDK 미로드
   console.log(window.TEPopup);    // undefined면 팝업 모듈 미로드
   ```

2. **config 확인**
   ```javascript
   console.log(window.trackingConfig.operate);
   // enabled: true, popup.enabled: true 확인
   ```

3. **빈도 제한 확인**
   - localStorage에서 `te_operate_popup_history` 삭제 후 재시도

4. **콘솔 디버그 모드**
   ```javascript
   // config.js에서 설정
   debug: {
     showConsoleLogs: true
   }
   ```

### 이벤트가 안 보내지는 경우

1. TDAnalytics 객체 확인
2. TE 콘솔에서 실시간 이벤트 확인
3. 네트워크 탭에서 요청 확인

---

## 11. 요약

| 구성요소 | 역할 |
|----------|------|
| **운영 SDK** | TE 콘솔 과제를 받아오는 배달부 |
| **팝업 모듈** | 받아온 과제를 예쁘게 보여주는 디자이너 |
| **TE 콘솔** | 마케터가 과제를 설정하는 컨트롤 타워 |
