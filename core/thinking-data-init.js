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