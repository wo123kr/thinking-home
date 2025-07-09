/**
 * 클릭 이벤트 추적 모듈 (ES 모듈 리팩토링)
 * - SDK 자동수집/커스텀 추적 선택 가능
 * - core/utils.js 유틸리티 사용
 * - 전역 오염 최소화
 */

import { trackEvent, updateSessionActivity } from '../core/utils.js';

// 클릭 패턴 정의 (필요시 확장)
  const clickPatterns = {
  cta: ['문의하기', '상담신청', '체험하기', '시작하기', '가입하기', '무료체험'],
  nav: ['홈', '서비스', '제품', '가격', '고객사례', '회사소개', '블로그'],
  footer: ['개인정보처리방침', '이용약관', '고객센터', '사업자정보'],
  social: ['공유', '페이스북', '트위터', '링크드인', '카카오톡'],
  download: ['다운로드', '내려받기', 'PDF', '자료받기']
};

let clickTrackingInitialized = false;

function matchPattern(text) {
  for (const [type, keywords] of Object.entries(clickPatterns)) {
    if (keywords.some(k => text.includes(k))) return type;
        }
  return 'other';
    }

  function analyzeElement(element) {
  const text = element.textContent?.trim() || '';
      const id = element.id || '';
  const classList = element.className ? element.className.split(' ').filter(Boolean) : [];
  const tag = element.tagName.toLowerCase();
      const href = element.href || '';
      return {
    element_id: id || classList.join('_') || tag,
        element_text: text,
        element_class_list: classList,
        element_html_id: id,
    element_tag_name: tag,
        element_href: href,
    element_pattern: matchPattern(text)
      };
    }

  function handleClick(event) {
  const element = event.target.closest('a, button, [role="button"], .btn, .button, input[type="submit"], input[type="button"]');
  if (!element) return;
  updateSessionActivity();
  const elementData = analyzeElement(element);
      const clickData = {
        ...elementData,
        page_url: window.location.href,
        page_title: document.title,
        click_coordinates: {
          x: event.clientX,
          y: event.clientY,
          pageX: event.pageX,
          pageY: event.pageY
        },
        viewport_size: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
  trackEvent('te_element_click', clickData);
}

/**
 * 클릭 추적 초기화
 * @param {Object} config - { useSdkAutoTrack: boolean }
 */
export function initClickTracking(config = { useSdkAutoTrack: false }) {
  if (clickTrackingInitialized) {
    console.log('ℹ️ 클릭 추적이 이미 초기화됨');
    return;
  }
  if (config.useSdkAutoTrack && window.ta && window.ta.trackLink) {
    // SDK 자동수집 사용
    window.ta.trackLink(
      { tag: ['a', 'button'], class: ['btn', 'button'], id: [] },
      'element_click',
      {}
    );
    console.log('✅ SDK 자동수집 클릭 트래킹 활성화');
  } else {
    // 커스텀 추적 사용
    document.removeEventListener('click', handleClick);
    document.addEventListener('click', handleClick);
    console.log('✅ 커스텀 클릭 트래킹 활성화');
  }
  clickTrackingInitialized = true;
}