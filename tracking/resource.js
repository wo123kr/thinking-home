/**
 * 리소스 다운로드 추적 모듈
 * ThinkingData SDK와 연동하여 파일 다운로드 이벤트 추적
 */

import { updateSessionActivity } from '../core/session-manager.js';

const DOWNLOAD_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.rar', '.7z', '.tar', '.gz',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv',
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg',
  '.txt', '.csv', '.json', '.xml',
  '.exe', '.msi', '.dmg', '.pkg',
  '.apk', '.ipa'
];

function getFileExtension(url) {
  const filename = url.split('/').pop();
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(lastDotIndex).toLowerCase() : '';
}

function getFileSize(url) {
  try {
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const size = urlParams.get('size') || urlParams.get('filesize');
    return size ? parseInt(size) : 0;
  } catch (e) {
    return 0;
  }
}

let resourceTrackingInitialized = false;

export function initResourceTracking() {
  document.addEventListener('click', (event) => {
    const target = event.target;
    const link = target.closest('a');
    if (!link || !link.href) return;

    const url = link.href.toLowerCase();
    const extension = getFileExtension(url);

    if (!DOWNLOAD_EXTENSIONS.includes(extension)) return;

    if (typeof updateSessionActivity === 'function') updateSessionActivity();

    const eventData = {
      page_name: document.title,
      page_url: window.location.href,
      download_url: link.href,
      download_filename: link.href.split('/').pop(),
      file_extension: extension,
      file_size_bytes: getFileSize(url),
      download_success: true,
      link_text: link.textContent ? link.textContent.trim() : '',
      link_id: link.id || null,
      link_class_list: Array.from(link.classList),
      click_coordinates: { x: event.pageX, y: event.pageY }
    };

    if (window.te && typeof window.te.track === 'function') {
      window.te.track('resource_download', eventData);
    }
  });
}

/**
 * 리소스 다운로드 추적 시작
 */
function trackResourceDownloads() {
  if (resourceTrackingInitialized) return;
  resourceTrackingInitialized = true;

  console.log('📥 리소스 다운로드 추적 초기화...');

  // 다운로드 확장자 목록
  const downloadExtensions = getDownloadExtensions();

  // 클릭 이벤트 리스너 등록
  document.addEventListener('click', function(event) {
    const target = event.target;
    const link = target.closest('a');

    if (link && link.href) {
      const url = link.href.toLowerCase();
      const extension = getFileExtension(url);

      // 다운로드 확장자 확인
      if (downloadExtensions.includes(extension)) {
        // 세션 활동 업데이트 (전역 함수 호출)
        if (typeof window.updateSessionActivity === 'function') {
          window.updateSessionActivity();
        }

        // 리소스 타입 감지
        const resourceType = getResourceType(link);
        const fileSize = getFileSize(url);

        // 이벤트 데이터 구성
        const eventData = {
          page_name: document.title,
          page_url: window.location.href,
          download_url: link.href,
          download_filename: link.href.split('/').pop(),
          file_extension: extension,
          resource_type: resourceType,
          file_size_bytes: fileSize,
          download_success: true, // 클릭 시점에서는 true로 설정
          link_text: link.textContent ? link.textContent.trim() : '',
          link_id: link.id || null,
          link_class_list: Array.from(link.classList),
          click_coordinates: {
            x: event.pageX,
            y: event.pageY
          }
        };

        // ThinkingData 이벤트 전송
        if (typeof window.te !== 'undefined' && window.te.track) {
          window.te.track('resource_download', eventData);
          console.log('📥 리소스 다운로드 이벤트 전송:', eventData);
        } else {
          console.warn('📥 ThinkingData SDK가 로드되지 않음');
        }
      }
    }
  });

  console.log('✅ 리소스 다운로드 추적 초기화 완료');
}

/**
 * 다운로드 확장자 목록 반환
 */
function getDownloadExtensions() {
  return [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.rar', '.7z', '.tar', '.gz',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg',
    '.txt', '.csv', '.json', '.xml',
    '.exe', '.msi', '.dmg', '.pkg',
    '.apk', '.ipa'
  ];
}

/**
 * 리소스 타입 감지
 */
function getResourceType(link) {
  const url = link.href.toLowerCase();
  const text = link.textContent ? link.textContent.toLowerCase() : '';
  const classList = Array.from(link.classList).map(cls => cls.toLowerCase());
  const id = link.id ? link.id.toLowerCase() : '';

  // 리소스 타입 매핑
  const resourceTypeMappings = {
    'document': {
      extensions: ['.pdf', '.doc', '.docx', '.txt'],
      text: ['문서', 'document', 'pdf', 'doc'],
      class: ['document-link', 'pdf-link', 'doc-link'],
      id: ['document', 'pdf', 'doc']
    },
    'spreadsheet': {
      extensions: ['.xls', '.xlsx', '.csv'],
      text: ['엑셀', '스프레드시트', 'excel', 'spreadsheet', 'csv'],
      class: ['excel-link', 'spreadsheet-link', 'csv-link'],
      id: ['excel', 'spreadsheet', 'csv']
    },
    'presentation': {
      extensions: ['.ppt', '.pptx'],
      text: ['파워포인트', '프레젠테이션', 'powerpoint', 'presentation'],
      class: ['ppt-link', 'presentation-link'],
      id: ['ppt', 'presentation']
    },
    'archive': {
      extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'],
      text: ['압축', 'zip', 'rar', 'archive'],
      class: ['zip-link', 'archive-link'],
      id: ['zip', 'archive']
    },
    'media': {
      extensions: ['.mp3', '.mp4', '.avi', '.mov', '.wmv'],
      text: ['동영상', '비디오', '오디오', 'video', 'audio', 'media'],
      class: ['video-link', 'audio-link', 'media-link'],
      id: ['video', 'audio', 'media']
    },
    'image': {
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'],
      text: ['이미지', '사진', 'image', 'photo', 'picture'],
      class: ['image-link', 'photo-link'],
      id: ['image', 'photo']
    },
    'software': {
      extensions: ['.exe', '.msi', '.dmg', '.pkg', '.apk', '.ipa'],
      text: ['소프트웨어', '프로그램', '앱', 'software', 'app', 'program'],
      class: ['software-link', 'app-link'],
      id: ['software', 'app']
    },
    'data': {
      extensions: ['.csv', '.json', '.xml'],
      text: ['데이터', 'data'],
      class: ['data-link'],
      id: ['data']
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
    if (patterns.text && patterns.text.some(pattern => text.includes(pattern))) {
      return type;
    }

    // URL 기반 감지
    if (patterns.url && patterns.url.some(pattern => url.includes(pattern))) {
      return type;
    }

    // 클래스 기반 감지
    if (patterns.class && patterns.class.some(pattern => classList.some(cls => cls.includes(pattern)))) {
      return type;
    }

    // ID 기반 감지
    if (patterns.id && patterns.id.some(pattern => id.includes(pattern))) {
      return type;
    }
  }

  return 'general';
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

// 초기화 함수 (한 번만 실행)
function initializeResourceTracking() {
  if (resourceTrackingInitialized) {
    return;
  }

  // DOM 로드 완료 후 자동 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('📥 DOM 로드 완료, 리소스 다운로드 추적 시작');
      trackResourceDownloads();
    });
  } else {
    // DOM이 이미 로드된 경우
    console.log('📥 DOM 이미 로드됨, 리소스 다운로드 추적 시작');
    trackResourceDownloads();
  }
}

// 초기화 실행
initializeResourceTracking();

// ThinkingData 초기화 완료 이벤트 감지 (한 번만)
if (!window.thinkingDataResourceListenerAdded) {
  window.thinkingDataResourceListenerAdded = true;
  window.addEventListener('thinkingdata:ready', function() {
    console.log('📥 ThinkingData 초기화 완료, 리소스 다운로드 추적 확인');
    // 이미 초기화되었으면 재실행하지 않음
    if (!resourceTrackingInitialized) {
      trackResourceDownloads();
    }
  });
}

// 페이지 로드 완료 후 확인 (한 번만)
if (!window.loadResourceListenerAdded) {
  window.loadResourceListenerAdded = true;
  window.addEventListener('load', function() {
    console.log('📥 페이지 로드 완료, 리소스 다운로드 추적 확인');
    // 이미 초기화되었으면 재실행하지 않음
    if (!resourceTrackingInitialized) {
      trackResourceDownloads();
    }
  });
}