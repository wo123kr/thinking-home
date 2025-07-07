/**
 * 스크롤 깊이 추적 모듈
 */

let scrollDepthTracked = new Set();
let maxScrollDepth = 0;

function trackScrollDepth() {
  const scrollDepthThresholds = [25, 50, 75, 90, 100];
  
  function calculateScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    const scrollDepthPercentage = Math.round(
      ((scrollTop + windowHeight) / documentHeight) * 100
    );
    
    return {
      percentage: Math.min(scrollDepthPercentage, 100),
      pixels: scrollTop,
      totalHeight: documentHeight
    };
  }
  
  function handleScroll() {
    updateSessionActivity();
    const scrollData = calculateScrollDepth();
    
    // 최대 스크롤 깊이 업데이트
    if (scrollData.percentage > maxScrollDepth) {
      maxScrollDepth = scrollData.percentage;
    }
    
    // 임계값 도달 시 이벤트 전송
    scrollDepthThresholds.forEach(threshold => {
      if (scrollData.percentage >= threshold && !scrollDepthTracked.has(threshold)) {
        scrollDepthTracked.add(threshold);
        te.track('te_scroll_depth', {
          scroll_depth_percentage: threshold,
          scroll_depth_pixels: scrollData.pixels,
          page_total_height_pixels: scrollData.totalHeight,
          page_name: document.title,
          page_url: window.location.href,
          scroll_direction: 'vertical'
        });
      }
    });
  }
  
  // 스크롤 이벤트 리스너 (디바운싱 적용)
let scrollTimeout;
window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(handleScroll, 100);
});

// 전역 함수로 노출
window.trackScrollDepth = trackScrollDepth;
}