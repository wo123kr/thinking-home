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
    script.onload = () => {
      console.log(`✅ 모듈 로드 완료: ${url}`);
      resolve();
    };
    script.onerror = (error) => {
      console.error(`❌ 모듈 로드 실패: ${url}`, error);
      reject(error);
    };
    document.head.appendChild(script);
  });
}

// 모든 모듈 로드
async function loadAllModules() {
  const baseUrl = 'https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main';
  
  try {
    console.log('🔄 ThinkingData 모듈 로딩 시작...');
    
    // 1. 코어 모듈들 로드 (유틸리티 먼저)
    await loadModule(`${baseUrl}/core/utils.js`);
    await loadModule(`${baseUrl}/core/session-manager.js`);
    
    // 2. 추적 모듈들 로드
    await loadModule(`${baseUrl}/tracking/page-view.js`);
    await loadModule(`${baseUrl}/tracking/click.js`);
    await loadModule(`${baseUrl}/tracking/scroll.js`);
    await loadModule(`${baseUrl}/tracking/form.js`);
    await loadModule(`${baseUrl}/tracking/popup.js`);
    await loadModule(`${baseUrl}/tracking/video.js`);
    await loadModule(`${baseUrl}/tracking/resource.js`);
    await loadModule(`${baseUrl}/tracking/exit.js`);
    
    // 3. 유저 속성 추적 시스템 로드
    await loadModule(`${baseUrl}/user-attributes.js`);
    
    console.log('🎉 모든 ThinkingData 모듈 로드 완료!');
    
    // 4. 추적 시스템 초기화
    initializeTrackingSystem();
    
  } catch (error) {
    console.error('❌ ThinkingData 모듈 로드 실패:', error);
  }
}

// 추적 시스템 초기화
function initializeTrackingSystem() {
  console.log('🔄 ThinkingData 추적 시스템 초기화 시작...');
  
  // DOM 로드 완료 후 이벤트 추적 시작
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('✅ DOM 로드 완료, ThinkingData 추적 활성화');
      startAllTracking();
    });
  } else {
    // DOM이 이미 로드된 경우
    console.log('✅ DOM 이미 로드됨, ThinkingData 추적 시작');
    startAllTracking();
  }
}

// 모든 추적 시작
function startAllTracking() {
  console.log('🔄 ThinkingData 추적 모듈 초기화 시작...');
  
  let initializedCount = 0;
  
  // 각 모듈의 초기화 함수 호출
  if (typeof window.trackPopupEvents === 'function') {
    window.trackPopupEvents();
    initializedCount++;
    console.log('✅ 팝업 추적 초기화 완료');
  }
  
  if (typeof window.trackClickEvents === 'function') {
    window.trackClickEvents();
    initializedCount++;
    console.log('✅ 클릭 추적 초기화 완료');
  }
  
  if (typeof window.trackScrollDepth === 'function') {
    window.trackScrollDepth();
    initializedCount++;
    console.log('✅ 스크롤 추적 초기화 완료');
  }
  
  if (typeof window.trackFormSubmissions === 'function') {
    window.trackFormSubmissions();
    initializedCount++;
    console.log('✅ 폼 추적 초기화 완료');
  }
  
  if (typeof window.trackVideoEvents === 'function') {
    window.trackVideoEvents();
    initializedCount++;
    console.log('✅ 비디오 추적 초기화 완료');
  }
  
  if (typeof window.trackResourceDownloads === 'function') {
    window.trackResourceDownloads();
    initializedCount++;
    console.log('✅ 리소스 추적 초기화 완료');
  }
  
  if (typeof window.initializePageExitTracking === 'function') {
    window.initializePageExitTracking();
    initializedCount++;
    console.log('✅ 페이지 종료 추적 초기화 완료');
  }
  
  // 유저 속성 추적 초기화
  if (typeof window.initializeUserAttributeTracker === 'function') {
    window.initializeUserAttributeTracker();
    initializedCount++;
    console.log('✅ 유저 속성 추적 초기화 완료');
  }
  
  // 페이지 뷰 즉시 전송
  if (typeof window.trackPageView === 'function') {
    window.trackPageView();
    console.log('✅ 페이지 뷰 이벤트 전송 완료');
  }
  
  console.log(`🎉 ThinkingData 추적 시스템 완전 초기화 완료! (${initializedCount}개 모듈)`);
  
  // 전역 디버깅 함수 추가
  window.debugThinkingData = function() {
    console.log('🔍 ThinkingData 디버깅 정보:');
    console.log('- SDK 상태:', {
      thinkingdata: typeof thinkingdata,
      te: typeof window.te,
      track: window.te ? typeof window.te.track : 'N/A'
    });
    console.log('- 모듈 상태:', {
      utils: typeof window.trackEvent,
      session: typeof window.initializeSession,
      pageView: typeof window.trackPageView,
      click: typeof window.trackClickEvents,
      scroll: typeof window.trackScrollDepth,
      form: typeof window.trackFormSubmissions,
      popup: typeof window.trackPopupEvents,
      video: typeof window.trackVideoEvents,
      resource: typeof window.trackResourceDownloads,
      exit: typeof window.initializePageExitTracking,
      userAttr: typeof window.initializeUserAttributeTracker
    });
  };
}

// SDK 초기화 함수
function initializeThinkingData() {
  try {
    // thinkingdata 객체 확인
    if (typeof thinkingdata === 'undefined') {
      console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 1초 후 재시도...');
      setTimeout(initializeThinkingData, 1000);
      return;
    }
    
    // 전역 객체 설정
    window.te = thinkingdata;
    
    // SDK 초기화
    te.init(config);
    
    console.log("🎯 ThinkingData SDK 초기화 완료:", config);
    
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

// 시작 로그
console.log('🚀 ThinkingData 추적 시스템 로드 시작...');