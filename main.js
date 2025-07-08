import config from './config.js';
import { initSDK, isSDKInitialized } from './core/thinking-data-init.js';
import { initSession } from './core/session-manager.js';
import { registerGlobalUtils } from './core/utils.js';
import { trackClicks } from './tracking/click.js';
import { initExitTracking } from './tracking/exit.js';
import { initScrollTracking } from './tracking/scroll.js';
import { initFormTracking } from './tracking/form.js';
import { initPopupTracking } from './tracking/popup.js';
import { trackVideo } from './tracking/video.js';
import { initResourceTracking } from './tracking/resource.js';
import { initUserAttributes } from './user-attributes.js';
import { trackPageView } from './tracking/pageview.js';

/**
 * ThinkingData 추적 시스템 초기화 및 실행
 * 모든 트래킹 모듈의 진입점
 */
async function main() {
  console.log('🚀 ThinkingData 추적 시스템 초기화 시작...');
  
  try {
    // 1. 유틸리티 함수 전역 등록 (하위 호환성)
    registerGlobalUtils();
    
    // 2. SDK 초기화
    await initSDK(config.thinkingData);
    
    // 3. 세션 초기화
    await initSession(config.session);
    
    // 4. 각 트래킹 모듈 초기화
    if (config.modules.click) trackClicks();
    if (config.modules.exit) initExitTracking();
    if (config.modules.scroll) initScrollTracking();
    if (config.modules.form) initFormTracking();
    if (config.modules.popup) initPopupTracking();
    if (config.modules.video) trackVideo();
    if (config.modules.resource) initResourceTracking();
    if (config.modules.userAttributes) initUserAttributes();

    // 5. 페이지 진입 시 pageview 이벤트 전송
    document.addEventListener('DOMContentLoaded', () => trackPageView());

    console.log('✅ 모든 트래킹 모듈 초기화 완료');
  } catch (error) {
    console.error('❌ 추적 시스템 초기화 실패:', error);
  }
}

main(); 