/**
 * ThinkingData SDK 초기화 코드
 * 설정을 기반으로 SDK를 초기화하고 공통 속성을 설정합니다.
 */

// 브라우저 환경 체크
function isBrowserEnvironment() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// SDK 존재 여부 확인 (다양한 로드 패턴 지원)
function findSDK() {
    if (!isBrowserEnvironment()) {
        console.warn('⚠️ 브라우저 환경이 아닙니다.');
        return null;
    }
    
    // 다양한 SDK 로드 패턴 확인
    if (typeof window.thinkingdata !== 'undefined') {
        return window.thinkingdata;
    }
    if (typeof window.te !== 'undefined') {
        return window.te;
    }
    if (typeof window.ta !== 'undefined') {
        return window.ta;
    }
    if (typeof window.TD !== 'undefined') {
        return window.TD;
    }
    
    return null;
}

// 페이지 타입 판단
function getPageType() {
    if (!isBrowserEnvironment()) return 'unknown';
    
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
    if (!isBrowserEnvironment()) return 'unknown';
    
    const path = window.location.pathname;
    if (path.includes('/blog/')) return 'content';
    if (path.includes('/product/')) return 'product';
    if (path.includes('/contact') || path.includes('/about')) return 'company';
    return 'general';
}

// 페이지 섹션 판단
function getPageSection() {
    if (!isBrowserEnvironment()) return 'unknown';
    
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
    if (!isBrowserEnvironment()) return 'unknown';
    
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
    // 브라우저 환경이 아니면 초기화하지 않음
    if (!isBrowserEnvironment()) {
        console.warn('⚠️ 브라우저 환경이 아니므로 SDK 초기화를 건너뜁니다.');
        return false;
    }
    
    // 중복 초기화 방지
    if (isInitialized) {
        if (window.trackingLog) window.trackingLog('ℹ️ ThinkingData SDK가 이미 초기화됨');
        return true;
    }

    try {
        // SDK 존재 여부 확인 (개선된 방식)
        const sdk = findSDK();
        if (!sdk) {
            console.error('❌ ThinkingData SDK가 로드되지 않았습니다.');
            if (window.trackingLog) {
                window.trackingLog('💡 SDK를 먼저 로드해주세요:');
                window.trackingLog('<script src="https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js"></script>');
            }
            return false;
        }

        // 전역 변수 설정 (기존 SDK가 있으면 그대로 사용)
        if (!window.te) {
            window.te = sdk;
        }
        
        // SDK 초기화 (이미 초기화되었는지 확인)
        if (typeof window.te.init === 'function') {
            window.te.init(config);
        }

        // 공통 이벤트 속성 설정
        const sessionId = localStorage.getItem('te_session_id') || null;
        const sessionNumber = localStorage.getItem('te_session_number') || 0;
        const superProperties = {
            "channel": "webflow",
            "platform": "web",
            "page_type": getPageType(),
            "page_category": getPageCategory(),
            "page_section": getPageSection(),
            "source": getTrafficSource(),
            "timestamp": new Date(),
            session_id: sessionId,
            session_number: sessionNumber
        };
        
        if (typeof window.te.setSuperProperties === 'function') {
            window.te.setSuperProperties(superProperties);
        }

        if (window.trackingLog) {
            window.trackingLog('✅ ThinkingData SDK 초기화 완료');
            window.trackingLog('📊 설정:', config);
            window.trackingLog('🎯 공통 속성:', superProperties);
        }

        // 초기화 완료 이벤트 발생
        window.dispatchEvent(new CustomEvent('thinkingdata:ready'));

        // 임시 저장된 이벤트들 전송 시도
        setTimeout(() => {
            try {
                if (typeof window.sendPendingEvents === 'function') {
                    window.sendPendingEvents();
                }
            } catch (error) {
                console.warn('임시 이벤트 전송 실패:', error);
            }
        }, 1000);

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
    return isInitialized && isBrowserEnvironment();
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