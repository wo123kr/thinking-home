/**
 * 공통 유틸리티 모듈
 * 모든 추적 모듈에서 공통으로 사용하는 함수들
 */

// ThinkingData SDK 안전한 호출 래퍼
function safeTeCall(method, ...args) {
  if (window.te && typeof window.te[method] === 'function') {
    try {
      return window.te[method](...args);
    } catch (error) {
      console.warn(`ThinkingData ${method} 호출 실패:`, error);
      return '';
    }
  } else {
    console.warn(`ThinkingData SDK의 ${method} 메서드를 사용할 수 없습니다.`);
    return '';
  }
}

// 이벤트 추적 래퍼
function trackEvent(eventName, properties = {}) {
  return safeTeCall('track', eventName, properties);
}

// 세션 활동 업데이트 (중앙 집중화)
function updateSessionActivity() {
  if (typeof window.updateSessionActivity === 'function') {
    window.updateSessionActivity();
  }
}

// 🆕 안전한 시간 형식 통일 함수 (기존 코드와 호환)
function formatTimestamp(date = new Date()) {
  try {
    return date.toISOString().replace('T', ' ').slice(0, 23);
  } catch (error) {
    console.warn('시간 형식 변환 실패:', error);
    return new Date().toISOString().replace('T', ' ').slice(0, 23);
  }
}

// 🆕 안전한 텍스트 추출 함수 (null/undefined 안전)
function safeGetText(element) {
  try {
    return element?.textContent?.trim() || '';
  } catch (error) {
    console.warn('텍스트 추출 실패:', error);
    return '';
  }
}

// 🆕 안전한 속성 추출 함수
function safeGetAttribute(element, attribute) {
  try {
    return element?.getAttribute?.(attribute) || '';
  } catch (error) {
    console.warn(`속성 ${attribute} 추출 실패:`, error);
    return '';
  }
}

// 🆕 안전한 클래스 리스트 추출
function safeGetClassList(element) {
  try {
    return element?.className ? element.className.split(' ').filter(cls => cls.trim()) : [];
  } catch (error) {
    console.warn('클래스 리스트 추출 실패:', error);
    return [];
  }
}

// 🆕 중앙화된 에러 핸들러
function handleError(context, error, fallback = null) {
  console.error(`[${context}] 오류:`, error);
  // 에러 로깅 (나중에 외부 서비스 연동 가능)
  if (window.te && typeof window.te.track === 'function') {
    try {
      window.te.track('tracking_error', {
        context: context,
        error_message: error?.message || String(error),
        timestamp: formatTimestamp()
      });
    } catch (e) {
      // 에러 추적도 실패한 경우 조용히 무시
    }
  }
  return fallback;
}

// 디바이스 타입 감지
function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    if (/tablet|ipad/i.test(userAgent)) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  return 'desktop';
}

// 브라우저 정보 추출
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browser = 'unknown';
  let version = 'unknown';
  
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'unknown';
  }
  
  return { browser, version };
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

// 텍스트 기반 ID 생성
function generateTextBasedId(text) {
  if (!text) return 'no_text';
  
  const cleanText = text.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
  const hash = simpleHash(cleanText);
  
  return `text_${cleanText.substring(0, 10)}_${hash}`;
}

// 클래스 기반 ID 생성
function generateClassBasedId(classList) {
  if (!classList || classList.length === 0) return 'no_class';
  
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
  
  const positionHash = simpleHash(`${Math.round(pageX)}_${Math.round(pageY)}`);
  
  return `pos_${Math.round(pageX)}_${Math.round(pageY)}_${positionHash}`;
}

// 외부 링크 판단
function isExternalLink(url) {
  try {
    const linkHost = new URL(url).hostname;
    const currentHost = window.location.hostname;
    return linkHost !== currentHost;
  } catch (e) {
    return false;
  }
}

// 개인정보 마스킹 함수들
function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.***';
  
  const [localPart, domain] = parts;
  const domainParts = domain.split('.');
  
  const maskedLocal = localPart.length > 1 ? localPart[0] + '***' : '***';
  const maskedDomain = domainParts.length > 1 ? 
    domainParts[0][0] + '***.' + domainParts[domainParts.length - 1] : 
    '***.' + domainParts[0];
    
  return maskedLocal + '@' + maskedDomain;
}

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length >= 10) {
    return numbers.substring(0, 3) + '-****-' + numbers.slice(-4);
  } else if (numbers.length >= 7) {
    return numbers.substring(0, 2) + '***' + numbers.slice(-2);
  } else {
    return '***-****-****';
  }
}

function maskName(name) {
  if (!name || typeof name !== 'string') return '';
  
  const trimmed = name.trim();
  if (trimmed.length <= 1) {
    return '*';
  } else if (trimmed.length === 2) {
    return trimmed[0] + '*';
  } else {
    return trimmed[0] + '***' + trimmed[trimmed.length - 1];
  }
}

// 요소 가시성 확인
function isElementVisible(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  
  return rect.width > 0 && 
         rect.height > 0 && 
         style.visibility !== 'hidden' && 
         style.display !== 'none' &&
         rect.top < window.innerHeight &&
         rect.bottom > 0;
}

// 페이지 로드 시간 측정
function getPageLoadTime() {
  if (performance && performance.timing) {
    const timing = performance.timing;
    return timing.loadEventEnd - timing.navigationStart;
  } else if (performance && performance.getEntriesByType) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      return navigation.loadEventEnd - navigation.startTime;
    }
  }
  return 0;
}

// 동적 패턴 매칭 함수
function matchPatterns(element, patterns) {
  const text = element.textContent ? element.textContent.trim() : '';
  const href = element.href || '';
  const classList = element.className ? element.className.split(' ') : [];
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
}

// 🆕 안전한 패턴 매칭 함수 (개선된 버전)
function safeMatchPatterns(element, patterns) {
  try {
    if (!element || !patterns) return '';
    
    const text = safeGetText(element);
    const href = element.href || '';
    const classList = safeGetClassList(element);
    const id = safeGetAttribute(element, 'id');
    
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
    return handleError('safeMatchPatterns', error, '');
  }
}

// 🔒 설정 관리자 (중복 선언 방지)
if (typeof window.ConfigManager === 'undefined') {
  class ConfigManager {
    constructor() {
      this.configs = {};
    }
    
    setConfig(module, config) {
      this.configs[module] = { ...this.configs[module], ...config };
    }
    
    getConfig(module) {
      return this.configs[module] || {};
    }
    
    updateConfig(module, updates) {
      this.setConfig(module, updates);
      console.log(`🔄 ${module} 설정 업데이트 완료:`, updates);
    }
  }
  
  // 전역에 클래스와 인스턴스 안전하게 등록
  window.ConfigManager = ConfigManager;
  window.configManager = new ConfigManager();
}

// 🔒 모듈 상태 관리자 (중복 선언 방지)
if (typeof window.ModuleStateManager === 'undefined') {
  class ModuleStateManager {
    constructor() {
      this.initialized = new Set();
      this.pending = new Set();
      this.failed = new Set();
    }
    
    isInitialized(moduleName) {
      return this.initialized.has(moduleName);
    }
    
    markInitialized(moduleName) {
      this.initialized.add(moduleName);
      this.pending.delete(moduleName);
      this.failed.delete(moduleName);
    }
    
    markPending(moduleName) {
      this.pending.add(moduleName);
    }
    
    markFailed(moduleName, error) {
      this.failed.add(moduleName);
      this.pending.delete(moduleName);
      handleError(`ModuleStateManager`, `${moduleName} 초기화 실패: ${error}`);
    }
    
    getStatus(moduleName) {
      if (this.initialized.has(moduleName)) return 'initialized';
      if (this.pending.has(moduleName)) return 'pending';
      if (this.failed.has(moduleName)) return 'failed';
      return 'not_started';
    }
  }
  
  // 전역에 클래스와 인스턴스 안전하게 등록
  window.ModuleStateManager = ModuleStateManager;
  window.moduleStateManager = new ModuleStateManager();
}

// 전역 함수로 노출 (기존 + 새로운 안전한 함수들)
window.safeTeCall = safeTeCall;
window.trackEvent = trackEvent;
window.updateSessionActivity = updateSessionActivity;
window.getDeviceType = getDeviceType;
window.getBrowserInfo = getBrowserInfo;
window.simpleHash = simpleHash;
window.generateTextBasedId = generateTextBasedId;
window.generateClassBasedId = generateClassBasedId;
window.generatePositionBasedId = generatePositionBasedId;
window.isExternalLink = isExternalLink;
window.maskEmail = maskEmail;
window.maskPhone = maskPhone;
window.maskName = maskName;
window.isElementVisible = isElementVisible;
window.getPageLoadTime = getPageLoadTime;
window.matchPatterns = matchPatterns;

// 🆕 새로운 안전한 함수들 노출
window.formatTimestamp = formatTimestamp;
window.safeGetText = safeGetText;
window.safeGetAttribute = safeGetAttribute;
window.safeGetClassList = safeGetClassList;
window.handleError = handleError;
window.safeMatchPatterns = safeMatchPatterns;

console.log('✅ 공통 유틸리티 모듈 로드 완료 (안전성 강화됨)'); 