/**
 * ThinkingData SDK 초기화 코드
 * 설정을 기반으로 SDK를 초기화하고 공통 속성을 설정합니다.
 */

    // 페이지 타입 판단
    function getPageType() {
        const path = window.location.pathname;
        if (path.includes('/blog/')) return 'blog';
        if (path.includes('/product/')) return 'product';
        if (path.includes('/contact')) return 'contact';
        if (path.includes('/about')) return 'about';
        if (path === '/' || path === '') return 'home';
        return 'other';
    }

    // 페이지 카테고리 판단
    function getPageCategory() {
        const path = window.location.pathname;
        if (path.includes('/blog/')) return 'content';
        if (path.includes('/product/')) return 'product';
        if (path.includes('/contact') || path.includes('/about')) return 'company';
        return 'general';
    }

    // 페이지 섹션 판단
    function getPageSection() {
        const path = window.location.pathname;
        if (path.includes('/blog/')) return 'blog';
        if (path.includes('/product/')) return 'product';
        if (path.includes('/contact')) return 'contact';
        if (path.includes('/about')) return 'about';
        if (path === '/' || path === '') return 'home';
        return 'other';
    }

    // 트래픽 소스 판단
    function getTrafficSource() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        if (utmSource) return utmSource;
        
        const referrer = document.referrer;
        if (!referrer) return 'direct';
        
        try {
            const referrerHost = new URL(referrer).hostname;
            if (referrerHost.includes('google')) return 'google';
            if (referrerHost.includes('naver')) return 'naver';
            if (referrerHost.includes('facebook')) return 'facebook';
            return 'referral';
        } catch (e) {
            return 'direct';
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
  // 중복 초기화 방지
  if (isInitialized) {
    console.log('ℹ️ ThinkingData SDK가 이미 초기화됨');
    return true;
  }

        try {
    // SDK 존재 여부 확인
            if (typeof window.thinkingdata === 'undefined') {
                console.error('❌ ThinkingData SDK가 로드되지 않았습니다.');
                console.log('💡 SDK를 먼저 로드해주세요:');
                console.log('<script src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>');
                return false;
            }

    // 전역 변수 설정
    window.te = window.thinkingdata;
    
    // SDK 초기화
    window.te.init({
      ...config,
      showLog: true // 디버깅을 위해 콘솔 로그 활성화
    });

            // 공통 이벤트 속성 설정
    const superProperties = {
      "channel": "webflow",
      "platform": "web",
      "page_type": getPageType(),
      "page_category": getPageCategory(),
      "page_section": getPageSection(),
      "source": getTrafficSource(),
      "timestamp": new Date()
    };
    
    window.te.setSuperProperties(superProperties);

    console.log('✅ ThinkingData SDK 초기화 완료');
            console.log('📊 설정:', config);
            console.log('🎯 공통 속성:', superProperties);

            // 초기화 완료 이벤트 발생
            window.dispatchEvent(new CustomEvent('thinkingdata:ready'));

    isInitialized = true;
            return true;
        } catch (error) {
            console.error('❌ ThinkingData SDK 초기화 실패:', error);
            return false;
        }
    }

/**
 * SDK가 초기화되었는지 확인
 * @returns {boolean} 초기화 여부
 */
function isSDKInitialized() {
  return isInitialized;
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
    source: getTrafficSource()
  };
}

// Node.js 환경에서 사용할 수 있도록 export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSDK,
        isSDKInitialized,
        getPageInfo
    };
}

export { initSDK, isSDKInitialized };