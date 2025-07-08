/**
 * 비디오 추적 모듈 (YouTube API 활용)
 * ThinkingData SDK와 연동하여 비디오 이벤트 추적
 */

import { safeTeCall, trackEvent, updateSessionActivity } from '../core/utils.js';

// 초기화 상태 추적
let videoTrackingInitialized = false;

// 비디오 세션 추적을 위한 변수들
let videoSessions = new Map(); // 각 비디오별 세션 추적

/**
 * 비디오 추적 초기화 및 설정
 * @param {Object} options - 비디오 추적 설정 옵션
 * @returns {Promise} 초기화 완료 Promise
 */
export function initVideoTracking(options = {}) {
  return new Promise((resolve) => {
    if (videoTrackingInitialized) {
      console.log('🎬 비디오 추적이 이미 초기화되었습니다.');
      resolve(true);
      return;
    }

    console.log('🎬 비디오 추적 초기화 시작...');
    
    // 기존 이벤트 리스너 제거 (중복 방지)
    cleanupExistingListeners();
    
    // YouTube iframe 감지 및 초기화
    detectAndInitYouTubeVideos();
    
    // DOM 변경 감지를 위한 MutationObserver 설정
    setupVideoObserver();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    videoTrackingInitialized = true;
    console.log('✅ 비디오 추적 초기화 완료');
    resolve(true);
  });
}

/**
 * 기존 이벤트 리스너 제거 (중복 방지)
 */
function cleanupExistingListeners() {
  // 전역 함수 참조 제거
  if (window.trackVideoEvents) {
    delete window.trackVideoEvents;
  }
  
  // 이벤트 리스너 플래그 초기화
  if (window.thinkingDataVideoListenerAdded) {
    delete window.thinkingDataVideoListenerAdded;
  }
  
  if (window.loadVideoListenerAdded) {
    delete window.loadVideoListenerAdded;
  }
}

/**
 * YouTube iframe 감지 및 초기화
 */
function detectAndInitYouTubeVideos() {
  // YouTube iframe이 있는지 확인
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
  console.log(`🎯 YouTube iframe 발견: ${youtubeIframes.length}개`);

  if (youtubeIframes.length > 0) {
    // YouTube API 즉시 로드
    loadYouTubeAPI();
  } else {
    console.log('ℹ️ YouTube iframe이 없어서 API 로드하지 않음');
  }
}

/**
 * DOM 변경 감지로 동적 비디오 iframe 감지
 */
function setupVideoObserver() {
  console.log('🔍 비디오 iframe 동적 감지 설정...');
  
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1) { // Element node
          // 새로 추가된 iframe 확인
          const youtubeIframes = node.querySelectorAll?.('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
          
          if (youtubeIframes && youtubeIframes.length > 0) {
            console.log(`🎯 새로운 YouTube iframe 발견: ${youtubeIframes.length}개`);
            loadYouTubeAPI();
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

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // ThinkingData 초기화 완료 이벤트 감지
  window.addEventListener('thinkingdata:ready', function() {
    console.log('🎬 ThinkingData 초기화 완료, 비디오 추적 확인');
    detectAndInitYouTubeVideos();
  });
  
  // 페이지 로드 완료 후 확인
  window.addEventListener('load', function() {
    console.log('🎬 페이지 로드 완료, 비디오 추적 확인');
    detectAndInitYouTubeVideos();
  });
}

/**
 * YouTube API 동적 로드
 */
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

  // YouTube API 준비 완료 시 호출될 함수 (공식 방식)
  window.onYouTubeIframeAPIReady = function() {
    console.log('✅ YouTube API 준비 완료!');
    initializeYouTubePlayers();
  };
}

/**
 * YouTube 플레이어 초기화
 */
function initializeYouTubePlayers() {
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
  console.log(`🎯 YouTube iframe 발견: ${youtubeIframes.length}개`);

  youtubeIframes.forEach((iframe, index) => {
    if (!iframe.id) {
      iframe.id = `youtube_player_${index}`;
    }

    console.log(`🎬 YouTube 플레이어 초기화: ${iframe.id}`);

    try {
      // YT 객체가 있는지 확인
      if (!window.YT || !window.YT.Player) {
        console.warn('❌ YouTube API가 아직 로드되지 않았습니다.');
        return;
      }

      const player = new YT.Player(iframe.id, {
        events: {
          'onReady': handlePlayerReady(iframe, index),
          'onStateChange': handlePlayerStateChange(iframe),
          'onError': handlePlayerError(iframe)
        }
      });
    } catch (error) {
      console.error('❌ YouTube 플레이어 생성 실패:', error);
    }
  });
}

/**
 * 플레이어 준비 완료 핸들러
 */
function handlePlayerReady(iframe, index) {
  return function(event) {
    console.log(`✅ YouTube 플레이어 준비 완료: ${iframe.id}`);
    
    const videoData = {
      video_name: event.target.getVideoData().title || `유튜브 동영상_${index + 1}`,
      label_name: 'Youtube 동영상 플레이어',
      video_url: `https://www.youtube.com/watch?v=${event.target.getVideoData().video_id}`,
      video_id: iframe.id,
      platform: 'youtube',
      video_duration: Math.round(event.target.getDuration() || 0)
    };

    videoSessions.set(iframe.id, {
      ...videoData,
      player: event.target,
      start_time: null,
      pause_count: 0,
      seek_count: 0,
      completion_rate: 0,
      total_watch_time: 0,
      last_position: 0
    });

    // 플레이어 준비 완료 이벤트
    trackEvent('video_ready', {
      ...videoData,
      video_duration: Math.round(event.target.getDuration() || 0)
    });
    console.log('🎬 비디오 준비 이벤트 전송:', videoData);
  };
}

/**
 * 플레이어 상태 변경 핸들러
 */
function handlePlayerStateChange(iframe) {
  return function(event) {
    const session = videoSessions.get(iframe.id);
    if (!session) {
      console.warn(`⚠️ 세션을 찾을 수 없음: ${iframe.id}`);
      return;
    }

    const currentTime = Math.round(session.player.getCurrentTime());
    const duration = Math.round(session.player.getDuration());
    const completionRate = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

    console.log(`🎬 YouTube 상태 변경: ${getYouTubeStateText(event.data)} - ${currentTime}/${duration}초 (${completionRate}%)`);

    switch (event.data) {
      case YT.PlayerState.PLAYING:
        // 세션 활동 업데이트
        updateSessionActivity();
        
        session.start_time = Date.now();
        session.last_position = currentTime;

        trackEvent('video_play', {
          video_name: session.video_name,
          video_url: session.video_url,
          video_id: session.video_id,
          video_position: currentTime,
          video_duration: duration,
          completion_rate: completionRate,
          is_replay: currentTime > 5,
          platform: 'youtube'
        });
        console.log('🎬 비디오 재생 이벤트 전송');
        break;

      case YT.PlayerState.PAUSED:
        // 세션 활동 업데이트
        updateSessionActivity();

        // 시청 시간 계산
        if (session.start_time) {
          const watchTime = Math.round((Date.now() - session.start_time) / 1000);
          session.total_watch_time += watchTime;
        }

        session.pause_count++;
        session.completion_rate = Math.max(session.completion_rate, completionRate);

        trackEvent('video_pause', {
          video_name: session.video_name,
          video_url: session.video_url,
          video_id: session.video_id,
          video_position: currentTime,
          video_duration: duration,
          completion_rate: session.completion_rate,
          pause_count: session.pause_count,
          total_watch_time: session.total_watch_time,
          platform: 'youtube'
        });
        console.log('🎬 비디오 일시정지 이벤트 전송');

        // 진행률 마일스톤 체크
        checkVideoProgress(session, completionRate);
        break;

      case YT.PlayerState.ENDED:
        // 시청 시간 계산
        if (session.start_time) {
          const watchTime = Math.round((Date.now() - session.start_time) / 1000);
          session.total_watch_time += watchTime;
        }

        trackEvent('video_ended', {
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
          platform: 'youtube'
        });
        console.log('🎬 비디오 종료 이벤트 전송');

        // 완료 이벤트
        trackEvent('video_complete', {
          video_name: session.video_name,
          video_url: session.video_url,
          video_id: session.video_id,
          video_duration: duration,
          total_watch_time: session.total_watch_time,
          pause_count: session.pause_count,
          seek_count: session.seek_count,
          completion_rate: 100,
          platform: 'youtube'
        });
        console.log('🎬 비디오 완료 이벤트 전송');
        break;

      case YT.PlayerState.BUFFERING:
        trackEvent('video_buffering', {
          video_name: session.video_name,
          video_url: session.video_url,
          video_id: session.video_id,
          video_position: currentTime,
          video_duration: duration,
          platform: 'youtube'
        });
        console.log('🎬 비디오 버퍼링 이벤트 전송');
        break;

      case YT.PlayerState.CUED:
        trackEvent('video_cued', {
          video_name: session.video_name,
          video_url: session.video_url,
          video_id: session.video_id,
          platform: 'youtube'
        });
        console.log('🎬 비디오 큐 이벤트 전송');
        break;
    }
  };
}

/**
 * 플레이어 오류 핸들러
 */
function handlePlayerError(iframe) {
  return function(event) {
    console.error('❌ YouTube 플레이어 오류:', event.data);
    trackEvent('video_error', {
      video_id: iframe.id,
      error_code: event.data,
      platform: 'youtube'
    });
    console.log('🎬 비디오 오류 이벤트 전송');
  };
}

/**
 * YouTube 상태 텍스트 변환
 */
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

/**
 * 비디오 진행률 마일스톤 체크 함수
 */
function checkVideoProgress(session, currentRate) {
  const milestones = [25, 50, 75, 90];

  milestones.forEach(milestone => {
    if (currentRate >= milestone && session.completion_rate < milestone) {
      trackEvent('video_progress', {
        video_name: session.video_name,
        video_url: session.video_url,
        video_id: session.video_id,
        completion_rate: milestone,
        milestone_reached: `${milestone}%`,
        total_watch_time: session.total_watch_time,
        platform: 'youtube'
      });
      console.log(`🎬 비디오 진행률 ${milestone}% 이벤트 전송`);
    }
  });
}

/**
 * HTML5 비디오 요소 추적
 * 일반 <video> 태그에 대한 추적
 */
export function trackHtml5Videos() {
  const videos = document.querySelectorAll('video');
  videos.forEach((video, index) => {
    if (!video.id) {
      video.id = `html5_video_${index}`;
    }
    
    // 이벤트 리스너 중복 방지
    if (video.getAttribute('data-tracking-initialized')) {
      return;
    }
    
    video.setAttribute('data-tracking-initialized', 'true');
    
    video.addEventListener('play', () => {
      updateSessionActivity();
      trackEvent('video_play', { 
        video_id: video.id,
        video_name: video.title || video.getAttribute('aria-label') || `HTML5 비디오_${index}`,
        video_duration: Math.round(video.duration || 0),
        video_position: Math.round(video.currentTime || 0),
        platform: 'html5'
      });
    });
    
    video.addEventListener('pause', () => {
      updateSessionActivity();
      trackEvent('video_pause', { 
        video_id: video.id,
        video_name: video.title || video.getAttribute('aria-label') || `HTML5 비디오_${index}`,
        video_duration: Math.round(video.duration || 0),
        video_position: Math.round(video.currentTime || 0),
        platform: 'html5'
      });
    });
    
    video.addEventListener('ended', () => {
      trackEvent('video_ended', { 
        video_id: video.id,
        video_name: video.title || video.getAttribute('aria-label') || `HTML5 비디오_${index}`,
        video_duration: Math.round(video.duration || 0),
        completion_rate: 100,
        platform: 'html5'
      });
    });
  });
  
  console.log(`✅ HTML5 비디오 트래킹 활성화: ${videos.length}개 발견`);
}

/**
 * 모든 비디오 추적 시작
 * 메인 진입점
 */
export function trackVideo(options = {}) {
  initVideoTracking(options)
    .then(() => {
      trackHtml5Videos();
      console.log('✅ 모든 비디오 트래킹 활성화 완료');
    })
    .catch(error => {
      console.error('❌ 비디오 트래킹 초기화 실패:', error);
    });
}