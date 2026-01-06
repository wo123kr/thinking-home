# TE 클라이언트 트리거 방식 과제 기능 통합 가이드 (JavaScript)

## 1. 개요 및 목적

- **TE 4.4 이상**에서 지원하는 ‘클라이언트 트리거 방식 과제’는 신규 유저 가입, 캐릭터 생성 등 실시간/밀리초 단위 트리거 및 A/B 테스트 분류가 가능한 운영 기능입니다.
- **클라이언트**(웹/앱)에서는 씽킹데이터 SDK를 통해 TE 백엔드와 통신하여 과제 조회 및 결과 처리만 신경 쓰면 됩니다.

---

## 2. SDK 구성 및 통합

### 2.1 사용 SDK 및 버전 요구사항

| SDK 이름       | 역할                   | 최소 버전 |
| -------------- | ---------------------- | --------- |
| TDAnalytics    | 데이터 수집 및 처리    | >= 2.1.0  |
| TDRemoteconfig | 백엔드 설정 정보 조회  | >= 1.1.0  |
| TDCore         | 통합 초기화 기능       | >= 1.1.0  |
| TDStrategy     | 클라이언트 트리거 기능 | >= 1.1.0  |

### 2.2 설치 및 파일 구성

1. **SDK 다운로드 및 압축 해제**
2. 프로젝트 폴더에 아래 파일 복사
   - `tdcore.umd.min.js`
   - `thinkingdata.umd.min.js`
   - `tdremoteconfig.umd.min.js`
   - `tdstrategy.umd.min.js`

### 2.3 초기화 예시

```html
<script src="./thinkingdata.umd.min.js"></script>
<script src="./tdcore.umd.min.js"></script>
<script src="./tdremoteconfig.umd.min.js"></script>
<script src="./tdstrategy.umd.min.js"></script>
<script>
  TDApp.init({
    appId: "AppId",
    serverUrl: "ServerUrl",
    enableLog: true,
    autoTrack: {
      appLaunch: true, // ta_mp_launch 자동 수집
      appShow: true, // ta_mp_show 자동 수집
      appHide: true, // ta_mp_hide 자동 수집
      pageShow: true, // ta_mp_view 자동 수집
      pageShare: true, // ta_mp_share 자동 수집
    },
    triggerListener: function (result) {
      // 트리거 결과 처리
    },
  });
</script>
```

#### 주요 초기화 파라미터

| 속성명          | 타입     | 설명                                  |
| --------------- | -------- | ------------------------------------- |
| appId           | String   | TE 프로젝트의 app id                  |
| serverUrl       | String   | TE 프로젝트의 server url              |
| mode            | String   | SDK 실행 모드(none, debug, debugOnly) |
| enableLog       | Boolean  | 로그 출력 활성화 여부                 |
| zoneOffset      | Number   | SDK 기본 시간대                       |
| autoTrack       | Object   | 자동 이벤트 수집 설정                 |
| triggerListener | Function | 과제 트리거 결과 콜백 함수            |

---

## 3. 클라이언트 트리거 과제 처리

### 3.1 트리거 결과 콜백 리스너

- **triggerListener**를 통해 과제 트리거 결과를 처리
- 콜백 함수로 전달되는 `result` 객체 주요 속성

| 속성명         | 타입   | 설명                                   |
| -------------- | ------ | -------------------------------------- |
| channelMsgType | String | 채널 메시지 타입                       |
| appId          | String | 프로젝트 app id                        |
| pushId         | String | 과제의 채널 발송 ID                    |
| taskId         | String | 과제 ID                                |
| content        | Object | 과제 푸시 내용                         |
| userParams     | Object | 커스텀 클라이언트 파라미터             |
| opsProperties  | Object | 채널 정보 및 퍼널 이벤트 회신 파라미터 |

---

## 4. 클라이언트 파라미터 설정

- **클라이언트 조건**에 사용할 파라미터는 자동 수집 환경 파라미터와 TDStrategy SDK에서 직접 등록한 커스텀 파라미터가 모두 활용됨
- 파라미터 이름/타입은 TE 백엔드 설정과 반드시 일치해야 함

```js
// 커스텀 클라이언트 파라미터 등록(합집합 방식)
TDStrategy.addClientParams({ key: "value" });
```

---

## 5. 원격 설정 데이터 가져오기

### 5.1 자동 가져오기

- 앱 콜드스타트
- 계정 시스템 변경(로그인/로그아웃 등) 시 자동 조회

### 5.2 수동 가져오기

```js
TDStrategy.fetch(); // 빈도 제한 있음
```

---

## 6. 도달 퍼널 이벤트 처리

- **도달 퍼널 활성화** 시, 각 단계별 메타 이벤트 이름 구성 가능
- 퍼널 이벤트는 `opsProperties`를 포함해야 하며, 트리거 결과에서 해당 속성을 추출해 이벤트로 전송

```js
TDApp.init({
  appId: "AppId",
  serverUrl: "ServerUrl",
  enableLog: true,
  triggerListener: function (result) {
    TDAnalytics.track("ops_click", result.opsProperties);
  },
});
```

---

## 7. 테스트/디버그 모드

- **테스트 모드 활성화:**  
  초기화 시 `mode: "debug"` 설정
- **동작:**  
  클라이언트에서 5초마다 테스트 작업을 한 번씩 가져옴  
  TE 운영 모듈에서 채널/작업 테스트 생성 후 진행 노드 확인 가능

```js
TDApp.init({
  appId: "AppId",
  serverUrl: "ServerUrl",
  enableLog: true,
  mode: "debug",
  triggerListener: function (result) {
    // 테스트 트리거 결과 처리
  },
});
```

- **테스트 디바이스 관리:**  
  테스트 발송 시 테스트 디바이스 목록에서 선택/추가 필요

---

## 8. 기타 참고

- 클라이언트에서는 SDK 연동 및 파라미터만 신경 쓰면 되며, 과제 세부 내용 및 로직은 TE 백엔드에서 관리
- 관련 문서:
  - 트리거 방식 작업 생성(클라이언트)
  - 채널 설정 가이드
  - 작업 발송 테스트/채널 발송 테스트

---

**이 가이드는 TE 클라이언트 트리거 방식 과제 기능의 SDK 통합부터 고급 활용까지 핵심 내용을 통합 정리한 문서입니다.**
