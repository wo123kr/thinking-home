# TE 운영 팝업 - 빠른 시작 가이드

> 이 가이드를 처음부터 끝까지 따라하면 TE 콘솔에서 설정한 조건에 따라 웹사이트에 팝업이 자동으로 표시됩니다.

---

## 전체 흐름 요약

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TE 콘솔 설정 (1회)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  STEP 1          STEP 2              STEP 3              STEP 4             │
│  클라이언트      클라이언트 채널     작업 생성           채널 활성화                    │
│  파라미터 등록   생성                (트리거 조건)       & 작업 제출                 │
│                                                                             │
│  스타일 옵션     채널명 + 템플릿     누가, 언제 팝업을   ON으로 활성화                  │
│  정의            정의                볼지 설정                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          웹사이트 설정 (1회)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  STEP 5          STEP 6              STEP 7                                 │
│  SDK 스크립트    SDK 초기화          팝업 모듈 로드                          │
│  로드            코드 추가           (operate-popup.js)                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              자동 동작                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  사용자 방문 → SDK가 조건 체크 → 조건 충족 시 팝업 자동 표시                 │
│                              → 클릭/닫기 이벤트 자동 전송                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: TE 콘솔 설정

### STEP 1: 클라이언트 파라미터 등록 (선택사항)

> **클라이언트 파라미터란?**
> 팝업 디자인을 TE 콘솔에서 조절할 수 있게 해주는 변수들입니다.
> 이걸 등록해두면 개발자 없이도 마케터가 색상, 크기 등을 변경할 수 있습니다.

**경로:** `운영 설정 > 클라이언트 파라미터 > + 추가`

| 파라미터 이름      | 별칭           | 파라미터 타입 | 옵션 값                     | 설명                             |
| ------------------ | -------------- | ------------- | --------------------------- | -------------------------------- |
| `popupType`        | 팝업 타입      | 문자열        | modal, banner, toast, slide | 팝업 형태                        |
| `image`            | 이미지 URL     | 문자열        | -                           | 팝업 상단 이미지                 |
| `title`            | 제목           | 문자열        | -                           | 팝업 제목                        |
| `body`             | 본문           | 문자열        | -                           | 팝업 내용                        |
| `primaryButton`    | 메인 버튼      | 문자열        | -                           | 버튼 텍스트                      |
| `primaryButtonUrl` | 버튼 링크      | 문자열        | -                           | 클릭 시 이동 URL                 |
| `secondaryButton`  | 보조 버튼      | 문자열        | -                           | 보조 버튼 텍스트                 |
| `backgroundColor`  | 배경색         | 문자열        | -                           | 팝업 배경색 (기본: #ffffff)      |
| `primaryColor`     | 버튼색         | 문자열        | -                           | 메인 버튼 색상 (기본: #4F46E5)   |
| `borderRadius`     | 모서리 둥글기  | 문자열        | -                           | 팝업 모서리 (기본: 12px)         |
| `titleColor`       | 제목 색상      | 문자열        | -                           | 제목 텍스트 색상 (기본: #333333) |
| `titleFontSize`    | 제목 글자 크기 | 문자열        | -                           | 제목 폰트 크기 (기본: 18px)      |
| `bodyColor`        | 본문 색상      | 문자열        | -                           | 본문 텍스트 색상 (기본: #666666) |
| `bodyFontSize`     | 본문 글자 크기 | 문자열        | -                           | 본문 폰트 크기 (기본: 14px)      |
| `imageWidth`       | 이미지 너비    | 문자열        | -                           | 이미지 너비 (기본: 100%)         |
| `imageHeight`      | 이미지 높이    | 문자열        | -                           | 이미지 높이 (기본: auto)         |
| `imageFit`         | 이미지 맞춤    | 문자열        | cover, contain, fill, none  | 이미지 맞춤 방식                 |
| `bannerBackground` | 배너 배경      | 문자열        | -                           | 배너 배경색/그라데이션 (기본: 보라 그라데이션) |
| `bannerTextColor`  | 배너 텍스트색  | 문자열        | -                           | 배너 텍스트 색상 (기본: #ffffff) |
| `bannerBtnTextColor` | 배너 버튼 텍스트색 | 문자열   | -                           | 배너 버튼 글자 색상 (기본: #667eea) |

---

### STEP 2: 클라이언트 채널 생성

> **채널이란?**
> 팝업 콘텐츠의 "틀"입니다. 어떤 필드들을 사용할지 정의합니다.

**경로:** `운영 설정 > 연동 설정 > 푸시 작업 > 클라이언트 채널 > + 생성`

#### 2-1. 기본 정보 입력

| 필드        | 입력값           | 설명                           |
| ----------- | ---------------- | ------------------------------ |
| 채널 이름   | `homepage_popup` | 원하는 이름 (영문, 언더스코어) |
| 메시지 타입 | `popup`          | 팝업임을 구분하는 식별자       |
| 전송 ID     | `게스트 ID`      | 사용자 식별 방식 선택          |

#### 2-2. 콘텐츠 템플릿 설정

`+ 행 추가` 버튼으로 아래 필드들을 추가합니다:

| 필드               | 별칭             | 입력 방식 | 힌트 문구          | 필수 여부 |
| ------------------ | ---------------- | --------- | ------------------ | --------- |
| `popupType`        | 팝업 타입        | 단일 선택 | -                  | 비필수    |
| `image`            | 이미지 URL       | 텍스트    | 팝업 이미지 URL    | 비필수    |
| `title`            | 팝업 제목        | 텍스트    | -                  | 비필수    |
| `body`             | 팝업 본문        | 텍스트    | -                  | 비필수    |
| `primaryButton`    | 메인 버튼 텍스트 | 텍스트    | 메인 버튼 텍스트   | 비필수    |
| `primaryButtonUrl` | 버튼 링크        | 텍스트    | 클릭 시 이동할 URL | 비필수    |
| `secondaryButton`  | 보조 버튼 텍스트 | 텍스트    | -                  | 비필수    |

> **💡 팁:** 디자인 옵션들도 추가하려면 `style`, `styleText` 객체 그룹 필드를 추가합니다.

#### 2-3. 저장

`저장` 버튼 클릭

---

### STEP 3: 작업 생성 (트리거 규칙 설정)

> **작업이란?**
> "누가, 언제, 어떤 팝업을 볼지" 정의하는 것입니다.

**경로:** `운영 > + 작업 생성`

#### 3-1. 기본 정보

| 필드      | 입력값                            |
| --------- | --------------------------------- |
| 작업 이름 | `첫 스크롤 시 팝업` (원하는 이름) |

#### 3-2. 푸시 시점 설정

| 필드      | 선택/입력값       |
| --------- | ----------------- |
| 푸시 유형 | `트리거 - A 완료` |

#### 3-3. 트리거 규칙 (언제 팝업을 보여줄지)

**예시: 사용자가 스크롤 1회 했을 때**

| 설정   | 값         |
| ------ | ---------- |
| 완료 A | ✓          |
| 이벤트 | `스크롤`   |
| 조건   | `횟수 = 1` |

> **다른 트리거 조건 예시:**
>
> - 페이지 방문: `pageview` 이벤트
> - 특정 버튼 클릭: `click` 이벤트 + `element_id = "signup-btn"` 조건
> - 3초 체류: `pageview` + `stay_time >= 3`

#### 3-4. 타겟 유저

| 설정 | 값                              |
| ---- | ------------------------------- |
| 타겟 | `모든 유저` 또는 특정 조건 설정 |

#### 3-5. 푸시 구성

| 설정      | 값                                      |
| --------- | --------------------------------------- |
| 채널 선택 | `클라이언트 채널`                       |
| 채널 이름 | `homepage_popup` (STEP 2에서 만든 채널) |

#### 3-6. 푸시 콘텐츠

팝업에 표시될 실제 내용을 입력합니다:

| 필드             | 입력값 (예시)                               |
| ---------------- | ------------------------------------------- |
| popupType        | `modal`                                     |
| image            | `https://example.com/promo.jpg`             |
| title            | `신규 가입 혜택`                            |
| body             | `지금 가입하시면 20% 할인 쿠폰을 드립니다!` |
| primaryButton    | `쿠폰 받기`                                 |
| primaryButtonUrl | `https://example.com/signup`                |
| secondaryButton  | `나중에`                                    |

#### 3-7. 푸시 빈도

| 설정                        | 값                          |
| --------------------------- | --------------------------- |
| 단일 실행 내 최대 푸시 횟수 | `1회` (같은 세션에서 1번만) |

#### 3-8. 저장 및 제출

1. `초안 저장` 클릭
2. 테스트 후 `저장 및 제출` 클릭

---

### STEP 4: 채널 활성화

**경로:** `운영 설정 > 연동 설정 > 푸시 작업 > 클라이언트 채널`

1. 만든 채널(`homepage_popup`) 찾기
2. **채널 스위치** 컬럼에서 토글을 **ON**으로 변경

---

## Part 2: 웹사이트 설정

### STEP 5: SDK 스크립트 로드

HTML `<head>` 또는 `<body>` 끝에 SDK 스크립트를 추가합니다:

```html
<!-- ThinkingData SDK 로드 (필수) -->
<script src="https://sdk.thinkingdata.cn/tdapp/tdapp.min.js"></script>

<!-- 또는 운영 SDK 전체 번들 사용 -->
<script src="https://cdn.thinkingdata.cn/tdcore.umd.min.js"></script>
<script src="https://cdn.thinkingdata.cn/tdremoteconfig.umd.min.js"></script>
<script src="https://cdn.thinkingdata.cn/tdstrategy.umd.min.js"></script>
```

---

### STEP 6: SDK 초기화 코드

```html
<script>
  // SDK 초기화
  window.TDApp.init({
    appId: "YOUR_APP_ID", // TE 콘솔에서 확인
    serverUrl: "YOUR_SERVER_URL", // 예: https://your-domain.thinkingdata.cn
    enableLog: true, // 개발 시 true, 운영 시 false
    mode: "none", // 'debug': 테스트 모드
    autoTrack: {
      pageShow: true,
      pageHide: true,
    },
    // ⭐ 핵심: 트리거 리스너 설정
    triggerListener: function (result) {
      console.log("📬 과제 트리거 수신:", result);

      // 팝업 표시 (TEPopup이 로드된 경우)
      if (window.TEPopup) {
        window.TEPopup.show(result);
      }
    },
  });
</script>
```

---

### STEP 7: 팝업 모듈 로드

#### 방법 A: 번들 파일 사용 (권장)

```html
<!-- 팝업 모듈 로드 -->
<script src="/path/to/operate-popup.js"></script>

<script>
  // 자동 초기화됨 - 별도 설정 불필요
</script>
```

#### 방법 B: 전체 통합 코드 (복사해서 바로 사용)

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Website</title>

    <!-- ThinkingData SDK -->
    <script src="https://sdk.thinkingdata.cn/tdapp/tdapp.min.js"></script>
  </head>
  <body>
    <!-- 페이지 콘텐츠 -->
    <h1>Welcome!</h1>

    <!-- SDK 초기화 + 팝업 모듈 -->
    <script>
      (function () {
        // ==========================================
        // 1. 팝업 스타일 (CSS)
        // ==========================================
        const styles = document.createElement("style");
        styles.textContent = `
      .te-popup-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 99998;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .te-popup-overlay.te-show { opacity: 1; }

      .te-popup-modal {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 480px;
        width: 90%;
        overflow: hidden;
        opacity: 0;
        transition: all 0.3s;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .te-popup-modal.te-show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      .te-popup-modal .te-popup-close {
        position: absolute;
        top: 12px; right: 12px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 8px;
        line-height: 1;
      }
      .te-popup-modal .te-popup-image {
        width: 100%;
        display: block;
      }
      .te-popup-modal .te-popup-content {
        padding: 24px;
      }
      .te-popup-modal .te-popup-title {
        margin: 0 0 12px;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
      .te-popup-modal .te-popup-body {
        margin: 0 0 16px;
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }
      .te-popup-modal .te-popup-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
      }
      .te-popup-btn {
        display: inline-block;
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
      }
      .te-popup-btn-primary {
        background: #4F46E5;
        color: #fff;
      }
      .te-popup-btn-primary:hover { background: #4338CA; }
      .te-popup-btn-secondary {
        background: #E5E7EB;
        color: #374151;
      }
      .te-popup-btn-secondary:hover { background: #D1D5DB; }

      /* 배너 스타일 */
      .te-popup-banner {
        position: fixed;
        left: 0; right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        transform: translateY(-100%);
        transition: transform 0.4s;
        z-index: 99999;
      }
      .te-popup-banner.te-position-top { top: 0; }
      .te-popup-banner.te-position-bottom { bottom: 0; top: auto; transform: translateY(100%); }
      .te-popup-banner.te-show { transform: translateY(0); }
      .te-popup-banner .te-popup-close {
        position: static;
        color: rgba(255,255,255,0.8);
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
      }
      .te-popup-banner .te-popup-title { color: #fff; margin: 0; font-size: 16px; }
      .te-popup-banner .te-popup-body { color: rgba(255,255,255,0.9); margin: 0; flex: 1; }
      .te-popup-banner .te-popup-btn { background: #fff; color: #667eea; }

      /* 토스트 스타일 */
      .te-popup-toast {
        position: fixed;
        bottom: 24px; right: 24px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        max-width: 360px;
        width: calc(100% - 48px);
        overflow: hidden;
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .te-popup-toast.te-show { transform: translateX(0); }
      .te-popup-toast .te-popup-close {
        position: absolute;
        top: 8px; right: 8px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      .te-popup-toast .te-popup-content { padding: 16px; }
      .te-popup-toast .te-popup-title { font-size: 15px; margin: 0 0 8px; color: #333; }
      .te-popup-toast .te-popup-body { font-size: 13px; margin: 0 0 12px; color: #666; }
      .te-popup-toast .te-popup-btn { width: 100%; }
    `;
        document.head.appendChild(styles);

        // ==========================================
        // 2. 팝업 모듈
        // ==========================================
        let currentPopup = null;
        let currentOverlay = null;

        function closePopup() {
          if (currentPopup) {
            currentPopup.classList.remove("te-show");
            if (currentOverlay) currentOverlay.classList.remove("te-show");
            setTimeout(() => {
              currentPopup?.remove();
              currentOverlay?.remove();
              currentPopup = null;
              currentOverlay = null;
            }, 400);
          }
        }

        function showPopup(result) {
          closePopup();

          const content = result.content || {};
          const style = content.style || {};
          const styleText = content.styleText || {};
          const merged = { ...style, ...styleText };

          const popupType = content.popupType || "modal";

          // Modal 타입
          if (popupType === "modal") {
            const overlay = document.createElement("div");
            overlay.className = "te-popup-overlay";
            overlay.onclick = closePopup;

            const modal = document.createElement("div");
            modal.className = "te-popup te-popup-modal";

            if (merged.maxWidth) modal.style.maxWidth = merged.maxWidth;
            if (merged.backgroundColor)
              modal.style.backgroundColor = merged.backgroundColor;
            if (merged.borderRadius)
              modal.style.borderRadius = merged.borderRadius;

            let html =
              '<button class="te-popup-close" onclick="window.TEPopup.close()">&times;</button>';

            if (content.image) {
              html +=
                '<img class="te-popup-image" src="' +
                content.image +
                '" style="';
              if (merged.imageWidth) html += "width:" + merged.imageWidth + ";";
              if (merged.imageHeight)
                html += "height:" + merged.imageHeight + ";";
              if (merged.imageFit)
                html += "object-fit:" + merged.imageFit + ";";
              html += '">';
            }

            html += '<div class="te-popup-content">';
            if (content.title) {
              html += '<h3 class="te-popup-title" style="';
              if (merged.titleColor) html += "color:" + merged.titleColor + ";";
              if (merged.titleFontSize)
                html += "font-size:" + merged.titleFontSize + ";";
              html += '">' + content.title + "</h3>";
            }
            if (content.body) {
              html += '<p class="te-popup-body" style="';
              if (merged.bodyColor) html += "color:" + merged.bodyColor + ";";
              if (merged.bodyFontSize)
                html += "font-size:" + merged.bodyFontSize + ";";
              html += '">' + content.body + "</p>";
            }
            if (content.primaryButton || content.secondaryButton) {
              html += '<div class="te-popup-buttons">';
              if (content.secondaryButton) {
                html +=
                  '<button class="te-popup-btn te-popup-btn-secondary" onclick="window.TEPopup.close()">' +
                  content.secondaryButton +
                  "</button>";
              }
              if (content.primaryButton) {
                if (content.primaryButtonUrl) {
                  html +=
                    '<a href="' +
                    content.primaryButtonUrl +
                    '" class="te-popup-btn te-popup-btn-primary" style="';
                } else {
                  html +=
                    '<button class="te-popup-btn te-popup-btn-primary" onclick="window.TEPopup.close()" style="';
                }
                if (merged.primaryColor)
                  html += "background-color:" + merged.primaryColor + ";";
                html += '">' + content.primaryButton;
                html += content.primaryButtonUrl ? "</a>" : "</button>";
              }
              html += "</div>";
            }
            html += "</div>";

            modal.innerHTML = html;
            document.body.appendChild(overlay);
            document.body.appendChild(modal);
            currentPopup = modal;
            currentOverlay = overlay;

            requestAnimationFrame(() => {
              overlay.classList.add("te-show");
              modal.classList.add("te-show");
            });
          }

          // Banner 타입
          else if (popupType === "banner") {
            const position = content.position || "top";
            const banner = document.createElement("div");
            banner.className =
              "te-popup te-popup-banner te-position-" + position;

            if (merged.backgroundColor)
              banner.style.background = merged.backgroundColor;

            let html = "";
            if (content.title)
              html +=
                '<span class="te-popup-title">' + content.title + "</span>";
            if (content.body)
              html += '<span class="te-popup-body">' + content.body + "</span>";
            if (content.primaryButton) {
              html +=
                '<button class="te-popup-btn" onclick="alert(\'clicked\')">' +
                content.primaryButton +
                "</button>";
            }
            html +=
              '<button class="te-popup-close" onclick="window.TEPopup.close()">&times;</button>';

            banner.innerHTML = html;
            document.body.appendChild(banner);
            currentPopup = banner;

            requestAnimationFrame(() => banner.classList.add("te-show"));
          }

          // Toast 타입
          else if (popupType === "toast") {
            const toast = document.createElement("div");
            toast.className = "te-popup te-popup-toast";

            if (merged.backgroundColor)
              toast.style.backgroundColor = merged.backgroundColor;
            if (merged.borderRadius)
              toast.style.borderRadius = merged.borderRadius;

            let html =
              '<button class="te-popup-close" onclick="window.TEPopup.close()">&times;</button>';
            html += '<div class="te-popup-content">';
            if (content.title)
              html += '<h3 class="te-popup-title">' + content.title + "</h3>";
            if (content.body)
              html += '<p class="te-popup-body">' + content.body + "</p>";
            if (content.primaryButton) {
              html +=
                '<button class="te-popup-btn te-popup-btn-primary" onclick="window.TEPopup.close()">' +
                content.primaryButton +
                "</button>";
            }
            html += "</div>";

            toast.innerHTML = html;
            document.body.appendChild(toast);
            currentPopup = toast;

            requestAnimationFrame(() => toast.classList.add("te-show"));
          }

          // ESC 키로 닫기
          const escHandler = (e) => {
            if (e.key === "Escape") {
              closePopup();
              document.removeEventListener("keydown", escHandler);
            }
          };
          document.addEventListener("keydown", escHandler);

          // 이벤트 전송
          if (result.opsProperties && window.TDAnalytics) {
            window.TDAnalytics.track("ops_show", result.opsProperties);
          }
        }

        // 전역 API
        window.TEPopup = {
          show: showPopup,
          close: closePopup,
        };

        // ==========================================
        // 3. SDK 초기화
        // ==========================================
        window.TDApp.init({
          appId: "YOUR_APP_ID", // ⚠️ 실제 값으로 변경
          serverUrl: "YOUR_SERVER_URL", // ⚠️ 실제 값으로 변경
          enableLog: true,
          mode: "none",
          autoTrack: {
            pageShow: true,
            pageHide: true,
          },
          triggerListener: function (result) {
            console.log("📬 과제 수신:", result);
            window.TEPopup.show(result);
          },
        });

        console.log("✅ SDK 및 팝업 모듈 초기화 완료");
      })();
    </script>
  </body>
</html>
```

---

## Part 3: 테스트하기

### 1. 디버그 모드로 테스트

SDK 초기화 시 `mode: 'debug'`로 설정하면 TE 콘솔에서 바로 테스트할 수 있습니다.

```javascript
window.TDApp.init({
  // ...
  mode: "debug", // 테스트 모드
  // ...
});
```

### 2. TE 콘솔에서 테스트 발송

1. 작업 편집 화면에서 `테스트 발송` 버튼 클릭
2. 테스트 기기 ID 입력
3. 발송 후 웹사이트에서 팝업 확인

### 3. 이벤트 확인

TE 콘솔 > 분석 > 이벤트 분석에서 아래 이벤트들이 기록되는지 확인:

| 이벤트명      | 시점         |
| ------------- | ------------ |
| `ops_receive` | 과제 수신 시 |
| `ops_show`    | 팝업 표시 시 |
| `ops_click`   | 버튼 클릭 시 |
| `ops_close`   | 팝업 닫을 때 |

---

## Part 4: FAQ

### Q1: 클라이언트 파라미터는 꼭 등록해야 하나요?

**A:** 아니요, 선택사항입니다.

- 등록하면: TE 콘솔에서 작업 생성 시 드롭다운으로 선택 가능
- 등록 안 하면: JSON으로 직접 입력해야 함

### Q2: 팝업이 안 뜨는데요?

**A:** 체크리스트:

1. 채널 스위치가 ON인지 확인
2. 작업이 "제출됨" 상태인지 확인
3. 브라우저 콘솔에 SDK 로드 오류가 있는지 확인
4. `console.log(window.TDApp)` 실행해서 undefined가 아닌지 확인

### Q3: 같은 팝업이 계속 뜹니다

**A:** 작업 설정에서 "푸시 빈도"를 설정하세요:

- 단일 실행 내 최대 1회
- 또는 "7일 내 최대 1회"

### Q4: 특정 페이지에서만 팝업을 보여주고 싶어요

**A:** 트리거 조건에 페이지 URL 조건을 추가하세요:

- 이벤트: `pageview`
- 조건: `url_path = "/products"`

---

## Part 5: 팝업 타입별 JSON 예시

### Modal (기본)

```json
{
  "popupType": "modal",
  "image": "https://example.com/banner.jpg",
  "title": "특별 프로모션",
  "body": "지금 구매하시면 30% 할인!",
  "primaryButton": "지금 구매",
  "primaryButtonUrl": "https://example.com/shop",
  "secondaryButton": "나중에"
}
```

### Banner (상단/하단)

```json
{
  "popupType": "banner",
  "position": "top",
  "title": "무료 배송",
  "body": "5만원 이상 구매 시",
  "primaryButton": "자세히 보기",
  "style": {
    "bannerBackground": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "bannerTextColor": "#ffffff",
    "bannerBtnTextColor": "#667eea"
  }
}
```

### Toast (우측 하단)

```json
{
  "popupType": "toast",
  "title": "새 메시지",
  "body": "고객센터에서 답변이 도착했습니다.",
  "primaryButton": "확인하기"
}
```

---

## 요약 체크리스트

- [ ] STEP 1: 클라이언트 파라미터 등록 (선택)
- [ ] STEP 2: 클라이언트 채널 생성
- [ ] STEP 3: 작업 생성 (트리거 조건 + 콘텐츠)
- [ ] STEP 4: 채널 스위치 ON
- [ ] STEP 5-7: 웹사이트에 SDK + 팝업 코드 추가
- [ ] 테스트 발송으로 확인
- [ ] 작업 제출 (운영 시작)
