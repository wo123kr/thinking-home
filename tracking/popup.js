/**
 * 팝업 추적 모듈
 */

// 팝업 관련 추적
function trackPopupEvents() {
  // 팝업 표시 감지
  const popupObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element node
          // 팝업으로 추정되는 요소들 감지
          if (node.classList && (
            node.classList.contains('modal') ||
            node.classList.contains('popup') ||
            node.classList.contains('overlay') ||
            node.getAttribute('role') === 'dialog'
          )) {
            te.track('popup_shown', {
              popup_type: 'benefit_check',
              popup_id: node.id || 'unknown',
              popup_class: Array.from(node.classList).join(' ')
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
  
  // 팝업 닫기 버튼 추적
  document.addEventListener('click', function(event) {
    const target = event.target;
    
    // 혜택 확인하기 버튼 감지
    if (target.textContent && target.textContent.includes('혜택 확인하기')) {
      updateSessionActivity();
      te.track('popup_action', {
        action_type: 'benefit_check_click',
        button_text: target.textContent.trim(),
        element_id: target.id || null,
        element_class: target.className || null
      });
    }
    
    // 팝업 닫기 버튼 감지
    if (target.classList.contains('close') || 
        target.classList.contains('modal-close') ||
        target.getAttribute('aria-label') === 'Close' ||
        target.textContent === '+' ||
        target.closest('.popup-close')) {
      updateSessionActivity();
      te.track('popup_action', {
        action_type: 'popup_close',
        close_method: 'button_click',
        element_id: target.id || null,
        element_class: target.className || null
      });
    }
  });
  
  // ESC 키로 팝업 닫기 감지
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    updateSessionActivity();
    te.track('popup_action', {
      action_type: 'popup_close',
      close_method: 'escape_key'
    });
  }
});

// 전역 함수로 노출
window.trackPopupEvents = trackPopupEvents;
}