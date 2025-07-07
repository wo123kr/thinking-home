/**
 * 페이지 뷰 이벤트 추적
 */

// 페이지 뷰 이벤트 전송
function trackPageView() {
  const pageViewProperties = {
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title
  };
  
  // referrer 정보가 있을 때만 추가
  if (document.referrer) {
    pageViewProperties.referrer = document.referrer;
    try {
      pageViewProperties.referrer_host = new URL(document.referrer).hostname;
    } catch (e) {
      // URL 파싱 실패 시 무시
    }
  }
  
  te.track('te_page_view', pageViewProperties);
}

// 전역 함수로 노출
window.trackPageView = trackPageView;

// SPA 환경에서 페이지 변경 감지를 위한 함수 (필요시 사용)
window.initSPAPageTracking = function() {
  let lastUrl = window.location.href;
  
  // URL 변경 감지를 위한 인터벌 설정
  setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      trackPageView();
    }
  }, 500);
};

// 페이지 로드 시 자동 실행
trackPageView();