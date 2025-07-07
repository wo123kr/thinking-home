/**
 * 페이지 종료 추적 모듈 - ThinkingData 홈페이지 최적화
 */

// 페이지 종료 추적 초기화
function initializePageExitTracking() {
  console.log('🚪 페이지 종료 추적 초기화 시작...');
  
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(initializePageExitTracking, 3000);
    return;
  }
  
  let pageStartTime = Date.now();
  let isPageVisible = !document.hidden;
  let totalVisibleTime = 0;
  let lastVisibilityChange = Date.now();
  let exitEventsSent = new Set(); // 중복 전송 방지
  let isInitialized = false;

  // 페이지 가시성 변경 추적
  function handleVisibilityChange() {
    const now = Date.now();
    
    if (document.hidden) {
      // 페이지가 숨겨짐 (탭 변경, 최소화, 다른 앱으로 전환)
      if (isPageVisible) {
        totalVisibleTime += now - lastVisibilityChange;
        isPageVisible = false;
        
        trackEvent('te_page_visibility_change', {
          visibility_state: 'hidden',
          total_visible_time: Math.round(totalVisibleTime / 1000), // 초 단위
          session_duration: Math.round((now - pageStartTime) / 1000),
          exit_reason: 'visibility_hidden',
          page_url: window.location.href,
          page_title: document.title,
          // ThinkingData 홈페이지 특화 정보
          page_section: getPageSection(),
          page_category: getPageCategory(),
          user_engagement_level: getUserEngagementLevel()
        });
        console.log('🚪 페이지 숨김 추적:', Math.round(totalVisibleTime / 1000), '초');
      }
    } else {
      // 페이지가 다시 보임
      isPageVisible = true;
      lastVisibilityChange = now;
      
      trackEvent('te_page_visibility_change', {
        visibility_state: 'visible',
        total_visible_time: Math.round(totalVisibleTime / 1000),
        session_duration: Math.round((now - pageStartTime) / 1000),
        exit_reason: 'page_returned',
        page_url: window.location.href,
        page_title: document.title,
        page_section: getPageSection(),
        page_category: getPageCategory()
      });
      console.log('🚪 페이지 복귀 추적');
    }
    
    // 기존 세션 활동 업데이트
    if (!document.hidden && typeof window.updateSessionActivity === 'function') {
      window.updateSessionActivity();
    }
  }

  // ThinkingData 홈페이지 섹션 감지
  function getPageSection() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') return 'home';
    if (path.includes('/blog')) return 'blog';
    if (path.includes('/user-case')) return 'user_case';
    if (path.includes('/company')) return 'company';
    if (path.includes('/culture')) return 'culture';
    if (path.includes('/news')) return 'news';
    if (path.includes('/solution')) return 'solution';
    if (path.includes('/feature')) return 'feature';
    if (path.includes('/form-demo')) return 'demo_form';
    if (path.includes('/form-ask')) return 'contact_form';
    
    return 'other';
  }

  // 페이지 카테고리 분류
  function getPageCategory() {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') return 'landing';
    if (path.includes('/blog') || path.includes('/user-case')) return 'content';
    if (path.includes('/company') || path.includes('/culture') || path.includes('/news')) return 'company';
    if (path.includes('/solution') || path.includes('/feature')) return 'product';
    if (path.includes('/form-')) return 'conversion';
    
    return 'other';
  }

  // 사용자 참여도 수준 판단
  function getUserEngagementLevel() {
    // 스크롤 깊이, 클릭 수, 체류 시간 등을 종합적으로 판단
    const scrollDepth = window.maxScrollDepth || 0;
    const clickCount = window.interactionCount || 0;
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000);
    
    let score = 0;
    score += Math.min(scrollDepth / 10, 10); // 스크롤 깊이당 0.1점, 최대 10점
    score += Math.min(clickCount * 2, 20); // 클릭당 2점, 최대 20점
    score += Math.min(timeSpent / 30, 20); // 30초당 1점, 최대 20점
    
    if (score >= 30) return 'high';
    if (score >= 10) return 'medium';
    return 'low';
  }

  // 페이지 종료 이벤트 전송 (중복 방지)
  function sendExitEvent(eventName, exitData) {
    console.log(`🚪 ${eventName} 전송 시도:`, exitData);
    
    if (exitEventsSent.has(eventName)) {
      console.log(`🚪 ${eventName} 이미 전송됨, 중복 방지`);
      return;
    }
    
    exitEventsSent.add(eventName);
    
    try {
      // 1. 일반 trackEvent 시도
      trackEvent(eventName, exitData);
      console.log(`✅ ${eventName} trackEvent 전송 완료`);
    } catch (e) {
      console.warn(`❌ ${eventName} trackEvent 전송 실패:`, e);
      
      // 2. Beacon API로 재시도
      try {
        sendBeaconEvent(eventName, exitData);
      } catch (beaconError) {
        console.warn(`❌ ${eventName} Beacon API 전송 실패:`, beaconError);
        
        // 3. 마지막 수단: 동기적 전송 시도
        sendSyncEvent(eventName, exitData);
      }
    }
  }

  // Beacon API를 통한 직접 전송
  function sendBeaconEvent(eventName, exitData) {
    try {
      if (navigator.sendBeacon) {
        const payload = JSON.stringify({
          data: [{
            "#type": "track",
            "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
            "#distinct_id": window.te ? window.te.getDistinctId() : 'anonymous',
            "#event_name": eventName,
            "properties": exitData
          }],
          "#app_id": "f43e15b9fb634d278845480f02c822f7",
          "#flush_time": new Date().toISOString().replace('T', ' ').slice(0, 23)
        });
        
        const success = navigator.sendBeacon(
          'https://te-receiver-naver.thinkingdata.kr/sync_js',
          payload
        );
        
        if (success) {
          console.log(`🚪 Beacon API로 ${eventName} 전송 성공`);
        } else {
          console.warn(`🚪 Beacon API로 ${eventName} 전송 실패`);
        }
      }
    } catch (e) {
      console.warn(`🚪 Beacon API 전송 실패:`, e);
    }
  }

  // 동기적 전송 (마지막 수단)
  function sendSyncEvent(eventName, exitData) {
    try {
      const payload = JSON.stringify({
        data: [{
          "#type": "track",
          "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
          "#distinct_id": window.te ? window.te.getDistinctId() : 'anonymous',
          "#event_name": eventName,
          "properties": exitData
        }],
        "#app_id": "f43e15b9fb634d278845480f02c822f7",
        "#flush_time": new Date().toISOString().replace('T', ' ').slice(0, 23)
      });
      
      // 동기적 XMLHttpRequest 시도
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://te-receiver-naver.thinkingdata.kr/sync_js', false); // 동기적
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payload);
      
      if (xhr.status === 200) {
        console.log(`✅ ${eventName} 동기 전송 성공`);
      } else {
        console.warn(`❌ ${eventName} 동기 전송 실패:`, xhr.status);
      }
    } catch (e) {
      console.warn(`❌ ${eventName} 동기 전송 실패:`, e);
    }
  }

  // 추가 전송 방식: Image 객체 사용
  function sendImageEvent(eventName, exitData) {
    try {
      const payload = JSON.stringify({
        data: [{
          "#type": "track",
          "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
          "#distinct_id": window.te ? window.te.getDistinctId() : 'anonymous',
          "#event_name": eventName,
          "properties": exitData
        }],
        "#app_id": "f43e15b9fb634d278845480f02c822f7",
        "#flush_time": new Date().toISOString().replace('T', ' ').slice(0, 23)
      });
      
      // URL 인코딩
      const encodedData = encodeURIComponent(payload);
      const url = `https://te-receiver-naver.thinkingdata.kr/sync_js?data=${encodedData}`;
      
      // Image 객체로 전송 (가장 안정적)
      const img = new Image();
      img.onload = function() {
        console.log(`✅ ${eventName} Image 전송 성공`);
      };
      img.onerror = function() {
        console.warn(`❌ ${eventName} Image 전송 실패`);
      };
      img.src = url;
      
    } catch (e) {
      console.warn(`❌ ${eventName} Image 전송 실패:`, e);
    }
  }

  // Page Visibility API 사용
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // beforeunload: 페이지 떠나기 전 (새로고침, 닫기, 다른 페이지 이동)
  window.addEventListener('beforeunload', function(event) {
    console.log('🚪 beforeunload 이벤트 발생');
    
    const now = Date.now();
    if (isPageVisible) {
      totalVisibleTime += now - lastVisibilityChange;
    }
    
    // 세션 정보 저장
    if (typeof window.sessionId !== 'undefined') {
      localStorage.setItem('te_last_activity_time', Date.now().toString());
      localStorage.setItem('te_is_engaged_session', (window.isEngagedSession || false).toString());
    }
    
    const exitData = {
      exit_type: 'beforeunload',
      total_visible_time: Math.round(totalVisibleTime / 1000),
      session_duration: Math.round((now - pageStartTime) / 1000),
      page_url: window.location.href,
      page_title: document.title,
      exit_reason: 'page_unload',
      user_agent: navigator.userAgent,
      // ThinkingData 홈페이지 특화 정보
      page_section: getPageSection(),
      page_category: getPageCategory(),
      user_engagement_level: getUserEngagementLevel(),
      scroll_depth: window.maxScrollDepth || 0,
      interaction_count: window.interactionCount || 0,
      session_id: (window.sessionId || '').toString(),
      session_number: window.sessionNumber || 0
    };
    
    // 여러 전송 방식 시도
    sendExitEvent('te_page_exit', exitData);
    
    // 브라우저가 이벤트를 처리할 시간을 주기 위해 약간의 지연
    event.preventDefault();
    event.returnValue = '';
    
    // 추가 전송 방식 시도
    setTimeout(() => {
      sendImageEvent('te_page_exit', exitData);
    }, 100);
  });

  // unload: 페이지 완전 언로드 (실제 브라우저/탭 종료)
  window.addEventListener('unload', function() {
    console.log('🚪 unload 이벤트 발생');
    
    const now = Date.now();
    if (isPageVisible) {
      totalVisibleTime += now - lastVisibilityChange;
    }
    
    const exitData = {
      exit_type: 'unload',
      total_visible_time: Math.round(totalVisibleTime / 1000),
      session_duration: Math.round((now - pageStartTime) / 1000),
      final_url: window.location.href,
      page_title: document.title,
      page_section: getPageSection(),
      page_category: getPageCategory(),
      user_engagement_level: getUserEngagementLevel(),
      scroll_depth: window.maxScrollDepth || 0,
      interaction_count: window.interactionCount || 0,
      session_id: (window.sessionId || '').toString(),
      session_number: window.sessionNumber || 0
    };
    
    // 여러 전송 방식 시도
    sendExitEvent('te_browser_exit', exitData);
    
    // Image 전송도 시도
    sendImageEvent('te_browser_exit', exitData);
  });

  // pagehide: 모바일에서 더 안정적 (브라우저 캐시 등)
  window.addEventListener('pagehide', function(event) {
    console.log('🚪 pagehide 이벤트 발생, persisted:', event.persisted);
    
    const now = Date.now();
    if (isPageVisible) {
      totalVisibleTime += now - lastVisibilityChange;
    }
    
    const exitData = {
      exit_type: 'pagehide',
      is_persisted: event.persisted, // 브라우저 캐시에 저장되는지
      total_visible_time: Math.round(totalVisibleTime / 1000),
      session_duration: Math.round((now - pageStartTime) / 1000),
      page_url: window.location.href,
      page_title: document.title,
      page_section: getPageSection(),
      page_category: getPageCategory(),
      user_engagement_level: getUserEngagementLevel(),
      scroll_depth: window.maxScrollDepth || 0,
      interaction_count: window.interactionCount || 0,
      session_id: (window.sessionId || '').toString(),
      session_number: window.sessionNumber || 0
    };
    
    // 캐시되지 않는 경우만 종료로 간주
    if (!event.persisted) {
      sendExitEvent('te_page_final_exit', exitData);
      sendImageEvent('te_page_final_exit', exitData);
    } else {
      console.log('🚪 페이지 캐시됨, 종료 이벤트 전송 안함');
    }
  });

  // 추가: visibilitychange 이벤트에서도 종료 감지
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      console.log('🚪 visibilitychange: hidden - 페이지 종료 감지');
      
      const now = Date.now();
      if (isPageVisible) {
        totalVisibleTime += now - lastVisibilityChange;
      }
      
      const exitData = {
        exit_type: 'visibility_hidden',
        total_visible_time: Math.round(totalVisibleTime / 1000),
        session_duration: Math.round((now - pageStartTime) / 1000),
        page_url: window.location.href,
        page_title: document.title,
        page_section: getPageSection(),
        page_category: getPageCategory(),
        user_engagement_level: getUserEngagementLevel(),
        scroll_depth: window.maxScrollDepth || 0,
        interaction_count: window.interactionCount || 0,
        session_id: (window.sessionId || '').toString(),
        session_number: window.sessionNumber || 0
      };
      
      // visibilitychange는 일반적으로 안정적이므로 즉시 전송
      sendExitEvent('te_page_visibility_exit', exitData);
    }
  });

  // 주기적으로 페이지 상태 체크 (SPA 대응)
  setInterval(function() {
    const now = Date.now();
    const timeSpent = Math.round((now - pageStartTime) / 1000);
    
    // 5분마다 페이지 상태 이벤트 전송
    if (timeSpent > 0 && timeSpent % 300 === 0) {
      trackEvent('te_page_status_check', {
        page_url: window.location.href,
        page_title: document.title,
        total_visible_time: Math.round(totalVisibleTime / 1000),
        session_duration: timeSpent,
        page_section: getPageSection(),
        page_category: getPageCategory(),
        user_engagement_level: getUserEngagementLevel(),
        scroll_depth: window.maxScrollDepth || 0,
        interaction_count: window.interactionCount || 0
      });
      console.log('🚪 페이지 상태 체크:', timeSpent, '초');
    }
  }, 1000);

  isInitialized = true;
  console.log('✅ 페이지 종료 추적 초기화 완료');
}

// 디버깅용 함수들
function debugExitTracking() {
  console.log('🚪 페이지 종료 추적 디버깅 정보:');
  console.log('- 페이지 URL:', window.location.href);
  console.log('- 페이지 제목:', document.title);
  console.log('- 세션 ID:', window.sessionId);
  console.log('- 세션 번호:', window.sessionNumber);
  console.log('- 최대 스크롤 깊이:', window.maxScrollDepth || 0);
  console.log('- 상호작용 수:', window.interactionCount || 0);
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
}

function testExitEvent() {
  console.log('🚪 테스트 종료 이벤트 전송...');
  
  // 중복 방지 Set 초기화 (테스트용)
  if (typeof exitEventsSent !== 'undefined') {
    exitEventsSent.clear();
  }
  
  trackEvent('te_test_exit', {
    test_type: 'manual_test',
    page_url: window.location.href,
    page_title: document.title,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 23),
          session_id: window.sessionId || '',
      session_number: window.sessionNumber || 0
  });
  console.log('✅ 테스트 종료 이벤트 전송 완료');
}

// 추가 테스트 함수
function testPageExit() {
  console.log('🚪 페이지 종료 시뮬레이션...');
  
  // beforeunload 이벤트 수동 트리거
  const beforeUnloadEvent = new Event('beforeunload');
  window.dispatchEvent(beforeUnloadEvent);
  
  console.log('✅ 페이지 종료 시뮬레이션 완료');
}

// 전역 함수로 노출
window.initializePageExitTracking = initializePageExitTracking;
window.debugExitTracking = debugExitTracking;
window.testExitEvent = testExitEvent;
window.testPageExit = testPageExit;

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚪 DOM 로드 완료, 페이지 종료 추적 시작');
    setTimeout(initializePageExitTracking, 1000);
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('🚪 DOM 이미 로드됨, 페이지 종료 추적 시작');
  setTimeout(initializePageExitTracking, 1000);
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
  console.log('🚪 ThinkingData 초기화 완료, 페이지 종료 추적 시작');
  setTimeout(initializePageExitTracking, 500);
});

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('🚪 페이지 로드 완료, 페이지 종료 추적 재확인');
  setTimeout(initializePageExitTracking, 2000);
});

// 10초 후 한 번 더 시도 (안전장치)
setTimeout(function() {
  if (typeof window.te !== 'undefined' && !window.exitTrackingInitialized) {
    console.log('🚪 안전장치: 페이지 종료 추적 재시도');
    initializePageExitTracking();
  }
}, 10000);