/**
 * ThinkingData SDK 초기화 코드 - Webflow 최적화
 */

// ThinkingData 설정
var config = {
  appId: "cf003f81e4564662955fc0e0d914cef9",
  serverUrl: "https://te-receiver-naver.thinkingdata.kr/sync_js",
  autoTrack: {
    pageShow: true,  // 페이지 진입 자동 추적
    pageHide: true   // 페이지 이탈 자동 추적
  }
};

// 모듈 로드 함수
function loadModule(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = false; // 순차 로딩을 위해 false로 설정
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 모든 모듈 로드
async function loadAllModules() {
  const baseUrl = 'https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main';
  
  try {
    console.log('🔄 모듈 로딩 시작...');
    
    // 1. 코어 모듈들 로드 (유틸리티 먼저)
    await loadModule(`${baseUrl}/core/utils.js`);
    console.log('✅ utils.js 로드 완료');
    
    await loadModule(`${baseUrl}/core/session-manager.js`);
    console.log('✅ session-manager.js 로드 완료');
    
    // 2. 추적 모듈들 로드
    await loadModule(`${baseUrl}/tracking/page-view.js`);
    await loadModule(`${baseUrl}/tracking/click.js`);
    await loadModule(`${baseUrl}/tracking/scroll.js`);
    await loadModule(`${baseUrl}/tracking/form.js`);
    await loadModule(`${baseUrl}/tracking/popup.js`);
    await loadModule(`${baseUrl}/tracking/video.js`);
    await loadModule(`${baseUrl}/tracking/resource.js`);
    await loadModule(`${baseUrl}/tracking/exit.js`);
    console.log('✅ 추적 모듈들 로드 완료');
    
    // 3. 유저 속성 추적 시스템 로드
    await loadModule(`${baseUrl}/user-attributes.js`);
    console.log('✅ user-attributes.js 로드 완료');
    
    console.log('✅ 모든 모듈 로드 완료');
    
    // 4. 추적 시스템 초기화
    initializeTrackingSystem();
    
  } catch (error) {
    console.error('❌ 모듈 로드 실패:', error);
  }
}

// 추적 시스템 초기화
function initializeTrackingSystem() {
  // DOM 로드 완료 후 이벤트 추적 시작
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('✅ DOM loaded, tracking active');
      startAllTracking();
    });
  } else {
    // DOM이 이미 로드된 경우
    console.log('✅ DOM already loaded, starting tracking');
    startAllTracking();
  }
}

// 모든 추적 시작
function startAllTracking() {
  console.log('🔄 추적 시스템 초기화 시작...');
  
  // 각 모듈의 초기화 함수 호출
  if (typeof window.trackPopupEvents === 'function') {
    window.trackPopupEvents();
    console.log('✅ 팝업 추적 초기화');
  }
  
  if (typeof window.trackClickEvents === 'function') {
    window.trackClickEvents();
    console.log('✅ 클릭 추적 초기화');
  }
  
  if (typeof window.trackScrollDepth === 'function') {
    window.trackScrollDepth();
    console.log('✅ 스크롤 추적 초기화');
  }
  
  if (typeof window.trackFormSubmissions === 'function') {
    window.trackFormSubmissions();
    console.log('✅ 폼 추적 초기화');
  }
  
  if (typeof window.trackVideoEvents === 'function') {
    window.trackVideoEvents();
    console.log('✅ 비디오 추적 초기화');
  }
  
  if (typeof window.trackResourceDownloads === 'function') {
    window.trackResourceDownloads();
    console.log('✅ 리소스 추적 초기화');
  }
  
  if (typeof window.initializePageExitTracking === 'function') {
    window.initializePageExitTracking();
    console.log('✅ 페이지 종료 추적 초기화');
  }
  
  // 유저 속성 추적 초기화
  if (typeof window.initializeUserAttributeTracker === 'function') {
    window.initializeUserAttributeTracker();
    console.log('✅ 유저 속성 추적 초기화');
  }
  
  // 페이지 뷰 즉시 전송
  if (typeof window.trackPageView === 'function') {
    window.trackPageView();
    console.log('✅ 페이지 뷰 이벤트 전송');
  }
  
  console.log('✅ 모든 추적 시스템 초기화 완료');
}

// SDK 초기화 함수
function initializeThinkingData() {
  try {
    // thinkingdata 객체 확인
    if (typeof thinkingdata === 'undefined') {
      console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 재시도 중...');
      setTimeout(initializeThinkingData, 1000);
      return;
    }
    
    // 전역 객체 설정
    window.te = thinkingdata;
    
    // SDK 초기화
    te.init(config);
    
    console.log("✅ ThinkingData SDK initialized:", config);
    
    // 초기화 완료 후 모듈 로드 시작
    loadAllModules();
    
    // 초기화 완료 이벤트 발생
    window.dispatchEvent(new CustomEvent('thinkingdata:ready'));
    
  } catch (error) {
    console.error('❌ ThinkingData SDK 초기화 실패:', error);
    // 3초 후 재시도
    setTimeout(initializeThinkingData, 3000);
  }
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOM 로드 완료, ThinkingData 초기화 시작');
    setTimeout(initializeThinkingData, 500);
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('🔄 DOM 이미 로드됨, ThinkingData 초기화 시작');
  setTimeout(initializeThinkingData, 500);
}

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  if (!window.te) {
    console.log('🔄 페이지 로드 완료, ThinkingData 재초기화 시도');
    setTimeout(initializeThinkingData, 1000);
  }
});

// 전역 함수로 노출
window.initializeThinkingData = initializeThinkingData;