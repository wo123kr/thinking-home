/**
 * ThinkingData 추적 시스템 설정
 * 중앙화된 설정 관리
 */

const config = {
  // ThinkingData SDK 설정
  thinkingData: {
    appId: 'dc61b4c238a048fb953b77b1fa1329c3', // 실제 APP_ID
    serverUrl: 'https://te-receiver-naver.thinkingdata.kr/sync_js', // 실제 서버 URL
    autoTrack: {
      pageShow: true,
      pageHide: true
    },
  },

  // 세션 관리 설정
  session: {
    timeout: 30 * 60 * 1000, // 30분
    engagementThreshold: 10000, // 10초
    interactionThreshold: 2 // 2회 상호작용
  },

  // 추적 모듈 활성화 설정
  modules: {
    click: true,
    exit: true,
    scroll: true,
    form: true,
    popup: true,
    video: true,
    resource: true,
    userAttributes: true
  },

  // 스크롤 추적 설정
  scroll: {
    thresholds: [25, 50, 75, 90, 100],
    debounceTime: 100
  },

  // 클릭 추적 설정
  click: {
    trackExternalLinks: true,
    trackMenuClicks: true,
    elementSelectors: ['a', 'button', '[role="button"]', '.btn', '.button']
  },

  // 폼 추적 설정
  form: {
    maskPersonalInfo: true,
    trackValidationErrors: true
  },

  // 비디오 추적 설정
  video: {
    platforms: ['youtube', 'vimeo'],
    trackProgress: [25, 50, 75, 90]
  },

  // 디버그 설정
  debug: {
    enabled: false,
    logLevel: 'warn' // 'error', 'warn', 'info', 'debug'
  }
};

// 설정 유효성 검사
function validateConfig() {
  if (!config.thinkingData.appId) {
    console.warn('⚠️ ThinkingData APP_ID가 설정되지 않았습니다.');
  }
  
  if (!config.thinkingData.serverUrl) {
    console.error('❌ ThinkingData 서버 URL이 설정되지 않았습니다.');
    return false;
  }
  
  return true;
}

// 설정 로드 시 유효성 검사
validateConfig();

// 설정 업데이트 함수
function updateConfig(module, updates) {
  if (!config[module]) {
    config[module] = {};
  }
  
  config[module] = { ...config[module], ...updates };
  console.log(`🔄 ${module} 설정 업데이트 완료:`, updates);
  return config[module];
}

// 모듈별 설정 가져오기
function getModuleConfig(module) {
  return config[module] || {};
}

export default config;
export { validateConfig, updateConfig, getModuleConfig }; 