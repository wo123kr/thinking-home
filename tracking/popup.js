/**
 * 팝업 추적 모듈 - 동적 설정 가능한 구조
 */

// 팝업 관련 추적
function trackPopupEvents() {
  console.log('🎪 팝업 추적 초기화 시작...');
  
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(trackPopupEvents, 3000);
    return;
  }
  
  // 기존 팝업 감지 (페이지 로드 시 이미 존재하는 팝업)
  detectExistingPopups();
  
  // 팝업 표시 감지 (동적으로 추가되는 팝업)
  const popupObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element node
          // 팝업으로 추정되는 요소들 감지
          if (isPopupElement(node)) {
            trackPopupShown(node);
          }
          
          // node 내부의 팝업 요소들도 확인
          if (node.querySelectorAll) {
            const popupSelectors = getPopupSelectors();
            const popupElements = node.querySelectorAll(popupSelectors);
            popupElements.forEach(function(popup) {
              if (!popup.dataset.tracked) {
                trackPopupShown(popup);
              }
            });
          }
        }
      });
    });
  });
  
  popupObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // 팝업 상호작용 추적
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // 동적 버튼 감지
    const buttonType = getPopupButtonType(target);
    
    if (buttonType !== 'none') {
      updateSessionActivity();
      trackEvent('te_popup_action', {
        action_type: buttonType,
        button_text: (target.textContent ? target.textContent.trim() : '') + '',
        element_id: (target.id || '') + '',
        element_class: (target.className || '') + '',
        popup_type: getPopupType(target),
        page_url: window.location.href
      });
      console.log('🎪 팝업 버튼 클릭 추적:', buttonType);
    }
  });
  
  // ESC 키로 팝업 닫기 감지
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      updateSessionActivity();
      trackEvent('te_popup_action', {
        action_type: 'popup_close',
        close_method: 'escape_key',
        popup_type: getCurrentPopupType(),
        page_url: window.location.href
      });
      console.log('🎪 ESC 키로 팝업 닫기 추적');
    }
  });
  
  // 팝업 외부 클릭으로 닫기 감지
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // 동적 팝업 외부 클릭 감지
    if (isPopupOutsideClick(target)) {
      updateSessionActivity();
      trackEvent('te_popup_action', {
        action_type: 'popup_close',
        close_method: 'outside_click',
        popup_type: getCurrentPopupType(),
        page_url: window.location.href
      });
      console.log('🎪 팝업 외부 클릭으로 닫기 추적');
    }
  });
  
  console.log('✅ 팝업 추적 초기화 완료');
}

// 동적 팝업 선택자 (설정 가능)
function getPopupSelectors() {
  const defaultSelectors = [
    '.modal-container', '.modal', '.popup', '.overlay', '[role="dialog"]',
    '.lightbox', '.dialog', '.modal-dialog', '.popup-container'
  ];
  
  const customSelectors = window.popupSelectors || [];
  return [...defaultSelectors, ...customSelectors].join(', ');
}

// 팝업 요소인지 확인
function isPopupElement(element) {
  const popupSelectors = getPopupSelectors().split(', ');
  return popupSelectors.some(selector => {
    const trimmedSelector = selector.trim();
    return element.classList && element.classList.contains(trimmedSelector.replace('.', '')) ||
           element.getAttribute('role') === 'dialog' ||
           element.matches && element.matches(trimmedSelector);
  });
}

// 동적 팝업 버튼 타입 감지 (설정 가능)
function getPopupButtonType(element) {
  const popupButtonMappings = window.popupButtonMappings || {
    'benefit_check_click': {
      text: ['혜택 확인하기', 'benefit check', '혜택 보기', '프로모션 확인'],
      id: ['benefit', 'check', 'promotion'],
      class: ['benefit-check', 'promotion-button', 'button-3']
    },
    'popup_close': {
      text: ['+', '×', '닫기', 'close', 'X'],
      id: ['close', 'modal-close'],
      class: ['close', 'modal-close', 'popup-close', 'link-block-2']
    },
    'popup_confirm': {
      text: ['확인', 'confirm', 'ok', 'yes'],
      id: ['confirm', 'ok'],
      class: ['confirm-button', 'ok-button']
    },
    'popup_cancel': {
      text: ['취소', 'cancel', 'no'],
      id: ['cancel'],
      class: ['cancel-button']
    }
  };
  
  return matchPatterns(element, popupButtonMappings) || 'none';
}

// 동적 팝업 타입 감지 (설정 가능)
function getPopupType(element) {
  const popup = element.closest(getPopupSelectors());
  if (!popup) return 'unknown';
  
  const popupTypeMappings = window.popupTypeMappings || {
    'benefit_promotion': {
      text: ['혜택', '프로모션', 'benefit', 'promotion'],
      class: ['promotion-modal', 'benefit-popup'],
      id: ['promotion', 'benefit']
    },
    'newsletter_signup': {
      text: ['뉴스레터', '구독', 'newsletter', 'subscribe'],
      class: ['newsletter-modal', 'signup-popup'],
      id: ['newsletter', 'signup']
    },
    'cookie_consent': {
      text: ['쿠키', '개인정보', 'cookie', 'privacy'],
      class: ['cookie-modal', 'consent-popup'],
      id: ['cookie', 'consent']
    },
    'demo_request': {
      text: ['데모', '체험', 'demo', 'trial'],
      class: ['demo-modal', 'trial-popup'],
      id: ['demo', 'trial']
    }
  };
  
  return matchPatterns(popup, popupTypeMappings) || 'general';
}

// 현재 활성 팝업 타입 감지
function getCurrentPopupType() {
  const visiblePopup = document.querySelector(getPopupSelectors() + '[style*="display: block"], .modal-container:not([style*="display: none"])');
  if (visiblePopup) {
    return getPopupType(visiblePopup);
  }
  return 'unknown';
}

// 팝업 외부 클릭 감지 (동적)
function isPopupOutsideClick(target) {
  const popupSelectors = getPopupSelectors();
  
  // 팝업 내부 클릭이 아닌 경우
  if (target.closest(popupSelectors)) {
    return false;
  }
  
  // 팝업이 보이는 상태에서 외부 클릭
  const visiblePopup = document.querySelector(popupSelectors + '[style*="display: block"], .modal-container:not([style*="display: none"])');
  return !!visiblePopup;
}

// 기존 팝업 감지 (페이지 로드 시 이미 존재하는 팝업)
function detectExistingPopups() {
  const popupSelectors = getPopupSelectors();
  const existingPopups = document.querySelectorAll(popupSelectors);
  console.log(`🎪 기존 팝업 발견: ${existingPopups.length}개`);
  
  existingPopups.forEach(function(popup) {
    if (!popup.dataset.tracked) {
      trackPopupShown(popup);
    }
  });
}

// 팝업 표시 추적
function trackPopupShown(popup) {
  // 중복 추적 방지
  if (popup.dataset.tracked) {
    return;
  }
  
  popup.dataset.tracked = 'true';
  
  // 팝업 정보 수집
  const popupInfo = {
    popup_type: getPopupType(popup),
    popup_id: popup.id || 'unknown',
    popup_class: Array.from(popup.classList).join(' '),
    popup_visible: isElementVisible(popup),
    page_url: window.location.href,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 23)
  };
  
  // 동적 버튼 감지
  const buttonMappings = window.popupButtonMappings || {};
  const buttons = {};
  
  for (const [buttonType, patterns] of Object.entries(buttonMappings)) {
    const button = findButtonInPopup(popup, patterns);
    if (button) {
      buttons[buttonType] = {
              text: button.textContent ? button.textContent.trim() : '',
      id: button.id || '',
      class: button.className || ''
      };
    }
  }
  
  if (Object.keys(buttons).length > 0) {
    popupInfo.buttons = buttons;
  }
  
        trackEvent('te_popup_shown', popupInfo);
  
  console.log('🎪 팝업 표시 추적:', popupInfo);
}

// 팝업 내 버튼 찾기
function findButtonInPopup(popup, patterns) {
  const buttons = popup.querySelectorAll('button, a, [role="button"]');
  
  for (const button of buttons) {
    const text = button.textContent ? button.textContent.trim() : '';
    const id = button.id || '';
    const classList = button.className ? button.className.split(' ') : [];
    
    if (patterns.text && patterns.text.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))) {
      return button;
    }
    if (patterns.id && patterns.id.some(pattern => id.toLowerCase().includes(pattern.toLowerCase()))) {
      return button;
    }
    if (patterns.class && patterns.class.some(pattern => classList.some(cls => cls.toLowerCase().includes(pattern.toLowerCase())))) {
      return button;
    }
  }
  
  return null;
}

// 요소가 보이는지 확인
function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
}

// 세션 활동 업데이트
function updateSessionActivity() {
  if (typeof window.updateSessionActivity === 'function') {
    window.updateSessionActivity();
  }
}

// 설정 업데이트 함수 (런타임에 설정 변경 가능)
function updatePopupTrackingConfig(newConfig) {
  if (newConfig.popupSelectors) {
    window.popupSelectors = [...(window.popupSelectors || []), ...newConfig.popupSelectors];
  }
  if (newConfig.popupButtonMappings) {
    window.popupButtonMappings = { ...window.popupButtonMappings, ...newConfig.popupButtonMappings };
  }
  if (newConfig.popupTypeMappings) {
    window.popupTypeMappings = { ...window.popupTypeMappings, ...newConfig.popupTypeMappings };
  }
  
  console.log('🎪 팝업 추적 설정 업데이트 완료:', newConfig);
}

// 디버깅용 함수
function debugPopupTracking() {
  console.log('🎪 팝업 추적 디버깅 정보:');
  console.log('- 팝업 선택자:', getPopupSelectors());
  console.log('- 팝업 버튼 매핑:', window.popupButtonMappings);
  console.log('- 팝업 타입 매핑:', window.popupTypeMappings);
  console.log('- 현재 활성 팝업 타입:', getCurrentPopupType());
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
  
  // 현재 페이지의 팝업 요소들 확인
  const popupSelectors = getPopupSelectors();
  const popups = document.querySelectorAll(popupSelectors);
  console.log('- 현재 페이지 팝업 개수:', popups.length);
  
  popups.forEach((popup, index) => {
    console.log(`  - 팝업 ${index + 1}:`, {
      id: popup.id,
      class: popup.className,
      type: getPopupType(popup),
      visible: isElementVisible(popup)
    });
  });
}

// 전역 함수로 노출
window.trackPopupEvents = trackPopupEvents;
window.updatePopupTrackingConfig = updatePopupTrackingConfig;
window.debugPopupTracking = debugPopupTracking;

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🎪 DOM 로드 완료, 팝업 추적 시작');
    setTimeout(trackPopupEvents, 1000);
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('🎪 DOM 이미 로드됨, 팝업 추적 시작');
  setTimeout(trackPopupEvents, 1000);
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
  console.log('🎪 ThinkingData 초기화 완료, 팝업 추적 시작');
  setTimeout(trackPopupEvents, 500);
});

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('🎪 페이지 로드 완료, 팝업 추적 재확인');
  setTimeout(trackPopupEvents, 2000);
});