/**
 * ThinkingData 웹 추적 시스템 - 메인 진입점
 * Webflow용 CDN 배포 버전
 * 
 * 사용법:
 * <script src="https://cdn.jsdelivr.net/gh/[username]/webpage-thinking@main/index.js"></script>
 * 
 * 주의: ThinkingData SDK는 Webflow Head에서 먼저 로드되어야 합니다.
 */

(function() {
    'use strict';
    
    // 모듈 로드 함수
    function loadModule(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // 모든 모듈 로드
    async function loadAllModules() {
        const baseUrl = 'https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main';
        
        try {
            // ThinkingData SDK가 이미 로드되었는지 확인
            if (!window.thinkingdata) {
                console.error('❌ ThinkingData SDK가 로드되지 않았습니다. Webflow Head에서 먼저 로드해주세요.');
                return;
            }
            
            // 1. 코어 모듈들 로드 (유틸리티 먼저)
            await loadModule(`${baseUrl}/core/utils.js`);
            await loadModule(`${baseUrl}/core/thinking-data-init.js`);
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
            
            console.log('✅ 모든 모듈 로드 완료');
            
            // 4. 초기화 실행
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
        // 각 모듈의 초기화 함수 호출
        if (typeof window.trackPopupEvents === 'function') window.trackPopupEvents();
        if (typeof window.trackClickEvents === 'function') window.trackClickEvents();
        if (typeof window.trackScrollDepth === 'function') window.trackScrollDepth();
        if (typeof window.trackFormSubmissions === 'function') window.trackFormSubmissions();
        if (typeof window.trackVideoEvents === 'function') window.trackVideoEvents();
        if (typeof window.trackResourceDownloads === 'function') window.trackResourceDownloads();
        if (typeof window.initializePageExitTracking === 'function') window.initializePageExitTracking();
        
        // 유저 속성 추적 초기화
        if (typeof window.initializeUserAttributeTracker === 'function') {
            window.initializeUserAttributeTracker();
        }
        
        console.log('✅ All tracking events initialized');
    }
    
    // 페이지 뷰 즉시 전송
    if (typeof window.trackPageView === 'function') {
        window.trackPageView();
    }
    
    // 모듈 로드 시작
    loadAllModules();
    
})(); 

console.log('🚀 Webflow Tracking System 시작...');

// 전역 디버깅 함수
window.debugVideoTracking = function() {
  console.log('🔍 비디오 추적 디버깅 시작...');
  
  // ThinkingData SDK 상태 확인
  console.log('📊 ThinkingData SDK 상태:', {
    te: typeof window.te,
    thinkingdata: typeof thinkingdata,
    track: window.te ? typeof window.te.track : 'N/A'
  });
  
  // YouTube iframe 확인
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="youtube-nocookie.com"]');
  console.log('🎯 YouTube iframe 발견:', youtubeIframes.length);
  
  youtubeIframes.forEach((iframe, index) => {
    console.log(`🎬 iframe ${index + 1}:`, {
      id: iframe.id,
      src: iframe.src,
      width: iframe.width,
      height: iframe.height
    });
  });
  
  // YouTube API 상태 확인
  console.log('📺 YouTube API 상태:', {
    YT: typeof window.YT,
    YTPlayer: window.YT ? typeof window.YT.Player : 'N/A'
  });
  
  // 비디오 세션 상태 확인
  if (window.videoSessions) {
    console.log('🎬 비디오 세션:', window.videoSessions.size);
    window.videoSessions.forEach((session, key) => {
      console.log(`  - ${key}:`, session);
    });
  }
  
  // 수동으로 비디오 추적 재시작
  if (typeof window.trackVideoEvents === 'function') {
    console.log('🔄 비디오 추적 재시작...');
    window.trackVideoEvents();
  }
};

// 팝업 추적 디버깅 함수 추가
window.debugPopupTracking = function() {
  console.log('🎪 팝업 추적 디버깅 시작...');
  
  // ThinkingData SDK 상태 확인
  console.log('📊 ThinkingData SDK 상태:', {
    te: typeof window.te,
    thinkingdata: typeof thinkingdata,
    track: window.te ? typeof window.te.track : 'N/A'
  });
  
  // 팝업 요소 확인
  const popupElements = document.querySelectorAll('.modal-container, .modal, .popup, .overlay, [role="dialog"]');
  console.log('🎪 팝업 요소 발견:', popupElements.length);
  
  popupElements.forEach((popup, index) => {
    console.log(`🎪 팝업 ${index + 1}:`, {
      id: popup.id,
      classList: Array.from(popup.classList),
      visible: isElementVisible(popup),
      tracked: popup.dataset.tracked || 'false'
    });
    
    // 혜택 확인하기 버튼 확인
    const benefitButton = popup.querySelector('a[href*="thinkingdata-onestore-special-promotion"], .button-3');
    if (benefitButton) {
      console.log(`  - 혜택 확인하기 버튼:`, {
        text: benefitButton.textContent ? benefitButton.textContent.trim() : null,
        href: benefitButton.href,
        classList: Array.from(benefitButton.classList)
      });
    }
    
    // 닫기 버튼 확인
    const closeButton = popup.querySelector('.link-block-2, .close, .modal-close');
    if (closeButton) {
      console.log(`  - 닫기 버튼:`, {
        text: closeButton.textContent ? closeButton.textContent.trim() : null,
        classList: Array.from(closeButton.classList)
      });
    }
  });
  
  // 수동으로 팝업 추적 재시작
  if (typeof window.trackPopupEvents === 'function') {
    console.log('🔄 팝업 추적 재시작...');
    window.trackPopupEvents();
  }
};

// 클릭 추적 디버깅 함수 추가
window.debugClickTracking = function() {
  console.log('🖱️ 클릭 추적 디버깅 시작...');
  
  // ThinkingData SDK 상태 확인
  console.log('📊 ThinkingData SDK 상태:', {
    te: typeof window.te,
    thinkingdata: typeof thinkingdata,
    track: window.te ? typeof window.te.track : 'N/A'
  });
  
  // 클릭 가능한 요소들 확인
  const clickableElements = document.querySelectorAll('a, button, [role="button"], .btn, .button, .w-button, .link-block');
  console.log('🖱️ 클릭 가능한 요소 발견:', clickableElements.length);
  
  // ThinkingData 특화 버튼들 확인
  const demoButtons = document.querySelectorAll('a[href*="demo"], button:contains("데모")');
  const contactButtons = document.querySelectorAll('a[href*="contact"], button:contains("문의")');
  const learnMoreButtons = document.querySelectorAll('a:contains("자세히 알아보기"), button:contains("자세히")');
  
  console.log('🖱️ 특화 버튼들:', {
    demo: demoButtons.length,
    contact: contactButtons.length,
    learnMore: learnMoreButtons.length
  });
  
  // 수동으로 클릭 추적 재시작
  if (typeof window.trackClickEvents === 'function') {
    console.log('🔄 클릭 추적 재시작...');
    window.trackClickEvents();
  }
};

// 리소스 다운로드 추적 디버깅 함수 추가
window.debugResourceTracking = function() {
  console.log('📥 리소스 다운로드 추적 디버깅 시작...');
  
  // ThinkingData SDK 상태 확인
  console.log('📊 ThinkingData SDK 상태:', {
    te: typeof window.te,
    thinkingdata: typeof thinkingdata,
    track: window.te ? typeof window.te.track : 'N/A'
  });
  
  // 다운로드 가능한 링크들 확인
  const downloadLinks = document.querySelectorAll('a[href*=".pdf"], a[href*=".doc"], a[href*=".xls"], a[href*=".ppt"], a[href*=".zip"]');
  console.log('📥 다운로드 링크 발견:', downloadLinks.length);
  
  downloadLinks.forEach((link, index) => {
    console.log(`📥 다운로드 링크 ${index + 1}:`, {
      href: link.href,
      text: link.textContent ? link.textContent.trim() : null,
      filename: link.href.split('/').pop()
    });
  });
  
  // ThinkingData 특화 리소스 확인
  const apiDocs = document.querySelectorAll('a[href*="api"], a[href*="docs"]');
  const guides = document.querySelectorAll('a[href*="guide"], a[href*="onboarding"]');
  const cases = document.querySelectorAll('a[href*="case"], a[href*="example"]');
  
  console.log('📥 특화 리소스들:', {
    apiDocs: apiDocs.length,
    guides: guides.length,
    cases: cases.length
  });
  
  // 수동으로 리소스 추적 재시작
  if (typeof window.trackResourceDownloads === 'function') {
    console.log('🔄 리소스 다운로드 추적 재시작...');
    window.trackResourceDownloads();
  }
};

// 스크롤 추적 디버깅 함수 추가
window.debugScrollTracking = function() {
  console.log('📜 스크롤 추적 디버깅 시작...');
  
  // ThinkingData SDK 상태 확인
  console.log('📊 ThinkingData SDK 상태:', {
    te: typeof window.te,
    thinkingdata: typeof thinkingdata,
    track: window.te ? typeof window.te.track : 'N/A'
  });
  
  // 현재 스크롤 상태 확인
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  const scrollPercentage = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
  
  console.log('📜 현재 스크롤 상태:', {
    scrollTop: scrollTop,
    windowHeight: windowHeight,
    documentHeight: documentHeight,
    scrollPercentage: scrollPercentage + '%',
    maxScrollDepth: window.maxScrollDepth || 0
  });
  
  // 추적된 스크롤 깊이 확인
  if (window.scrollDepthTracked) {
    console.log('📜 추적된 스크롤 깊이:', Array.from(window.scrollDepthTracked));
  }
  
  // 수동으로 스크롤 추적 재시작
  if (typeof window.trackScrollDepth === 'function') {
    console.log('🔄 스크롤 추적 재시작...');
    window.trackScrollDepth();
  }
};

// 통합 디버깅 함수
window.debugAllTracking = function() {
  console.log('🔍 모든 추적 시스템 디버깅 시작...');
  
  // ThinkingData SDK 상태 확인
  console.log('📊 ThinkingData SDK 상태:', {
    te: typeof window.te,
    thinkingdata: typeof thinkingdata,
    track: window.te ? typeof window.te.track : 'N/A'
  });
  
  // 각 추적 모듈 상태 확인
  console.log('📊 추적 모듈 상태:', {
    clickTracking: typeof window.trackClickEvents,
    resourceTracking: typeof window.trackResourceDownloads,
    scrollTracking: typeof window.trackScrollDepth,
    popupTracking: typeof window.trackPopupEvents,
    videoTracking: typeof window.trackVideoEvents
  });
  
  // 수동으로 모든 추적 재시작
  if (typeof window.trackClickEvents === 'function') window.trackClickEvents();
  if (typeof window.trackResourceDownloads === 'function') window.trackResourceDownloads();
  if (typeof window.trackScrollDepth === 'function') window.trackScrollDepth();
  if (typeof window.trackPopupEvents === 'function') window.trackPopupEvents();
  if (typeof window.trackVideoEvents === 'function') window.trackVideoEvents();
  
  console.log('✅ 모든 추적 시스템 재시작 완료');
};

// 요소가 보이는지 확인하는 헬퍼 함수
function isElementVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 && 
         element.offsetHeight > 0;
}

// 페이지 로드 완료 후 디버깅 정보 출력
window.addEventListener('load', function() {
  console.log('✅ 페이지 로드 완료');
  
  // 5초 후 디버깅 정보 출력
  setTimeout(function() {
    console.log('🔍 자동 디버깅 정보:');
    window.debugVideoTracking();
  }, 5000);
});

// 전역 함수로 노출
window.debugVideoTracking = window.debugVideoTracking; 