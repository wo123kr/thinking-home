import config from './config.js';
import { initSDK, isSDKInitialized } from './core/thinking-data-init.js';
import { registerGlobalUtils, trackingLog } from './core/utils.js';
import { initClickTracking } from './tracking/click.js';
import { initExitTracking } from './tracking/exit.js';
import { initScrollTracking } from './tracking/scroll.js';
import { initFormTracking } from './tracking/form.js';
import { initPopupTracking } from './tracking/popup.js';
import { initResourceTracking } from './tracking/resource.js';
import { initUserAttributes } from './user-attributes.js';
import { trackPageView } from './tracking/pageview.js';

/**
 * ThinkingData 추적 시스템 초기화 및 실행
 * 모든 트래킹 모듈의 진입점
 */
async function main() {
  // config를 전역으로 설정 (로그 제어용)
  // window.trackingConfig = config; // Node.js 환경에서는 불필요
  
  trackingLog('🚀 ThinkingData 추적 시스템 초기화 시작...');
  
  try {
    // 1. 유틸리티 함수 전역 등록 (하위 호환성)
    registerGlobalUtils();
    
    // 2. SDK 초기화
    await initSDK(config.thinkingData);
    
    // 3. 각 트래킹 모듈 초기화 (세션/브라우저 전용 제외)
    if (config.modules.click) initClickTracking();
    if (config.modules.exit) initExitTracking();
    if (config.modules.scroll) initScrollTracking();
    if (config.modules.form) initFormTracking();
    if (config.modules.popup) initPopupTracking();
    if (config.modules.resource) initResourceTracking();
    if (config.modules.userAttributes) initUserAttributes();

    // 4. 페이지 진입 시 pageview 이벤트 전송 (SDK가 완전히 준비된 후 1회만 전송)
    // Node.js 환경에서는 불필요

    trackingLog('✅ 모든 트래킹 모듈 초기화 완료');
  } catch (error) {
    console.error('❌ 추적 시스템 초기화 실패:', error);
  }
}

main(); 