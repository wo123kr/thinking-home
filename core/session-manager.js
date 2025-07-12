/**
 * 세션 관리자 - ThinkingData 추적 시스템용
 * 세션 생성, 유지, 종료 및 관련 이벤트 전송을 담당
 */

import { trackEvent, addBotInfoToEvent, addTETimeProperties, trackingLog, updateSuperPropertiesWithSession } from './utils.js';

// 초기화 상태 추적
let isInitialized = false;
let initializationPromise = null;

// 세션 변수들 (모듈 내부 캡슐화)
let sessionId = null;
let sessionNumber = parseInt(safeGetItem('te_session_number') || '0');
let sessionStartTime = null;
let sessionEndTime = null;
let isEngagedSession = false;
let interactionCount = 0;
let lastActivityTime = Date.now();
let sessionTimeout = 30 * 60 * 1000; // 30분 (웹 기준)
let isSessionTrackingEnabled = true;

// 세션 이벤트 추적 (중복 전송 방지)
const sessionEventsTracked = {
  session_start: false,
  session_end: false,
  session_engaged: false
};

// 무한 재귀 방지를 위한 플래그
let isUpdatingSession = false;

// 안전한 로컬스토리지 접근
function safeGetItem(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
  } catch (e) {
    console.warn(`로컬스토리지 읽기 실패 (${key}):`, e);
    return defaultValue;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.warn(`로컬스토리지 쓰기 실패 (${key}):`, e);
    return false;
  }
}

// 안전한 이벤트 전송
function safeTrackEvent(eventName, properties = {}) {
  try {
    if (typeof window.te !== 'undefined' && window.te.track) {
      window.te.track(eventName, properties);
      return true;
    } else {
      console.warn('ThinkingData SDK가 로드되지 않음');
      return false;
    }
  } catch (e) {
    console.error('이벤트 전송 실패:', e);
    return false;
  }
}

/**
 * 세션 초기화 및 시작
 * @param {Object} config - 세션 설정
 * @returns {Promise} 초기화 완료 Promise
 */
function initializeSession(config = {}) {
  // 설정 적용
  if (config.timeout) {
    sessionTimeout = config.timeout;
  }
  
  if (isInitialized) {
    trackingLog('🔄 세션 관리자가 이미 초기화됨');
    return Promise.resolve();
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = new Promise((resolve, reject) => {
    trackingLog('🔄 세션 관리자 초기화 시작...');

    // ThinkingData SDK 확인 및 재시도 로직
    function checkAndInitialize() {
      if (typeof window.te === 'undefined') {
        console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
        setTimeout(checkAndInitialize, 3000);
        return;
      }

      try {
        // ✅ 세션 번호 초기화 검증
        const storedSessionNumber = safeGetItem('te_session_number');
        if (storedSessionNumber !== null) {
          const parsedNumber = parseInt(storedSessionNumber);
          if (!isNaN(parsedNumber) && parsedNumber >= 0) {
            sessionNumber = parsedNumber;
            trackingLog(`📊 기존 세션 번호 복원: ${sessionNumber}`);
          } else {
            console.warn('⚠️ 잘못된 세션 번호 발견, 0으로 리셋:', storedSessionNumber);
            sessionNumber = 0;
            safeSetItem('te_session_number', '0');
          }
        } else {
          trackingLog('📊 최초 방문자, 세션 번호 0으로 시작');
          sessionNumber = 0;
          safeSetItem('te_session_number', '0');
        }

        const storedSessionId = safeGetItem('te_session_id');
        const storedStartTime = safeGetItem('te_session_start_time');
        const storedLastActivity = safeGetItem('te_last_activity_time');

        // 기존 세션 복원 또는 새 세션 시작
        if (storedSessionId && storedStartTime && storedLastActivity) {
          const timeSinceStart = Date.now() - parseInt(storedStartTime);
          const timeSinceLastActivity = Date.now() - parseInt(storedLastActivity);

          // 세션 타임아웃 체크
          if (timeSinceLastActivity < sessionTimeout && timeSinceStart < sessionTimeout * 2) {
            // 기존 세션 복원
            restoreSession(storedSessionId, parseInt(storedStartTime));
          } else {
            // 세션 만료 - 새 세션 시작
            startNewSession();
          }
        } else {
          // 최초 방문 - 새 세션 시작
          startNewSession();
        }

        // 세션 타임아웃 체크 주기 설정
        setInterval(checkSessionTimeout, 60000); // 1분마다 체크

        // 페이지 종료 시 세션 종료 이벤트 전송
        setupSessionEndTracking();

        // 전역 함수 등록 (중복 등록 방지)
        if (!window.updateSessionActivity) {
          window.updateSessionActivity = updateSessionActivity;
        }
        if (!window.endSession) {
          window.endSession = endSession;
        }

        isInitialized = true;
        trackingLog('✅ 세션 관리자 초기화 완료 (안전성 강화)');
        resolve();
      } catch (error) {
        console.error('세션 초기화 실패:', error);
        reject(error);
      }
    }

    checkAndInitialize();
  });

  return initializationPromise;
}

/**
 * 새 세션 시작 (GA4/Amplitude 방식)
 */
function startNewSession() {
  const now = Date.now();
  sessionId = generateSessionId();
  
  // ✅ 세션 번호 증가 (안전한 방식)
  const previousSessionNumber = sessionNumber;
  sessionNumber = previousSessionNumber + 1;
  
  sessionStartTime = now;
  isEngagedSession = false;
  interactionCount = 0;
  lastActivityTime = now;

  // 세션 정보 저장
  safeSetItem('te_session_id', sessionId.toString());
  safeSetItem('te_session_number', sessionNumber.toString());
  safeSetItem('te_session_start_time', sessionStartTime.toString());
  safeSetItem('te_last_activity_time', lastActivityTime.toString());
  safeSetItem('te_is_engaged_session', isEngagedSession.toString());

  // 🪪 세션 정보로 슈퍼 프로퍼티 갱신
  updateSuperPropertiesWithSession(sessionId, sessionNumber);

  // 세션 시작 이벤트 데이터 준비
  const sessionStartData = {
    session_id: sessionId,
    session_number: sessionNumber,
    is_engaged_session: isEngagedSession,
    session_start_time: sessionStartTime,
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer || '',
    user_agent: navigator.userAgent,
    device_type: getDeviceType(),
    browser_info: getBrowserInfo()
  };

  // 봇 정보 추가
  const sessionStartDataWithBot = addBotInfoToEvent(sessionStartData);
  
  // TE 시간 형식 속성 추가
  const sessionStartDataWithTETime = addTETimeProperties(sessionStartDataWithBot);

  // 세션 시작 이벤트 전송
  safeTrackEvent('te_session_start', sessionStartDataWithTETime);

      trackingLog('✅ 새 세션 시작:', {
    sessionId,
    sessionNumber,
    previousSessionNumber, // ✅ 이전 세션 번호도 로그에 포함
    isBot: sessionStartDataWithTETime.is_bot,
    botType: sessionStartDataWithTETime.bot_type,
    sessionStartTimeTE: sessionStartDataWithTETime.session_start_time_te
  });

  // 세션 통계 업데이트
  updateSessionStatistics(0);
}

/**
 * 기존 세션 복원
 */
function restoreSession(existingSessionId, existingStartTime) {
  sessionId = parseInt(existingSessionId);
  sessionStartTime = parseInt(existingStartTime);
  sessionNumber = parseInt(safeGetItem('te_session_number') || '0');
  isEngagedSession = safeGetItem('te_is_engaged_session') === 'true';
  interactionCount = 0;
  lastActivityTime = Date.now();
  
  // 🪪 세션 정보로 슈퍼 프로퍼티 갱신
  updateSuperPropertiesWithSession(sessionId, sessionNumber);
  
  // 로컬스토리지 업데이트
  safeSetItem('te_last_activity_time', lastActivityTime.toString());
  
  // 세션 시작 시 날짜/UTM/사용자 체크
  checkDateChange();
  checkUtmChange();
  checkUserChange();

      trackingLog('🔄 기존 세션 복원:', {
    sessionId,
    sessionNumber,
    startTime: new Date(sessionStartTime).toLocaleString(),
    duration: Math.round((Date.now() - sessionStartTime) / 1000) + '초'
  });
}

/**
 * 세션 활동 업데이트
 */
function updateSessionActivity() {
  // 무한 재귀 방지
  if (isUpdatingSession || !isSessionTrackingEnabled) {
    return;
  }
  
  isUpdatingSession = true;
  
  try {
    lastActivityTime = Date.now();
    interactionCount++;
    
    // 로컬스토리지 업데이트
    safeSetItem('te_last_activity_time', lastActivityTime.toString());
    
    // 인게이지 세션 조건: 10초 이상 또는 2회 이상 상호작용
    if (!isEngagedSession) {
      const timeSpent = Date.now() - sessionStartTime;
      if (timeSpent >= 10000 || interactionCount >= 2) {
        isEngagedSession = true;
        safeSetItem('te_is_engaged_session', 'true');
        
        // 인게이지 세션 이벤트 전송 (중복 방지)
        if (!sessionEventsTracked.session_engaged) {
          safeTrackEvent('te_session_engaged', {
            session_id: sessionId,
            session_number: sessionNumber,
            time_to_engage: Math.round(timeSpent / 1000),
            interaction_count: interactionCount
          });
          sessionEventsTracked.session_engaged = true;
        }
      }
    }

    // 세션 시작 시 날짜/UTM/사용자 체크
    checkDateChange();
    checkUtmChange();
    checkUserChange();
  } finally {
    isUpdatingSession = false;
  }
}

/**
 * 세션 타임아웃 체크
 */
function checkSessionTimeout() {
  if (!isSessionTrackingEnabled) return;
  
  const now = Date.now();
  if (now - lastActivityTime > sessionTimeout) {
    // 세션 만료 - 종료 이벤트 전송 후 새 세션 시작
    endSession('timeout');
    startNewSession();
  }
}

/**
 * 세션 종료
 */
function endSession(reason = 'page_exit') {
  if (!isInitialized || !sessionId || sessionEventsTracked.session_end) {
    return;
  }
  
  const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
  sessionEndTime = Date.now();
  
  // 세션 종료 이벤트 전송
  safeTrackEvent('te_session_end', {
    session_id: sessionId,
    session_number: sessionNumber,
    session_duration: sessionDuration,
    is_engaged_session: isEngagedSession,
    interaction_count: interactionCount,
    end_reason: reason
  });
  
  // 세션 통계 업데이트
  updateSessionStatistics(sessionDuration);
  
  sessionEventsTracked.session_end = true;
  
  console.log('🔄 세션 종료:', {
    sessionId,
    duration: sessionDuration + '초',
    reason
  });
}

/**
 * 세션 통계 업데이트
 */
function updateSessionStatistics(sessionDuration) {
  try {
    // 총 세션 수 증가
    const totalSessions = parseInt(safeGetItem('te_total_sessions') || '0') + 1;
    safeSetItem('te_total_sessions', totalSessions.toString());
    
    // 총 세션 시간 누적
    const totalSessionTime = parseInt(safeGetItem('te_total_session_time') || '0') + sessionDuration;
    safeSetItem('te_total_session_time', totalSessionTime.toString());
    
    // 평균 세션 시간 계산
    const averageSessionTime = Math.round(totalSessionTime / totalSessions);
    safeSetItem('te_average_session_time', averageSessionTime.toString());
    
    // 최장 세션 시간 갱신
    const longestSessionTime = parseInt(safeGetItem('te_longest_session_time') || '0');
    if (sessionDuration > longestSessionTime) {
      safeSetItem('te_longest_session_time', sessionDuration.toString());
    }
    
    // 인게이지 세션 수 증가
    if (isEngagedSession) {
      const engagedSessions = parseInt(safeGetItem('te_engaged_sessions') || '0') + 1;
      safeSetItem('te_engaged_sessions', engagedSessions.toString());
    }
  } catch (error) {
    console.warn('세션 통계 업데이트 실패:', error);
  }
}

/**
 * 페이지 종료 시 세션 종료 이벤트 전송 설정
 */
function setupSessionEndTracking() {
  // beforeunload: 페이지 떠나기 전
  window.addEventListener('beforeunload', function() {
    endSession('page_exit');
  });
  
  // visibilitychange: 탭 전환 등
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // 페이지가 숨겨질 때 세션 활동 시간 업데이트
      lastActivityTime = Date.now();
      safeSetItem('te_last_activity_time', lastActivityTime.toString());
    }
  });
  
  // pagehide: 모바일에서 더 안정적
  window.addEventListener('pagehide', function() {
    endSession('page_hide');
  });
}

/**
 * 세션 ID 생성
 */
function generateSessionId() {
  return Date.now(); // Epoch 시간 사용
}

/**
 * 공통 속성 업데이트
 */
function updateSuperProperties() {
  try {
    const superProperties = {
      // 세션 관련 (커스텀)
      session_id: sessionId,
      session_number: sessionNumber,
      
      // 페이지 정보 (SDK 자동수집 #url, #url_path, #title과 별개)
      page_host: window.location.hostname,
      page_protocol: window.location.protocol,
      page_hash: window.location.hash || null,
      page_query: window.location.search || null,
      
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
      connection_type: navigator.connection ? navigator.connection.effectiveType : null,
      connection_downlink: navigator.connection ? navigator.connection.downlink : null,
      is_online: navigator.onLine,
      
      // 타이밍 정보
      timestamp: Date.now(),
      local_time: new Date().toISOString(),
      
      // 성능 정보 (의미있는 지표만)
      dom_ready_state: document.readyState,
      performance_now: Math.round(performance.now()),
      connection_rtt: navigator.connection ? navigator.connection.rtt : null, // 네트워크 지연시간
      memory_used: performance.memory && performance.memory.usedJSHeapSize ? 
        Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : null // MB 단위
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
    
    // TE 시간 형식 속성 추가
    const superPropertiesWithTETime = addTETimeProperties(superProperties);
    
    window.te.setSuperProperties(superPropertiesWithTETime);
    console.log('✅ 공통 속성 업데이트 완료 (TE 시간 형식 포함)');
  } catch (error) {
    console.error('공통 속성 업데이트 실패:', error);
  }
}

/**
 * 디바이스 타입 감지
 */
function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    if (screenWidth >= 768 && screenHeight >= 1024) {
      return 'tablet';
    }
    return 'mobile';
  }
  return 'desktop';
}

/**
 * 브라우저 정보 수집
 */
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browser = 'unknown';
  let version = 'unknown';

  // 브라우저 감지
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
    browser = 'Internet Explorer';
    version = userAgent.match(/MSIE (\d+)/)?.[1] || userAgent.match(/rv:(\d+)/)?.[1] || 'unknown';
  }

  return {
    name: browser,
    version: version,
    user_agent: userAgent
  };
}

/**
 * 세션 설정 업데이트
 */
function updateSessionConfig(newConfig) {
  if (newConfig.timeout) {
    sessionTimeout = newConfig.timeout;
  }
  if (typeof newConfig.enabled === 'boolean') {
    isSessionTrackingEnabled = newConfig.enabled;
  }
  console.log('✅ 세션 설정 업데이트:', newConfig);
}

/**
 * 세션 통계 조회
 */
function getSessionStatistics() {
  return {
    current_session: {
      id: sessionId,
      number: sessionNumber,
      start_time: sessionStartTime,
      is_engaged: isEngagedSession,
      interaction_count: interactionCount,
      duration: sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0
    },
    total_sessions: parseInt(safeGetItem('te_total_sessions') || '0'),
    total_session_time: parseInt(safeGetItem('te_total_session_time') || '0'),
    average_session_time: parseInt(safeGetItem('te_average_session_time') || '0'),
    longest_session_time: parseInt(safeGetItem('te_longest_session_time') || '0'),
    engaged_sessions: parseInt(safeGetItem('te_engaged_sessions') || '0')
  };
}

/**
 * 디버깅용 함수
 */
function debugSession() {
  console.log('🔄 세션 디버깅 정보:');
  console.log('- 초기화 상태:', isInitialized);
  console.log('- 세션 ID:', sessionId);
  console.log('- 세션 번호:', sessionNumber);
  console.log('- localStorage 세션 번호:', safeGetItem('te_session_number'));
  console.log('- 세션 시작 시간:', sessionStartTime ? new Date(sessionStartTime).toLocaleString() : '없음');
  console.log('- 인게이지 세션:', isEngagedSession);
  console.log('- 상호작용 수:', interactionCount);
  console.log('- 마지막 활동 시간:', new Date(lastActivityTime).toLocaleString());
  console.log('- 세션 타임아웃:', Math.round(sessionTimeout / 60000) + '분');
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
  
  // ✅ 추가 디버깅 정보
  console.log('- localStorage 전체 세션 관련 키들:');
  ['te_session_id', 'te_session_number', 'te_session_start_time', 'te_last_activity_time', 'te_is_engaged_session'].forEach(key => {
    console.log(`  ${key}:`, safeGetItem(key));
  });
}

// 세션 관리자 API
const sessionManager = {
  initialize: initializeSession,
  updateActivity: updateSessionActivity,
  endSession: endSession,
  getStatistics: getSessionStatistics,
  updateConfig: updateSessionConfig,
  debug: debugSession
};

// 브라우저 환경에서만 전역 등록 (중복 방지)
if (typeof window !== 'undefined' && !window.sessionManager) {
  window.sessionManager = sessionManager;
  
  // ✅ 추가 디버깅 함수들
  window.debugSessionNumber = function() {
    console.log('🔍 세션 번호 디버깅:');
    console.log('- 메모리 세션 번호:', sessionNumber);
    console.log('- localStorage 세션 번호:', safeGetItem('te_session_number'));
    console.log('- 세션 ID:', sessionId);
    console.log('- 세션 시작 시간:', sessionStartTime ? new Date(sessionStartTime).toLocaleString() : '없음');
    
    // localStorage 전체 확인
    console.log('- localStorage 전체 내용:');
    Object.keys(localStorage).filter(key => key.startsWith('te_')).forEach(key => {
      console.log(`  ${key}:`, localStorage.getItem(key));
    });
  };
  
  window.resetSessionNumber = function() {
    console.log('🔄 세션 번호 리셋...');
    sessionNumber = 0;
    safeSetItem('te_session_number', '0');
    console.log('✅ 세션 번호가 0으로 리셋되었습니다.');
  };
  
  window.forceNewSession = function() {
    console.log('🔄 강제 새 세션 시작...');
    endSession('manual_reset');
    startNewSession();
    console.log('✅ 새 세션이 시작되었습니다. 세션 번호:', sessionNumber);
  };
}

/**
 * 세션 초기화 함수 (외부 노출용)
 * @param {Object} config - 세션 설정
 * @returns {Promise} 초기화 완료 Promise
 */
export async function initSession(config = {}) {
  return initializeSession(config);
}

// 기타 함수 내보내기
export { updateSessionActivity, endSession, getSessionStatistics };

// UTM 파라미터 변경 감지
function checkUtmChange() {
  const urlParams = new URLSearchParams(window.location.search);
  const currentUtm = urlParams.get('utm_source') || urlParams.get('utm_medium') || urlParams.get('utm_campaign');
  const previousUtm = safeGetItem('te_previous_utm');
  if (currentUtm && previousUtm && currentUtm !== previousUtm) {
    endSession('utm_change');
    startNewSession();
  }
  if (currentUtm) {
    safeSetItem('te_previous_utm', currentUtm);
  }
}

// 사용자 ID 변경 감지
function checkUserChange() {
  if (!window.te || !window.te.getDistinctId) return;
  const currentUser = window.te.getDistinctId();
  const previousUser = safeGetItem('te_previous_user');
  if (previousUser && currentUser !== previousUser) {
    endSession('user_change');
    startNewSession();
  }
  if (currentUser) {
    safeSetItem('te_previous_user', currentUser);
  }
}

// 날짜 변경 감지 및 기록 (세션 분리 X, 이벤트만 기록)
function checkDateChange() {
  const currentDate = new Date().toISOString().split('T')[0];
  const sessionDate = safeGetItem('te_session_date');
  if (sessionDate && currentDate !== sessionDate) {
    // 날짜가 바뀌었지만 세션은 유지
    safeTrackEvent('te_date_change_in_session', {
      session_id: sessionId,
      previous_date: sessionDate,
      current_date: currentDate,
      session_duration_so_far: Math.round((Date.now() - sessionStartTime) / 1000)
    });
    // 세션 속성에 날짜 변경 표시 추가
    if (window.te && window.te.userSetOnce) {
      window.te.userSetOnce({ has_date_change: true });
    }
  }
  safeSetItem('te_session_date', currentDate);
}