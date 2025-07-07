/**
 * ThinkingData 웹 추적 시스템 - 메인 진입점
 * Webflow용 CDN 배포 버전
 * 
 * 사용법:
 * <script src="https://cdn.jsdelivr.net/gh/[username]/webpage-thinking@main/index.js"></script>
 */

(function() {
    'use strict';
    
    // ThinkingData SDK 로드
    function loadThinkingDataSDK() {
        return new Promise((resolve, reject) => {
            // 이미 로드된 경우
            if (window.thinkingdata) {
                resolve(window.thinkingdata);
                return;
            }
            
            // SDK 스크립트 로드
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/thinkingdata-browser@2.0.3/thinkingdata.umd.min.js';
            script.async = true;
            script.onload = () => {
                if (window.thinkingdata) {
                    resolve(window.thinkingdata);
                } else {
                    reject(new Error('ThinkingData SDK 로드 실패'));
                }
            };
            script.onerror = () => reject(new Error('ThinkingData SDK 로드 실패'));
            document.head.appendChild(script);
        });
    }
    
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
        const baseUrl = 'https://cdn.jsdelivr.net/gh/[username]/webpage-thinking@main';
        
        try {
            // 1. ThinkingData SDK 로드
            await loadThinkingDataSDK();
            
            // 2. 코어 모듈들 로드
            await loadModule(`${baseUrl}/core/thinking-data-init.js`);
            await loadModule(`${baseUrl}/core/session-manager.js`);
            
            // 3. 추적 모듈들 로드
            await loadModule(`${baseUrl}/tracking/page-view.js`);
            await loadModule(`${baseUrl}/tracking/click.js`);
            await loadModule(`${baseUrl}/tracking/scroll.js`);
            await loadModule(`${baseUrl}/tracking/form.js`);
            await loadModule(`${baseUrl}/tracking/popup.js`);
            await loadModule(`${baseUrl}/tracking/video.js`);
            await loadModule(`${baseUrl}/tracking/resource.js`);
            await loadModule(`${baseUrl}/tracking/exit.js`);
            
            // 4. 유저 속성 추적 시스템 로드
            await loadModule(`${baseUrl}/user-attributes.js`);
            
            console.log('✅ 모든 모듈 로드 완료');
            
            // 5. 초기화 실행
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