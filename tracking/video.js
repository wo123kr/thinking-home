/**
 * 유튜브 비디오 추적 모듈 (YouTube API 활용)
 */

// 비디오 세션 추적을 위한 변수들
let videoSessions = new Map(); // 각 비디오별 세션 추적

function trackVideoEvents() {
  console.log('🎬 비디오 추적 초기화 시작...');
  
  // YouTube iframe이 있는지 확인
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
  console.log(`🎯 YouTube iframe 발견: ${youtubeIframes.length}개`);
  
  if (youtubeIframes.length > 0) {
    // YouTube API 즉시 로드 (더 정확한 추적을 위해)
    loadYouTubeAPI();
  } else {
    console.log('ℹ️ YouTube iframe이 없어서 API 로드하지 않음');
  }
}

// YouTube API 동적 로드 (더 정확한 추적을 위해)
function loadYouTubeAPI() {
  // 이미 로드된 경우 중복 로드 방지
  if (window.YT && window.YT.Player) {
    initializeYouTubePlayers();
    return;
  }
  
  // 이미 스크립트가 있는지 확인
  if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
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
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
  console.log(`🎯 YouTube iframe 발견: ${youtubeIframes.length}개`);
  
  youtubeIframes.forEach((iframe, index) => {
    if (!iframe.id) {
      iframe.id = `youtube_player_${index}`;
    }
    
    console.log(`🎬 YouTube 플레이어 초기화: ${iframe.id}`);
    
    try {
      const player = new YT.Player(iframe.id, {
        events: {
          'onReady': function(event) {
            console.log(`✅ YouTube 플레이어 준비 완료: ${iframe.id}`);
            const videoData = {
              video_name: event.target.getVideoData().title || `유튜브 동영상_${index + 1}`,
              label_name: 'Youtube 동영상 플레이어',
              video_url: `https://www.youtube.com/watch?v=${event.target.getVideoData().video_id}`,
              video_id: iframe.id,
              platform: 'youtube'
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
            te.track('video_ready', {
              ...videoData,
              video_duration: Math.round(event.target.getDuration() || 0)
            });
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
            
            console.log(`🎬 YouTube 상태 변경: ${getYouTubeStateText(event.data)} - ${currentTime}/${duration}초 (${completionRate}%)`);
            
            switch (event.data) {
              case YT.PlayerState.PLAYING:
                updateSessionActivity();
                session.start_time = Date.now();
                session.last_position = currentTime;
                
                te.track('video_play', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  video_position: currentTime,
                  video_duration: duration,
                  completion_rate: completionRate,
                  is_replay: currentTime > 5,
                  platform: 'youtube'
                });
                break;
                
              case YT.PlayerState.PAUSED:
                updateSessionActivity();
                
                // 시청 시간 계산
                if (session.start_time) {
                  const watchTime = Math.round((Date.now() - session.start_time) / 1000);
                  session.total_watch_time += watchTime;
                }
                
                session.pause_count++;
                session.completion_rate = Math.max(session.completion_rate, completionRate);
                
                te.track('video_pause', {
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
                
                // 진행률 마일스톤 체크
                checkVideoProgress(session, completionRate);
                break;
                
              case YT.PlayerState.ENDED:
                // 시청 시간 계산
                if (session.start_time) {
                  const watchTime = Math.round((Date.now() - session.start_time) / 1000);
                  session.total_watch_time += watchTime;
                }
                
                te.track('video_ended', {
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
                
                // 완료 이벤트
                te.track('video_complete', {
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
                break;
                
              case YT.PlayerState.BUFFERING:
                te.track('video_buffering', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  video_position: currentTime,
                  video_duration: duration,
                  platform: 'youtube'
                });
                break;
                
              case YT.PlayerState.CUED:
                te.track('video_cued', {
                  video_name: session.video_name,
                  video_url: session.video_url,
                  video_id: session.video_id,
                  platform: 'youtube'
                });
                break;
            }
          },
          'onError': function(event) {
            console.error('❌ YouTube 플레이어 오류:', event.data);
            te.track('video_error', {
              video_id: iframe.id,
              error_code: event.data,
              platform: 'youtube'
            });
          }
        }
      });
    } catch (error) {
      console.error('❌ YouTube 플레이어 생성 실패:', error);
    }
  });
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
  const milestones = [25, 50, 75, 90];
  
  milestones.forEach(milestone => {
    if (currentRate >= milestone && session.completion_rate < milestone) {
      te.track('video_progress', {
        video_name: session.video_name,
        video_url: session.video_url,
        video_id: session.video_id,
        completion_rate: milestone,
        milestone_reached: `${milestone}%`,
        total_watch_time: session.total_watch_time,
        platform: 'youtube'
      });
    }
  });
}

// 전역 함수로 노출
window.trackVideoEvents = trackVideoEvents;