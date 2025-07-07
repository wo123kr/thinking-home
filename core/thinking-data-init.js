/**
 * ThinkingData SDK 초기화 코드
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

// SDK 초기화
window.te = thinkingdata;
te.init(config);

console.log("✅ ThinkingData SDK initialized:", config);

// 전역 함수로 노출
window.initializeThinkingData = function() {
    window.te = thinkingdata;
    te.init(config);
    console.log("✅ ThinkingData SDK initialized:", config);
};