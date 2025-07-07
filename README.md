# ThinkingData 웹 추적 시스템

Webflow용 ThinkingData 추적 시스템입니다. 50,000자 제한을 우회하기 위해 CDN으로 배포할 수 있도록 모듈화되어 있습니다.

## 🚀 사용법

### 1. GitHub에 업로드
1. 이 프로젝트를 GitHub 저장소에 업로드
2. 저장소를 public으로 설정

### 2. Webflow에 적용
Webflow의 Custom Code 섹션에 다음 코드를 추가:

```html
<!-- ThinkingData 웹 추적 시스템 -->
<script src="https://cdn.jsdelivr.net/gh/[YOUR_USERNAME]/webpage-thinking@main/index.js"></script>
```

`[YOUR_USERNAME]`을 실제 GitHub 사용자명으로 변경하세요.

## 📁 프로젝트 구조

```
webpage-thinking/
├── index.js                 # 메인 진입점
├── core/
│   ├── thinking-data-init.js    # ThinkingData SDK 초기화
│   └── session-manager.js       # 세션 관리
├── tracking/
│   ├── page-view.js         # 페이지 뷰 추적
│   ├── click.js             # 클릭 이벤트 추적
│   ├── scroll.js            # 스크롤 깊이 추적
│   ├── form.js              # 폼 제출 추적
│   ├── popup.js             # 팝업 추적
│   ├── video.js             # 비디오 추적
│   ├── resource.js          # 리소스 다운로드 추적
│   └── exit.js              # 페이지 종료 추적
└── user-attributes.js       # 유저 속성 추적 시스템
```

## 🔧 주요 기능

### 📊 기본 추적
- **페이지 뷰**: 자동 페이지 진입 추적
- **클릭 이벤트**: 버튼, 링크, 메뉴 클릭 추적
- **스크롤 깊이**: 25%, 50%, 75%, 90%, 100% 도달 추적
- **폼 제출**: 개인정보 마스킹 처리된 폼 제출 추적
- **팝업 상호작용**: 팝업 표시/닫기 추적
- **비디오 시청**: YouTube 비디오 시청 패턴 추적
- **리소스 다운로드**: PDF, 문서 등 다운로드 추적
- **페이지 종료**: 체류시간, 종료 방식 추적

### 👤 유저 속성 추적
- **방문자 생명주기**: Awareness → Consideration → Decision
- **참여도 수준**: Low, Medium, High
- **콘텐츠 선호도**: 관심 주제, 선호 깊이
- **시간 패턴**: 선호 방문 시간대, 요일
- **유입 소스**: UTM 파라미터, 리퍼러 추적

### 🔄 세션 관리
- **세션 자동 관리**: 30분 타임아웃
- **인게이지 세션**: 10초 이상 또는 2회 이상 상호작용
- **세션 복원**: 브라우저 새로고침 시 세션 유지

## 📈 추적 이벤트 목록

### 기본 이벤트
- `te_page_view`: 페이지 진입
- `te_session_start`: 세션 시작
- `te_element_click`: 요소 클릭
- `te_menu_click`: 메뉴 클릭
- `te_outbound_link_click`: 외부 링크 클릭
- `te_scroll_depth`: 스크롤 깊이 도달
- `te_form_submit`: 폼 제출
- `popup_shown`: 팝업 표시
- `popup_action`: 팝업 상호작용
- `video_play`: 비디오 재생
- `video_pause`: 비디오 일시정지
- `video_complete`: 비디오 완료
- `resource_download`: 리소스 다운로드
- `te_page_exit`: 페이지 종료

### 유저 속성
- `first_visit_timestamp`: 최초 방문 시점
- `total_sessions`: 총 세션 수
- `engagement_level`: 참여도 수준
- `visitor_lifecycle_stage`: 생명주기 단계
- `interested_topics`: 관심 주제
- `preferred_visit_time`: 선호 방문 시간대

## ⚙️ 설정

### ThinkingData 설정
`core/thinking-data-init.js`에서 다음 설정을 변경하세요:

```javascript
var config = {
  appId: "YOUR_APP_ID",  // 실제 App ID로 변경
  serverUrl: "https://te-receiver-naver.thinkingdata.kr/sync_js",
  autoTrack: {
    pageShow: true,
    pageHide: true
  }
};
```

### 세션 타임아웃 설정
`core/session-manager.js`에서 세션 타임아웃을 조정할 수 있습니다:

```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분 (밀리초)
```

## 🔒 개인정보 보호

- **이메일 마스킹**: `a***@g***.com` 형태
- **전화번호 마스킹**: `010-****-1234` 형태
- **이름 마스킹**: `김***철` 형태
- **민감한 필드 자동 제외**: password, ssn, birthday 등

## 🌐 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📝 로그 확인

브라우저 개발자 도구 콘솔에서 다음 로그를 확인할 수 있습니다:

```
✅ ThinkingData SDK initialized
✅ Session started
✅ Super properties set
✅ All tracking events initialized
✅ User Attribute Tracking System initialized
```

## 🚨 주의사항

1. **GitHub 저장소**: 반드시 public 저장소여야 CDN 접근이 가능합니다.
2. **App ID**: 실제 ThinkingData 프로젝트의 App ID로 변경해야 합니다.
3. **도메인 설정**: ThinkingData 콘솔에서 도메인을 등록해야 합니다.
4. **개인정보**: 민감한 개인정보는 자동으로 마스킹되지만, 추가 검토가 필요합니다.

## 🔄 업데이트

코드 수정 후 GitHub에 푸시하면 CDN이 자동으로 업데이트됩니다. 캐시 지연이 있을 수 있으니 몇 분 후 확인하세요.

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 브라우저 콘솔 에러 메시지
2. 네트워크 탭에서 요청 실패 여부
3. ThinkingData 콘솔에서 이벤트 수신 여부

---

**Made with ❤️ for ThinkingData** 