/**
 * 페이지뷰(pageview) 추적 모듈
 * - ta_pageview(ta.quick('autoTrack')) 이벤트 전송
 * - 커스텀 속성 확장 가능
 * - SPA 라우트 변경 등에서 재호출 가능
 */

// core/utils.js에서 필요시 유틸리티 import (trackEvent 등)
// import { trackEvent } from '../core/utils.js';

/**
 * 페이지뷰 추적 함수
 * @param {Object} customProps - 추가로 전송할 커스텀 속성(선택)
 */
export function trackPageView(customProps = {}) {
  if (window.ta && typeof window.ta.quick === 'function') {
    window.ta.quick('autoTrack', {
      ...customProps
    });
    console.log('✅ ta_pageview(pageview) 이벤트 전송', customProps);
  } else {
    console.warn('⚠️ ThinkingData SDK(ta.quick)가 준비되지 않음');
  }
}

// 페이지 최초 진입 시 자동 호출 예시 (원하면 main.js에서 직접 호출)
// document.addEventListener('DOMContentLoaded', () => trackPageView()); 