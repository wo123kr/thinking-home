/**
 * 클릭 이벤트 추적 모듈 - 동적 설정 가능한 구조
 */

// 버튼 및 링크 클릭 추적 (SDK 자동 수집과 중복 방지를 위해 비활성화)
function trackClickEvents() {
  console.log('🖱️ 클릭 추적 - SDK 자동 수집 사용으로 비활성화됨');
  
  // SDK 자동 수집 이벤트(element_click, outbound_link_click)가 이미 수집되므로
  // 커스텀 클릭 이벤트는 중복을 방지하기 위해 비활성화
  return;
  
  // 아래 코드는 참고용으로 유지 (필요시 주석 해제)
  /*
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(trackClickEvents, 3000);
    return;
  }
  
  document.addEventListener('click', function(event) {
    const target = event.target;
    const closestClickable = target.closest(getClickableSelectors());
    
    if (closestClickable) {
      updateSessionActivity();
      
      const elementData = {
        element_id: closestClickable.id || '',
        element_class_list: closestClickable.className ? closestClickable.className.split(' ') : [],
        // name 추출: 텍스트만, 2000자 이내, 없으면 alt/id/unknown
        element_name: (function() {
          let name = '';
          if (closestClickable.textContent && closestClickable.textContent.trim()) {
            name = closestClickable.textContent.trim();
          } else if (closestClickable.alt) {
            name = closestClickable.alt;
          } else if (closestClickable.id) {
            name = closestClickable.id;
          } else {
            name = 'unknown';
          }
          if (name.length > 2000) name = name.substring(0, 2000);
          return name;
        })(),
        element_tag_name: closestClickable.tagName.toLowerCase(),
        element_target_url: closestClickable.href || '',
        page_url: window.location.href,
        click_coordinates_page: {
          x_coordinate: event.pageX,
          y_coordinate: event.pageY
        }
      };
      
      // 동적 버튼 타입 감지
      const buttonType = getButtonType(closestClickable);
      const buttonInfo = getButtonInfo(closestClickable);
      
      // 메뉴 클릭 감지 (동적 선택자)
      if (isMenuElement(closestClickable)) {
        trackEvent('te_menu_click', {
          ...elementData,
          menu_id: closestClickable.id || elementData.element_name || 'unknown',
          menu_name: elementData.element_name,
          menu_depth: getMenuDepth(closestClickable),
          menu_position: getMenuPosition(closestClickable),
          menu_target_url: elementData.element_target_url,
          button_type: buttonType,
          button_info: buttonInfo
        });
        console.log('🖱️ 메뉴 클릭 추적:', elementData.element_name, buttonInfo);
      }
      // 외부 링크 클릭 감지
      else if (closestClickable.href && isExternalLink(closestClickable.href)) {
        trackEvent('te_outbound_link_click', {
          outbound_url: closestClickable.href,
          link_text: elementData.element_name,
          link_id: elementData.element_id,
          link_class_list: elementData.element_class_list,
          button_type: buttonType,
          button_info: buttonInfo
        });
        console.log('🖱️ 외부 링크 클릭 추적:', elementData.element_name, buttonInfo);
      }
      // 특화 버튼 클릭
      else if (buttonType !== 'general') {
        trackEvent('te_specialized_button_click', {
          ...elementData,
          button_type: buttonType,
          button_category: getButtonCategory(closestClickable),
          button_info: buttonInfo
        });
        console.log('🖱️ 특화 버튼 클릭 추적:', buttonType, elementData.element_name, buttonInfo);
      }
      // 일반 요소 클릭
      else {
        trackEvent('te_element_click', elementData);
        console.log('🖱️ 일반 요소 클릭 추적:', elementData.element_name);
      }
    }
  });
  
  console.log('✅ 클릭 추적 초기화 완료');
  */
}

// 동적 클릭 가능한 요소 선택자 (설정 가능)
function getClickableSelectors() {
  const defaultSelectors = [
    'a', 'button', '[role="button"]', '.btn', '.button', 
    '.w-button', '.link-block', '.clickable', '[onclick]'
  ];
  
  const customSelectors = window.clickableSelectors || [];
  return [...defaultSelectors, ...customSelectors].join(', ');
}

// 동적 버튼 타입 감지 (설정 가능)
function getButtonType(element) {
  const buttonTypeMappings = window.buttonTypeMappings || {
    'demo_request': {
      text: ['데모 신청', '데모 신청하기', 'demo request', 'request demo'],
      url: ['demo', 'request'],
      id: ['demo', 'request'],
      class: ['demo-button', 'request-button']
    },
    'contact_inquiry': {
      text: ['문의하기', '문의', 'contact', 'inquiry', '연락하기'],
      url: ['contact', 'inquiry'],
      id: ['contact', 'inquiry'],
      class: ['contact-button', 'inquiry-button']
    },
    'learn_more': {
      text: ['자세히 알아보기', '더 알아보기', 'learn more', '자세히 보기'],
      id: ['learn', 'more'],
      class: ['learn-more', 'more-info']
    },
    'go_to_page': {
      text: ['바로가기', 'go to', '이동'],
      id: ['go', 'link'],
      class: ['go-to', 'link-to']
    },
    'benefit_check': {
      text: ['혜택 확인하기', 'benefit check', '혜택 보기'],
      id: ['benefit', 'check'],
      class: ['benefit-check', 'promotion']
    },
    'download': {
      text: ['다운로드', 'download', '받기'],
      url: ['.pdf', '.doc', '.zip'],
      id: ['download'],
      class: ['download-button']
    }
  };
  
  return matchPatterns(element, buttonTypeMappings) || 'general';
}

// 동적 메뉴 요소 감지 (설정 가능)
function isMenuElement(element) {
  const menuSelectors = window.menuSelectors || [
    'nav', '.navigation', '.menu', '.nav-menu', 
    'header', '.header', '.gnb', '.main-nav'
  ];
  
  return menuSelectors.some(selector => element.closest(selector));
}

// 동적 버튼 카테고리 분류 (설정 가능)
function getButtonCategory(element) {
  const href = element.href || '';
  const classList = element.className ? element.className.split(' ') : [];
  const id = element.id || '';
  
  const categoryMappings = window.buttonCategoryMappings || {
    'content': {
      url: ['/blog', '/user-case', '/article'],
      id: ['blog', 'case', 'article'],
      class: ['content-link', 'blog-link']
    },
    'company': {
      url: ['/company', '/culture', '/news', '/about'],
      id: ['company', 'culture', 'news'],
      class: ['company-link', 'about-link']
    },
    'conversion': {
      url: ['/form-', '/contact', '/demo'],
      id: ['demo', 'form', 'contact'],
      class: ['cta-button', 'conversion-button']
    },
    'product': {
      url: ['/solution', '/feature', '/product'],
      id: ['solution', 'feature', 'product'],
      class: ['product-link', 'solution-link']
    }
  };
  
  for (const [category, patterns] of Object.entries(categoryMappings)) {
    if (patterns.url && patterns.url.some(pattern => href.includes(pattern))) {
      return category;
    }
    if (patterns.id && patterns.id.some(pattern => id.includes(pattern))) {
      return category;
    }
    if (patterns.class && patterns.class.some(pattern => classList.some(cls => cls.includes(pattern)))) {
      return category;
    }
  }
  
  return 'other';
}

// 버튼 상세 정보 수집 (ID 유무와 관계없이)
function getButtonInfo(element) {
  const text = element.textContent ? element.textContent.trim() : '';
  const href = element.href || '';
  const classList = element.className ? element.className.split(' ') : [];
  const id = element.id || '';
  const tagName = element.tagName.toLowerCase();
  
  return {
    has_id: !!id,
    id_value: id,
    text_content: text,
    href: href,
    tag_name: tagName,
    class_list: classList,
    // ID가 없는 경우 텍스트 기반 식별자 생성
    text_based_id: generateTextBasedId(text),
    // 클래스 기반 식별자
    class_based_id: generateClassBasedId(classList),
    // 위치 기반 식별자
    position_based_id: generatePositionBasedId(element)
  };
}

// 텍스트 기반 ID 생성 (ID가 없는 경우)
function generateTextBasedId(text) {
  if (!text) return 'no_text';
  
  // 텍스트를 기반으로 한 고유 식별자 생성
  const cleanText = text.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
  const hash = simpleHash(cleanText);
  
  return `text_${cleanText.substring(0, 10)}_${hash}`;
}

// 클래스 기반 ID 생성
function generateClassBasedId(classList) {
  if (!classList || classList.length === 0) return 'no_class';
  
  // 의미있는 클래스들만 선택 (설정 가능)
  const meaningfulClassPatterns = window.meaningfulClassPatterns || [
    'btn', 'button', 'link', 'w-', 'brix', 'div-block'
  ];
  
  const meaningfulClasses = classList.filter(cls => 
    meaningfulClassPatterns.some(pattern => cls.includes(pattern))
  );
  
  if (meaningfulClasses.length === 0) return 'no_meaningful_class';
  
  const classString = meaningfulClasses.join('_');
  const hash = simpleHash(classString);
  
  return `class_${classString.substring(0, 15)}_${hash}`;
}

// 위치 기반 ID 생성
function generatePositionBasedId(element) {
  const rect = element.getBoundingClientRect();
  const pageY = window.pageYOffset + rect.top;
  const pageX = window.pageXOffset + rect.left;
  
  // 위치를 기반으로 한 식별자 생성
  const positionHash = simpleHash(`${Math.round(pageX)}_${Math.round(pageY)}`);
  
  return `pos_${Math.round(pageX)}_${Math.round(pageY)}_${positionHash}`;
}

// 간단한 해시 함수
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash).toString(36);
}

// 메뉴 깊이 판단
function getMenuDepth(element) {
  let depth = 1;
  let parent = element.parentElement;
  
  const menuSelectors = window.menuSelectors || ['nav', '.navigation', '.menu', '.nav-menu'];
  
  while (parent && !menuSelectors.some(selector => parent.closest(selector))) {
    if (parent.tagName === 'UL' || parent.tagName === 'OL') {
      depth++;
    }
    parent = parent.parentElement;
  }
  
  return depth + '차';
}

// 메뉴 위치 판단
function getMenuPosition(element) {
  const menuSelectors = window.menuSelectors || ['nav', '.navigation', '.menu', '.nav-menu'];
  const nav = menuSelectors.reduce((found, selector) => found || element.closest(selector), null);
  
  if (!nav) return 'unknown';
  
  const rect = nav.getBoundingClientRect();
  if (rect.top < 100) return '상단';
  if (rect.left < 100) return '사이드';
  if (rect.bottom > window.innerHeight - 100) return '푸터';
  
  return '기타';
}

// 세션 활동 업데이트
function updateSessionActivity() {
  if (typeof window.updateSessionActivity === 'function') {
    window.updateSessionActivity();
  }
}

// 설정 업데이트 함수 (런타임에 설정 변경 가능)
function updateClickTrackingConfig(newConfig) {
  if (newConfig.clickableSelectors) {
    window.clickableSelectors = [...(window.clickableSelectors || []), ...newConfig.clickableSelectors];
  }
  if (newConfig.buttonTypeMappings) {
    window.buttonTypeMappings = { ...window.buttonTypeMappings, ...newConfig.buttonTypeMappings };
  }
  if (newConfig.menuSelectors) {
    window.menuSelectors = [...(window.menuSelectors || []), ...newConfig.menuSelectors];
  }
  if (newConfig.buttonCategoryMappings) {
    window.buttonCategoryMappings = { ...window.buttonCategoryMappings, ...newConfig.buttonCategoryMappings };
  }
  if (newConfig.meaningfulClassPatterns) {
    window.meaningfulClassPatterns = [...(window.meaningfulClassPatterns || []), ...newConfig.meaningfulClassPatterns];
  }
  
  console.log('🖱️ 클릭 추적 설정 업데이트 완료:', newConfig);
}

// 디버깅용 함수
function debugClickTracking() {
  console.log('🖱️ 클릭 추적 디버깅 정보:');
  console.log('- 클릭 가능한 선택자:', getClickableSelectors());
  console.log('- 버튼 타입 매핑:', window.buttonTypeMappings);
  console.log('- 메뉴 선택자:', window.menuSelectors);
  console.log('- 버튼 카테고리 매핑:', window.buttonCategoryMappings);
  console.log('- 의미있는 클래스 패턴:', window.meaningfulClassPatterns);
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
}

// 전역 함수로 노출
window.trackClickEvents = trackClickEvents;
window.isExternalLink = isExternalLink;
window.updateClickTrackingConfig = updateClickTrackingConfig;
window.debugClickTracking = debugClickTracking;

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🖱️ DOM 로드 완료, 클릭 추적 시작');
    setTimeout(trackClickEvents, 1000);
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('🖱️ DOM 이미 로드됨, 클릭 추적 시작');
  setTimeout(trackClickEvents, 1000);
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
  console.log('🖱️ ThinkingData 초기화 완료, 클릭 추적 시작');
  setTimeout(trackClickEvents, 500);
});

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('🖱️ 페이지 로드 완료, 클릭 추적 재확인');
  setTimeout(trackClickEvents, 2000);
});