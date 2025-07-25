// tracking/section-scroll.js
// @brief: 각 section(id)별로 0/25/50/75/100% 스크롤 도달 시 ThinkingData 이벤트 전송

import config from '../config.js';

const SECTION_THRESHOLDS = [0, 25, 50, 75, 100];
const DEBOUNCE_TIME = 100; // ms

let sectionScrollTrackingInitialized = false;

/**
 * 섹션별 스크롤 뎁스 추적 초기화
 * 사용법: main.js 등에서 import 후 initSectionScrollTracking() 1회 호출
 */
export function initSectionScrollTracking() {
  if (sectionScrollTrackingInitialized) return;
  sectionScrollTrackingInitialized = true;

  const sections = Array.from(document.querySelectorAll('section[id]'));
  const tracked = {}; // { sectionId: Set([0, 25, ...]) }

  function checkSectionScrollDepth() {
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    sections.forEach((section, idx) => {
      const rect = section.getBoundingClientRect();
      const sectionId = section.id;
      const sectionTop = rect.top + scrollY;
      const sectionHeight = section.offsetHeight;
      // 현재 뷰포트에서 섹션이 얼마나 노출됐는지 계산
      const visibleStart = Math.max(sectionTop, scrollY);
      const visibleEnd = Math.min(sectionTop + sectionHeight, scrollY + viewportHeight);
      const visibleHeight = Math.max(0, visibleEnd - visibleStart);
      const percent = Math.round((visibleHeight / sectionHeight) * 100);

      if (!tracked[sectionId]) tracked[sectionId] = new Set();

      SECTION_THRESHOLDS.forEach(threshold => {
        if (percent >= threshold && !tracked[sectionId].has(threshold)) {
          tracked[sectionId].add(threshold);
          // 이벤트 전송
          if (window.te && typeof window.te.track === 'function') {
            const eventData = {
              section_id: sectionId,
              section_index: idx + 1,
              section_class: section.className,
              scroll_depth_percentage: threshold,
              section_height: sectionHeight,
              visible_height: visibleHeight,
              page_name: document.title,
              page_url: window.location.href
            };
            if (config.debug && config.debug.showConsoleLogs) {
              console.log('[DEBUG] section_scroll_depth fired', eventData);
            }
            window.te.track('section_scroll_depth', eventData);
          }
        }
      });
    });
  }

  // 디바운싱 적용
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(checkSectionScrollDepth, DEBOUNCE_TIME);
  });

  // 최초 진입 시도 체크
  checkSectionScrollDepth();
}

// robust 초기화: DOMContentLoaded, window load, SDK ready 등에서 자동 실행
function robustSectionScrollInit() {
  if (sectionScrollTrackingInitialized) return;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionScrollTracking);
  } else {
    initSectionScrollTracking();
  }

  // ThinkingData SDK ready 이벤트
  if (!window.sectionScrollThinkingDataListenerAdded) {
    window.sectionScrollThinkingDataListenerAdded = true;
    window.addEventListener('thinkingdata:ready', function() {
      if (!sectionScrollTrackingInitialized) {
        initSectionScrollTracking();
      }
    });
  }

  // window load 이벤트
  if (!window.sectionScrollLoadListenerAdded) {
    window.sectionScrollLoadListenerAdded = true;
    window.addEventListener('load', function() {
      if (!sectionScrollTrackingInitialized) {
        initSectionScrollTracking();
      }
    });
  }
}

robustSectionScrollInit(); 