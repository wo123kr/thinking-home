/**
 * 세션 관리자 - 안전성 강화 버전
 * 기존 로직은 그대로 유지하되 에러 핸들링 및 안전장치 추가
 */

// 🔒 중복 초기화 방지
if (window.moduleStateManager && window.moduleStateManager.isInitialized('session-manager')) {
  console.log('⚠️ 세션 관리자는 이미 초기화되었습니다.');
} else {
  console.log('🔄 세션 관리자 초기화 시작...');
  
  // 모듈 상태 업데이트
  if (window.moduleStateManager) {
    window.moduleStateManager.markPending('session-manager');
  }

  // 🔒 안전한 세션 관리 변수들 (중복 선언 방지)
  let sessionId = window.sessionId || null;
  let sessionNumber = window.sessionNumber || parseInt(localStorage.getItem('te_session_number') || '0');
  let sessionStartTime = window.sessionStartTime || null;
  let sessionEndTime = window.sessionEndTime || null;
  let isEngagedSession = window.isEngagedSession || false;
  let interactionCount = window.interactionCount || 0;
  let lastActivityTime = window.lastActivityTime || Date.now();
  let sessionTimeout = 30 * 60 * 1000; // 30분 (기본값)
  let isSessionTrackingEnabled = true;
  
  // ✅ 전역에 안전하게 등록
  window.sessionId = sessionId;
  window.sessionNumber = sessionNumber;
  window.sessionStartTime = sessionStartTime;
  window.sessionEndTime = sessionEndTime;
  window.isEngagedSession = isEngagedSession;
  window.interactionCount = interactionCount;
  window.lastActivityTime = lastActivityTime;

  // 세션 이벤트 추적 상태
  let sessionEventsTracked = {
    session_start: false,
    session_end: false,
    session_timeout: false
  };

  // 🆕 안전한 localStorage 접근 함수
  function safeGetItem(key, defaultValue = null) {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.warn(`localStorage.getItem(${key}) 실패:`, error);
      return defaultValue;
    }
  }

  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`localStorage.setItem(${key}) 실패:`, error);
      return false;
    }
  }

  // 🆕 안전한 ThinkingData 호출 (이미 utils.js에 있지만 독립성 보장)
  function safeTrackEvent(eventName, properties = {}) {
    try {
      console.log(`🔧 이벤트 전송: ${eventName}`, properties);
      
      if (window.te && typeof window.te.track === 'function') {
        window.te.track(eventName, properties);
        console.log(`✅ 이벤트 전송 완료: ${eventName}`);
        return true;
      } else if (window.trackEvent && typeof window.trackEvent === 'function') {
        window.trackEvent(eventName, properties);
        console.log(`✅ 이벤트 전송 완료: ${eventName}`);
        return true;
      } else {
        console.warn(`ThinkingData SDK를 사용할 수 없습니다: ${eventName}`);
        return false;
      }
    } catch (error) {
      console.error(`이벤트 추적 실패 (${eventName}):`, error);
      return false;
    }
  }

  /**
   * 세션 초기화 및 시작
   */
  function initializeSession() {
    console.log('🔄 세션 초기화 시작...');
    
    // ThinkingData SDK 확인
    if (typeof window.te === 'undefined') {
      console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
      setTimeout(initializeSession, 3000);
      return;
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
    
    console.log('✅ 세션 초기화 완료');
  }

  /**
   * 새 세션 시작 (GA4/Amplitude 방식)
   */
  function startNewSession() {
    sessionId = generateSessionId();
    sessionNumber++;
    sessionStartTime = Date.now();
    sessionEndTime = null;
    isEngagedSession = false;
    interactionCount = 0;
    lastActivityTime = Date.now();
    
    // 로컬스토리지에 세션 정보 저장
    safeSetItem('te_session_id', sessionId.toString());
    safeSetItem('te_session_number', sessionNumber.toString());
    safeSetItem('te_session_start_time', sessionStartTime.toString());
    safeSetItem('te_last_activity_time', lastActivityTime.toString());
    
    // 공통 속성 업데이트
    updateSuperProperties();
    
    // 세션 시작 이벤트 전송 (GA4/Amplitude 방식)
    const sessionStartData = {
      session_id: sessionId.toString(), // 문자열로 전송
      session_number: sessionNumber,
      session_start_time: new Date(sessionStartTime).toISOString().replace('T', ' ').slice(0, 23), // "YYYY-MM-DD HH:mm:ss.SSS" 형식
      is_engaged_session: isEngagedSession,
      interaction_count: interactionCount,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer || '',
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      device_type: getDeviceType(),
      browser_info: getBrowserInfo(),
      session_timeout_minutes: Math.round(sessionTimeout / 60000)
    };
    
          safeTrackEvent('te_session_start', sessionStartData);
      sessionEventsTracked.session_start = true;
    
    console.log('🔄 새 세션 시작:', {
      sessionId,
      sessionNumber,
      startTime: new Date(sessionStartTime).toLocaleString()
    });
  }

  /**
   * 기존 세션 복원
   */
  function restoreSession(existingSessionId, existingStartTime) {
    sessionId = parseInt(existingSessionId);
    sessionStartTime = existingStartTime;
    sessionNumber = parseInt(safeGetItem('te_session_number', '1'));
    isEngagedSession = safeGetItem('te_is_engaged_session') === 'true';
    interactionCount = parseInt(safeGetItem('te_interaction_count') || '0');
    lastActivityTime = Date.now();
    
    // 로컬스토리지 업데이트
    safeSetItem('te_last_activity_time', lastActivityTime.toString());
    
    // 공통 속성 업데이트
    updateSuperProperties();
    
    console.log('🔄 기존 세션 복원:', {
      sessionId,
      sessionNumber,
      startTime: new Date(sessionStartTime).toLocaleString(),
      isEngaged: isEngagedSession
    });
  }

  /**
   * 세션 활동 업데이트
   */
  function updateSessionActivity() {
    try {
      lastActivityTime = Date.now();
      interactionCount++;
      
      // 로컬스토리지 업데이트
      safeSetItem('te_last_activity_time', lastActivityTime.toString());
      safeSetItem('te_interaction_count', interactionCount.toString());
      
      // 인게이지 세션 조건 체크 (GA4 방식)
      if (!isEngagedSession) {
        const timeSpent = Date.now() - sessionStartTime;
        if (timeSpent >= 10000 || interactionCount >= 2) { // 10초 이상 또는 2회 이상 상호작용
          isEngagedSession = true;
          safeSetItem('te_is_engaged_session', 'true');
          
          // 인게이지 세션 이벤트 전송
          safeTrackEvent('te_session_engaged', {
            session_id: sessionId.toString(), // 문자열로 전송
            session_number: sessionNumber,
            engagement_time: Math.round(timeSpent / 1000),
            interaction_count: interactionCount,
            engagement_trigger: timeSpent >= 10000 ? 'time_based' : 'interaction_based'
          });
          
          console.log('✅ 세션이 인게이지 상태가 됨');
        }
      }
    } catch (error) {
      console.error('세션 활동 업데이트 실패:', error);
    }
  }

  /**
   * 세션 타임아웃 체크
   */
  function checkSessionTimeout() {
    if (!isSessionTrackingEnabled) return;
    
    const timeSinceLastActivity = Date.now() - lastActivityTime;
    
    if (timeSinceLastActivity > sessionTimeout) {
      console.log('⏰ 세션 타임아웃 발생');
      endSession('timeout');
      startNewSession(); // 새 세션 시작
    }
  }

  /**
   * 세션 종료
   */
  function endSession(reason = 'page_exit') {
    if (!sessionId || sessionEventsTracked.session_end) return;
    
    sessionEndTime = Date.now();
    const sessionDuration = Math.round((sessionEndTime - sessionStartTime) / 1000);
    
    const sessionEndData = {
      session_id: sessionId.toString(), // 문자열로 전송
      session_number: sessionNumber,
      session_start_time: new Date(sessionStartTime).toISOString().replace('T', ' ').slice(0, 23), // "YYYY-MM-DD HH:mm:ss.SSS" 형식
      session_end_time: new Date(sessionEndTime).toISOString().replace('T', ' ').slice(0, 23), // "YYYY-MM-DD HH:mm:ss.SSS" 형식
      session_duration_seconds: sessionDuration,
      session_duration_minutes: Math.round(sessionDuration / 60 * 100) / 100,
      is_engaged_session: isEngagedSession,
      interaction_count: interactionCount,
      end_reason: reason,
      page_url: window.location.href,
      page_title: document.title,
      time_since_last_activity: Math.round((sessionEndTime - lastActivityTime) / 1000)
    };
    
          safeTrackEvent('te_session_end', sessionEndData);
      sessionEventsTracked.session_end = true;
    
    console.log('🔚 세션 종료:', {
      sessionId,
      duration: sessionDuration + '초',
      reason,
      isEngaged: isEngagedSession
    });
    
    // 세션 통계 업데이트
    updateSessionStatistics(sessionDuration);
  }

  /**
   * 세션 통계 업데이트
   */
  function updateSessionStatistics(sessionDuration) {
    // 총 세션 수 증가
    const totalSessions = parseInt(safeGetItem('te_total_sessions') || '0') + 1;
    safeSetItem('te_total_sessions', totalSessions.toString());
    
    // 총 세션 시간 누적
    const totalSessionTime = parseInt(safeGetItem('te_total_session_time') || '0') + sessionDuration;
    safeSetItem('te_total_session_time', totalSessionTime.toString());
    
    // 평균 세션 시간 계산
    const averageSessionTime = Math.round(totalSessionTime / totalSessions);
    safeSetItem('te_average_session_time', averageSessionTime.toString());
    
    // 최장 세션 시간 업데이트
    const longestSessionTime = parseInt(safeGetItem('te_longest_session_time') || '0');
    if (sessionDuration > longestSessionTime) {
      safeSetItem('te_longest_session_time', sessionDuration.toString());
    }
    
    // 인게이지 세션 수 업데이트
    if (isEngagedSession) {
      const engagedSessions = parseInt(safeGetItem('te_engaged_sessions') || '0') + 1;
      safeSetItem('te_engaged_sessions', engagedSessions.toString());
    }
  }

  /**
   * 세션 종료 추적 설정
   */
  function setupSessionEndTracking() {
    // beforeunload: 페이지 떠나기 전
    window.addEventListener('beforeunload', function() {
      endSession('page_unload');
    });
    
    // pagehide: 모바일에서 더 안정적
    window.addEventListener('pagehide', function(event) {
      if (!event.persisted) { // 브라우저 캐시에 저장되지 않는 경우만
        endSession('page_hide');
      }
    });
    
    // visibilitychange: 탭 전환 시
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // 탭이 숨겨질 때 세션 종료는 하지 않고, 활동 시간만 업데이트
        lastActivityTime = Date.now();
        safeSetItem('te_last_activity_time', lastActivityTime.toString());
      }
    });
  }

  /**
   * 세션 ID 생성 (GA4/Amplitude 방식)
   */
  function generateSessionId() {
    return Date.now(); // Epoch 시간 사용
  }

  /**
   * 공통 속성 업데이트
   */
  function updateSuperProperties() {
    if (!window.te || typeof window.te.setSuperProperties !== 'function') return;
    
    const superProperties = {
      // 세션 관련
      session_id: sessionId ? sessionId.toString() : '', // 문자열로 전송
      session_number: sessionNumber,
      session_start_time: sessionStartTime ? new Date(sessionStartTime).toISOString().replace('T', ' ').slice(0, 23) : '', // "YYYY-MM-DD HH:mm:ss.SSS" 형식
      is_engaged_session: isEngagedSession,
      interaction_count: interactionCount,
      
      // 페이지 정보
      page_host: window.location.hostname,
      page_protocol: window.location.protocol,
      page_hash: (window.location.hash || '') + '',
      page_query: (window.location.search || '') + '',
      
      // 뷰포트 정보
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      viewport_ratio: Math.round((window.innerWidth / window.innerHeight) * 100) / 100,
      
      // 디바이스 정보
      device_pixel_ratio: window.devicePixelRatio || 1,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      device_type: getDeviceType(),
      browser_info: getBrowserInfo(),
      
      // 환경 감지
      is_mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      is_touch_device: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      is_tablet: /iPad|Android|Tablet/i.test(navigator.userAgent) && window.innerWidth >= 768,
      
      // 네트워크 정보
      connection_type: navigator.connection ? navigator.connection.effectiveType : '',
      connection_downlink: navigator.connection ? navigator.connection.downlink : 0,
      is_online: navigator.onLine,
      
      // 타이밍 정보
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 23),
      local_time: new Date().toISOString().replace('T', ' ').slice(0, 23),
      
      // 성능 정보 (의미있는 지표만)
      dom_ready_state: document.readyState,
      performance_now: Math.round(performance.now()),
      connection_rtt: navigator.connection ? navigator.connection.rtt : 0, // 네트워크 지연시간
      memory_used: performance.memory && performance.memory.usedJSHeapSize ? 
          Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0 // MB 단위
    };
    
    // UTM 파라미터 추출
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
    
    window.te.setSuperProperties(nullSafeObject(superProperties));
    console.log('✅ Super properties set:', superProperties);
  }

  // null/undefined → '' 변환 유틸리티
  function nullSafeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const safe = {};
    for (const k in obj) {
      if (obj[k] === null || obj[k] === undefined) {
        safe[k] = '';
      } else {
        safe[k] = obj[k];
      }
    }
    return safe;
  }

  /**
   * 디바이스 타입 감지
   */
  function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
      if (/tablet|ipad/i.test(userAgent)) {
        return 'tablet';
      }
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * 브라우저 정보 추출
   */
  function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    let version = 'unknown';
    
    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
      version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'unknown';
    }
    
    return { browser, version };
  }

  /**
   * 세션 설정 업데이트
   */
  function updateSessionConfig(newConfig) {
    if (newConfig.sessionTimeout) {
      sessionTimeout = newConfig.sessionTimeout * 60 * 1000; // 분을 밀리초로 변환
    }
    if (newConfig.isSessionTrackingEnabled !== undefined) {
      isSessionTrackingEnabled = newConfig.isSessionTrackingEnabled;
    }
    
    console.log('🔄 세션 설정 업데이트 완료:', newConfig);
  }

  /**
   * 세션 통계 조회
   */
  function getSessionStatistics() {
    return {
      currentSession: {
        id: sessionId,
        number: sessionNumber,
        startTime: sessionStartTime,
        duration: sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 0,
        isEngaged: isEngagedSession,
        interactionCount: interactionCount
      },
      historical: {
        totalSessions: parseInt(safeGetItem('te_total_sessions') || '0'),
        totalSessionTime: parseInt(safeGetItem('te_total_session_time') || '0'),
        averageSessionTime: parseInt(safeGetItem('te_average_session_time') || '0'),
        longestSessionTime: parseInt(safeGetItem('te_longest_session_time') || '0'),
        engagedSessions: parseInt(safeGetItem('te_engaged_sessions') || '0')
      },
      settings: {
        sessionTimeout: Math.round(sessionTimeout / 60000),
        isTrackingEnabled: isSessionTrackingEnabled
      }
    };
  }

  /**
   * 디버깅용 함수
   */
  function debugSession() {
    console.log('🔄 세션 디버깅 정보:');
    console.log('- 현재 세션:', {
      id: sessionId,
      number: sessionNumber,
      startTime: sessionStartTime ? new Date(sessionStartTime).toLocaleString() : null,
      duration: sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) + '초' : null,
      isEngaged: isEngagedSession,
      interactionCount: interactionCount
    });
    console.log('- 세션 통계:', getSessionStatistics());
    console.log('- 세션 이벤트 추적 상태:', sessionEventsTracked);
    console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
  }

  // 🆕 전역 함수로 노출 (기존 + 새로운 안전한 함수들)
  window.updateSessionActivity = updateSessionActivity;
  window.endSession = endSession;
  window.updateSessionConfig = updateSessionConfig;
  window.getSessionStatistics = getSessionStatistics;
  window.debugSession = debugSession;

  // 🆕 세션 관리자 상태 표시
  console.log('✅ 세션 관리자 초기화 완료 (안전성 강화)');
  console.log('📊 현재 세션 상태:', getSessionStatus());
  
  // 모듈 상태 업데이트
  if (window.moduleStateManager) {
    window.moduleStateManager.markInitialized('session-manager');
  }
}