/**
 * 리소스 다운로드 추적 모듈
 */

function trackResourceDownloads() {
  document.addEventListener('click', function(event) {
    const target = event.target;
    const link = target.closest('a');
    
    if (link && link.href) {
      const url = link.href.toLowerCase();
      const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar'];
      
      if (downloadExtensions.some(ext => url.includes(ext))) {
        updateSessionActivity();
        te.track('resource_download', {
          page_name: document.title,
          page_url: window.location.href,
          download_url: link.href,
          download_filename: link.href.split('/').pop(),
          download_success: true // 클릭 시점에서는 true로 설정
        });
          }
  }
});

// 전역 함수로 노출
window.trackResourceDownloads = trackResourceDownloads;
}