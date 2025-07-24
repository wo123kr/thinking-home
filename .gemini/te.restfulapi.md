## Thinking Engine(TE) RESTful API 가이드

이 가이드는 Thinking Engine 백엔드로 데이터를 직접 전송하는 **데이터 접속 API** 사용 방법을 설명합니다. 이 API를 활용하면 별도의 전송 도구나 SDK 없이 **HTTP POST 메서드**를 이용해 데이터를 보낼 수 있습니다.
데이터를 업로드하기 전에, 반드시 TE의 **데이터 형식과 규칙을 숙지**해야 합니다. 모든 데이터 항목은 **하나의 JSON 객체**로 구성됩니다.

-----

### 1\. 데이터 형식 변환

데이터를 전송하기 전에 **TE에서 요구하는 형식**으로 변환해야 합니다. TE는 모든 데이터를 JSON 객체로 처리하며, 다음은 데이터 예시입니다:

```json
{
  "#account_id": "ABCDEFG-123-abc",
  "#distinct_id": "F53A58ED-E5DA-4F18-B082-7E1228746E88",
  "#type": "track",
  "#ip": "192.168.171.111",
  "#time": "2017-12-18 14:37:28.527",
  "#event_name": "test",
  "properties": {
    "#lib": "LogBus",
    "#lib_version": "1.0.0",
    "#screen_height": 1920,
    "#screen_width": 1080,
    "argString": "abc",
    "argNum": 123,
    "argBool": true
  }
}
```

**주의**: `POST` 메서드로 업로드하는 데이터는 **반드시 TE 데이터 형식**을 따라야 합니다. 상세한 규칙은 "데이터 규칙" 섹션을 참고하세요.

-----

### 2\. 데이터 전송

JSON 데이터를 준비했다면, 이제 TE 서버로 데이터를 전송할 수 있습니다. TE 서버는 **HTTP 표준 POST 요청**을 통해 데이터를 받으며, 모든 인터페이스의 문자 인코딩은 **UTF-8**을 사용합니다.

#### 2.1 데이터 수신 엔드포인트 (POST 방식, `form-data` 전송)

이 방식은 데이터를 `form-data` 형태로 전송합니다.

  * **SaaS 서비스**: `https://te-receiver-naver.thinkingdata.kr/sync_data` 또는 `https://te-receiver-naver.thinkingdata.kr/sync_json`
  * **프라이빗 서비스**: `http://<데이터 전송 서버 주소>/sync_data` 또는 `http://<데이터 전송 서버 주소>/sync_json`

##### 2.1.1 요청 파라미터 (`Request Body`)

  * **단일 JSON 데이터 전송:**
      * `appid`: 프로젝트의 APP ID
      * `data`: JSON 데이터 (UTF-8 인코딩 후 **urlencode** 필요)
      * `client`: `0` 또는 `1` (기본값 `0`. `1`로 설정 시 클라이언트 IP를 `#ip` 필드에 강제 덮어쓰기)
  * **다중 JSON 데이터 전송:**
      * `appid`: 프로젝트의 APP ID
      * `data_list`: 여러 JSON 데이터를 포함한 **JSONArray** (UTF-8 인코딩 후 **urlencode** 필요)
      * `client`: `0` 또는 `1` (기본값 `0`. `1`로 설정 시 클라이언트 IP를 `#ip` 필드에 강제 덮어쓰기)

**참고**: Python3의 `requests` 라이브러리나 Postman 같은 일부 도구는 `urlencode`를 자동으로 처리할 수 있습니다.

##### `curl`을 이용한 RESTful API 호출 예제

1.  **원본 데이터 예시:**
    ```json
    {
      "#account_id": "testing",
      "#time": "2019-01-01 10:00:00.000",
      "#type": "track",
      "#event_name": "testing",
      "properties": {
        "test": "test"
      }
    }
    ```
2.  **`urlencode` 적용 후 데이터:**
    ```
    %7b%22%23account_id%22%3a%22testing%22%2c%22%23time%22%3a%222019-01-01+10%3a00%3a00.000%22%2c%22%23type%22%3a%22track%22%2c%22%23event_name%22%3a%22testing%22%2c%22properties%22%3a%7b%22test%22%3a%22test%22%7d%7d
    ```
3.  **`curl`을 이용한 데이터 전송:**
    ```bash
    curl "http://receiver:9080/sync_data" \
    --data "appid=test-sdk-appid&data=%7b%22%23account_id%22%3a%22testing%22%2c%22%23time%22%3a%222019-01-01+10%3a00%3a00.000%22%2c%22%23type%22%3a%22track%22%2c%22%23event_name%22%3a%22testing%22%2c%22properties%22%3a%7b%22test%22%3a%22test%22%7d%7d"
    ```

##### 2.1.2 반환 파라미터

응답 값에 `code: 0`이 반환되면 데이터 전송이 성공한 것입니다.

##### 2.1.3 디버그(Debug) 모드

요청 시 `debug` 파라미터를 추가하여 디버그 모드를 활성화할 수 있습니다 (`appid`, `data`/`data_list`, `debug` 총 3개 파라미터).

  * \*\*`debug=1`\*\*로 설정하면 상세한 오류 원인을 반환합니다.
    ```json
    {"code":-1,"msg":"#time 필드의 형식이 올바르지 않습니다. [yyyy-MM-dd HH:mm:ss] 또는 [yyyy-MM-dd HH:mm:ss.SSS] 형식으로 전달해야 합니다."}
    ```
  * **권장**: 디버그 모드는 소량의 테스트 데이터 업로드에만 사용하고, 운영 환경에서는 **비활성화**하는 것이 좋습니다.

#### 2.2 데이터 수집 API (전송 방식: `raw`)

이 방식은 `Request Body`에 JSON 형식으로 데이터를 직접 입력하여 전송합니다.

  * **클라우드 서비스**: `http://ta-receiver.thinkingdata.io/sync_json`
  * **온프레미스(프라이빗 서버)**: `http://업로드 URL/sync_json`

##### 2.2.1 요청 파라미터 (`Request Body`에 JSON 형식으로 입력)

  * **단일 JSON 데이터 전송 예시:**
    ```json
    {
      "appid": "debug-appid",
      "debug": 0,
      "data": {
        "#type": "track",
        "#event_name": "test",
        "#time": "2019-11-15 11:35:53.648",
        "properties": { "a": "123", "b": 2 },
        "#distinct_id": "1111"
      }
    }
    ```
  * **여러 개의 데이터 배열 전송 예시:**
    ```json
    [
      {
        "appid": "debug-appid",
        "data": {
          "#type": "track",
          "#event_name": "test",
          "#time": "2019-11-15 11:35:53.648",
          "properties": { "a": "123", "b": 2 },
          "#distinct_id": "1111"
        }
      },
      {
        "appid": "debug-appid",
        "data": {
          "#type": "track",
          "#event_name": "test",
          "#time": "2019-11-15 11:35:53.648",
          "properties": { "a": "123", "b": 2 },
          "#distinct_id": "1111"
        }
      }
    ]
    ```

##### 2.2.2 반환 파라미터

응답 값에 `code: 0`이 반환되면 데이터 전송이 성공한 것입니다.

##### 2.2.3 디버그(Debug) 모드

JSON 데이터에 `debug` 파라미터를 추가하여 디버그 모드를 활성화할 수 있습니다 (현재 단일 데이터 전송만 지원).

  * \*\*`debug=1`\*\*로 설정하면 상세한 오류 원인을 반환합니다.
    ```json
    {
      "code": -1,
      "msg": "#time 필드의 형식이 올바르지 않습니다. [yyyy-MM-dd HH:mm:ss] 또는 [yyyy-MM-dd HH:mm:ss.SSS] 형식으로 전달해야 합니다."
    }
    ```
  * **권장**: 디버그 모드는 소량의 테스트 데이터 업로드에만 사용하고, 운영 환경에서는 **비활성화**하는 것이 좋습니다.

##### 2.2.4 데이터 압축

`Request Header`에 `compress` 필드를 추가하여 압축된 데이터를 업로드할 수 있습니다. 예를 들어, `compress=gzip`으로 설정하면 서버에서 gzip 방식으로 데이터를 압축 해제합니다.

  * **지원하는 압축 방식**: `gzip`, `lzo`, `lz4`, `snappy`
  * **기본값**: 압축 없음

##### 2.2.5 업로드 클라이언트의 IP 가져오기

`Request Header`에 `client=1`을 추가하면 서버에서 업로드 클라이언트의 IP를 `#ip` 필드에 저장하며, 기존 값을 **강제로 덮어씁니다**. 기본값은 `0`이며, 이 경우 클라이언트 IP를 수집하지 않습니다.