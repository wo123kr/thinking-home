import config from './config.js';
import { initSDK, isSDKInitialized } from './core/thinking-data-init.js';
import { registerGlobalUtils, trackingLog } from './core/utils.js';
import { initSession } from './core/session-manager.js';
import { initClickTracking } from './tracking/click.js';
import { initExitTracking } from './tracking/exit.js';
import { initScrollTracking } from './tracking/scroll.js';
import { initFormTracking } from './tracking/form.js';
import { initPopupTracking } from './tracking/popup.js';
import { initResourceTracking } from './tracking/resource.js';
import { initUserAttributes } from './user-attributes.js';
import { trackPageView } from './tracking/pageview.js';
import { initSectionScrollTracking } from './tracking/section-scroll.js';

// 브라우저 환경 체크
function isBrowserEnvironment() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * ThinkingData 추적 시스템 초기화 및 실행
 * 모든 트래킹 모듈의 진입점
 */
async function main() {
    // 브라우저 환경이 아니면 실행하지 않음
    if (!isBrowserEnvironment()) {
        console.warn('⚠️ 브라우저 환경이 아니므로 추적 시스템을 건너뜁니다.');
        return;
    }
    
    // ✅ config를 전역으로 노출 (trackingLog 함수가 접근할 수 있도록)
    window.trackingConfig = config;
    
    trackingLog('🚀 ThinkingData 추적 시스템 초기화 시작...');
    
    try {
        // 1. 유틸리티 함수 전역 등록 (하위 호환성)
        registerGlobalUtils();
        
        // 2. SDK 초기화 (실패해도 다른 모듈들은 동작하도록)
        let sdkInitialized = false;
        try {
            sdkInitialized = await initSDK(config.thinkingData);
        } catch (sdkError) {
            console.warn('⚠️ SDK 초기화 실패, 다른 모듈들은 계속 실행:', sdkError);
        }
        
        // ✅ 세션 관리자 초기화 (SDK 초기화 후)
        try {
            await initSession(config.session);
            trackingLog('✅ 세션 관리자 초기화 완료');
        } catch (sessionError) {
            console.warn('⚠️ 세션 관리자 초기화 실패:', sessionError);
        }
        
        // 3. 각 트래킹 모듈 초기화 (SDK 초기화 실패해도 실행)
        if (config.modules.click) {
            try {
                initClickTracking();
                trackingLog('✅ 클릭 추적 초기화 완료');
            } catch (error) {
                console.warn('⚠️ 클릭 추적 초기화 실패:', error);
            }
        }
        
        if (config.modules.exit) {
            try {
                initExitTracking();
                trackingLog('✅ 종료 추적 초기화 완료');
            } catch (error) {
                console.warn('⚠️ 종료 추적 초기화 실패:', error);
            }
        }
        
        if (config.modules.scroll) {
            try {
                initScrollTracking();
                trackingLog('✅ 스크롤 추적 초기화 완료');
            } catch (error) {
                console.warn('⚠️ 스크롤 추적 초기화 실패:', error);
            }
        }
        
        if (config.modules.form) {
            try {
                initFormTracking();
                trackingLog('✅ 폼 추적 초기화 완료');
            } catch (error) {
                console.warn('⚠️ 폼 추적 초기화 실패:', error);
            }
        }
        
        if (config.modules.popup) {
            try {
                initPopupTracking();
                trackingLog('✅ 팝업 추적 초기화 완료');
            } catch (error) {
                console.warn('⚠️ 팝업 추적 초기화 실패:', error);
            }
        }
        
        if (config.modules.resource) {
            try {
                initResourceTracking();
                trackingLog('✅ 리소스 다운로드 추적 초기화 완료');
            } catch (error) {
                console.warn('⚠️ 리소스 다운로드 추적 초기화 실패:', error);
            }
        }
        
        if (config.modules.sectionScroll) {
            try {
                initSectionScrollTracking();
                window.initSectionScrollTracking = initSectionScrollTracking;
                trackingLog('✅ 섹션 스크롤 추적 초기화 완료');
            } catch (error) {
                console.warn('⚠️ 섹션 스크롤 추적 초기화 실패:', error);
            }
        }

        // 유저 속성 추적 초기화
        if (config.modules.userAttributes) {
            try {
                initUserAttributes();
                trackingLog('✅ 유저 속성 추적 초기화 완료');
            } catch (error) {
                console.warn('⚠️ 유저 속성 추적 초기화 실패:', error);
            }
        }

        // 4. SDK가 초기화된 경우에만 페이지뷰 이벤트 전송
        if (sdkInitialized) {
            try {
                trackPageView();
                trackingLog('✅ 페이지뷰 이벤트 전송 완료');
            } catch (error) {
                console.warn('⚠️ 페이지뷰 이벤트 전송 실패:', error);
            }
        }

        trackingLog('✅ 모든 트래킹 모듈 초기화 완료');
        
        // 5. 초기화 완료 이벤트 발생
        window.dispatchEvent(new CustomEvent('tracking:ready', {
            detail: {
                sdkInitialized,
                modules: config.modules
            }
        }));
        
    } catch (error) {
        console.error('❌ 추적 시스템 초기화 실패:', error);
    }
}

// 브라우저 환경에서만 실행
if (isBrowserEnvironment()) {
    // DOM 로드 완료 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        // DOM이 이미 로드된 경우 즉시 실행
        main();
    }
} 