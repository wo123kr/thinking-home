/**
 * 운영 팝업 모듈 (Operate Popup)
 * TDStrategy 과제 트리거를 팝업으로 표시
 *
 * 팝업 타입:
 * - modal: 화면 중앙 오버레이
 * - banner: 상단/하단 고정 배너
 * - toast: 우측 하단 알림
 * - slide: 측면 슬라이드인
 */

// ============================================
// 상수 정의
// ============================================
const POPUP_TYPES = {
  MODAL: 'modal',
  BANNER: 'banner',
  TOAST: 'toast',
  SLIDE: 'slide'
};

const STORAGE_KEY = 'te_operate_popup_history';
const DEFAULT_DISPLAY_LIMIT = 1; // 기본 1회 노출
const DEFAULT_LIMIT_PERIOD = 24 * 60 * 60 * 1000; // 24시간

// 기본 디자인 설정
const DEFAULT_STYLE = {
  maxWidth: '480px',
  backgroundColor: '#ffffff',
  primaryColor: '#4F46E5',
  primaryHoverColor: '#4338CA',
  secondaryColor: '#E5E7EB',
  secondaryHoverColor: '#D1D5DB',
  borderRadius: '12px',
  titleColor: '#333333',
  titleFontSize: '18px',
  bodyColor: '#666666',
  bodyFontSize: '14px',
  imageWidth: '100%',
  imageHeight: 'auto',
  imageFit: 'cover' // cover, contain, fill, none
};

// ============================================
// CSS 스타일 삽입
// ============================================
function injectStyles() {
  if (document.getElementById('te-operate-popup-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'te-operate-popup-styles';
  styles.textContent = `
    /* 공통 스타일 */
    .te-popup-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99998;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .te-popup-overlay.te-show {
      opacity: 1;
    }

    .te-popup {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      z-index: 99999;
    }
    .te-popup * {
      box-sizing: border-box;
    }
    .te-popup-close {
      position: absolute;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      transition: color 0.2s;
      padding: 8px;
      line-height: 1;
    }
    .te-popup-close:hover {
      color: #333;
    }
    .te-popup-image {
      max-width: 100%;
      height: auto;
      display: block;
    }
    .te-popup-title {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    .te-popup-body {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
    .te-popup-btn {
      display: inline-block;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: all 0.2s;
    }
    .te-popup-btn-primary {
      background: #4F46E5;
      color: #fff;
    }
    .te-popup-btn-primary:hover {
      background: #4338CA;
    }
    .te-popup-btn-secondary {
      background: #E5E7EB;
      color: #374151;
    }
    .te-popup-btn-secondary:hover {
      background: #D1D5DB;
    }

    /* Modal 스타일 */
    .te-popup-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 480px;
      width: 90%;
      max-height: 90vh;
      overflow: hidden;
      opacity: 0;
      transition: all 0.3s ease;
    }
    .te-popup-modal.te-show {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    .te-popup-modal .te-popup-close {
      top: 12px;
      right: 12px;
    }
    .te-popup-modal .te-popup-content {
      padding: 24px;
    }
    .te-popup-modal .te-popup-image {
      border-radius: 12px 12px 0 0;
    }
    .te-popup-modal .te-popup-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    /* Banner 스타일 */
    .te-popup-banner {
      position: fixed;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      transform: translateY(-100%);
      transition: transform 0.4s ease;
    }
    .te-popup-banner.te-position-top {
      top: 0;
      transform: translateY(-100%);
    }
    .te-popup-banner.te-position-bottom {
      bottom: 0;
      top: auto;
      transform: translateY(100%);
    }
    .te-popup-banner.te-show {
      transform: translateY(0);
    }
    .te-popup-banner .te-popup-close {
      position: static;
      color: rgba(255,255,255,0.8);
      flex-shrink: 0;
    }
    .te-popup-banner .te-popup-close:hover {
      color: #fff;
    }
    .te-popup-banner .te-popup-title {
      color: #fff;
      margin: 0;
      font-size: 16px;
    }
    .te-popup-banner .te-popup-body {
      color: rgba(255,255,255,0.9);
      margin: 0;
      flex: 1;
    }
    .te-popup-banner .te-popup-btn {
      background: #fff;
      color: #667eea;
      flex-shrink: 0;
    }
    .te-popup-banner .te-popup-btn:hover {
      background: #f0f0f0;
    }

    /* Toast 스타일 */
    .te-popup-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      max-width: 360px;
      width: calc(100% - 48px);
      overflow: hidden;
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    .te-popup-toast.te-show {
      transform: translateX(0);
    }
    .te-popup-toast .te-popup-close {
      top: 8px;
      right: 8px;
    }
    .te-popup-toast .te-popup-content {
      padding: 16px;
    }
    .te-popup-toast .te-popup-title {
      font-size: 15px;
      padding-right: 24px;
    }
    .te-popup-toast .te-popup-body {
      font-size: 13px;
      margin-bottom: 12px;
    }
    .te-popup-toast .te-popup-btn {
      width: 100%;
      padding: 10px 16px;
    }

    /* Slide 스타일 */
    .te-popup-slide {
      position: fixed;
      top: 0;
      right: 0;
      height: 100%;
      width: 400px;
      max-width: 90%;
      background: #fff;
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.4s ease;
      overflow-y: auto;
    }
    .te-popup-slide.te-show {
      transform: translateX(0);
    }
    .te-popup-slide .te-popup-close {
      top: 16px;
      right: 16px;
    }
    .te-popup-slide .te-popup-content {
      padding: 24px;
      padding-top: 60px;
    }
    .te-popup-slide .te-popup-image {
      margin: -24px -24px 24px -24px;
      margin-top: -60px;
      width: calc(100% + 48px);
      max-width: none;
    }

    /* 모바일 반응형 */
    @media (max-width: 480px) {
      .te-popup-modal {
        width: 95%;
        max-height: 85vh;
      }
      .te-popup-banner {
        flex-wrap: wrap;
        padding: 12px 16px;
      }
      .te-popup-toast {
        right: 12px;
        bottom: 12px;
        width: calc(100% - 24px);
        max-width: none;
      }
      .te-popup-slide {
        width: 100%;
        max-width: 100%;
      }
    }

    /* 애니메이션 */
    @keyframes te-shake {
      0%, 100% { transform: translate(-50%, -50%) rotate(0); }
      25% { transform: translate(-50%, -50%) rotate(-1deg); }
      75% { transform: translate(-50%, -50%) rotate(1deg); }
    }
    .te-popup-modal.te-shake {
      animation: te-shake 0.3s ease;
    }
  `;
  document.head.appendChild(styles);
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 팝업 노출 이력 가져오기
 */
function getPopupHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

/**
 * 팝업 노출 이력 저장
 */
function savePopupHistory(taskId) {
  try {
    const history = getPopupHistory();
    if (!history[taskId]) {
      history[taskId] = { count: 0, timestamps: [] };
    }
    history[taskId].count++;
    history[taskId].timestamps.push(Date.now());

    // 최근 100개만 유지
    if (history[taskId].timestamps.length > 100) {
      history[taskId].timestamps = history[taskId].timestamps.slice(-100);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('팝업 이력 저장 실패:', e);
  }
}

/**
 * 팝업 표시 가능 여부 확인 (빈도 제한)
 */
function canShowPopup(taskId, options = {}) {
  const {
    maxDisplayCount = DEFAULT_DISPLAY_LIMIT,
    limitPeriod = DEFAULT_LIMIT_PERIOD
  } = options;

  const history = getPopupHistory();
  const taskHistory = history[taskId];

  if (!taskHistory) return true;

  // 기간 내 노출 횟수 계산
  const now = Date.now();
  const recentCount = taskHistory.timestamps.filter(
    ts => now - ts < limitPeriod
  ).length;

  return recentCount < maxDisplayCount;
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// 팝업 렌더링
// ============================================

/**
 * 스타일 객체를 inline style 문자열로 변환
 */
function buildInlineStyle(styleObj) {
  if (!styleObj || Object.keys(styleObj).length === 0) return '';
  return Object.entries(styleObj)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

/**
 * 팝업 콘텐츠 HTML 생성
 */
function renderPopupContent(content, type, customStyle = {}) {
  const {
    image,
    title,
    body,
    primaryButton,
    secondaryButton,
    primaryButtonUrl,
    secondaryButtonUrl
  } = content;

  // 스타일 병합 (기본값 + 커스텀)
  const style = { ...DEFAULT_STYLE, ...customStyle };

  let html = '';

  // 이미지
  if (image) {
    const imageStyle = buildInlineStyle({
      'width': style.imageWidth,
      'height': style.imageHeight,
      'object-fit': style.imageFit
    });
    html += `<img src="${escapeHtml(image)}" alt="" class="te-popup-image" style="${imageStyle}">`;
  }

  // 콘텐츠 영역
  html += `<div class="te-popup-content">`;

  if (title) {
    const titleStyle = buildInlineStyle({
      'color': style.titleColor,
      'font-size': style.titleFontSize
    });
    html += `<h3 class="te-popup-title" style="${titleStyle}">${escapeHtml(title)}</h3>`;
  }

  if (body) {
    const bodyStyle = buildInlineStyle({
      'color': style.bodyColor,
      'font-size': style.bodyFontSize
    });
    html += `<p class="te-popup-body" style="${bodyStyle}">${escapeHtml(body)}</p>`;
  }

  // 버튼 영역
  if (primaryButton || secondaryButton) {
    html += `<div class="te-popup-buttons">`;

    if (secondaryButton) {
      const tag = secondaryButtonUrl ? 'a' : 'button';
      const href = secondaryButtonUrl ? ` href="${escapeHtml(secondaryButtonUrl)}" target="_blank"` : '';
      const btnStyle = buildInlineStyle({
        'background-color': style.secondaryColor
      });
      html += `<${tag}${href} class="te-popup-btn te-popup-btn-secondary" style="${btnStyle}" data-action="secondary">${escapeHtml(secondaryButton)}</${tag}>`;
    }

    if (primaryButton) {
      const tag = primaryButtonUrl ? 'a' : 'button';
      const href = primaryButtonUrl ? ` href="${escapeHtml(primaryButtonUrl)}" target="_blank"` : '';
      const btnStyle = buildInlineStyle({
        'background-color': style.primaryColor
      });
      html += `<${tag}${href} class="te-popup-btn te-popup-btn-primary" style="${btnStyle}" data-action="primary">${escapeHtml(primaryButton)}</${tag}>`;
    }

    html += `</div>`;
  }

  html += `</div>`;

  return html;
}

/**
 * 모달 팝업 생성
 */
function createModal(content, options) {
  const customStyle = content.style || {};
  const style = { ...DEFAULT_STYLE, ...customStyle };

  const overlay = document.createElement('div');
  overlay.className = 'te-popup-overlay';

  const modal = document.createElement('div');
  modal.className = 'te-popup te-popup-modal';

  // 컨테이너 스타일 적용
  const containerStyle = buildInlineStyle({
    'max-width': style.maxWidth,
    'background-color': style.backgroundColor,
    'border-radius': style.borderRadius
  });
  modal.setAttribute('style', containerStyle);

  modal.innerHTML = `
    <button class="te-popup-close" aria-label="닫기">&times;</button>
    ${renderPopupContent(content, POPUP_TYPES.MODAL, customStyle)}
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // 애니메이션
  requestAnimationFrame(() => {
    overlay.classList.add('te-show');
    modal.classList.add('te-show');
  });

  return { container: modal, overlay };
}

/**
 * 배너 팝업 생성
 */
function createBanner(content, options) {
  const position = options.position || 'top';
  const customStyle = content.style || {};
  const style = { ...DEFAULT_STYLE, ...customStyle };

  const banner = document.createElement('div');
  banner.className = `te-popup te-popup-banner te-position-${position}`;

  // 배너 스타일 적용
  if (style.backgroundColor && style.backgroundColor !== '#ffffff') {
    banner.style.background = style.backgroundColor;
  }
  if (style.borderRadius) {
    banner.style.borderRadius = style.borderRadius;
  }

  let html = '';
  if (content.title) {
    const titleStyle = buildInlineStyle({
      'color': style.titleColor,
      'font-size': style.titleFontSize
    });
    html += `<span class="te-popup-title" style="${titleStyle}">${escapeHtml(content.title)}</span>`;
  }
  if (content.body) {
    const bodyStyle = buildInlineStyle({
      'color': style.bodyColor,
      'font-size': style.bodyFontSize
    });
    html += `<span class="te-popup-body" style="${bodyStyle}">${escapeHtml(content.body)}</span>`;
  }
  if (content.primaryButton) {
    const tag = content.primaryButtonUrl ? 'a' : 'button';
    const href = content.primaryButtonUrl ? ` href="${escapeHtml(content.primaryButtonUrl)}" target="_blank"` : '';
    const btnStyle = buildInlineStyle({
      'background-color': style.primaryColor
    });
    html += `<${tag}${href} class="te-popup-btn" style="${btnStyle}" data-action="primary">${escapeHtml(content.primaryButton)}</${tag}>`;
  }
  html += `<button class="te-popup-close" aria-label="닫기">&times;</button>`;

  banner.innerHTML = html;
  document.body.appendChild(banner);

  requestAnimationFrame(() => {
    banner.classList.add('te-show');
  });

  return { container: banner };
}

/**
 * 토스트 팝업 생성
 */
function createToast(content, options) {
  const customStyle = content.style || {};
  const style = { ...DEFAULT_STYLE, ...customStyle };

  const toast = document.createElement('div');
  toast.className = 'te-popup te-popup-toast';

  // 컨테이너 스타일 적용
  const containerStyle = buildInlineStyle({
    'max-width': style.maxWidth !== '480px' ? style.maxWidth : '360px',
    'background-color': style.backgroundColor,
    'border-radius': style.borderRadius
  });
  toast.setAttribute('style', containerStyle);

  toast.innerHTML = `
    <button class="te-popup-close" aria-label="닫기">&times;</button>
    ${renderPopupContent(content, POPUP_TYPES.TOAST, customStyle)}
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('te-show');
  });

  // 자동 닫기 (기본 10초)
  const autoCloseDelay = options.autoClose !== false ? (options.autoCloseDelay || 10000) : null;

  return { container: toast, autoCloseDelay };
}

/**
 * 슬라이드 팝업 생성
 */
function createSlide(content, options) {
  const customStyle = content.style || {};
  const style = { ...DEFAULT_STYLE, ...customStyle };

  const overlay = document.createElement('div');
  overlay.className = 'te-popup-overlay';

  const slide = document.createElement('div');
  slide.className = 'te-popup te-popup-slide';

  // 컨테이너 스타일 적용
  const containerStyle = buildInlineStyle({
    'width': style.maxWidth !== '480px' ? style.maxWidth : '400px',
    'background-color': style.backgroundColor
  });
  slide.setAttribute('style', containerStyle);

  slide.innerHTML = `
    <button class="te-popup-close" aria-label="닫기">&times;</button>
    ${renderPopupContent(content, POPUP_TYPES.SLIDE, customStyle)}
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(slide);

  requestAnimationFrame(() => {
    overlay.classList.add('te-show');
    slide.classList.add('te-show');
  });

  return { container: slide, overlay };
}

// ============================================
// 팝업 관리
// ============================================

// 현재 열린 팝업 추적
const activePopups = new Map();

/**
 * 팝업 닫기
 */
function closePopup(popupId, closeMethod = 'manual') {
  const popup = activePopups.get(popupId);
  if (!popup) return;

  const { container, overlay, taskId, opsProperties, autoCloseTimer } = popup;

  // 타이머 정리
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
  }

  // 닫기 애니메이션
  container.classList.remove('te-show');
  if (overlay) {
    overlay.classList.remove('te-show');
  }

  // 닫기 이벤트 전송
  if (opsProperties && window.TDAnalytics) {
    try {
      window.TDAnalytics.track('ops_close', {
        ...opsProperties,
        close_method: closeMethod
      });
    } catch (e) {
      console.warn('ops_close 이벤트 전송 실패:', e);
    }
  }

  // DOM 제거
  setTimeout(() => {
    container.remove();
    if (overlay) overlay.remove();
    activePopups.delete(popupId);
  }, 400);

  // 커스텀 이벤트
  window.dispatchEvent(new CustomEvent('te:popup:close', {
    detail: { popupId, taskId, closeMethod }
  }));
}

/**
 * 팝업 표시
 */
function showPopup(triggerResult, options = {}) {
  const {
    taskId,
    content = {},
    opsProperties,
    userParams = {}
  } = triggerResult;

  // 팝업 타입 결정 (content 또는 userParams에서)
  const popupType = content.popupType || userParams.popupType || options.type || POPUP_TYPES.MODAL;

  // 빈도 제한 확인
  const limitOptions = {
    maxDisplayCount: content.maxDisplayCount || userParams.maxDisplayCount || options.maxDisplayCount,
    limitPeriod: content.limitPeriod || userParams.limitPeriod || options.limitPeriod
  };

  if (!canShowPopup(taskId, limitOptions)) {
    if (window.trackingConfig?.debug?.showConsoleLogs) {
      console.log(`⏸️ 팝업 빈도 제한으로 미표시: ${taskId}`);
    }
    return null;
  }

  // 스타일 삽입
  injectStyles();

  // 팝업 ID 생성
  const popupId = `te-popup-${taskId}-${Date.now()}`;

  // 팝업 생성
  let popupElements;
  const mergedOptions = { ...options, ...userParams };

  switch (popupType) {
    case POPUP_TYPES.BANNER:
      popupElements = createBanner(content, mergedOptions);
      break;
    case POPUP_TYPES.TOAST:
      popupElements = createToast(content, mergedOptions);
      break;
    case POPUP_TYPES.SLIDE:
      popupElements = createSlide(content, mergedOptions);
      break;
    case POPUP_TYPES.MODAL:
    default:
      popupElements = createModal(content, mergedOptions);
      break;
  }

  const { container, overlay, autoCloseDelay } = popupElements;
  container.setAttribute('data-popup-id', popupId);
  container.setAttribute('data-task-id', taskId);

  // 팝업 정보 저장
  const popupInfo = {
    container,
    overlay,
    taskId,
    opsProperties,
    popupType,
    autoCloseTimer: null
  };
  activePopups.set(popupId, popupInfo);

  // 이벤트 핸들러 등록
  setupPopupEvents(popupId, popupInfo);

  // 자동 닫기 타이머
  if (autoCloseDelay) {
    popupInfo.autoCloseTimer = setTimeout(() => {
      closePopup(popupId, 'auto_close');
    }, autoCloseDelay);
  }

  // 노출 이력 저장
  savePopupHistory(taskId);

  // 노출 이벤트 전송
  if (opsProperties && window.TDAnalytics) {
    try {
      window.TDAnalytics.track('ops_show', {
        ...opsProperties,
        popup_type: popupType
      });
    } catch (e) {
      console.warn('ops_show 이벤트 전송 실패:', e);
    }
  }

  // 커스텀 이벤트
  window.dispatchEvent(new CustomEvent('te:popup:show', {
    detail: { popupId, taskId, popupType }
  }));

  if (window.trackingConfig?.debug?.showConsoleLogs) {
    console.log(`📢 팝업 표시: ${popupType}`, { taskId, content });
  }

  return popupId;
}

/**
 * 팝업 이벤트 핸들러 설정
 */
function setupPopupEvents(popupId, popupInfo) {
  const { container, overlay, opsProperties } = popupInfo;

  // 닫기 버튼
  container.querySelector('.te-popup-close')?.addEventListener('click', () => {
    closePopup(popupId, 'button_click');
  });

  // 오버레이 클릭
  if (overlay) {
    overlay.addEventListener('click', () => {
      closePopup(popupId, 'overlay_click');
    });
  }

  // 버튼 클릭
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.getAttribute('data-action');

      // 클릭 이벤트 전송
      if (opsProperties && window.TDAnalytics) {
        try {
          window.TDAnalytics.track('ops_click', {
            ...opsProperties,
            button_action: action,
            button_text: btn.textContent?.trim()
          });
        } catch (err) {
          console.warn('ops_click 이벤트 전송 실패:', err);
        }
      }

      // 커스텀 이벤트
      window.dispatchEvent(new CustomEvent('te:popup:click', {
        detail: {
          popupId,
          taskId: popupInfo.taskId,
          action,
          buttonText: btn.textContent?.trim()
        }
      }));

      // 링크가 아닌 경우 팝업 닫기
      if (btn.tagName !== 'A') {
        closePopup(popupId, 'button_click');
      }
    });
  });

  // ESC 키
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closePopup(popupId, 'escape_key');
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * 운영 SDK 트리거 핸들러로 등록
 */
function registerAsOperateHandler(options = {}) {
  if (window.TEOperate && typeof window.TEOperate.addTriggerHandler === 'function') {
    window.TEOperate.addTriggerHandler((result) => {
      // 팝업 타입이 지정된 과제만 처리
      const popupType = result.content?.popupType || result.userParams?.popupType;
      if (popupType || options.showAllTriggers) {
        showPopup(result, options);
      }
    });

    if (window.trackingConfig?.debug?.showConsoleLogs) {
      console.log('✅ 운영 팝업 핸들러 등록 완료');
    }
  }
}

/**
 * 초기화
 */
function initOperatePopup(options = {}) {
  if (typeof window === 'undefined') return;

  // 스타일 삽입
  injectStyles();

  // 운영 SDK 핸들러 등록
  if (options.autoRegister !== false) {
    // SDK가 로드된 후 등록
    if (window.TEOperate) {
      registerAsOperateHandler(options);
    } else {
      window.addEventListener('te:operate:ready', () => {
        registerAsOperateHandler(options);
      });
    }
  }

  if (window.trackingConfig?.debug?.showConsoleLogs) {
    console.log('✅ 운영 팝업 모듈 초기화 완료');
  }
}

// ============================================
// 전역 API 노출
// ============================================
if (typeof window !== 'undefined') {
  window.TEPopup = {
    init: initOperatePopup,
    show: showPopup,
    close: closePopup,
    closeAll: () => {
      activePopups.forEach((_, popupId) => closePopup(popupId, 'close_all'));
    },
    getActivePopups: () => Array.from(activePopups.keys()),
    TYPES: POPUP_TYPES
  };
}

// ============================================
// ES Module Export
// ============================================
export {
  initOperatePopup,
  showPopup,
  closePopup,
  POPUP_TYPES
};

// 자동 초기화 (DOM 로드 후)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initOperatePopup());
  } else {
    initOperatePopup();
  }
}
