/**
 * 스크롤 깊이 추적 모듈
 * ThinkingData SDK와 연동하여 스크롤 깊이 이벤트 추적
 */

import { updateSessionActivity } from '../core/session-manager.js';
import { trackFullScroll } from '../user-attributes.js';
import { trackingLog } from '../core/utils.js';

const scrollDepthThresholds = [25, 50, 75, 90, 100];
  let scrollDepthTracked = new Set();
  let maxScrollDepth = 0;

    function calculateScrollDepth() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const scrollDepthPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100
      );
      return {
        percentage: Math.min(scrollDepthPercentage, 100),
        pixels: scrollTop,
        totalHeight: documentHeight
      };
    }

function calculateScrollSpeed() {
  if (!window.lastScrollTime) {
    window.lastScrollTime = Date.now();
    window.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return 0;
  }
  const currentTime = Date.now();
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const timeDiff = currentTime - window.lastScrollTime;
  const scrollDiff = Math.abs(currentScrollTop - window.lastScrollTop);
  window.lastScrollTime = currentTime;
  window.lastScrollTop = currentScrollTop;
  return timeDiff > 0 ? Math.round(scrollDiff / timeDiff * 1000) : 0; // 픽셀/초
}

export function initScrollTracking() {
  window.addEventListener('scroll', () => {
    if (typeof updateSessionActivity === 'function') updateSessionActivity();
    const scrollData = calculateScrollDepth();
    if (scrollData.percentage > maxScrollDepth) {
      maxScrollDepth = scrollData.percentage;
    }
    scrollDepthThresholds.forEach(threshold => {
      if (scrollData.percentage >= threshold && !scrollDepthTracked.has(threshold)) {
        scrollDepthTracked.add(threshold);
        const eventData = {
          scroll_depth_percentage: threshold,
          scroll_depth_pixels: scrollData.pixels,
          page_total_height_pixels: scrollData.totalHeight,
          page_name: document.title,
          page_url: window.location.href,
          scroll_direction: 'vertical',
          max_scroll_depth: maxScrollDepth,
          scroll_speed: calculateScrollSpeed()
        };
        if (window.te && typeof window.te.track === 'function') {
          window.te.track('te_scroll_depth', eventData);
        }
        
        // 🚀 100% 스크롤 시 유저 속성에 추적
        if (threshold === 100) {
          trackFullScroll();
        }
      }
    });
  });
}

// 초기화 상태 추적
let scrollTrackingInitialized = false;

/**
 * 스크롤 깊이 추적 시작
 */
function trackScrollDepth() {
  if (scrollTrackingInitialized) {
    return;
  }

  trackingLog('📜 스크롤 깊이 추적 초기화...');

    function handleScroll() {
      // 세션 활동 업데이트 (전역 함수 호출)
      if (typeof window.updateSessionActivity === 'function') {
        window.updateSessionActivity();
      }

      const scrollData = calculateScrollDepth();

      // 최대 스크롤 깊이 업데이트
      if (scrollData.percentage > maxScrollDepth) {
        maxScrollDepth = scrollData.percentage;
      }

      // 임계값 도달 시 이벤트 전송
      scrollDepthThresholds.forEach(threshold => {
        if (scrollData.percentage >= threshold && !scrollDepthTracked.has(threshold)) {
          scrollDepthTracked.add(threshold);

          const eventData = {
            scroll_depth_percentage: threshold,
            scroll_depth_pixels: scrollData.pixels,
            page_total_height_pixels: scrollData.totalHeight,
            page_name: document.title,
            page_url: window.location.href,
            scroll_direction: 'vertical',
            max_scroll_depth: maxScrollDepth,
            scroll_speed: calculateScrollSpeed()
          };

          // ThinkingData 이벤트 전송
          if (typeof window.te !== 'undefined' && window.te.track) {
            window.te.track('te_scroll_depth', eventData);
            trackingLog('📜 스크롤 깊이 이벤트 전송:', eventData);
          } else {
            console.warn('📜 ThinkingData SDK가 로드되지 않음');
          }
        }
      });
    }

    // 스크롤 이벤트 리스너 (디바운싱 적용)
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    });

    scrollTrackingInitialized = true;
    trackingLog('✅ 스크롤 깊이 추적 초기화 완료');
  }

  // 전역 함수로 노출
  window.trackScrollDepth = trackScrollDepth;

  // 초기화 함수 (한 번만 실행)
  function initializeScrollTracking() {
    if (scrollTrackingInitialized) {
      return;
    }

    // DOM 로드 완료 후 자동 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        trackingLog('📜 DOM 로드 완료, 스크롤 깊이 추적 시작');
        trackScrollDepth();
      });
    } else {
      // DOM이 이미 로드된 경우
      trackingLog('📜 DOM 이미 로드됨, 스크롤 깊이 추적 시작');
      trackScrollDepth();
    }
  }

  // 초기화 실행
  initializeScrollTracking();

  // ThinkingData 초기화 완료 이벤트 감지 (한 번만)
  if (!window.thinkingDataScrollListenerAdded) {
    window.thinkingDataScrollListenerAdded = true;
    window.addEventListener('thinkingdata:ready', function() {
      trackingLog('📜 ThinkingData 초기화 완료, 스크롤 깊이 추적 확인');
      // 이미 초기화되었으면 재실행하지 않음
      if (!scrollTrackingInitialized) {
        trackScrollDepth();
      }
    });
  }

  // 페이지 로드 완료 후 확인 (한 번만)
  if (!window.loadScrollListenerAdded) {
    window.loadScrollListenerAdded = true;
    window.addEventListener('load', function() {
      trackingLog('📜 페이지 로드 완료, 스크롤 깊이 추적 확인');
      // 이미 초기화되었으면 재실행하지 않음
      if (!scrollTrackingInitialized) {
        trackScrollDepth();
      }
    });
  }

  export function trackScroll() {
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
      );
      if (scrollPercent >= 90) {
        window.thinkingdata.track('scroll_depth', { percent: scrollPercent });
      }
    });
    trackingLog('✅ 스크롤 트래킹 활성화');
  }