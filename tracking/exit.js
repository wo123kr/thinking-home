/**
 * 페이지 종료(이탈) 추적 모듈 (ES 모듈 리팩토링)
 * - beforeunload, unload, pagehide, visibilitychange 등 주요 종료 이벤트 추적
 * - core/utils.js 유틸리티 사용
 * - 전역 오염 없음, 테스트/디버깅 함수 제거
 */

import { trackEvent, addTETimeProperties } from '../core/utils.js';

let exitTrackingInitialized = false;

function getExitData(type, extra = {}) {
    const now = Date.now();
  const exitData = {
    exit_type: type,
          page_url: window.location.href,
          page_title: document.title,
    user_agent: navigator.userAgent,
    timestamp: now,
    ...extra
  };
  
  // TE 시간 형식 속성 추가
  return addTETimeProperties(exitData);
    }
    
function handleBeforeUnload() {
  trackEvent('te_page_exit', getExitData('beforeunload'));
  }

function handleUnload() {
  trackEvent('te_browser_exit', getExitData('unload'));
  }

function handlePageHide(event) {
  trackEvent('te_page_final_exit', getExitData('pagehide', { is_persisted: event.persisted }));
      }

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    trackEvent('te_page_visibility_exit', getExitData('visibility_hidden'));
  }
}

/**
 * 페이지 종료 추적 초기화
 */
export function initExitTracking() {
  if (exitTrackingInitialized) {
    console.log('ℹ️ 페이지 종료 추적이 이미 초기화됨');
    return;
    }
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('unload', handleUnload);
  window.addEventListener('pagehide', handlePageHide);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  exitTrackingInitialized = true;
  console.log('✅ 페이지 종료(이탈) 트래킹 활성화');
}