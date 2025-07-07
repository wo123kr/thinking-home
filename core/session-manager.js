/**
 * 세션 관리 및 공통 속성 설정
 */

// 세션 관리 변수
let sessionId = null;
let sessionNumber = parseInt(localStorage.getItem('te_session_number') || '0');
let sessionStartTime = null;
let isEngagedSession = false;
let interactionCount = 0;
let lastActivityTime = Date.now();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분 (웹 기준)

// 세션 ID 생성
function generateSessionId() {
  return Date.now(); // Epoch 시간 사용 (Amplitude 권장)
}

// 세션 시작
function startSession() {
  sessionId = generateSessionId();
  sessionNumber++;
  sessionStartTime = Date.now();
  isEngagedSession = false;
  interactionCount = 0;
  localStorage.setItem('te_session_number', sessionNumber.toString());
  localStorage.setItem('te_session_id', sessionId.toString());
  localStorage.setItem('te_session_start_time', sessionStartTime.toString());
  
  // 공통 속성 업데이트 (새 세션 정보 반영)
  setSuperProperties();
  
  // 세션 시작 이벤트 전송
  te.track('te_session_start', {
    session_id: sessionId,
    session_number: sessionNumber,
    is_engaged_session: isEngagedSession
  });
  
  console.log('✅ Session started:', sessionId, 'Session Number:', sessionNumber);
}

// 세션 활동 업데이트
function updateSessionActivity() {
  lastActivityTime = Date.now();
  interactionCount++;
  
  // 인게이지 세션 조건: 10초 이상 또는 2회 이상 상호작용
  if (!isEngagedSession) {
    const timeSpent = Date.now() - sessionStartTime;
    if (timeSpent >= 10000 || interactionCount >= 2) {
      isEngagedSession = true;
      console.log('✅ Session became engaged');
    }
  }
}

// 세션 만료 체크
function checkSessionExpiry() {
  if (Date.now() - lastActivityTime > SESSION_TIMEOUT) {
    startSession(); // 새 세션 시작
  }
}

// 기존 세션 복원 또는 새 세션 시작
function initializeSession() {
  const storedSessionId = localStorage.getItem('te_session_id');
  const storedStartTime = localStorage.getItem('te_session_start_time');
  
  if (storedSessionId && storedStartTime) {
    const timeSinceStart = Date.now() - parseInt(storedStartTime);
    if (timeSinceStart < SESSION_TIMEOUT) {
      // 기존 세션 복원
      sessionId = parseInt(storedSessionId);
      sessionStartTime = parseInt(storedStartTime);
      sessionNumber = parseInt(localStorage.getItem('te_session_number') || '1');
      console.log('✅ Session restored:', sessionId, 'Session Number:', sessionNumber);
    } else {
      startSession(); // 새 세션 시작
    }
  } else {
    startSession(); // 새 세션 시작
  }
}

// 공통 속성 설정 (모든 이벤트에 자동 추가)
function setSuperProperties() {
  const superProperties = {
    // 세션 관련 (커스텀)
    session_id: sessionId,
    session_number: sessionNumber,
    
    // 페이지 정보 (SDK 자동수집 #url, #url_path, #title과 별개)
    page_host: window.location.hostname,
    page_protocol: window.location.protocol,
    page_hash: window.location.hash || '',
    page_query: window.location.search || '',
    
    // 뷰포트 정보 (SDK의 #screen_width/height와 다름 - 실제 브라우저 창 크기)
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    viewport_ratio: Math.round((window.innerWidth / window.innerHeight) * 100) / 100,
    
    // 디바이스 정보 (SDK 자동수집 외 추가 정보)
    device_pixel_ratio: window.devicePixelRatio || 1,
    orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    
    // 환경 감지 (SDK에서 제공하지 않는 정보)
    is_mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    is_touch_device: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    is_tablet: /iPad|Android|Tablet/i.test(navigator.userAgent) && window.innerWidth >= 768,
    
    // 브라우저 기능 지원 (기술적 제약사항)
    local_storage_enabled: (function() {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })(),
    cookies_enabled: navigator.cookieEnabled,
    webgl_enabled: (function() {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    })(),
    
    // 네트워크 정보 (지원하는 브라우저만)
    connection_type: navigator.connection ? navigator.connection.effectiveType : '',
    connection_downlink: navigator.connection ? navigator.connection.downlink : '',
    is_online: navigator.onLine,
    
    // 타이밍 정보
    timestamp: Date.now(),
    local_time: new Date().toISOString(),
    
    // 성능 정보 (의미있는 지표만)
    dom_ready_state: document.readyState,
    performance_now: Math.round(performance.now()),
    connection_rtt: navigator.connection ? navigator.connection.rtt : '', // 네트워크 지연시간
    memory_used: performance.memory && performance.memory.usedJSHeapSize ? 
      Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : '' // MB 단위
  };
  
  // UTM 파라미터 추출 (마케팅 캠페인 추적 - SDK #utm과 별개)
  const urlParams = new URLSearchParams(window.location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'].forEach(function(param) {
    const value = urlParams.get(param);
    if (value) {
      superProperties[param] = value;
    }
  });
  
  // 커스텀 추적 ID들
  ['gclid', 'fbclid', 'msclkid', '_ga'].forEach(function(param) {
    const value = urlParams.get(param);
    if (value) {
      superProperties[param] = value;
    }
  });
  
  te.setSuperProperties(superProperties);
  console.log('✅ Super properties set:', superProperties);
}

// 세션 초기화
initializeSession();
setSuperProperties();

// 주기적으로 세션 만료 체크
setInterval(checkSessionExpiry, 60000); // 1분마다 체크