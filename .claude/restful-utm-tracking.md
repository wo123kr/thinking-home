# RESTful API를 이용한 UTM 속성 추적 가이드

이 문서는 Thinking Engine(TE)의 RESTful API (`/sync_json` 엔드포인트)를 사용하여, 웹사이트 방문자의 UTM 파라미터를 수집하고 이벤트 데이터에 포함시켜 전송하는 JavaScript 예제 코드를 제공합니다.

이 방식은 클라이언트 측(브라우저)에서 직접 TE 서버로 데이터를 전송할 때 유용하며, 별도의 서버 사이드 코드가 필요 없습니다.

---

## 🚀 JavaScript 예제 코드

아래 코드는 다음 기능을 수행합니다.

1.  **UTM 파라미터 추출**: 현재 페이지 URL에서 `utm_`으로 시작하는 모든 쿼리 파라미터를 자동으로 수집합니다.
2.  **TE 데이터 형식 구성**: TE의 데이터 규칙에 맞는 JSON 페이로드를 생성합니다.
3.  **API 요청**: `fetch` API를 사용하여 TE 서버로 데이터를 비동기적으로 전송합니다.

```javascript
/**
 * @brief 현재 페이지 URL의 쿼리 문자열에서 UTM 파라미터를 추출합니다.
 * @returns {object} utm_source, utm_medium 등 UTM 파라미터를 담은 객체.
 */
function getUtmProperties() {
    const utmParams = {};
    const queryString = window.location.search;
    if (!queryString) {
        return utmParams;
    }
    const urlParams = new URLSearchParams(queryString);
    for (const [key, value] of urlParams.entries()) {
        if (key.startsWith('utm_')) {
            utmParams[key] = value;
        }
    }
    return utmParams;
}

/**
 * @brief 현재 시간을 TE 데이터 형식(yyyy-MM-dd HH:mm:ss.SSS)에 맞게 포맷합니다.
 * @returns {string} 포맷된 시간 문자열
 */
function getFormattedTimestamp() {
    const d = new Date();
    const pad = (num) => num.toString().padStart(2, '0');
    const pad3 = (num) => num.toString().padStart(3, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad3(d.getMilliseconds())}`;
}


/**
 * @brief 이벤트 데이터를 TE RESTful API로 전송합니다. UTM 속성이 자동으로 포함됩니다.
 * @param {string} eventName - 전송할 이벤트의 이름
 * @param {object} properties - 전송할 이벤트의 속성
 */
async function trackEventViaRestAPI(eventName, properties = {}) {
    // --- 1. 데이터 준비 ---
    
    // 1a. UTM 속성을 가져옵니다.
    const utmProperties = getUtmProperties();

    // 1b. 기본 이벤트 속성과 UTM 속성을 병합합니다.
    const finalProperties = { ...utmProperties, ...properties };

    // 1c. TE 데이터 규칙에 맞는 전체 데이터 페이로드를 구성합니다.
    const teDataPayload = {
        "#type": "track",
        "#event_name": eventName,
        "#time": getFormattedTimestamp(),
        // 중요: 실제 서비스에서는 이 값을 고유한 방문자 ID로 교체해야 합니다.
        "#distinct_id": "visitor_unique_id_12345", 
        // 로그인한 사용자라면 #account_id를 사용합니다.
        // "#account_id": "user_login_id_abc",
        "properties": finalProperties
    };

    // --- 2. API 요청 준비 ---

    // 2a. /sync_json 엔드포인트에 맞는 요청 본문을 구성합니다.
    const requestBody = {
        // 중요: 당신의 프로젝트 APP ID로 교체하세요.
        "appid": "YOUR_PROJECT_APP_ID", 
        "data": teDataPayload
        // "debug": 1 // 테스트 시 상세 오류를 보려면 이 옵션을 사용하세요.
    };

    // 2b. 데이터를 전송할 API 엔드포인트 주소입니다.
    // 프라이빗 서버 환경인 경우, 이 주소를 변경해야 합니다.
    const apiEndpoint = "https://te-receiver-naver.thinkingdata.kr/sync_json";

    // --- 3. API 요청 실행 ---
    console.log("📡 API로 전송할 데이터:", JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();

        if (result.code === 0) {
            console.log("✅ 데이터 전송 성공:", result);
        } else {
            // TE 서버가 반환하는 상세 오류 메시지를 확인합니다.
            console.error("❌ 데이터 전송 실패:", result);
        }
    } catch (error) {
        console.error("🔥 API 요청 중 네트워크 또는 기타 오류 발생:", error);
    }
}


// --- 사용 예시 ---

// 사용자가 "https://example.com/product/123?utm_source=newsletter&utm_campaign=summer_sale" URL로 접속했다고 가정
trackEventViaRestAPI('product_view', {
    product_id: 'P-67890',
    category: 'electronics'
});
```

---

## 🧠 코드 설명 및 중요 포인트

1.  **데이터 구성 (`teDataPayload`)**:
    *   `#type`, `#event_name`, `#time`, `#distinct_id` 등 TE에서 요구하는 필수 필드를 포함하여 JSON 객체를 생성합니다.
    *   `properties` 객체 안에는 `getUtmProperties()`로 가져온 UTM 정보와 `trackEventViaRestAPI` 함수로 전달된 커스텀 속성이 모두 포함됩니다.

2.  **요청 본문 (`requestBody`)**:
    *   `/sync_json` 엔드포인트는 `appid`와 `data` 필드를 가진 JSON 객체를 `Request Body`로 받습니다.
    *   `data` 필드의 값으로 위에서 만든 `teDataPayload`를 넣습니다.
    *   **`YOUR_PROJECT_APP_ID`**는 반드시 실제 프로젝트의 APP ID로 변경해야 합니다.

3.  **API 호출 (`fetch`)**:
    *   `fetch` 함수를 사용하여 지정된 `apiEndpoint`로 `POST` 요청을 보냅니다.
    *   `headers`의 `Content-Type`을 `application/json`으로 설정하여 서버가 JSON 데이터를 올바르게 해석하도록 합니다.
    *   `body`에는 `JSON.stringify()`를 사용하여 `requestBody` 객체를 문자열로 변환하여 전달합니다.

4.  **오류 처리**:
    *   API 응답의 `code` 값이 `0`이 아니면 데이터에 문제가 있는 것입니다. `msg` 필드를 통해 어떤 필드가 잘못되었는지 확인할 수 있어 디버깅에 유용합니다.
    *   `try...catch` 블록은 네트워크 문제 등 요청 자체가 실패하는 경우를 처리합니다.
