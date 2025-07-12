/**
 * 페이지뷰(pageview) 추적 모듈
 * - ta_pageview(ta.quick('autoTrack')) 이벤트 전송
 * - 커스텀 속성 확장 가능
 * - SPA 라우트 변경 등에서 재호출 가능
 */

import { addBotInfoToEvent, addTETimeProperties, trackingLog } from '../core/utils.js';

/**
 * 페이지뷰 추적 함수
 * @param {Object} customProps - 추가로 전송할 커스텀 속성(선택)
 */
export function trackPageView(customProps = {}) {
  try {
    // 봇 정보 추가
    const propsWithBot = addBotInfoToEvent(customProps);
    
    // TE 시간 형식 속성 추가
    const propsWithTETime = addTETimeProperties(propsWithBot);
    
    // 페이지 정보 추가
    const pageviewData = {
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
      referrer: document.referrer || '',
      ...propsWithTETime
    };
    
    // ThinkingData SDK를 통한 전송 시도
    if (window.te && typeof window.te.track === 'function') {
      window.te.track('te_pageview', pageviewData);
      trackingLog('✅ te_pageview 이벤트 전송 (SDK)', pageviewData);
    } else if (window.ta && typeof window.ta.quick === 'function') {
      // 기존 ta.quick 방식 지원 (하위 호환성)
      window.ta.quick('autoTrack', pageviewData);
      trackingLog('✅ te_pageview 이벤트 전송 (ta.quick)', pageviewData);
    } else {
      // SDK가 없는 경우 utils의 trackEvent 사용 (로컬 스토리지 임시 저장)
      trackEvent('te_pageview', pageviewData);
      trackingLog('✅ te_pageview 이벤트 임시 저장 (SDK 없음)', pageviewData);
    }
    
  } catch (error) {
    console.warn('⚠️ 페이지뷰 이벤트 전송 실패:', error);
    trackingLog('❌ 페이지뷰 이벤트 전송 실패:', error);
  }
}

// 페이지 최초 진입 시 자동 호출 예시 (원하면 main.js에서 직접 호출)
// document.addEventListener('DOMContentLoaded', () => trackPageView()); 