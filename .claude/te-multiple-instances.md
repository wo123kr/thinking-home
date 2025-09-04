# JavaScript SDK 다중 인스턴스 가이드

## 📋 다중 인스턴스 개요

`initInstance` 메서드를 호출하여 서브 인스턴스(하위 인스턴스)를 생성할 수 있습니다. 이 메서드의 파라미터는 서브 인스턴스의 이름이며, 이후 해당 이름을 사용하여 서브 인스턴스의 메서드를 호출할 수 있습니다.

## 🚀 1. 기본 서브 인스턴스 생성

```javascript
// "newInstance"라는 이름의 서브 인스턴스 생성
ta.initInstance("newInstance");

// 서브 인스턴스에 distinct_id 설정 후 "test_event" 이벤트 전송
ta.newInstance.identify("new_distinct_id");
ta.newInstance.track("test_event");
```

**기본 특성:**
- 서브 인스턴스는 메인 인스턴스와 동일한 설정(appId, serverUrl 등)을 사용
- 기본적으로 로컬 캐시가 비활성화되어 있음

## ⚙️ 2. 커스텀 설정 서브 인스턴스

서브 인스턴스에 개별 설정을 적용하려면, 초기화 시 설정 정보를 전달할 수 있습니다. 설정 정보에서 다른 appId 값을 지정하면, 서로 다른 프로젝트에 데이터를 전송할 수 있습니다.

```javascript
// 서브 인스턴스의 설정 값 정의
var param = {
  appId: "debug-appid",
  serverUrl: "ANOTHER_SERVER_URL",
  persistenceEnabled: true, // 서브 인스턴스 로컬 캐시 활성화 (서브 인스턴스명 기준으로 구분)
  send_method: "image",
  showLog: true
};

// 서브 인스턴스 초기화
ta.initInstance("anotherInstance", param);

// 메인 인스턴스로 데이터 전송
ta.track("Event");

// 서브 인스턴스로 데이터 전송
ta.anotherInstance.track("Event");
```

## 👥 3. 독립적인 ID 시스템

메인 인스턴스와 서브 인스턴스는 **ID 시스템과 공통 속성을 공유하지 않으며**, 각각 독립적으로 사용자 ID를 설정할 수 있습니다.

### 3.1 초대 시스템 활용 예시

아래 예제에서는 이 특성을 활용하여, 초대받은 사용자(피초대자)와 초대한 사용자(초대자)의 이벤트를 각각 기록합니다.

```javascript
// 메인 인스턴스: 초대받은 신규 사용자
// 서브 인스턴스: 친구를 초대한 기존 사용자
ta.login("invitee");
ta.anotherInstance.login("inviter");

// 신규 사용자가 초대받은 이벤트 기록
ta.track("be_invited");

// 기존 사용자가 신규 사용자 초대 이벤트 기록
ta.anotherInstance.track("invite_new_user");
```

## 📊 4. 주요 특징 요약

| 특징 | 메인 인스턴스 | 서브 인스턴스 |
|------|---------------|---------------|
| **설정 상속** | 기본 설정 | 메인 설정 상속 (커스텀 가능) |
| **사용자 ID** | 독립적 관리 | 독립적 관리 |
| **공통 속성** | 독립적 관리 | 독립적 관리 |
| **로컬 캐시** | 기본 활성화 | 기본 비활성화 |
| **프로젝트 전송** | 메인 프로젝트 | 다른 프로젝트 가능 |

## 🎯 5. 실용적인 활용 시나리오

### 5.1 A/B 테스트 분리

```javascript
// A그룹용 인스턴스
ta.initInstance("groupA", {
  appId: "GROUP_A_APP_ID",
  serverUrl: "https://groupa-server.com/sync_js"
});

// B그룹용 인스턴스  
ta.initInstance("groupB", {
  appId: "GROUP_B_APP_ID",
  serverUrl: "https://groupb-server.com/sync_js"
});
```

### 5.2 개발/프로덕션 환경 분리

```javascript
// 디버그용 인스턴스
ta.initInstance("debug", {
  appId: "DEBUG_APP_ID",
  serverUrl: "https://debug-server.com/sync_js",
  showLog: true
});

// 프로덕션은 메인 인스턴스 사용
ta.track("production_event");

// 디버그는 서브 인스턴스 사용
ta.debug.track("debug_event");
```

다중 인스턴스를 활용하여 복잡한 추적 요구사항을 효율적으로 해결해보세요! 🚀