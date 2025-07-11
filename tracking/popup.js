/**
 * 팝업 추적 모듈
 * ThinkingData SDK와 연동하여 팝업 이벤트 추적
 */

import { updateSessionActivity } from '../core/session-manager.js';
import { trackingLog } from '../core/utils.js';

function getPopupInfo(node) {
  return {
    popup_id: node.id || node.getAttribute('data-popup-id') || 'unknown',
    popup_class: node.className || '',
    popup_type: node.getAttribute('data-popup-type') || 'modal',
                page_url: window.location.href,
                page_title: document.title
              };
}

function trackPopupShown(node) {
  if (typeof updateSessionActivity === 'function') updateSessionActivity();
  if (window.te && typeof window.te.track === 'function') {
    window.te.track('popup_shown', getPopupInfo(node));
  }
}

function trackPopupAction(action, node, extra = {}) {
  if (typeof updateSessionActivity === 'function') updateSessionActivity();
  if (window.te && typeof window.te.track === 'function') {
    window.te.track('popup_action', {
      ...getPopupInfo(node),
      action_type: action,
      ...extra
    });
  }
}

function observePopups() {
  // 진입 시 이미 떠있는 팝업도 추적
  document.querySelectorAll('.modal, .popup, .modal-container, [role="dialog"]').forEach(node => {
    if (!node.getAttribute('data-popup-tracked')) {
      trackPopupShown(node);
      node.setAttribute('data-popup-tracked', 'true');
    }
  });

  // 동적 팝업 감지
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && (
          node.classList.contains('modal') ||
          node.classList.contains('popup') ||
          node.classList.contains('modal-container') ||
          node.getAttribute('role') === 'dialog'
        )) {
          if (!node.getAttribute('data-popup-tracked')) {
            trackPopupShown(node);
            node.setAttribute('data-popup-tracked', 'true');
          }
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export function initPopupTracking() {
  observePopups();

  // 팝업 액션(혜택확인, 닫기 등) 추적
  document.addEventListener('click', event => {
    const target = event.target;
    // 혜택 확인하기
    if (target.textContent?.includes('혜택 확인하기')) {
      trackPopupAction('benefit_check_click', target.closest('.modal, .popup, .modal-container, [role="dialog"]') || target, {
        button_text: target.textContent.trim()
      });
    }
    // 닫기 버튼
    if (
      target.classList.contains('close') ||
      target.classList.contains('modal-close') ||
      target.getAttribute('aria-label') === 'Close' ||
      target.textContent === '+' ||
      target.closest('.popup-close')
    ) {
      trackPopupAction('popup_close', target.closest('.modal, .popup, .modal-container, [role="dialog"]') || target, {
        close_method: 'button_click'
      });
    }
  });

  // ESC 키로 팝업 닫기
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      // 현재 열려있는 팝업을 찾아서 추적
      const openPopup = document.querySelector('.modal[style*="display: block"], .popup[style*="display: block"], .modal-container[style*="display: block"]');
      trackPopupAction('popup_close', openPopup || document.body, { close_method: 'escape_key' });
      }
    });
  }

export function trackPopup() {
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('popup-open')) {
      window.thinkingdata.track('popup_open', { popup_id: event.target.id });
    }
    if (event.target.classList.contains('popup-close')) {
      window.thinkingdata.track('popup_close', { popup_id: event.target.id });
    }
  });
  trackingLog('✅ 팝업 트래킹 활성화');
}