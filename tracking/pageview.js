/**
 * 페이지뷰(pageview) 추적 모듈
 * - ta_pageview(ta.quick('autoTrack')) 이벤트 전송
 * - 커스텀 속성 확장 가능
 * - SPA 라우트 변경 등에서 재호출 가능
 */

import { addBotInfoToEvent, addTETimeProperties } from '../core/utils.js';

/**
 * 페이지뷰 추적 함수
 * @param {Object} customProps - 추가로 전송할 커스텀 속성(선택)
 */
export function trackPageView(customProps = {}) {
  if (window.ta && typeof window.ta.quick === 'function') {
    // 봇 정보 추가
    const propsWithBot = addBotInfoToEvent(customProps);
    
    // TE 시간 형식 속성 추가
    const propsWithTETime = addTETimeProperties(propsWithBot);
    
    window.ta.quick('autoTrack', {
      ...propsWithTETime
    });
    console.log('✅ ta_pageview(pageview) 이벤트 전송', {
      ...propsWithTETime,
      is_bot: propsWithTETime.is_bot,
      bot_type: propsWithTETime.bot_type,
      current_time_te: propsWithTETime.current_time_te
    });
  } else {
    console.warn('⚠️ ThinkingData SDK(ta.quick)가 준비되지 않음');
  }
}

// 페이지 최초 진입 시 자동 호출 예시 (원하면 main.js에서 직접 호출)
// document.addEventListener('DOMContentLoaded', () => trackPageView()); 