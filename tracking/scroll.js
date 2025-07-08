/**
 * 스크롤 깊이 추적 모듈 - 동적 설정 가능한 구조
 */

// 🔒 안전한 스크롤 깊이 추적 변수 (중복 선언 방지)
let scrollDepthTracked = window.scrollDepthTracked || new Set();
let maxScrollDepth = window.maxScrollDepth || 0;
let isScrollTrackingInitialized = false;

// ✅ 전역에 안전하게 등록
window.scrollDepthTracked = scrollDepthTracked;
window.maxScrollDepth = maxScrollDepth;

function trackScrollDepth() {
  // 중복 초기화 방지
  if (window.scrollTrackingInitialized) {
    console.log('ℹ️ 스크롤 추적이 이미 초기화됨');
    return;
  }
  
  console.log('📜 스크롤 추적 초기화 시작...');
  
  // 초기화 플래그 설정
  window.scrollTrackingInitialized = true;
  
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(trackScrollDepth, 3000);
    return;
  }
  
  const scrollDepthThresholds = getScrollDepthThresholds();
  
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
  
  function handleScroll() {
    updateSessionActivity();
    const scrollData = calculateScrollDepth();
    
    // 최대 스크롤 깊이 업데이트
    if (scrollData.percentage > maxScrollDepth) {
      maxScrollDepth = scrollData.percentage;
    }
    
    // 임계값 도달 시 이벤트 전송
    scrollDepthThresholds.forEach(threshold => {
      if (scrollData.percentage >= threshold && !scrollDepthTracked.has(threshold)) {
        scrollDepthTracked.add(threshold);
        
        const scrollEventData = {
          scroll_depth_percentage: threshold,
          scroll_depth_pixels: scrollData.pixels,
          page_total_height_pixels: scrollData.totalHeight,
          page_name: document.title,
          page_url: window.location.href,
          scroll_direction: 'vertical',
          page_section: getCurrentPageSection(scrollData.pixels),
          scroll_speed: calculateScrollSpeed(),
          time_spent_on_page: getTimeSpentOnPage()
        };
        
        trackEvent('te_scroll_depth', scrollEventData);
        
        console.log('📜 스크롤 깊이 추적:', threshold + '%', scrollEventData.page_section);
      }
    });
  }
  
  // 스크롤 이벤트 리스너 (디바운싱 적용)
let scrollTimeout;
  const debounceDelay = getScrollDebounceDelay();
  
window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(handleScroll, debounceDelay);
  });
  
  console.log('✅ 스크롤 추적 초기화 완료');
}

// 동적 스크롤 깊이 임계값 (설정 가능)
function getScrollDepthThresholds() {
  const defaultThresholds = [25, 50, 75, 90, 100];
  const customThresholds = window.scrollDepthThresholds || [];
  return [...defaultThresholds, ...customThresholds].sort((a, b) => a - b);
}

// 동적 스크롤 디바운스 지연시간 (설정 가능)
function getScrollDebounceDelay() {
  return window.scrollDebounceDelay || 100;
}

// 현재 페이지 섹션 감지 (동적 설정 가능)
function getCurrentPageSection(scrollTop) {
  const sectionMappings = window.scrollSectionMappings || {
    'hero': {
      percentage: [0, 20],
      selectors: ['.hero-section', '.banner-section', '[data-section="hero"]'],
      keywords: ['hero', 'banner', 'main']
    },
    'features': {
      percentage: [20, 40],
      selectors: ['.features-section', '.feature-section', '[data-section="features"]'],
      keywords: ['feature', '기능', '특징']
    },
    'solutions': {
      percentage: [40, 60],
      selectors: ['.solutions-section', '.solution-section', '[data-section="solutions"]'],
      keywords: ['solution', '솔루션', '해결책']
    },
    'testimonials': {
      percentage: [60, 80],
      selectors: ['.testimonials-section', '.case-studies-section', '[data-section="testimonials"]'],
      keywords: ['testimonial', '사례', 'case']
    },
    'cta': {
      percentage: [80, 95],
      selectors: ['.cta-section', '.contact-section', '[data-section="cta"]'],
      keywords: ['cta', 'contact', '연락', '문의']
    },
    'footer': {
      percentage: [95, 100],
      selectors: ['footer', '.footer-section', '[data-section="footer"]'],
      keywords: ['footer', '푸터']
    }
  };
  
  // 스크롤 위치 기반 섹션 감지
  const windowHeight = window.innerHeight;
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  
  const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
  
  // 동적 매핑으로 섹션 감지
  for (const [section, config] of Object.entries(sectionMappings)) {
    // 퍼센트 기반 감지
    if (config.percentage && scrollPercentage >= config.percentage[0] && scrollPercentage < config.percentage[1]) {
      return section;
    }
    
    // 선택자 기반 감지
    if (config.selectors) {
      for (const selector of config.selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            return section;
          }
        }
      }
    }
    
    // 키워드 기반 감지
    if (config.keywords) {
      for (const keyword of config.keywords) {
        const elements = document.querySelectorAll(`[class*="${keyword}"], [id*="${keyword}"]`);
        for (const element of elements) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            return section;
          }
        }
      }
    }
  }
  
  return 'other';
}

// 스크롤 속도 계산
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

// 페이지 체류 시간 계산
function getTimeSpentOnPage() {
  if (!window.pageLoadTime) {
    window.pageLoadTime = Date.now();
    return 0;
  }
  
  return Math.round((Date.now() - window.pageLoadTime) / 1000); // 초 단위
}

// 세션 활동 업데이트 (직접 전역 함수 호출)
function updateSessionActivity() {
  // 전역 함수가 정의되어 있고, 자기 자신이 아닌 경우에만 호출
  if (typeof window.updateSessionActivity === 'function' && window.updateSessionActivity !== arguments.callee) {
    try {
      window.updateSessionActivity();
    } catch (e) {
      console.warn('📜 세션 활동 업데이트 오류:', e);
    }
  } else {
    // 전역 함수가 없거나 자기 자신인 경우 기본 동작
    try {
      if (window.lastActivityTime) {
        window.lastActivityTime = Date.now();
      }
    } catch (e) {
      console.warn('📜 기본 세션 활동 업데이트 오류:', e);
    }
  }
}

// 설정 업데이트 함수 (런타임에 설정 변경 가능)
function updateScrollTrackingConfig(newConfig) {
  if (newConfig.scrollDepthThresholds) {
    window.scrollDepthThresholds = [...(window.scrollDepthThresholds || []), ...newConfig.scrollDepthThresholds];
  }
  if (newConfig.scrollDebounceDelay) {
    window.scrollDebounceDelay = newConfig.scrollDebounceDelay;
  }
  if (newConfig.scrollSectionMappings) {
    window.scrollSectionMappings = { ...window.scrollSectionMappings, ...newConfig.scrollSectionMappings };
  }
  
  console.log('📜 스크롤 추적 설정 업데이트 완료:', newConfig);
}

// 디버깅용 함수
function debugScrollTracking() {
  console.log('📜 스크롤 추적 디버깅 정보:');
  console.log('- 스크롤 깊이 임계값:', getScrollDepthThresholds());
  console.log('- 스크롤 디바운스 지연시간:', getScrollDebounceDelay(), 'ms');
  console.log('- 섹션 매핑:', window.scrollSectionMappings);
  console.log('- 최대 스크롤 깊이:', maxScrollDepth, '%');
  console.log('- 현재 스크롤 위치:', window.pageYOffset || document.documentElement.scrollTop, 'px');
  console.log('- 페이지 총 높이:', Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  ), 'px');
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
  
  // 현재 섹션 확인
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  console.log('- 현재 섹션:', getCurrentPageSection(currentScrollTop));
}

// 전역 함수로 노출
window.trackScrollDepth = trackScrollDepth;
window.updateScrollTrackingConfig = updateScrollTrackingConfig;
window.debugScrollTracking = debugScrollTracking;

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📜 DOM 로드 완료, 스크롤 추적 시작');
    setTimeout(trackScrollDepth, 1000);
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('📜 DOM 이미 로드됨, 스크롤 추적 시작');
  setTimeout(trackScrollDepth, 1000);
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
  console.log('📜 ThinkingData 초기화 완료, 스크롤 추적 시작');
  setTimeout(trackScrollDepth, 500);
});

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('📜 페이지 로드 완료, 스크롤 추적 재확인');
  setTimeout(trackScrollDepth, 2000);
});