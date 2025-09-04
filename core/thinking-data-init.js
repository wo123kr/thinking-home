/**
 * ThinkingData SDK 초기화 코드
 * 설정을 기반으로 SDK를 초기화하고 공통 속성을 설정합니다.
 */

// 상수 정의
const BOT_KEYWORDS = [
  "bot", "crawler", "spider", "scraper", "webdriver", 
  "selenium", "puppeteer", "playwright", "headless",
  "chatgpt", "claude", "bard", "copilot", "perplexity"
];

const BROWSER_PATTERNS = [
  { name: "Chrome", pattern: "Chrome", versionPattern: /Chrome\/(\d+)/ },
  { name: "Firefox", pattern: "Firefox", versionPattern: /Firefox\/(\d+)/ },
  { name: "Safari", pattern: "Safari", exclude: "Chrome", versionPattern: /Version\/(\d+)/ },
  { name: "Edge", pattern: "Edge", versionPattern: /Edge\/(\d+)/ },
  { name: "Internet Explorer", pattern: ["MSIE", "Trident"], versionPattern: /(MSIE|rv:)\s*(\d+)/ }
];

const MOBILE_PATTERNS = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i;
const TABLET_PATTERNS = /tablet|ipad/i;

// 캐시된 값들
let cachedUserAgent = null;
let cachedBrowserInfo = null;
let cachedDeviceInfo = null;

// 유틸리티 함수들
const utils = {
  // 브라우저 환경 체크
  isBrowserEnvironment() {
    return typeof window !== "undefined" && typeof document !== "undefined";
  },

  // 안전한 URL 파싱
  safeParseURL(url) {
    try {
      return new URL(url);
    } catch (error) {
      return null;
    }
  },

  // 안전한 localStorage 접근
  safeGetLocalStorage(key, defaultValue = null) {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch (error) {
      console.warn(`localStorage 접근 실패: ${key}`, error);
      return defaultValue;
    }
  }
};

// 봇 감지 함수
function detectBot() {
  // 캐시된 사용자 에이전트 사용
  const userAgent = cachedUserAgent || (cachedUserAgent = navigator.userAgent.toLowerCase());
  
  // 키워드 기반 감지
  const hasBotKeywords = BOT_KEYWORDS.some(keyword => userAgent.includes(keyword));
  
  // WebDriver 속성 감지
  const hasWebDriver = navigator.webdriver === true;
  
  return hasBotKeywords || hasWebDriver;
}

// 브라우저 정보 감지 (캐싱 적용)
function getBrowserInfo() {
  if (cachedBrowserInfo) {
    return cachedBrowserInfo;
  }

  const userAgent = cachedUserAgent || (cachedUserAgent = navigator.userAgent);
  let browserName = "unknown";
  let browserVersion = "unknown";

  for (const browser of BROWSER_PATTERNS) {
    const patterns = Array.isArray(browser.pattern) ? browser.pattern : [browser.pattern];
    const hasPattern = patterns.some(pattern => userAgent.includes(pattern));
    const hasExclude = browser.exclude && userAgent.includes(browser.exclude);

    if (hasPattern && !hasExclude) {
      browserName = browser.name;
      const versionMatch = userAgent.match(browser.versionPattern);
      if (versionMatch) {
        browserVersion = versionMatch[1] || versionMatch[2] || "unknown";
      }
      break;
    }
  }

  cachedBrowserInfo = { name: browserName, version: browserVersion };
  return cachedBrowserInfo;
}

// 디바이스 타입 감지 (캐싱 적용)
function getDeviceInfo() {
  if (cachedDeviceInfo) {
    return cachedDeviceInfo;
  }

  const userAgent = cachedUserAgent || (cachedUserAgent = navigator.userAgent.toLowerCase());
  
  let deviceType = "desktop";
  if (MOBILE_PATTERNS.test(userAgent)) {
    deviceType = TABLET_PATTERNS.test(userAgent) ? "tablet" : "mobile";
  }

  cachedDeviceInfo = {
    type: deviceType,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    timezone_offset: new Date().getTimezoneOffset() / -60
  };
  
  return cachedDeviceInfo;
}

// UTM 파라미터 추출 함수
function extractUTMParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  
  const utmData = {};
  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if (value) {
      utmData[key] = value;
    }
  });
  
  return utmData;
}

// 공통 속성 생성 함수
function createSuperProperties() {
  try {
    // 세션 정보 가져오기
    const sessionId = utils.safeGetLocalStorage("te_session_id");
    const sessionNumber = utils.safeGetLocalStorage("te_session_number", "0");

    // 각종 정보 수집
    const isBot = detectBot();
    const browserInfo = getBrowserInfo();
    const deviceInfo = getDeviceInfo();
    const utmData = extractUTMParameters();

    // 리퍼러 호스트 추출
    const referrerHost = document.referrer 
      ? utils.safeParseURL(document.referrer)?.hostname || null
      : null;

    // 기본 속성
    const baseProperties = {
      // 비즈니스 컨텍스트
      channel: "webflow",
      platform: "web",
      page_type: getPageType(),
      page_category: getPageCategory(),
      page_section: getPageSection(),
      source: getTrafficSource(),
      timestamp: new Date(),
      
      // 세션 정보
      session_id: sessionId,
      session_number: parseInt(sessionNumber) || 0,
      
      // 봇 감지
      is_bot: isBot,
      
      // 디바이스 정보
      device_type: deviceInfo.type,
      common_screen_resolution: deviceInfo.screen_resolution,
      common_viewport_size: deviceInfo.viewport_size,
      common_timezone_offset: deviceInfo.timezone_offset,
      
      // 페이지 정보
      common_url: window.location.href,
      common_title: document.title,
      common_page_path: window.location.pathname,
      common_host: window.location.hostname,
      common_search_params: window.location.search,
      
      // 리퍼러 정보
      common_referrer: document.referrer,
      common_referrer_host: referrerHost,
      
      // 브라우저 정보
      common_language: navigator.language || "unknown",
      common_user_agent: navigator.userAgent,
      common_browser: browserInfo.name,
      common_browser_version: browserInfo.version
    };

    // UTM 파라미터 추가 (값이 있는 경우에만)
    Object.assign(baseProperties, utmData);

    return baseProperties;
    
  } catch (error) {
    console.error("공통 속성 생성 실패:", error);
    // 최소한의 기본 속성 반환
    return {
      channel: "webflow",
      platform: "web",
      timestamp: new Date(),
      is_bot: false,
      device_type: "unknown"
    };
  }
}

// SDK 존재 여부 확인 (다양한 로드 패턴 지원)
function findSDK() {
  if (!utils.isBrowserEnvironment()) {
    console.warn("⚠️ 브라우저 환경이 아닙니다.");
    return null;
  }

  // 다양한 SDK 로드 패턴 확인
  if (typeof window.thinkingdata !== "undefined") {
    return window.thinkingdata;
  }
  if (typeof window.te !== "undefined") {
    return window.te;
  }
  if (typeof window.ta !== "undefined") {
    return window.ta;
  }
  if (typeof window.TD !== "undefined") {
    return window.TD;
  }

  return null;
}

// 페이지 타입 판단
function getPageType() {
  if (!utils.isBrowserEnvironment()) return "unknown";

  const path = window.location.pathname;
  if (path.includes("/blog/")) return "blog";
  if (path.includes("/product/")) return "product";
  if (path.includes("/contact")) return "contact";
  if (path.includes("/about")) return "about";
  if (path === "/" || path === "") return "home";
  return "other";
}

// 페이지 카테고리 판단
function getPageCategory() {
  if (!utils.isBrowserEnvironment()) return "unknown";

  const path = window.location.pathname;
  if (path.includes("/blog/")) return "content";
  if (path.includes("/product/")) return "product";
  if (path.includes("/contact") || path.includes("/about")) return "company";
  return "general";
}

// 페이지 섹션 판단
function getPageSection() {
  if (!utils.isBrowserEnvironment()) return "unknown";

  const path = window.location.pathname;
  if (path.includes("/blog/")) return "blog";
  if (path.includes("/product/")) return "product";
  if (path.includes("/contact")) return "contact";
  if (path.includes("/about")) return "about";
  if (path === "/" || path === "") return "home";
  return "other";
}

// 트래픽 소스 판단
function getTrafficSource() {
  if (!utils.isBrowserEnvironment()) return "unknown";

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source");
  if (utmSource) return utmSource;

  const referrer = document.referrer;
  if (!referrer) return "direct";

  try {
    const referrerHost = new URL(referrer).hostname;
    if (referrerHost.includes("google")) return "google";
    if (referrerHost.includes("naver")) return "naver";
    if (referrerHost.includes("facebook")) return "facebook";
    return "referral";
  } catch (e) {
    return "direct";
  }
}

// SDK 초기화 상태 관리
let isInitialized = false;

/**
 * ThinkingData SDK 초기화
 * @param {Object} config - SDK 설정 객체
 * @returns {boolean} 초기화 성공 여부
 */
function initSDK(config) {
  // 브라우저 환경이 아니면 초기화하지 않음
  if (!utils.isBrowserEnvironment()) {
    console.warn("⚠️ 브라우저 환경이 아니므로 SDK 초기화를 건너뜁니다.");
    return false;
  }

  // 중복 초기화 방지
  if (isInitialized) {
    if (window.trackingLog)
      window.trackingLog("ℹ️ ThinkingData SDK가 이미 초기화됨");
    return true;
  }

  try {
    // SDK 존재 여부 확인 (개선된 방식)
    const sdk = findSDK();
    if (!sdk) {
      console.error("❌ ThinkingData SDK가 로드되지 않았습니다.");
      if (window.trackingLog) {
        window.trackingLog("💡 SDK를 먼저 로드해주세요:");
        window.trackingLog(
          '<script src="https://cdn.jsdelivr.net/npm/thinkingdata-browser"></script>'
        );
      }
      return false;
    }

    // 전역 변수 설정 (기존 SDK가 있으면 그대로 사용)
    if (!window.te) {
      window.te = sdk;
    }

    // SDK 초기화 (이미 초기화되었는지 확인)
    if (typeof window.te.init === "function") {
      window.te.init(config);
    }

    // 공통 이벤트 속성 생성
    const superProperties = createSuperProperties();

    if (typeof window.te.setSuperProperties === "function") {
      window.te.setSuperProperties(superProperties);
    }

    if (window.trackingLog) {
      window.trackingLog("✅ ThinkingData SDK 초기화 완료");
      window.trackingLog("📊 설정:", config);
      window.trackingLog("🎯 공통 속성:", superProperties);
    }

    // 초기화 완료 이벤트 발생
    window.dispatchEvent(new CustomEvent("thinkingdata:ready"));

    // 임시 저장된 이벤트들 전송 시도
    setTimeout(() => {
      try {
        if (typeof window.sendPendingEvents === "function") {
          window.sendPendingEvents();
        }
      } catch (error) {
        console.warn("임시 이벤트 전송 실패:", error);
      }
    }, 1000);

    isInitialized = true;
    return true;
  } catch (error) {
    console.error("❌ ThinkingData SDK 초기화 실패:", error);
    return false;
  }
}

/**
 * SDK가 초기화되었는지 확인
 * @returns {boolean} 초기화 여부
 */
function isSDKInitialized() {
  return isInitialized && utils.isBrowserEnvironment();
}

/**
 * 페이지 정보 가져오기
 * @returns {Object} 페이지 정보 객체
 */
function getPageInfo() {
  return {
    type: getPageType(),
    category: getPageCategory(),
    section: getPageSection(),
    source: getTrafficSource(),
  };
}

// Node.js 환경에서 사용할 수 있도록 export
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initSDK,
    isSDKInitialized,
    getPageInfo,
  };
}

export { initSDK, isSDKInitialized };
