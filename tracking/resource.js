/**
 * 리소스 다운로드 추적 모듈 - 동적 설정 가능한 구조
 */

function trackResourceDownloads() {
  console.log('📥 리소스 다운로드 추적 초기화 시작...');
  
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(trackResourceDownloads, 3000);
    return;
  }
  
  document.addEventListener('click', function(event) {
    const target = event.target;
    const link = target.closest('a');
    
    if (link && link.href) {
      const url = link.href.toLowerCase();
      const downloadExtensions = getDownloadExtensions();
      
      // 동적 리소스 타입 감지
      const resourceType = getResourceType(link);
      
      if (downloadExtensions.some(ext => url.includes(ext)) || resourceType !== 'general') {
        updateSessionActivity();
        
        const downloadData = {
          page_name: document.title,
          page_url: window.location.href,
          download_url: link.href,
          download_filename: link.href.split('/').pop(),
          resource_type: resourceType,
          download_success: true, // 클릭 시점에서는 true로 설정
          link_text: link.textContent ? link.textContent.trim() : '',
          link_id: link.id || '',
          link_class_list: link.className ? link.className.split(' ') : [],
          file_extension: getFileExtension(link.href),
          file_size: getFileSize(link.href)
        };
        
        trackEvent('te_resource_download', downloadData);
        
        console.log('📥 리소스 다운로드 추적:', resourceType, downloadData.download_filename);
      }
    }
  });
  
  console.log('✅ 리소스 다운로드 추적 초기화 완료');
}

// 동적 다운로드 확장자 (설정 가능)
function getDownloadExtensions() {
  const defaultExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
    '.zip', '.rar', '.csv', '.txt', '.rtf'
  ];
  
  const customExtensions = window.downloadExtensions || [];
  return [...defaultExtensions, ...customExtensions];
}

// 동적 리소스 타입 감지 (설정 가능)
function getResourceType(link) {
  const url = link.href.toLowerCase();
  const text = link.textContent ? link.textContent.trim() : '';
  const classList = link.className ? link.className.split(' ') : [];
  const id = link.id || '';
  
  // 동적 리소스 타입 매핑 (설정 가능)
  const resourceTypeMappings = window.resourceTypeMappings || {
    'pdf_document': {
      extensions: ['.pdf'],
      text: ['pdf', '문서', 'document'],
      class: ['pdf-link', 'document-link'],
      id: ['pdf', 'document']
    },
    'word_document': {
      extensions: ['.doc', '.docx'],
      text: ['word', '문서', 'document'],
      class: ['word-link', 'document-link'],
      id: ['word', 'document']
    },
    'excel_document': {
      extensions: ['.xls', '.xlsx'],
      text: ['excel', '스프레드시트', 'spreadsheet'],
      class: ['excel-link', 'spreadsheet-link'],
      id: ['excel', 'spreadsheet']
    },
    'powerpoint_document': {
      extensions: ['.ppt', '.pptx'],
      text: ['powerpoint', '프레젠테이션', 'presentation'],
      class: ['powerpoint-link', 'presentation-link'],
      id: ['powerpoint', 'presentation']
    },
    'compressed_file': {
      extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
      text: ['압축', 'compressed', 'zip', 'rar'],
      class: ['compressed-link', 'archive-link'],
      id: ['compressed', 'archive']
    },
    'csv_data': {
      extensions: ['.csv'],
      text: ['csv', '데이터', 'data'],
      class: ['csv-link', 'data-link'],
      id: ['csv', 'data']
    },
    'api_documentation': {
      text: ['개발문서', 'API', 'api', 'docs', 'documentation'],
      url: ['api', 'docs', 'documentation'],
      class: ['api-link', 'docs-link'],
      id: ['api', 'docs']
    },
    'user_guide': {
      text: ['온보딩', '가이드', 'guide', 'onboarding', '매뉴얼'],
      url: ['guide', 'onboarding', 'manual'],
      class: ['guide-link', 'manual-link'],
      id: ['guide', 'manual']
    },
    'case_study': {
      text: ['사례', '케이스', 'case', 'example', '스터디'],
      url: ['case', 'example', 'study'],
      class: ['case-link', 'example-link'],
      id: ['case', 'example']
    },
    'whitepaper': {
      text: ['백서', 'whitepaper', 'white paper'],
      url: ['whitepaper'],
      class: ['whitepaper-link'],
      id: ['whitepaper']
    },
    'demo_request': {
      text: ['데모', 'demo', '체험', 'trial'],
      url: ['demo', 'trial'],
      class: ['demo-link', 'trial-link'],
      id: ['demo', 'trial']
    },
    'contact_form': {
      text: ['문의', 'contact', '연락'],
      url: ['contact', 'inquiry'],
      class: ['contact-link', 'inquiry-link'],
      id: ['contact', 'inquiry']
    }
  };
  
  // 동적 매핑으로 리소스 타입 감지
  for (const [type, patterns] of Object.entries(resourceTypeMappings)) {
    // 확장자 기반 감지
    if (patterns.extensions && patterns.extensions.some(ext => url.includes(ext))) {
      return type;
    }
    
    // 텍스트 기반 감지
    if (patterns.text && patterns.text.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))) {
      return type;
    }
    
    // URL 기반 감지
    if (patterns.url && patterns.url.some(pattern => url.includes(pattern))) {
      return type;
    }
    
    // 클래스 기반 감지
    if (patterns.class && patterns.class.some(pattern => classList.some(cls => cls.toLowerCase().includes(pattern.toLowerCase())))) {
      return type;
    }
    
    // ID 기반 감지
    if (patterns.id && patterns.id.some(pattern => id.toLowerCase().includes(pattern.toLowerCase()))) {
      return type;
    }
  }
  
  return 'general';
}

// 파일 확장자 추출
function getFileExtension(url) {
  const filename = url.split('/').pop();
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(lastDotIndex).toLowerCase() : '';
}

// 파일 크기 추정 (URL 파라미터에서)
function getFileSize(url) {
  try {
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const size = urlParams.get('size') || urlParams.get('filesize');
    return size ? parseInt(size) : null;
  } catch (e) {
    return null;
  }
}

// 세션 활동 업데이트
function updateSessionActivity() {
  if (typeof window.updateSessionActivity === 'function') {
    window.updateSessionActivity();
  }
}

// 설정 업데이트 함수 (런타임에 설정 변경 가능)
function updateResourceTrackingConfig(newConfig) {
  if (newConfig.downloadExtensions) {
    window.downloadExtensions = [...(window.downloadExtensions || []), ...newConfig.downloadExtensions];
  }
  if (newConfig.resourceTypeMappings) {
    window.resourceTypeMappings = { ...window.resourceTypeMappings, ...newConfig.resourceTypeMappings };
  }
  
  console.log('📥 리소스 추적 설정 업데이트 완료:', newConfig);
}

// 디버깅용 함수
function debugResourceTracking() {
  console.log('📥 리소스 추적 디버깅 정보:');
  console.log('- 다운로드 확장자:', getDownloadExtensions());
  console.log('- 리소스 타입 매핑:', window.resourceTypeMappings);
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
  
  // 현재 페이지의 다운로드 링크들 확인
  const downloadExtensions = getDownloadExtensions();
  const downloadSelectors = downloadExtensions.map(ext => `a[href*="${ext}"]`).join(', ');
  const downloadLinks = document.querySelectorAll(downloadSelectors);
  
  console.log('- 현재 페이지 다운로드 링크 개수:', downloadLinks.length);
  
  downloadLinks.forEach((link, index) => {
    console.log(`  - 링크 ${index + 1}:`, {
      href: link.href,
      text: link.textContent ? link.textContent.trim() : '',
      type: getResourceType(link),
      extension: getFileExtension(link.href)
    });
  });
}

// 전역 함수로 노출
window.trackResourceDownloads = trackResourceDownloads;
window.updateResourceTrackingConfig = updateResourceTrackingConfig;
window.debugResourceTracking = debugResourceTracking;

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📥 DOM 로드 완료, 리소스 다운로드 추적 시작');
    setTimeout(trackResourceDownloads, 1000);
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('📥 DOM 이미 로드됨, 리소스 다운로드 추적 시작');
  setTimeout(trackResourceDownloads, 1000);
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
  console.log('📥 ThinkingData 초기화 완료, 리소스 다운로드 추적 시작');
  setTimeout(trackResourceDownloads, 500);
});

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('📥 페이지 로드 완료, 리소스 다운로드 추적 재확인');
  setTimeout(trackResourceDownloads, 2000);
});