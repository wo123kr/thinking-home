/**
 * 페이지 종료 추적 모듈
 */

// 페이지 종료 추적 초기화
function initializePageExitTracking() {
  let pageStartTime = Date.now();
  let isPageVisible = !document.hidden;
  let totalVisibleTime = 0;
  let lastVisibilityChange = Date.now();

  // 페이지 가시성 변경 추적
  function handleVisibilityChange() {
    const now = Date.now();
    
    if (document.hidden) {
      // 페이지가 숨겨짐 (탭 변경, 최소화, 다른 앱으로 전환)
      if (isPageVisible) {
        totalVisibleTime += now - lastVisibilityChange;
        isPageVisible = false;
        
        te.track('te_page_visibility_change', {
          visibility_state: 'hidden',
          total_visible_time: Math.round(totalVisibleTime / 1000), // 초 단위
          session_duration: Math.round((now - pageStartTime) / 1000),
          exit_reason: 'visibility_hidden'
        });
      }
    } else {
      // 페이지가 다시 보임
      isPageVisible = true;
      lastVisibilityChange = now;
      
      te.track('te_page_visibility_change', {
        visibility_state: 'visible',
        total_visible_time: Math.round(totalVisibleTime / 1000),
        session_duration: Math.round((now - pageStartTime) / 1000),
        exit_reason: 'page_returned'
      });
    }
    
    // 기존 세션 활동 업데이트
    if (!document.hidden) {
      updateSessionActivity();
    }
  }

  // Page Visibility API 사용
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // beforeunload: 페이지 떠나기 전 (새로고침, 닫기, 다른 페이지 이동)
  window.addEventListener('beforeunload', function() {
    const now = Date.now();
    if (isPageVisible) {
      totalVisibleTime += now - lastVisibilityChange;
    }
    
    // 세션 정보 저장 (기존 로직 유지)
    localStorage.setItem('te_last_activity_time', Date.now().toString());
    localStorage.setItem('te_is_engaged_session', isEngagedSession.toString());
    
    // 동기적으로 즉시 전송 (navigator.sendBeacon 사용)
    const exitData = {
      exit_type: 'beforeunload',
      total_visible_time: Math.round(totalVisibleTime / 1000),
      session_duration: Math.round((now - pageStartTime) / 1000),
      page_url: window.location.href,
      exit_reason: 'page_unload',
      user_agent: navigator.userAgent
    };
    
    // 동기 전송 시도
    try {
      const payload = JSON.stringify({
        data: [{
          "#type": "track",
          "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
          "#distinct_id": te.getDistinctId(),
          "#event_name": "te_page_exit",
          "properties": Object.assign(exitData, {
            session_id: sessionId,
            session_number: sessionNumber
          })
        }],
        "#app_id": "test",
        "#flush_time": Date.now()
      });
      
      // Beacon API 사용 (가장 안정적)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          'https://te-receiver-naver.thinkingdata.kr/sync_js',
          payload
        );
      }
    } catch (e) {
      console.warn('페이지 종료 이벤트 전송 실패:', e);
    }
  });

  // unload: 페이지 완전 언로드 (실제 브라우저/탭 종료)
  window.addEventListener('unload', function() {
    const now = Date.now();
    if (isPageVisible) {
      totalVisibleTime += now - lastVisibilityChange;
    }
    
    // 최종 종료 이벤트 (매우 제한적인 시간)
    try {
      if (navigator.sendBeacon) {
        const payload = JSON.stringify({
          data: [{
            "#type": "track",
            "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
            "#distinct_id": te.getDistinctId(),
            "#event_name": "te_browser_exit",
            "properties": {
              exit_type: 'unload',
              total_visible_time: Math.round(totalVisibleTime / 1000),
              session_duration: Math.round((now - pageStartTime) / 1000),
              final_url: window.location.href,
              session_id: sessionId,
              session_number: sessionNumber
            }
          }],
          "#app_id": "test",
          "#flush_time": Date.now()
        });
        
        navigator.sendBeacon(
          'https://te-receiver-naver.thinkingdata.kr/sync_js',
          payload
        );
      }
    } catch (e) {
      // unload에서는 로그도 출력 안됨
    }
  });

  // pagehide: 모바일에서 더 안정적 (브라우저 캐시 등)
  window.addEventListener('pagehide', function(event) {
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
      session_id: sessionId,
      session_number: sessionNumber
    };
    
    // 캐시되지 않는 경우만 종료로 간주
    if (!event.persisted) {
      try {
        if (navigator.sendBeacon) {
          const payload = JSON.stringify({
            data: [{
              "#type": "track",
              "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
              "#distinct_id": te.getDistinctId(),
              "#event_name": "te_page_final_exit",
              "properties": exitData
            }],
            "#app_id": "test",
            "#flush_time": Date.now()
          });
          
          navigator.sendBeacon(
            'https://te-receiver-naver.thinkingdata.kr/sync_js',
            payload
          );
        }
      } catch (e) {
        console.warn('최종 페이지 종료 이벤트 전송 실패:', e);
      }
    }
  });

  console.log('✅ 페이지 종료 추적 초기화 완료');
}

// 전역 함수로 노출
window.initializePageExitTracking = initializePageExitTracking;