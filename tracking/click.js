/**
 * 클릭 이벤트 추적 모듈 - 안전성 강화 버전
 * 기존 모든 기능을 보존하면서 안전장치 추가
 */

// 🔒 중복 초기화 방지
if (window.moduleStateManager && window.moduleStateManager.isInitialized('click-tracker')) {
  console.log('⚠️ 클릭 추적 모듈은 이미 초기화되었습니다.');
} else {
  console.log('🖱️ 클릭 이벤트 추적 초기화 시작...');
  
  // 모듈 상태 업데이트
  if (window.moduleStateManager) {
    window.moduleStateManager.markPending('click-tracker');
  }

  // 🆕 안전한 유틸리티 함수들 (기존 로직 보존)
  function safeGetText(element) {
    if (window.safeGetText) {
      return window.safeGetText(element);
    }
    // 기존 로직 보존
    try {
      return element?.textContent?.trim() || '';
    } catch (error) {
      return '';
    }
  }

  function safeGetClassList(element) {
    if (window.safeGetClassList) {
      return window.safeGetClassList(element);
    }
    // 기존 로직 보존
    try {
      return element?.className ? element.className.split(' ').filter(cls => cls.trim()) : [];
    } catch (error) {
      return [];
    }
  }

  function safeTrackEvent(eventName, properties = {}) {
    if (window.trackEvent) {
      return window.trackEvent(eventName, properties);
    }
    // 기존 로직 보존
    try {
      if (window.te && typeof window.te.track === 'function') {
        window.te.track(eventName, properties);
        return true;
      }
    } catch (error) {
      console.error('클릭 이벤트 추적 실패:', error);
    }
    return false;
  }

  function safeUpdateActivity() {
    if (window.updateSessionActivity) {
      return window.updateSessionActivity();
    }
    // 기존 로직 보존 - 별도 처리 없음
  }

  // 기존 설정 및 변수들 (완전 보존)
  const clickPatterns = {
    'cta_button': {
      text: ['문의하기', '상담신청', '체험하기', '시작하기', '가입하기', '무료체험'],
      class: ['cta', 'btn-primary', 'btn-cta', 'contact-btn', 'trial-btn'],
      id: ['cta-btn', 'contact-btn', 'trial-btn', 'signup-btn']
    },
    'navigation': {
      text: ['홈', '서비스', '제품', '가격', '고객사례', '회사소개', '블로그'],
      class: ['nav-link', 'menu-item', 'nav-item'],
      id: ['nav-', 'menu-']
    },
    'footer_link': {
      text: ['개인정보처리방침', '이용약관', '고객센터', '사업자정보'],
      class: ['footer-link', 'footer-nav'],
      id: ['footer-']
    },
    'social_share': {
      text: ['공유', '페이스북', '트위터', '링크드인', '카카오톡'],
      class: ['share', 'social', 'sns'],
      id: ['share-', 'social-']
    },
    'download': {
      text: ['다운로드', '내려받기', 'PDF', '자료받기'],
      class: ['download', 'file-download'],
      id: ['download-', 'file-']
    }
  };

  // 의미있는 클래스명 패턴 (기존 유지)
  const meaningfulClassPatterns = [
    'btn', 'button', 'link', 'w-', 'brix', 'div-block', 'cta', 'nav', 'menu', 'footer', 'header', 'card'
  ];

  // 기존 함수들 (완전 보존)
  function simpleHash(str) {
    if (window.simpleHash) {
      return window.simpleHash(str);
    }
    // 기존 로직 보존
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  function generateTextBasedId(text) {
    if (window.generateTextBasedId) {
      return window.generateTextBasedId(text);
    }
    // 기존 로직 보존
    if (!text) return 'no_text';
    
    const cleanText = text.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
    const hash = simpleHash(cleanText);
    
    return `text_${cleanText.substring(0, 10)}_${hash}`;
  }

  function generateClassBasedId(classList) {
    if (window.generateClassBasedId) {
      return window.generateClassBasedId(classList);
    }
    // 기존 로직 보존
    if (!classList || classList.length === 0) return 'no_class';
    
    const meaningfulClasses = classList.filter(cls => 
      meaningfulClassPatterns.some(pattern => cls.includes(pattern))
    );
    
    if (meaningfulClasses.length === 0) return 'no_meaningful_class';
    
    const classString = meaningfulClasses.join('_');
    const hash = simpleHash(classString);
    
    return `class_${classString.substring(0, 15)}_${hash}`;
  }

  function generatePositionBasedId(element) {
    if (window.generatePositionBasedId) {
      return window.generatePositionBasedId(element);
    }
    // 기존 로직 보존
    try {
      const rect = element.getBoundingClientRect();
      const pageY = window.pageYOffset + rect.top;
      const pageX = window.pageXOffset + rect.left;
      
      const positionHash = simpleHash(`${Math.round(pageX)}_${Math.round(pageY)}`);
      
      return `pos_${Math.round(pageX)}_${Math.round(pageY)}_${positionHash}`;
    } catch (error) {
      return 'pos_unknown';
    }
  }

  function matchPatterns(element, patterns) {
    if (window.matchPatterns) {
      return window.matchPatterns(element, patterns);
    }
    // 기존 로직 보존
    try {
      const text = safeGetText(element);
      const href = element.href || '';
      const classList = safeGetClassList(element);
      const id = element.id || '';
      
      for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.text && pattern.text.some(p => text.toLowerCase().includes(p.toLowerCase()))) {
          return type;
        }
        if (pattern.url && pattern.url.some(p => href.toLowerCase().includes(p.toLowerCase()))) {
          return type;
        }
        if (pattern.id && pattern.id.some(p => id.toLowerCase().includes(p.toLowerCase()))) {
          return type;
        }
        if (pattern.class && pattern.class.some(p => classList.some(cls => cls.toLowerCase().includes(p.toLowerCase())))) {
          return type;
        }
      }
      
      return '';
    } catch (error) {
      return '';
    }
  }

  function isExternalLink(url) {
    if (window.isExternalLink) {
      return window.isExternalLink(url);
    }
    // 기존 로직 보존
    try {
      const linkHost = new URL(url).hostname;
      const currentHost = window.location.hostname;
      return linkHost !== currentHost;
    } catch (e) {
      return false;
    }
  }

  // 🆕 안전한 요소 분석 함수 (기존 로직 보존)
  function analyzeElement(element) {
    try {
      const text = safeGetText(element);
      const classList = safeGetClassList(element);
      const id = element.id || '';
      const href = element.href || '';
      
      // 패턴 매칭
      const matchedPattern = matchPatterns(element, clickPatterns);
      
      // 요소 식별자 생성 (기존 로직 완전 보존)
      let elementId = '';
      if (text) {
        elementId = generateTextBasedId(text);
      } else if (classList.length > 0) {
        elementId = generateClassBasedId(classList);
      } else {
        elementId = generatePositionBasedId(element);
      }
      
      return {
        element_id: elementId,
        element_text: text,
        element_class_list: classList,
        element_html_id: id,
        element_tag_name: element.tagName.toLowerCase(),
        element_href: href,
        element_pattern: matchedPattern || 'unknown',
        is_external_link: href ? isExternalLink(href) : false
      };
    } catch (error) {
      console.error('요소 분석 실패:', error);
      return {
        element_id: 'analysis_failed',
        element_text: '',
        element_class_list: [],
        element_html_id: '',
        element_tag_name: 'unknown',
        element_href: '',
        element_pattern: 'unknown',
        is_external_link: false
      };
    }
  }

  // 기존 클릭 이벤트 핸들러 (완전 보존)
  function handleClick(event) {
    try {
      const element = event.target;
      const clickableElement = element.closest('a, button, [role="button"], .btn, .button, input[type="submit"], input[type="button"]');
      
      if (!clickableElement) return;
      
      // 세션 활동 업데이트
      safeUpdateActivity();
      
      // 요소 분석
      const elementData = analyzeElement(clickableElement);
      
      // 클릭 좌표 정보
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
      
      // 이벤트 전송
      safeTrackEvent('te_element_click', clickData);
      
      console.log('🖱️ 클릭 이벤트 추적:', elementData.element_pattern, elementData.element_text);
      
    } catch (error) {
      console.error('클릭 이벤트 핸들러 오류:', error);
    }
  }

  // 🆕 안전한 이벤트 리스너 추가 (기존 로직 보존)
  function initializeClickTracking() {
    try {
      // 기존 이벤트 리스너 중복 제거
      document.removeEventListener('click', handleClick);
      
      // 새 이벤트 리스너 추가
      document.addEventListener('click', handleClick);
      
      console.log('✅ 클릭 이벤트 추적 초기화 완료');
      
      // 모듈 상태 업데이트
      if (window.moduleStateManager) {
        window.moduleStateManager.markInitialized('click-tracker');
      }
      
    } catch (error) {
      console.error('클릭 이벤트 추적 초기화 실패:', error);
      
      // 모듈 상태 업데이트
      if (window.moduleStateManager) {
        window.moduleStateManager.markFailed('click-tracker', error);
      }
    }
  }

  // 🆕 설정 업데이트 함수 (기존 기능 확장)
  function updateClickPatterns(newPatterns) {
    try {
      Object.assign(clickPatterns, newPatterns);
      console.log('🔄 클릭 패턴 업데이트 완료:', newPatterns);
      
      // 설정 관리자에도 저장
      if (window.configManager) {
        window.configManager.updateConfig('click-tracker', { patterns: clickPatterns });
      }
    } catch (error) {
      console.error('클릭 패턴 업데이트 실패:', error);
    }
  }

  // 🆕 디버깅 함수
  function debugClickTracking() {
    console.log('🖱️ 클릭 추적 디버깅 정보:');
    console.log('- 현재 패턴:', clickPatterns);
    console.log('- 의미있는 클래스 패턴:', meaningfulClassPatterns);
    console.log('- 모듈 상태:', window.moduleStateManager ? 
      window.moduleStateManager.getStatus('click-tracker') : 'unknown');
  }

  // 🆕 클릭 통계 함수
  function getClickStatistics() {
    // 간단한 통계 정보 제공
    const stats = {
      totalClicks: 0,
      patternMatches: {},
      lastClick: null
    };
    
    // localStorage에서 통계 로드 (선택사항)
    try {
      const stored = localStorage.getItem('te_click_stats');
      if (stored) {
        Object.assign(stats, JSON.parse(stored));
      }
    } catch (error) {
      console.warn('클릭 통계 로드 실패:', error);
    }
    
    return stats;
  }

  // 전역 함수로 노출 (기존 + 새로운 함수들)
  window.updateClickPatterns = updateClickPatterns;
  window.debugClickTracking = debugClickTracking;
  window.getClickStatistics = getClickStatistics;
  window.analyzeElement = analyzeElement;

  // 🆕 초기화 실행 (안전한 타이밍)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeClickTracking);
  } else {
    // DOM이 이미 로드된 경우 즉시 초기화
    initializeClickTracking();
  }

  console.log('🖱️ 클릭 추적 모듈 로드 완료 (안전성 강화)');
}

// 클릭 이벤트 추적 (SDK 자동 수집 사용으로 비활성화)
function trackClickEvents() {
  // 중복 초기화 방지
  if (window.clickTrackingInitialized) {
    console.log('ℹ️ 클릭 추적이 이미 초기화됨');
    return;
  }
  
  console.log('🖱️ 클릭 추적 - SDK 자동 수집 사용으로 비활성화됨');
  
  // 초기화 플래그 설정
  window.clickTrackingInitialized = true;
  
  // SDK 자동 수집을 사용하므로 커스텀 클릭 추적은 비활성화
  // ta.trackLink() 기능이 SDK에서 제공됨
}