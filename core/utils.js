/**
 * 공통 유틸리티 모듈
 * 모든 추적 모듈에서 공통으로 사용하는 함수들
 */

// 안전한 ThinkingData SDK 호출
export function safeTeCall(method, ...args) {
  try {
    if (typeof window.te !== 'undefined' && window.te[method]) {
      return window.te[method](...args);
    } else {
      console.warn(`ThinkingData SDK의 ${method} 메서드를 사용할 수 없습니다.`);
      return false;
    }
  } catch (error) {
    console.error(`ThinkingData SDK ${method} 호출 실패:`, error);
    return false;
  }
}

// 안전한 이벤트 전송
export function trackEvent(eventName, properties = {}) {
  return safeTeCall('track', eventName, properties);
}

// 세션 활동 업데이트 함수 (세션 관리자에서 실제 구현)
export function updateSessionActivity() {
  if (
    typeof window.updateSessionActivity === 'function' &&
    window.updateSessionActivity !== updateSessionActivity
  ) {
    window.updateSessionActivity();
  } else {
    // 기본 동작 또는 아무것도 안함
    // 예: window.lastActivityTime = Date.now();
  }
}

// 안전한 시간 형식 통일 함수
export function formatTimestamp(date = new Date()) {
  try {
    return date.toISOString().replace('T', ' ').slice(0, 23);
  } catch (error) {
    console.warn('시간 형식 변환 실패:', error);
    return new Date().toISOString().replace('T', ' ').slice(0, 23);
  }
}

// 안전한 텍스트 추출 함수 (null/undefined 안전)
export function safeGetText(element) {
  try {
    return element?.textContent?.trim() || '';
  } catch (error) {
    console.warn('텍스트 추출 실패:', error);
    return '';
  }
}

// 안전한 속성 추출 함수
export function safeGetAttribute(element, attribute) {
  try {
    return element?.getAttribute?.(attribute) || '';
  } catch (error) {
    console.warn(`속성 ${attribute} 추출 실패:`, error);
    return '';
  }
}

// 안전한 클래스 리스트 추출
export function safeGetClassList(element) {
  try {
    return element?.className ? element.className.split(' ').filter(cls => cls.trim()) : [];
  } catch (error) {
    console.warn('클래스 리스트 추출 실패:', error);
    return [];
  }
}

// 중앙화된 에러 핸들러
export function handleError(context, error, fallback = null) {
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
export function getDeviceType() {
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
export function getBrowserInfo() {
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
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash).toString(36);
}

// 텍스트 기반 ID 생성
export function generateTextBasedId(text) {
  if (!text) return 'no_text';
  
  const cleanText = text.replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
  const hash = simpleHash(cleanText);
  
  return `text_${cleanText.substring(0, 10)}_${hash}`;
}

// 클래스 기반 ID 생성
export function generateClassBasedId(classList) {
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
export function generatePositionBasedId(element) {
  const rect = element.getBoundingClientRect();
  const pageY = window.pageYOffset + rect.top;
  const pageX = window.pageXOffset + rect.left;
  
  const positionHash = simpleHash(`${Math.round(pageX)}_${Math.round(pageY)}`);
  
  return `pos_${Math.round(pageX)}_${Math.round(pageY)}_${positionHash}`;
}

// 외부 링크 판단
export function isExternalLink(url) {
  try {
    const linkHost = new URL(url).hostname;
    const currentHost = window.location.hostname;
    return linkHost !== currentHost;
  } catch (e) {
    return false;
  }
}

// 개인정보 마스킹 함수들
export function maskEmail(email) {
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

export function maskPhone(phone) {
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

export function maskName(name) {
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
export function isElementVisible(element) {
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
export function getPageLoadTime() {
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

// 안전한 패턴 매칭 함수
export function safeMatchPatterns(element, patterns) {
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

// 설정 관리자 클래스
export class ConfigManager {
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
  
// 모듈 상태 관리자 클래스
export class ModuleStateManager {
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
  
// 전역 객체에 유틸리티 함수 등록 (하위 호환성 유지)
export function registerGlobalUtils() {
  // 중복 등록 방지
  if (window.utilsRegistered) return;
  
  // 주요 함수들을 전역 객체에 등록
  const utils = {
    safeTeCall, trackEvent, updateSessionActivity, formatTimestamp,
    safeGetText, safeGetAttribute, safeGetClassList, handleError,
    getDeviceType, getBrowserInfo, simpleHash,
    generateTextBasedId, generateClassBasedId, generatePositionBasedId,
    isExternalLink, maskEmail, maskPhone, maskName,
    isElementVisible, getPageLoadTime, safeMatchPatterns
  };
  
  // 전역 객체에 등록
  Object.entries(utils).forEach(([name, func]) => {
    window[name] = func;
  });
  
  // 클래스 인스턴스 생성 및 등록
  if (!window.configManager) {
    window.ConfigManager = ConfigManager;
    window.configManager = new ConfigManager();
  }
  
  if (!window.moduleStateManager) {
  window.ModuleStateManager = ModuleStateManager;
  window.moduleStateManager = new ModuleStateManager();
}

  window.utilsRegistered = true;
  console.log('✅ 공통 유틸리티 함수 전역 등록 완료');
}

// 전역 함수 등록 (선택적으로 호출 가능)
// registerGlobalUtils(); 

// 봇/크롤러/GPT 감지 함수들
export function detectBot() {
  const botInfo = {
    is_bot: false,
    bot_type: null,
    bot_name: null,
    detection_method: [],
    confidence: 0
  };

  const userAgent = navigator.userAgent.toLowerCase();
  let confidence = 0;

  // 1. User-Agent 기반 봇 감지
  const botPatterns = {
    // 검색엔진 봇
    'googlebot': { name: 'Google Bot', type: 'search_engine' },
    'bingbot': { name: 'Bing Bot', type: 'search_engine' },
    'slurp': { name: 'Yahoo Slurp', type: 'search_engine' },
    'duckduckbot': { name: 'DuckDuckGo Bot', type: 'search_engine' },
    'baiduspider': { name: 'Baidu Spider', type: 'search_engine' },
    'naverbot': { name: 'Naver Bot', type: 'search_engine' },
    'daumoa': { name: 'Daum Bot', type: 'search_engine' },
    
    // 소셜 미디어 봇
    'facebookexternalhit': { name: 'Facebook Bot', type: 'social_media' },
    'twitterbot': { name: 'Twitter Bot', type: 'social_media' },
    'linkedinbot': { name: 'LinkedIn Bot', type: 'social_media' },
    'whatsapp': { name: 'WhatsApp Bot', type: 'social_media' },
    
    // AI/챗봇 봇
    'chatgpt': { name: 'ChatGPT', type: 'ai_chatbot' },
    'claude': { name: 'Claude', type: 'ai_chatbot' },
    'bard': { name: 'Google Bard', type: 'ai_chatbot' },
    'copilot': { name: 'GitHub Copilot', type: 'ai_chatbot' },
    'perplexity': { name: 'Perplexity', type: 'ai_chatbot' },
    
    // 일반 크롤러/스크래퍼
    'scraper': { name: 'Web Scraper', type: 'scraper' },
    'crawler': { name: 'Web Crawler', type: 'crawler' },
    'spider': { name: 'Web Spider', type: 'crawler' },
    'bot': { name: 'Generic Bot', type: 'generic_bot' },
    'crawler': { name: 'Web Crawler', type: 'crawler' },
    
    // 자동화 도구
    'selenium': { name: 'Selenium', type: 'automation' },
    'webdriver': { name: 'WebDriver', type: 'automation' },
    'puppeteer': { name: 'Puppeteer', type: 'automation' },
    'playwright': { name: 'Playwright', type: 'automation' },
    'cypress': { name: 'Cypress', type: 'automation' },
    'headless': { name: 'Headless Browser', type: 'automation' },
    
    // 기타 봇
    'curl': { name: 'cURL', type: 'http_client' },
    'wget': { name: 'wget', type: 'http_client' },
    'python': { name: 'Python Bot', type: 'script' },
    'requests': { name: 'Python Requests', type: 'script' },
    'urllib': { name: 'Python urllib', type: 'script' }
  };

  // User-Agent 패턴 매칭
  for (const [pattern, info] of Object.entries(botPatterns)) {
    if (userAgent.includes(pattern)) {
      botInfo.is_bot = true;
      botInfo.bot_type = info.type;
      botInfo.bot_name = info.name;
      botInfo.detection_method.push('user_agent_pattern');
      confidence += 80;
      break;
    }
  }

  // 2. WebDriver 속성 체크
  if (navigator.webdriver) {
    botInfo.is_bot = true;
    botInfo.bot_type = botInfo.bot_type || 'automation';
    botInfo.bot_name = botInfo.bot_name || 'WebDriver Bot';
    botInfo.detection_method.push('webdriver_property');
    confidence += 90;
  }

  // 3. 자동화 도구 감지
  const automationIndicators = [
    'window.chrome && window.chrome.runtime',
    'window.Notification',
    'window.outerHeight',
    'window.outerWidth',
    'window.screenX',
    'window.screenY'
  ];

  let automationScore = 0;
  automationIndicators.forEach(indicator => {
    try {
      if (!eval(indicator)) {
        automationScore++;
      }
    } catch (e) {
      automationScore++;
    }
  });

  if (automationScore >= 3) {
    botInfo.is_bot = true;
    botInfo.bot_type = botInfo.bot_type || 'automation';
    botInfo.bot_name = botInfo.bot_name || 'Automation Tool';
    botInfo.detection_method.push('automation_indicators');
    confidence += 60;
  }

  // 4. 언어/로케일 체크 (봇은 보통 기본값 사용)
  const language = navigator.language || navigator.userLanguage;
  const languages = navigator.languages;
  
  if (!language || language === 'en-US' || language === 'en') {
    if (!languages || languages.length === 0 || languages[0] === 'en-US') {
      confidence += 20;
      botInfo.detection_method.push('default_language');
    }
  }

  // 5. 플러그인 체크 (봇은 보통 플러그인이 없음)
  if (navigator.plugins && navigator.plugins.length === 0) {
    confidence += 30;
    botInfo.detection_method.push('no_plugins');
  }

  // 6. 화면 해상도 체크 (봇은 보통 특정 해상도 사용)
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // 일반적인 봇 해상도 패턴
  const botResolutions = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1024, height: 768 },
    { width: 800, height: 600 }
  ];

  const isBotResolution = botResolutions.some(res => 
    screenWidth === res.width && screenHeight === res.height
  );

  if (isBotResolution) {
    confidence += 25;
    botInfo.detection_method.push('bot_resolution');
  }

  // 7. 시간 기반 패턴 (봇은 보통 빠른 접근)
  const now = Date.now();
  const pageLoadTime = performance.timing ? 
    performance.timing.loadEventEnd - performance.timing.navigationStart : 0;

  if (pageLoadTime > 0 && pageLoadTime < 1000) { // 1초 미만 로드
    confidence += 15;
    botInfo.detection_method.push('fast_load_time');
  }

  // 8. 마우스/키보드 이벤트 체크 (봇은 보통 이벤트가 없음)
  let hasUserInteraction = false;
  
  const checkUserInteraction = () => {
    hasUserInteraction = true;
    document.removeEventListener('mousemove', checkUserInteraction);
    document.removeEventListener('keydown', checkUserInteraction);
    document.removeEventListener('click', checkUserInteraction);
  };

  document.addEventListener('mousemove', checkUserInteraction, { once: true });
  document.addEventListener('keydown', checkUserInteraction, { once: true });
  document.addEventListener('click', checkUserInteraction, { once: true });

  // 5초 후 체크
  setTimeout(() => {
    if (!hasUserInteraction) {
      confidence += 40;
      botInfo.detection_method.push('no_user_interaction');
    }
  }, 5000);

  // 9. 특정 헤더 체크 (fetch로 확인)
  try {
    fetch(window.location.href, { 
      method: 'HEAD',
      cache: 'no-cache'
    }).then(response => {
      const headers = response.headers;
      if (headers.get('x-powered-by') || headers.get('server')) {
        // 서버 정보가 노출되면 봇일 가능성
        confidence += 10;
        botInfo.detection_method.push('server_info_exposed');
      }
    }).catch(() => {
      // fetch 실패는 정상적인 브라우저에서도 발생할 수 있음
    });
  } catch (e) {
    // CORS 등으로 인한 실패는 무시
  }

  // 최종 신뢰도 계산
  botInfo.confidence = Math.min(confidence, 100);

  // 봇 판정 기준 (신뢰도 70% 이상)
  if (botInfo.confidence >= 70) {
    botInfo.is_bot = true;
  }

  return botInfo;
}

// 간단한 봇 감지 (빠른 체크)
export function isBot() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // 주요 봇 패턴 체크
  const botKeywords = [
    'bot', 'crawler', 'spider', 'scraper', 'webdriver', 
    'selenium', 'puppeteer', 'playwright', 'headless',
    'chatgpt', 'claude', 'bard', 'copilot'
  ];
  
  return botKeywords.some(keyword => userAgent.includes(keyword)) || 
         navigator.webdriver === true;
}

// AI 챗봇 특별 감지
export function detectAIChatbot() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  const aiPatterns = {
    'chatgpt': 'ChatGPT',
    'claude': 'Claude',
    'bard': 'Google Bard',
    'copilot': 'GitHub Copilot',
    'perplexity': 'Perplexity',
    'bing': 'Bing Chat',
    'duckduckgo': 'DuckDuckGo AI'
  };
  
  for (const [pattern, name] of Object.entries(aiPatterns)) {
    if (userAgent.includes(pattern)) {
      return {
        is_ai_chatbot: true,
        ai_name: name,
        user_agent: userAgent
      };
    }
  }
  
  return { is_ai_chatbot: false };
}

// 봇 정보를 이벤트 속성에 추가하는 헬퍼 함수
export function addBotInfoToEvent(properties = {}) {
  const botInfo = detectBot();
  const aiInfo = detectAIChatbot();
  
  return {
    ...properties,
    is_bot: botInfo.is_bot,
    bot_type: botInfo.bot_type,
    bot_name: botInfo.bot_name,
    bot_confidence: botInfo.confidence,
    bot_detection_methods: botInfo.detection_method,
    is_ai_chatbot: aiInfo.is_ai_chatbot,
    ai_chatbot_name: aiInfo.ai_name
  };
}

// ThinkingData 시간 형식 변환 함수들
export function convertToTETimeFormat(dateInput) {
  try {
    let date;
    
    // 입력 타입에 따른 처리
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // ISO 문자열인 경우
      if (dateInput.includes('T') && dateInput.includes('Z')) {
        date = new Date(dateInput);
      } else if (dateInput.includes('T')) {
        // ISO 문자열이지만 Z가 없는 경우
        date = new Date(dateInput);
      } else {
        // 기타 문자열 형식
        date = new Date(dateInput);
      }
    } else if (typeof dateInput === 'number') {
      // 타임스탬프인 경우 (밀리초 단위로 가정)
      // 13자리면 밀리초, 10자리면 초 단위
      if (dateInput.toString().length === 10) {
        date = new Date(dateInput * 1000); // 초를 밀리초로 변환
      } else {
        date = new Date(dateInput); // 밀리초로 가정
      }
    } else {
      // 현재 시간
      date = new Date();
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('유효하지 않은 날짜 입력:', dateInput);
      return new Date().toISOString().replace('T', ' ').slice(0, 23);
    }
    
    // ThinkingData 형식: "yyyy-MM-dd HH:mm:ss.SSS"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  } catch (error) {
    console.warn('시간 형식 변환 실패:', error, '입력값:', dateInput);
    return new Date().toISOString().replace('T', ' ').slice(0, 23);
  }
}

// 시간 속성을 TE 형식으로 변환하여 추가하는 함수
export function addTETimeProperties(properties = {}) {
  const teTimeProperties = {};
  
  // 시간 관련 속성들을 TE 형식으로 변환
  const timeProperties = [
    'local_time',
    'timestamp',
    'created_at',
    'updated_at',
    'start_time',
    'end_time',
    'event_time',
    'session_start_time',
    'session_end_time',
    'form_submission_time',
    'interaction_time',
    'error_time',
    // 숫자 타임스탬프 속성들 추가
    'first_visit_timestamp',
    'last_visit_timestamp',
    'session_start_timestamp',
    'session_end_timestamp',
    'page_load_timestamp',
    'interaction_timestamp',
    'form_timestamp',
    'click_timestamp',
    'scroll_timestamp',
    'exit_timestamp'
  ];
  
  timeProperties.forEach(propName => {
    if (properties[propName] !== undefined && properties[propName] !== null) {
      const teFormattedTime = convertToTETimeFormat(properties[propName]);
      teTimeProperties[`${propName}_te`] = teFormattedTime;
    }
  });
  
  // 현재 시간도 추가
  teTimeProperties['current_time_te'] = convertToTETimeFormat(new Date());
  
  return {
    ...properties,
    ...teTimeProperties
  };
}

// 특정 시간 속성을 TE 형식으로 변환
export function convertTimePropertyToTE(properties = {}, propertyName) {
  if (properties[propertyName]) {
    const teFormattedTime = convertToTETimeFormat(properties[propertyName]);
    return {
      ...properties,
      [`${propertyName}_te`]: teFormattedTime
    };
  }
  return properties;
} 