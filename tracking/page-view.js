/**
 * 페이지 뷰 이벤트 추적 - 유연하고 확장 가능한 구조
 */

// 페이지 뷰 이벤트 전송
function trackPageView() {
  console.log('📄 페이지 뷰 추적 시작...');
  
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(trackPageView, 3000);
    return;
  }
  
  // SDK 자동 이벤트와 중복 방지를 위해 커스텀 이벤트명 사용
  const pageViewProperties = {
    page_url: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
    page_hostname: window.location.hostname,
    page_protocol: window.location.protocol,
    page_hash: window.location.hash || null,
    page_query: window.location.search || null,
    // 동적 페이지 분석 정보
    page_section: getPageSection(),
    page_category: getPageCategory(),
    page_content_type: getPageContentType(),
    page_has_forms: hasForms(),
    page_has_videos: hasVideos(),
    page_has_downloads: hasDownloads(),
    page_load_time: getPageLoadTime(),
    page_view_timestamp: Date.now(),
    // 동적 메타데이터 수집
    page_meta_data: getPageMetaData(),
    page_structure_info: getPageStructureInfo(),
    event_source: 'custom_module', // 커스텀 모듈에서 발생한 이벤트임을 표시
    timestamp: new Date().toISOString()
  };
  
  // referrer 정보가 있을 때만 추가
  if (document.referrer) {
    pageViewProperties.referrer = document.referrer;
    try {
      const referrerUrl = new URL(document.referrer);
      pageViewProperties.referrer_host = referrerUrl.hostname;
      pageViewProperties.referrer_path = referrerUrl.pathname;
      pageViewProperties.is_internal_referrer = referrerUrl.hostname === window.location.hostname;
    } catch (e) {
      console.warn('Referrer URL 파싱 실패:', e);
    }
  }
  
  // 동적 파라미터 추출 (확장 가능)
  const urlParams = new URLSearchParams(window.location.search);
  const dynamicParams = extractDynamicParameters(urlParams);
  
  if (Object.keys(dynamicParams.utm).length > 0) {
    pageViewProperties.utm_parameters = dynamicParams.utm;
  }
  
  if (Object.keys(dynamicParams.tracking).length > 0) {
    pageViewProperties.tracking_parameters = dynamicParams.tracking;
  }
  
  if (Object.keys(dynamicParams.custom).length > 0) {
    pageViewProperties.custom_parameters = dynamicParams.custom;
  }
  
  trackEvent('custom_page_view', pageViewProperties);
  console.log('📄 페이지 뷰 이벤트 전송:', pageViewProperties);
}

// 동적 페이지 섹션 감지 (확장 가능)
function getPageSection() {
  const path = window.location.pathname;
  
  // 기본 섹션 매핑 (설정 가능)
  const sectionMappings = window.pageSectionMappings || {
    '/': 'home',
    '/blog': 'blog',
    '/user-case': 'user_case',
    '/company': 'company',
    '/culture': 'culture',
    '/news': 'news',
    '/solution': 'solution',
    '/feature': 'feature',
    '/form-demo': 'demo_form',
    '/form-ask': 'contact_form'
  };
  
  // 정확한 매칭 먼저 시도
  if (sectionMappings[path]) {
    return sectionMappings[path];
  }
  
  // 부분 매칭으로 동적 감지
  for (const [pattern, section] of Object.entries(sectionMappings)) {
    if (pattern !== '/' && path.startsWith(pattern)) {
      return section;
    }
  }
  
  // 동적 패턴 감지
  const dynamicPatterns = {
    '/form-': 'form',
    '/blog/': 'blog_post',
    '/user-case/': 'case_study',
    '/solution/': 'solution_page',
    '/feature/': 'feature_page',
    '/product/': 'product_page',
    '/service/': 'service_page'
  };
  
  for (const [pattern, section] of Object.entries(dynamicPatterns)) {
    if (path.includes(pattern)) {
      return section;
    }
  }
  
  // 기본값
  return 'other';
}

// 동적 페이지 카테고리 분류 (확장 가능)
function getPageCategory() {
  const path = window.location.pathname;
  const title = document.title.toLowerCase();
  
  // 카테고리 매핑 (설정 가능)
  const categoryMappings = window.pageCategoryMappings || {
    'landing': ['/', ''],
    'content': ['/blog', '/user-case', '/article', '/post'],
    'company': ['/company', '/culture', '/news', '/about'],
    'product': ['/solution', '/feature', '/product', '/service'],
    'conversion': ['/form-', '/contact', '/demo', '/request']
  };
  
  // 동적 카테고리 감지
  for (const [category, patterns] of Object.entries(categoryMappings)) {
    for (const pattern of patterns) {
      if (path.includes(pattern)) {
        return category;
      }
    }
  }
  
  // 제목 기반 감지
  const titleKeywords = {
    'landing': ['홈', 'home', '메인'],
    'content': ['블로그', 'blog', '사례', 'case'],
    'company': ['회사', 'company', '소개', 'about'],
    'product': ['솔루션', 'solution', '기능', 'feature'],
    'conversion': ['데모', 'demo', '문의', 'contact', '신청']
  };
  
  for (const [category, keywords] of Object.entries(titleKeywords)) {
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'other';
}

// 동적 페이지 콘텐츠 타입 감지 (확장 가능)
function getPageContentType() {
  const path = window.location.pathname;
  const title = document.title.toLowerCase();
  
  // 콘텐츠 타입 매핑 (설정 가능)
  const contentTypeMappings = window.pageContentTypeMappings || {
    'form': ['/form-', '/contact', '/demo', '/request'],
    'blog_post': ['/blog/', '/post/', '/article/'],
    'case_study': ['/user-case/', '/case/', '/study/'],
    'solution_page': ['/solution/', '/product/', '/service/'],
    'feature_page': ['/feature/', '/function/', '/capability/'],
    'demo_page': ['/demo', '/trial', '/test'],
    'contact_page': ['/contact', '/inquiry', '/ask']
  };
  
  // 동적 콘텐츠 타입 감지
  for (const [type, patterns] of Object.entries(contentTypeMappings)) {
    for (const pattern of patterns) {
      if (path.includes(pattern)) {
        return type;
      }
    }
  }
  
  // 제목 기반 감지
  const titleTypeKeywords = {
    'form': ['신청', '문의', 'contact', 'form'],
    'blog_post': ['블로그', 'blog', '포스트', 'post'],
    'case_study': ['사례', 'case', '스터디', 'study'],
    'demo_page': ['데모', 'demo', '체험', 'trial'],
    'contact_page': ['문의', 'contact', '연락', 'inquiry']
  };
  
  for (const [type, keywords] of Object.entries(titleTypeKeywords)) {
    for (const keyword of keywords) {
      if (title.includes(keyword)) {
        return type;
      }
    }
  }
  
  return 'general';
}

// 동적 파라미터 추출 (확장 가능)
function extractDynamicParameters(urlParams) {
  const params = {
    utm: {},
    tracking: {},
    custom: {}
  };
  
  // UTM 파라미터 (확장 가능)
  const utmParams = window.utmParameters || ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];
  utmParams.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      params.utm[param] = value;
    }
  });
  
  // 추적 파라미터 (확장 가능)
  const trackingParams = window.trackingParameters || ['gclid', 'fbclid', 'msclkid', '_ga', '_gl', 'ref'];
  trackingParams.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      params.tracking[param] = value;
    }
  });
  
  // 커스텀 파라미터 (확장 가능)
  const customParams = window.customParameters || ['source', 'medium', 'campaign', 'term', 'content'];
  customParams.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      params.custom[param] = value;
    }
  });
  
  return params;
}

// 동적 페이지 메타데이터 수집
function getPageMetaData() {
  const metaData = {};
  
  // 메타 태그에서 정보 수집
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach(tag => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (name && content) {
      metaData[name] = content;
    }
  });
  
  // Open Graph 태그 수집
  const ogTags = document.querySelectorAll('meta[property^="og:"]');
  ogTags.forEach(tag => {
    const property = tag.getAttribute('property');
    const content = tag.getAttribute('content');
    if (property && content) {
      metaData[property] = content;
    }
  });
  
  // Twitter Card 태그 수집
  const twitterTags = document.querySelectorAll('meta[name^="twitter:"]');
  twitterTags.forEach(tag => {
    const name = tag.getAttribute('name');
    const content = tag.getAttribute('content');
    if (name && content) {
      metaData[name] = content;
    }
  });
  
  return metaData;
}

// 동적 페이지 구조 정보 수집
function getPageStructureInfo() {
  const structureInfo = {
    has_header: !!document.querySelector('header, .header, .nav, nav'),
    has_footer: !!document.querySelector('footer, .footer'),
    has_sidebar: !!document.querySelector('aside, .sidebar, .side-nav'),
    has_main_content: !!document.querySelector('main, .main, .content'),
    has_navigation: !!document.querySelector('nav, .nav, .navigation, .menu'),
    has_search: !!document.querySelector('input[type="search"], .search, .search-box'),
    has_breadcrumb: !!document.querySelector('.breadcrumb, .breadcrumbs, [aria-label*="breadcrumb"]'),
    has_pagination: !!document.querySelector('.pagination, .pager, .page-nav'),
    has_social_share: !!document.querySelector('.social-share, .share-buttons, [class*="share"]'),
    has_related_content: !!document.querySelector('.related, .related-posts, .similar'),
    form_count: document.querySelectorAll('form').length,
    video_count: document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length,
    download_count: document.querySelectorAll('a[href*=".pdf"], a[href*=".doc"], a[href*=".zip"]').length,
    image_count: document.querySelectorAll('img').length,
    link_count: document.querySelectorAll('a').length
  };
  
  return structureInfo;
}

// 폼 존재 여부 확인
function hasForms() {
  const forms = document.querySelectorAll('form');
  return forms.length > 0;
}

// 비디오 존재 여부 확인 (확장 가능)
function hasVideos() {
  const videoSelectors = window.videoSelectors || [
    'video',
    'iframe[src*="youtube"]',
    'iframe[src*="vimeo"]',
    'iframe[src*="dailymotion"]',
    'iframe[src*="wistia"]',
    '.video-player',
    '[class*="video"]'
  ];
  
  const selector = videoSelectors.join(', ');
  const videos = document.querySelectorAll(selector);
  return videos.length > 0;
}

// 다운로드 링크 존재 여부 확인 (확장 가능)
function hasDownloads() {
  const downloadExtensions = window.downloadExtensions || [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.rar', '.7z', '.tar', '.gz',
    '.mp4', '.avi', '.mov', '.wmv',
    '.mp3', '.wav', '.aac'
  ];
  
  const downloadSelectors = downloadExtensions.map(ext => `a[href*="${ext}"]`).join(', ');
  const downloadLinks = document.querySelectorAll(downloadSelectors);
  return downloadLinks.length > 0;
}

// 페이지 로드 시간 측정
function getPageLoadTime() {
  if (performance && performance.timing) {
    const timing = performance.timing;
    return timing.loadEventEnd - timing.navigationStart;
  } else if (performance && performance.getEntriesByType) {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      return navigation.loadEventEnd - navigation.startTime;
    }
  }
  return null;
}

// SPA 환경에서 페이지 변경 감지를 위한 함수
function initSPAPageTracking() {
  console.log('📄 SPA 페이지 추적 초기화...');
  
  let lastUrl = window.location.href;
  let lastPath = window.location.pathname;
  
  // URL 변경 감지를 위한 인터벌 설정
  setInterval(() => {
    const currentUrl = window.location.href;
    const currentPath = window.location.pathname;
    
    if (currentUrl !== lastUrl || currentPath !== lastPath) {
      console.log('📄 SPA 페이지 변경 감지:', lastPath, '→', currentPath);
      lastUrl = currentUrl;
      lastPath = currentPath;
      
      // 페이지 변경 후 약간의 지연을 두고 추적 (DOM 업데이트 대기)
      setTimeout(trackPageView, 500);
    }
  }, 1000);
  
  // History API 변경 감지
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(trackPageView, 100);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(trackPageView, 100);
  };
  
  // popstate 이벤트 감지
  window.addEventListener('popstate', function() {
    setTimeout(trackPageView, 100);
  });
  
  console.log('✅ SPA 페이지 추적 초기화 완료');
}

// 설정 업데이트 함수 (런타임에 설정 변경 가능)
function updatePageViewConfig(newConfig) {
  if (newConfig.sectionMappings) {
    window.pageSectionMappings = { ...window.pageSectionMappings, ...newConfig.sectionMappings };
  }
  if (newConfig.categoryMappings) {
    window.pageCategoryMappings = { ...window.pageCategoryMappings, ...newConfig.categoryMappings };
  }
  if (newConfig.contentTypeMappings) {
    window.pageContentTypeMappings = { ...window.pageContentTypeMappings, ...newConfig.contentTypeMappings };
  }
  if (newConfig.utmParameters) {
    window.utmParameters = [...(window.utmParameters || []), ...newConfig.utmParameters];
  }
  if (newConfig.trackingParameters) {
    window.trackingParameters = [...(window.trackingParameters || []), ...newConfig.trackingParameters];
  }
  if (newConfig.customParameters) {
    window.customParameters = [...(window.customParameters || []), ...newConfig.customParameters];
  }
  if (newConfig.videoSelectors) {
    window.videoSelectors = [...(window.videoSelectors || []), ...newConfig.videoSelectors];
  }
  if (newConfig.downloadExtensions) {
    window.downloadExtensions = [...(window.downloadExtensions || []), ...newConfig.downloadExtensions];
  }
  
  console.log('📄 페이지 뷰 설정 업데이트 완료:', newConfig);
}

// 디버깅용 함수
function debugPageViewTracking() {
  console.log('📄 페이지 뷰 추적 디버깅 정보:');
  console.log('- 현재 URL:', window.location.href);
  console.log('- 페이지 경로:', window.location.pathname);
  console.log('- 페이지 제목:', document.title);
  console.log('- 페이지 섹션:', getPageSection());
  console.log('- 페이지 카테고리:', getPageCategory());
  console.log('- 페이지 콘텐츠 타입:', getPageContentType());
  console.log('- 폼 존재:', hasForms());
  console.log('- 비디오 존재:', hasVideos());
  console.log('- 다운로드 존재:', hasDownloads());
  console.log('- 페이지 로드 시간:', getPageLoadTime(), 'ms');
  console.log('- Referrer:', document.referrer);
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
  
  // 동적 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search);
  const dynamicParams = extractDynamicParameters(urlParams);
  
  if (Object.keys(dynamicParams.utm).length > 0) {
    console.log('- UTM 파라미터:', dynamicParams.utm);
  }
  if (Object.keys(dynamicParams.tracking).length > 0) {
    console.log('- 추적 파라미터:', dynamicParams.tracking);
  }
  if (Object.keys(dynamicParams.custom).length > 0) {
    console.log('- 커스텀 파라미터:', dynamicParams.custom);
  }
  
  // 설정 정보 확인
  console.log('- 섹션 매핑:', window.pageSectionMappings);
  console.log('- 카테고리 매핑:', window.pageCategoryMappings);
  console.log('- 콘텐츠 타입 매핑:', window.pageContentTypeMappings);
}

// 전역 함수로 노출
window.trackPageView = trackPageView;
window.initSPAPageTracking = initSPAPageTracking;
window.debugPageViewTracking = debugPageViewTracking;
window.updatePageViewConfig = updatePageViewConfig;

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM 로드 완료, 페이지 뷰 추적 시작');
    setTimeout(trackPageView, 1000);
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('📄 DOM 이미 로드됨, 페이지 뷰 추적 시작');
  setTimeout(trackPageView, 1000);
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
  console.log('📄 ThinkingData 초기화 완료, 페이지 뷰 추적 시작');
  setTimeout(trackPageView, 500);
});

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('📄 페이지 로드 완료, 페이지 뷰 추적 재확인');
  setTimeout(trackPageView, 2000);
});

// 페이지 로드 즉시 실행 (기존 로직 유지)
trackPageView();