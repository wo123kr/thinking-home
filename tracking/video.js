/**
 * 비디오 추적 모듈 (YouTube API 활용) - 동적 설정 가능한 구조
 */

// 비디오 세션 추적을 위한 변수들
let videoSessions = new Map(); // 각 비디오별 세션 추적
let isVideoTrackingInitialized = false;

function trackVideoEvents() {
  console.log('🎬 비디오 추적 초기화 시작...');
  
  // 중복 초기화 방지
  if (isVideoTrackingInitialized) {
    console.log('ℹ️ 비디오 추적이 이미 초기화됨');
    return;
  }
  
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(trackVideoEvents, 3000);
    return;
  }
  
  // 동적 비디오 플랫폼 감지
  const videoIframes = detectVideoIframes();
  console.log(`🎯 비디오 iframe 발견: ${videoIframes.length}개`);
  
  if (videoIframes.length > 0) {
    // YouTube API 즉시 로드
    loadYouTubeAPI();
  } else {
    console.log('ℹ️ 비디오 iframe이 없어서 API 로드하지 않음');
    // DOM 변경 감지를 위한 MutationObserver 설정
    setupVideoObserver();
  }
  
  isVideoTrackingInitialized = true;
}

// 동적 비디오 iframe 감지 (설정 가능)
function detectVideoIframes() {
  const videoPlatformMappings = window.videoPlatformMappings || {
    'youtube': {
      selectors: [
        'iframe[src*="youtube.com"]',
        'iframe[src*="youtu.be"]',
        'iframe[src*="youtube-nocookie.com"]'
      ],
      patterns: ['youtube.com', 'youtu.be', 'youtube-nocookie.com']
    },
    'vimeo': {
      selectors: [
        'iframe[src*="vimeo.com"]',
        'iframe[src*="player.vimeo.com"]'
      ],
      patterns: ['vimeo.com', 'player.vimeo.com']
    },
    'dailymotion': {
      selectors: [
        'iframe[src*="dailymotion.com"]'
      ],
      patterns: ['dailymotion.com']
    },
    'wistia': {
      selectors: [
        'iframe[src*="wistia.com"]',
        'iframe[src*="fast.wistia.com"]'
      ],
      patterns: ['wistia.com', 'fast.wistia.com']
    }
  };
  
  let allIframes = [];
  
  // 모든 플랫폼의 iframe 수집
  for (const [platform, config] of Object.entries(videoPlatformMappings)) {
    const selectors = config.selectors.join(', ');
    const iframes = document.querySelectorAll(selectors);
    iframes.forEach(iframe => {
      iframe.dataset.videoPlatform = platform;
      allIframes.push(iframe);
    });
  }
  
  return allIframes;
}

// DOM 변경 감지로 동적 비디오 iframe 감지
function setupVideoObserver() {
  console.log('🔍 비디오 iframe 동적 감지 설정...');
  
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element node
          // 새로 추가된 iframe 확인
          const videoIframes = detectVideoIframes();
          
          if (videoIframes.length > 0) {
            console.log(`🎯 새로운 비디오 iframe 발견: ${videoIframes.length}개`);
            loadYouTubeAPI();
            observer.disconnect(); // 한 번 발견하면 관찰 중단
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// YouTube API 동적 로드 (더 정확한 추적을 위해)
function loadYouTubeAPI() {
  // 이미 로드된 경우 중복 로드 방지
  if (window.YT && window.YT.Player) {
    console.log('✅ YouTube API 이미 로드됨');
    initializeYouTubePlayers();
    return;
  }
  
  // 이미 스크립트가 있는지 확인
  if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    console.log('ℹ️ YouTube API 스크립트 이미 존재함');
    return;
  }
  
  console.log('🎬 YouTube API 로드 시작...');
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  script.onload = function() {
    console.log('✅ YouTube API 스크립트 로드 완료');
  };
  script.onerror = function() {
    console.error('❌ YouTube API 스크립트 로드 실패');
  };
  document.head.appendChild(script);
  
  // YouTube API 준비 완료 시 호출될 함수
  window.onYouTubeIframeAPIReady = function() {
    console.log('✅ YouTube API 준비 완료!');
    initializeYouTubePlayers();
  };
}

// YouTube 플레이어 초기화
function initializeYouTubePlayers() {
  const videoIframes = detectVideoIframes();
  console.log(`🎯 비디오 iframe 발견: ${videoIframes.length}개`);
  
  videoIframes.forEach((iframe, index) => {
    if (!iframe.id) {
      iframe.id = `video_player_${index}`;
    }
    
    // 접근성 개선을 위한 iframe 속성 설정
    iframe.setAttribute('title', 'YouTube video player');
    iframe.setAttribute('aria-label', 'YouTube video player');
    
    console.log(`🎬 비디오 플레이어 초기화: ${iframe.id}`);
    
    try {
      const player = new YT.Player(iframe.id, {
        // 접근성 개선을 위한 설정
        host: 'https://www.youtube-nocookie.com', // 개인정보 보호 강화
        rel: 0, // 관련 동영상 표시 안함
        modestbranding: 1, // YouTube 로고 최소화
        events: {
          'onReady': function(event) {
            console.log(`✅ 비디오 플레이어 준비 완료: ${iframe.id}`);
            
            const videoData = {
              video_name: event.target.getVideoData().title || `비디오_${index + 1}`,
              label_name: getVideoLabelName(iframe),
              video_url: `https://www.youtube.com/watch?v=${event.target.getVideoData().video_id}`,
              video_id: iframe.id,
              platform: iframe.dataset.videoPlatform || 'youtube',
              video_duration: Math.round(event.target.getDuration() || 0)
            };
            
            videoSessions.set(iframe.id, {
              ...videoData,
              player: event.target,
              start_time: '',
              pause_count: 0,
              seek_count: 0,
              completion_rate: 0,
              total_watch_time: 0,
              last_position: 0
            });
            
            // 플레이어 준비 완료 이벤트
            trackEvent('te_video_ready', videoData);
          },
          'onStateChange': function(event) {
            const session = videoSessions.get(iframe.id);
            if (!session) {
              console.warn(`⚠️ 세션을 찾을 수 없음: ${iframe.id}`);
              return;
            }
            
            const currentTime = Math.round(session.player.getCurrentTime());
            const duration = Math.round(session.player.getDuration());
            const completionRate = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;
            
            console.log(`🎬 비디오 상태 변경: ${getYouTubeStateText(event.data)} - ${currentTime}/${duration}초 (${completionRate}%)`);
            
            // 세션 활동 업데이트 (전역 함수 확인)
            if (typeof window.updateSessionActivity === 'function') {
              window.updateSessionActivity();
            }
            
            switch (event.data) {
              case YT.PlayerState.PLAYING:
                session.start_time = Date.now();
                session.last_position = currentTime;
                
                trackEvent('te_video_play', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  video_position: currentTime,
                  video_duration: duration,
                  completion_rate: completionRate,
                  is_replay: currentTime > 5,
                  platform: session.platform
                });
                break;
                
              case YT.PlayerState.PAUSED:
                // 시청 시간 계산
                if (session.start_time) {
                  const watchTime = Math.round((Date.now() - session.start_time) / 1000);
                  session.total_watch_time += watchTime;
                }
                
                session.pause_count++;
                session.completion_rate = Math.max(session.completion_rate, completionRate);
                
                trackEvent('te_video_pause', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  video_position: currentTime,
                  video_duration: duration,
                  completion_rate: session.completion_rate,
                  pause_count: session.pause_count,
                  total_watch_time: session.total_watch_time,
                  platform: session.platform
                });
                
                // 진행률 마일스톤 체크
                checkVideoProgress(session, completionRate);
                break;
                
              case YT.PlayerState.ENDED:
                // 시청 시간 계산
                if (session.start_time) {
                  const watchTime = Math.round((Date.now() - session.start_time) / 1000);
                  session.total_watch_time += watchTime;
                }
                
                trackEvent('te_video_ended', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  video_position: currentTime,
                  video_duration: duration,
                  completion_rate: 100,
                  total_watch_time: session.total_watch_time,
                  pause_count: session.pause_count,
                  seek_count: session.seek_count,
                  ended_naturally: true,
                  platform: session.platform
                });
                
                // 완료 이벤트
                trackEvent('te_video_complete', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  video_duration: duration,
                  total_watch_time: session.total_watch_time,
                  pause_count: session.pause_count,
                  seek_count: session.seek_count,
                  completion_rate: 100,
                  platform: session.platform
                });
                break;
                
              case YT.PlayerState.BUFFERING:
                trackEvent('te_video_buffering', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  video_position: currentTime,
                  video_duration: duration,
                  platform: session.platform
                });
                break;
                
              case YT.PlayerState.CUED:
                trackEvent('te_video_cued', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  platform: session.platform
                });
                break;
            }
          },
          'onError': function(event) {
            console.error('❌ 비디오 플레이어 오류:', event.data);
            trackEvent('te_video_error', {
              video_id: iframe.id,
              error_code: event.data,
              platform: iframe.dataset.videoPlatform || 'youtube'
            });
          }
        }
      });
    } catch (error) {
      console.error('❌ 비디오 플레이어 생성 실패:', error);
    }
  });
}

// 동적 비디오 라벨 이름 (설정 가능)
function getVideoLabelName(iframe) {
  const platform = iframe.dataset.videoPlatform || 'youtube';
  
  const labelMappings = window.videoLabelMappings || {
    'youtube': 'YouTube 동영상 플레이어',
    'vimeo': 'Vimeo 동영상 플레이어',
    'dailymotion': 'Dailymotion 동영상 플레이어',
    'wistia': 'Wistia 동영상 플레이어'
  };
  
  return labelMappings[platform] || `${platform} 동영상 플레이어`;
}

// YouTube 상태 텍스트 변환
function getYouTubeStateText(state) {
  const states = {
    [-1]: 'UNSTARTED',
    [0]: 'ENDED',
    [1]: 'PLAYING',
    [2]: 'PAUSED',
    [3]: 'BUFFERING',
    [5]: 'CUED'
  };
  return states[state] || `UNKNOWN(${state})`;
}

// 비디오 진행률 마일스톤 체크 함수
function checkVideoProgress(session, currentRate) {
  const milestones = getVideoProgressMilestones();
  
  milestones.forEach(milestone => {
    if (currentRate >= milestone && session.completion_rate < milestone) {
      trackEvent('te_video_progress', {
        video_name: session.video_name,
        video_url: session.video_url,
        video_id: session.video_id,
        completion_rate: milestone,
        milestone_reached: `${milestone}%`,
        total_watch_time: session.total_watch_time,
        platform: session.platform
      });
    }
  });
}

// 동적 비디오 진행률 마일스톤 (설정 가능)
function getVideoProgressMilestones() {
  const defaultMilestones = [25, 50, 75, 90];
  const customMilestones = window.videoProgressMilestones || [];
  return [...defaultMilestones, ...customMilestones].sort((a, b) => a - b);
}

// 설정 업데이트 함수 (런타임에 설정 변경 가능)
function updateVideoTrackingConfig(newConfig) {
  if (newConfig.videoPlatformMappings) {
    window.videoPlatformMappings = { ...window.videoPlatformMappings, ...newConfig.videoPlatformMappings };
  }
  if (newConfig.videoLabelMappings) {
    window.videoLabelMappings = { ...window.videoLabelMappings, ...newConfig.videoLabelMappings };
  }
  if (newConfig.videoProgressMilestones) {
    window.videoProgressMilestones = [...(window.videoProgressMilestones || []), ...newConfig.videoProgressMilestones];
  }
  
  console.log('🎬 비디오 추적 설정 업데이트 완료:', newConfig);
}

// 디버깅용 함수
function debugVideoTracking() {
  console.log('🎬 비디오 추적 디버깅 정보:');
  console.log('- 비디오 플랫폼 매핑:', window.videoPlatformMappings);
  console.log('- 비디오 라벨 매핑:', window.videoLabelMappings);
  console.log('- 비디오 진행률 마일스톤:', getVideoProgressMilestones());
  console.log('- 현재 비디오 세션 수:', videoSessions.size);
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
  console.log('- YouTube API:', typeof window.YT !== 'undefined' ? '로드됨' : '로드 안됨');
  console.log('- 비디오 추적 초기화:', isVideoTrackingInitialized);
  
  // 현재 페이지의 비디오 요소들 확인
  const videoIframes = detectVideoIframes();
  console.log('- 현재 페이지 비디오 iframe 개수:', videoIframes.length);
  
  videoIframes.forEach((iframe, index) => {
    console.log(`  - iframe ${index + 1}:`, {
      id: iframe.id,
      src: iframe.src,
      platform: iframe.dataset.videoPlatform,
      label: getVideoLabelName(iframe)
    });
  });
  
  // 수동으로 비디오 추적 실행
  console.log('🎬 수동으로 비디오 추적 실행...');
  trackVideoEvents();
}

// 전역 함수로 노출
window.trackVideoEvents = trackVideoEvents;
window.updateVideoTrackingConfig = updateVideoTrackingConfig;
window.debugVideoTracking = debugVideoTracking;
window.videoSessions = videoSessions;
window.isVideoTrackingInitialized = isVideoTrackingInitialized;

// 세션 활동 업데이트 함수
window.updateSessionActivity = function() {
  // 세션 활동 업데이트 함수가 있으면 호출
  if (typeof window.updateSessionActivity === 'function') {
    window.updateSessionActivity();
  }
};

// 수동 비디오 추적 실행 함수
window.forceVideoTracking = function() {
  console.log('🎬 강제 비디오 추적 실행...');
  isVideoTrackingInitialized = false; // 초기화 플래그 리셋
  trackVideoEvents();
};

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DOM 로드 완료, 비디오 추적 시작');
    setTimeout(trackVideoEvents, 1000); // 1초 지연으로 안정성 확보
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('🎬 DOM 이미 로드됨, 비디오 추적 시작');
  setTimeout(trackVideoEvents, 1000);
}

// 추가: 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('🎬 페이지 로드 완료, 비디오 추적 재확인');
  setTimeout(trackVideoEvents, 2000);
});

// 추가: 3초 후 한 번 더 시도
setTimeout(function() {
  console.log('🎬 3초 후 비디오 추적 재확인');
  trackVideoEvents();
}, 3000);

// 추가: 5초 후 한 번 더 시도 (동적 콘텐츠 대응)
setTimeout(function() {
  console.log('🎬 5초 후 비디오 추적 재확인');
  trackVideoEvents();
}, 5000);

// 추가: 10초 후 한 번 더 시도 (최종 시도)
setTimeout(function() {
  console.log('🎬 10초 후 비디오 추적 최종 시도');
  trackVideoEvents();
}, 10000);

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
  console.log('🎬 ThinkingData 초기화 완료, 비디오 추적 시작');
  setTimeout(trackVideoEvents, 500);
});

// 페이지 로드 완료 후 한 번 더 시도 (동적 콘텐츠 대응)
window.addEventListener('load', function() {
  console.log('🎬 페이지 로드 완료, 비디오 추적 재확인');
  setTimeout(trackVideoEvents, 2000);
});