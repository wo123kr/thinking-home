/**
 * ⚠️ DEPRECATED - 이 파일은 더 이상 권장되지 않습니다
 * 
 * 🚀 대신 이것을 사용하세요:
 * <script src="https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@43a3452/core/thinking-data-init.js"></script>
 * 
 * 🎯 이유:
 * - core/thinking-data-init.js가 이미 모든 기능을 포함
 * - 더 간단하고 빠른 로딩
 * - 불필요한 복잡성 제거
 * - 동일한 기능, 더 나은 성능
 * 
 * 이 파일은 하위 호환성을 위해 유지되지만, 새 프로젝트에서는 사용하지 마세요.
 */

console.warn('⚠️ DEPRECATED: index.js 사용 중지 예정');
console.warn('🚀 대신 사용하세요: core/thinking-data-init.js');
console.warn('📖 자세한 정보: https://github.com/wo123kr/webflow-tracking#readme');

/**
 * ThinkingData 웹 추적 시스템 - 메인 진입점
 * Webflow용 CDN 배포 버전 (중복 초기화 방지 강화)
 * 
 * 사용법:
 * <script src="https://cdn.jsdelivr.net/gh/[username]/webflow-tracking@main/index.js"></script>
 * 
 * 주의: core/thinking-data-init.js가 먼저 로드되어야 합니다.
 */

(function() {
    'use strict';
    
    // 전역 중복 방지 플래그 (강화)
    if (window.indexJSInitialized) {
        console.log('ℹ️ index.js가 이미 초기화됨');
        return;
    }
    window.indexJSInitialized = true;
    
    // 모듈 로드 함수 (중복 방지)
    function loadModule(url) {
        return new Promise((resolve, reject) => {
            // 이미 로드된 모듈인지 확인
            if (document.querySelector(`script[src="${url}"]`)) {
                console.log(`ℹ️ 모듈이 이미 로드됨: ${url}`);
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // 모든 모듈 로드 (thinking-data-init.js 제외) - 중복 방지 강화
    async function loadAllModules() {
        // 중복 실행 방지
        if (window.modulesLoadingInProgress) {
            console.log('ℹ️ 모듈 로드가 이미 진행 중임');
            return;
        }
        window.modulesLoadingInProgress = true;
        
        const baseUrl = 'https://cdn.jsdelivr.net/gh/wo123kr/webflow-tracking@main';
        
        try {
            // ThinkingData SDK가 이미 로드되었는지 확인
            if (!window.thinkingdata) {
                console.error('❌ ThinkingData SDK가 로드되지 않았습니다. core/thinking-data-init.js를 먼저 로드해주세요.');
                return;
            }
            
            // core/thinking-data-init.js가 이미 로드되었는지 확인
            if (window.thinkingDataInitialized) {
                console.log('ℹ️ core/thinking-data-init.js가 이미 로드되어 있음, 추가 모듈만 로드');
            } else {
                console.log('⚠️ core/thinking-data-init.js가 로드되지 않음, 직접 초기화 시도...');
                // 직접 ThinkingData 초기화 시도
                initializeThinkingDataDirectly();
                return;
            }
            
            // 1. 코어 모듈들 로드 (thinking-data-init.js 제외)
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
            
            console.log('✅ 추가 모듈 로드 완료');
            
            // 4. 추가 초기화 실행 (중복 방지)
            initializeAdditionalTracking();
            
        } catch (error) {
            console.error('❌ 모듈 로드 실패:', error);
        } finally {
            window.modulesLoadingInProgress = false;
        }
    }
    
    // 추가 추적 초기화 (중복 방지 강화)
    function initializeAdditionalTracking() {
        // 중복 실행 방지
        if (window.additionalTrackingInitialized) {
            console.log('ℹ️ 추가 추적이 이미 초기화됨');
            return;
        }
        
        // DOM 로드 완료 후 이벤트 추적 시작
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                console.log('✅ DOM loaded, additional tracking active');
                startAdditionalTracking();
            });
        } else {
            // DOM이 이미 로드된 경우
            console.log('✅ DOM already loaded, starting additional tracking');
            startAdditionalTracking();
        }
    }
    
    // 추가 추적 시작 (중복 방지 강화)
    function startAdditionalTracking() {
        // 중복 실행 방지 플래그 확인 (강화된 체크)
        if (window.additionalTrackingInitialized) {
            console.log('ℹ️ 추가 추적이 이미 초기화됨');
            return;
        }
        
        // 5초 내 재실행 방지
        const now = Date.now();
        if (window.additionalTrackingLastInitTime && (now - window.additionalTrackingLastInitTime) < 5000) {
            console.log('ℹ️ 추가 추적이 최근에 초기화됨, 스킵');
            return;
        }
        
        console.log('🔄 추가 추적 모듈 초기화 시작...');
        
        // 초기화 플래그 설정
        window.additionalTrackingInitialized = true;
        window.additionalTrackingLastInitTime = now;
        
        let initializedCount = 0;
        
        // 각 모듈의 초기화 함수 호출 (중복 방지 강화)
        if (typeof window.trackPopupEvents === 'function' && !window.popupTrackingInitialized) {
            window.trackPopupEvents();
            window.popupTrackingInitialized = true;
            initializedCount++;
            console.log('✅ 팝업 추적 초기화 완료');
        } else if (window.popupTrackingInitialized) {
            console.log('ℹ️ 팝업 추적이 이미 초기화됨');
        }
        
        if (typeof window.trackClickEvents === 'function' && !window.clickTrackingInitialized) {
            window.trackClickEvents();
            window.clickTrackingInitialized = true;
            initializedCount++;
            console.log('✅ 클릭 추적 초기화 완료');
        } else if (window.clickTrackingInitialized) {
            console.log('ℹ️ 클릭 추적이 이미 초기화됨');
        }
        
        if (typeof window.trackScrollDepth === 'function' && !window.scrollTrackingInitialized) {
            window.trackScrollDepth();
            window.scrollTrackingInitialized = true;
            initializedCount++;
            console.log('✅ 스크롤 추적 초기화 완료');
        } else if (window.scrollTrackingInitialized) {
            console.log('ℹ️ 스크롤 추적이 이미 초기화됨');
        }
        
        if (typeof window.trackFormSubmissions === 'function' && !window.formTrackingInitialized) {
            window.trackFormSubmissions();
            window.formTrackingInitialized = true;
            initializedCount++;
            console.log('✅ 폼 추적 초기화 완료');
        } else if (window.formTrackingInitialized) {
            console.log('ℹ️ 폼 추적이 이미 초기화됨');
        }
        
        // thinking-data-init.js에서 이미 초기화되었는지 확인
        if (window.thinkingDataInitialized && window.videoTrackingInitialized) {
            console.log('ℹ️ 비디오 추적이 이미 초기화됨 (thinking-data-init.js에서)');
        } else if (typeof window.trackVideoEvents === 'function' && !window.videoTrackingInitialized) {
            window.trackVideoEvents();
            window.videoTrackingInitialized = true;
            initializedCount++;
            console.log('✅ 비디오 추적 초기화 완료 (index.js에서)');
        } else if (window.videoTrackingInitialized) {
            console.log('ℹ️ 비디오 추적이 이미 초기화됨');
        }
        
        if (typeof window.trackResourceDownloads === 'function' && !window.resourceTrackingInitialized) {
            window.trackResourceDownloads();
            window.resourceTrackingInitialized = true;
            initializedCount++;
            console.log('✅ 리소스 추적 초기화 완료');
        } else if (window.resourceTrackingInitialized) {
            console.log('ℹ️ 리소스 추적이 이미 초기화됨');
        }
        
        if (typeof window.initializePageExitTracking === 'function' && !window.exitTrackingInitialized) {
            window.initializePageExitTracking();
            window.exitTrackingInitialized = true;
            initializedCount++;
            console.log('✅ 페이지 종료 추적 초기화 완료');
        } else if (window.exitTrackingInitialized) {
            console.log('ℹ️ 페이지 종료 추적이 이미 초기화됨');
        }
        
        // 유저 속성 추적 초기화 (user-attributes.js에서 자동 생성됨)
        if (window.userTracker && !window.userAttributeTrackingInitialized) {
            window.userAttributeTrackingInitialized = true;
            initializedCount++;
            console.log('✅ 유저 속성 추적 초기화 완료 (자동 생성됨)');
        } else if (!window.userTracker) {
            console.log('⚠️ 유저 속성 추적기가 아직 생성되지 않음');
        } else if (window.userAttributeTrackingInitialized) {
            console.log('ℹ️ 유저 속성 추적이 이미 초기화됨');
        }
        
        console.log(`✅ 추가 추적 모듈 초기화 완료 (${initializedCount}개 모듈)`);
    }
    
    // core/thinking-data-init.js가 로드되었는지 확인 후 모듈 로드 시작
    function checkAndLoadModules() {
        if (window.thinkingDataInitialized) {
            console.log('✅ core/thinking-data-init.js 감지됨, 추가 모듈 로드 시작');
            loadAllModules();
        } else {
            console.log('⏳ core/thinking-data-init.js 대기 중...');
            setTimeout(checkAndLoadModules, 1000);
        }
    }
    
    // ThinkingData 직접 초기화 함수
    function initializeThinkingDataDirectly() {
        // 중복 실행 방지
        if (window.te && window.te.getDistinctId) {
            console.log('ℹ️ ThinkingData SDK가 이미 초기화됨');
            loadAllModules();
            return;
        }
        
        try {
            // thinkingdata 객체 확인
            if (typeof thinkingdata === 'undefined') {
                console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 1초 후 재시도...');
                setTimeout(initializeThinkingDataDirectly, 1000);
                return;
            }
            
            // 전역 객체 설정
            window.te = thinkingdata;
            
            // SDK 초기화
            const config = {
                appId: "dc61b4c238a048fb953b77b1fa1329c3",
                serverUrl: "https://te-receiver-naver.thinkingdata.kr/sync_js",
                autoTrack: {
                    pageShow: true,
                    pageHide: true
                }
            };
            
            te.init(config);
            console.log("🎯 ThinkingData SDK 직접 초기화 완료:", config);
            
            // 초기화 완료 후 모듈 로드 시작
            loadAllModules();
            
        } catch (error) {
            console.error('❌ ThinkingData SDK 직접 초기화 실패:', error);
            setTimeout(initializeThinkingDataDirectly, 3000);
        }
    }
    
    // 모듈 로드 시작
    checkAndLoadModules();
    
})(); 

console.log('🚀 Webflow Additional Tracking System 시작...');

// 전역 디버깅 함수들
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
  
  // 비디오 추적 모듈 상태 확인
  console.log('🎬 비디오 추적 모듈 상태:', {
    trackVideoEvents: typeof window.trackVideoEvents,
    videoSessions: window.videoSessions ? window.videoSessions.size : 'N/A',
    isVideoTrackingInitialized: window.isVideoTrackingInitialized
  });
  
  // 수동으로 비디오 추적 실행
  if (typeof window.trackVideoEvents === 'function') {
    console.log('🎬 수동으로 비디오 추적 실행...');
    window.trackVideoEvents();
  } else {
    console.error('❌ trackVideoEvents 함수를 찾을 수 없음');
  }
};

// 팝업 추적 디버깅 함수
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
  });
  
  // 수동으로 팝업 추적 재시작
  if (typeof window.trackPopupEvents === 'function') {
    console.log('🔄 팝업 추적 재시작...');
    window.trackPopupEvents();
  }
};

// 클릭 추적 디버깅 함수
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
  
  // 수동으로 클릭 추적 재시작
  if (typeof window.trackClickEvents === 'function') {
    console.log('🔄 클릭 추적 재시작...');
    window.trackClickEvents();
  }
};

// 리소스 다운로드 추적 디버깅 함수
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
      text: link.textContent ? link.textContent.trim() : '',
      filename: link.href.split('/').pop()
    });
  });
  
  // 수동으로 리소스 추적 재시작
  if (typeof window.trackResourceDownloads === 'function') {
    console.log('🔄 리소스 다운로드 추적 재시작...');
    window.trackResourceDownloads();
  }
};

// 스크롤 추적 디버깅 함수
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