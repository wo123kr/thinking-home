/**
 * 폼 제출 추적 모듈 - ThinkingData 홈페이지 최적화
 */

function trackFormSubmissions() {
  // 중복 초기화 방지
  if (window.formTrackingInitialized) {
    console.log('ℹ️ 폼 추적이 이미 초기화됨');
    return;
  }
  
  console.log('📝 폼 추적 초기화 시작...');
  
  // 초기화 플래그 설정
  window.formTrackingInitialized = true;
  
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(trackFormSubmissions, 3000);
    return;
  }

  // 🚀 폼 필드 추적 최적화 설정
  const fieldTrackingConfig = {
    debounceDelay: 2000,        // 디바운싱 지연 시간 (ms)
    lengthThreshold: 3,         // 길이 변화 임계값 (3글자 단위로 변경)
    enableDebouncing: true,     // 디바운싱 활성화
    enableLengthCategory: true, // 길이 카테고리 분석 활성화
    enablePreview: true,        // 값 미리보기 (개인정보 아닌 경우)
    ...(window.formTrackingConfig || {}) // 사용자 커스텀 설정
  };
  
  console.log('📝 폼 필드 추적 설정:', fieldTrackingConfig);
  
  document.addEventListener('submit', function(event) {
    const form = event.target;
    updateSessionActivity();
    
    console.log('📝 폼 제출 감지:', form);
    
    // 폼 데이터 수집 (개인정보 제외)
    const formData = new FormData(form);
    const formFields = {};
    
    // 개인정보가 아닌 필드만 수집
    for (let [key, value] of formData.entries()) {
      if (!isPersonalInfo(key)) {
        formFields[key] = value;
      }
    }
    
    // 개인정보 동의 체크박스 확인 (ThinkingData 폼 구조에 맞춤)
    const privacyCheckbox = form.querySelector('input[type="checkbox"][name*="privacy"], input[type="checkbox"][name*="agreement"], input[type="checkbox"][name*="동의"]');
    const privacyAgreed = privacyCheckbox ? privacyCheckbox.checked : false;
    
    // ThinkingData 공식 폼 구분
    const formType = getThinkingDataFormType(form);
    const formInfo = getThinkingDataFormInfo(form);
    
    const formSubmitData = {
      form_id: form.id || form.name || 'unknown_form',
      form_name: getFormName(form),
      form_type: formType, // 'demo_request', 'contact_inquiry', 'other'
      form_url: window.location.href,
      form_page_title: document.title,
      form_fields_submitted_info: {
        name: formData.get('name') || formData.get('이름') ? maskName(formData.get('name') || formData.get('이름')) : '',
        email: formData.get('email') || formData.get('이메일') ? maskEmail(formData.get('email') || formData.get('이메일')) : '',
        phone: formData.get('phone') || formData.get('연락처') ? maskPhone(formData.get('phone') || formData.get('연락처')) : '',
        company_name: formData.get('company') || formData.get('company_name') || formData.get('회사명') || '', // 회사명은 마스킹 안함
        inquiry_source: formData.get('source') || formData.get('how_did_you_know') || formData.get('알게된경로') || '',
        message_length: formData.get('message') || formData.get('문의사항') ? (formData.get('message') || formData.get('문의사항')).length : 0 // 메시지 길이만
      },
      privacy_agreement_checked: privacyAgreed,
      submission_status: 'pending',
      // ThinkingData 특화 정보
      form_info: formInfo,
      form_validation_passed: true,
      form_submission_time: new Date().toISOString().replace('T', ' ').slice(0, 23)
    };
    
    trackEvent('te_form_submit', formSubmitData);
    console.log('📝 폼 제출 이벤트 전송:', formSubmitData);
    
    // 폼 제출 결과 추적 (AJAX 요청인 경우)
    setTimeout(() => {
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitButton && submitButton.disabled) {
        // 성공으로 가정
        trackEvent('te_form_submit', {
          ...formSubmitData,
          submission_status: 'success'
        });
        console.log('📝 폼 제출 성공 이벤트 전송');
      }
    }, 1000);
    
    // 폼 제출 성공 메시지 감지 (ThinkingData 폼 구조에 맞춤)
    setTimeout(() => {
      const successMessage = document.querySelector('.w-form-done, .success-message, [data-success-message]');
      if (successMessage && successMessage.style.display !== 'none') {
        if (window.te && typeof window.te.track === 'function') {
          window.te.track('te_form_submit', {
            ...formSubmitData,
            submission_status: 'success',
            success_message_detected: true
          });
          console.log('📝 폼 제출 성공 메시지 감지');
        }
      }
    }, 2000);
  });
  
  // 폼 제출 오류 추적
  document.addEventListener('invalid', function(event) {
    updateSessionActivity();
    const form = event.target.closest('form');
    if (form) {
      const errorData = {
        form_name: getFormName(form),
        form_type: getThinkingDataFormType(form),
        form_url: window.location.href,
        error_type: 'validation_error',
        field_name: event.target.name || event.target.id,
        field_type: event.target.type,
        error_message: event.target.validationMessage,
        error_time: new Date().toISOString().replace('T', ' ').slice(0, 23)
      };
      
      trackEvent('te_form_submit_error', errorData);
      console.log('📝 폼 제출 오류 이벤트 전송:', errorData);
    }
  }, true);
  
  // 🚀 최적화된 폼 필드 변경 추적 (이벤트 폭발 방지)
  const fieldTrackingState = new Map(); // 필드별 상태 관리
  const fieldDebounceTimers = new Map(); // 디바운싱 타이머
  
  function trackFieldInteraction(field, triggerType = 'input') {
    const form = field.closest('form');
    if (!form || !isThinkingDataForm(form)) return;
    
    const fieldKey = `${form.id || 'form'}_${field.name || field.id || 'field'}`;
    const currentLength = field.value ? field.value.length : 0;
    const hasValue = !!field.value;
    
    // 이전 상태 가져오기
    const previousState = fieldTrackingState.get(fieldKey) || {
      length: 0,
      hasValue: false,
      lastTrackedLength: 0,
      interactionCount: 0
    };
    
         // 의미 있는 변화인지 확인 (설정 기반)
     const isSignificantChange = (
       // 1. 상태 변화 (빈 값 ↔ 값 있음)
       previousState.hasValue !== hasValue ||
       // 2. 길이가 설정된 임계값 단위로 변함
       Math.floor(currentLength / fieldTrackingConfig.lengthThreshold) !== 
       Math.floor(previousState.lastTrackedLength / fieldTrackingConfig.lengthThreshold) ||
       // 3. 포커스 이벤트
       triggerType === 'focus' || triggerType === 'blur'
     );
     
     // 상태 업데이트
     const newState = {
       length: currentLength,
       hasValue: hasValue,
       lastTrackedLength: isSignificantChange ? currentLength : previousState.lastTrackedLength,
       interactionCount: previousState.interactionCount + 1
     };
     fieldTrackingState.set(fieldKey, newState);
     
     // 의미 있는 변화가 아니면 디바운싱 적용 (설정에 따라)
     if (!isSignificantChange && triggerType === 'input' && fieldTrackingConfig.enableDebouncing) {
       // 기존 타이머 클리어
       if (fieldDebounceTimers.has(fieldKey)) {
         clearTimeout(fieldDebounceTimers.get(fieldKey));
       }
       
       // 설정된 지연 시간 후에 전송하도록 디바운싱
       const timer = setTimeout(() => {
         sendFieldInteractionEvent(field, fieldKey, newState, 'debounced');
         fieldDebounceTimers.delete(fieldKey);
       }, fieldTrackingConfig.debounceDelay);
       
       fieldDebounceTimers.set(fieldKey, timer);
       return;
     }
    
    // 즉시 전송 (의미 있는 변화)
    sendFieldInteractionEvent(field, fieldKey, newState, triggerType);
  }
  
  function sendFieldInteractionEvent(field, fieldKey, state, triggerType) {
    const form = field.closest('form');
    const fieldData = {
      form_name: getFormName(form),
      form_type: getThinkingDataFormType(form),
      field_name: field.name || field.id,
      field_type: field.type,
      field_value_length: state.length,
      field_has_value: state.hasValue,
      interaction_count: state.interactionCount,
      trigger_type: triggerType, // 'input', 'focus', 'blur', 'debounced'
      interaction_time: new Date().toISOString().replace('T', ' ').slice(0, 23)
    };
    
         // 개인정보 필드가 아닌 경우에만 값 미리보기 전송 (설정에 따라)
     if (fieldTrackingConfig.enablePreview && !isPersonalInfo(field.name || field.id)) {
       fieldData.field_value_preview = field.value ? field.value.substring(0, 10) + '...' : '';
     }
     
     // 길이 구간 정보 추가 (설정에 따라)
     if (fieldTrackingConfig.enableLengthCategory) {
       fieldData.length_category = getLengthCategory(state.length);
     }
    
    trackEvent('te_form_field_interaction', fieldData);
    
    console.log(`📝 필드 상호작용 추적 (${triggerType}):`, field.name, `길이: ${state.length}`);
  }
  
  // 길이 카테고리 분류
  function getLengthCategory(length) {
    if (length === 0) return 'empty';
    if (length <= 5) return 'short';
    if (length <= 20) return 'medium';
    if (length <= 50) return 'long';
    return 'very_long';
  }
  
  // 🎯 최적화된 이벤트 리스너들
  document.addEventListener('input', function(event) {
    const field = event.target;
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      trackFieldInteraction(field, 'input');
    }
  });
  
  // 🎯 통합된 포커스 추적 (최적화된 시스템과 연동)
  document.addEventListener('focusin', function(event) {
    const field = event.target;
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      trackFieldInteraction(field, 'focus');
    }
  });
  
  document.addEventListener('focusout', function(event) {
    const field = event.target;
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      trackFieldInteraction(field, 'blur');
    }
  });
  
  console.log('✅ 폼 추적 초기화 완료');
}

// ThinkingData 폼인지 확인
function isThinkingDataForm(form) {
  const url = window.location.href;
  return url.includes('/form-demo') || url.includes('/form-ask') || 
         form.id === 'demo-form' || form.id === 'contact-form' ||
         form.action && (form.action.includes('form-demo') || form.action.includes('form-ask'));
}

// 개인정보 필드 판단 (ThinkingData 폼 구조에 맞춤)
function isPersonalInfo(fieldName) {
  if (!fieldName) return false;
  
  const personalFields = [
    'email', 'phone', 'name', 'password', 'ssn', 'birthday',
    '이메일', '연락처', '이름', '비밀번호', '생년월일',
    'tel', 'mobile', 'contact', 'phone_number'
  ];
  
  return personalFields.some(field => fieldName.toLowerCase().includes(field));
}

// 폼 이름 추출 (ThinkingData 폼 구조에 맞춤)
function getFormName(form) {
  // ThinkingData 특화 폼 이름
  if (window.location.href.includes('/form-demo')) {
    return '데모 신청 폼';
  } else if (window.location.href.includes('/form-ask')) {
    return '문의하기 폼';
  }
  
  return form.title || 
    form.getAttribute('data-form-name') ||
    form.closest('[data-form-name]')?.getAttribute('data-form-name') ||
         form.querySelector('h1, h2')?.textContent?.trim() ||
    '알 수 없는 폼';
}

// ThinkingData 공식 폼 타입 구분 (실제 URL 구조 기반)
function getThinkingDataFormType(form) {
  const url = window.location.href;
  const formId = form.id || '';
  const formAction = form.action || '';
  
  // URL 기반 구분
  if (url.includes('/form-demo') || formAction.includes('form-demo')) {
    return 'demo_request';
  } else if (url.includes('/form-ask') || formAction.includes('form-ask')) {
    return 'contact_inquiry';
  }
  
  // 폼 ID 기반 구분
  if (formId.includes('demo') || formId.includes('request')) {
    return 'demo_request';
  } else if (formId.includes('contact') || formId.includes('ask') || formId.includes('inquiry')) {
    return 'contact_inquiry';
  }
  
  return 'other';
}

// ThinkingData 폼 상세 정보 수집
function getThinkingDataFormInfo(form) {
  const url = window.location.href;
  const formType = getThinkingDataFormType(form);
  
  const formInfo = {
    form_type: formType,
    form_url: url,
    form_page_title: document.title,
    form_has_required_fields: false,
    form_has_privacy_agreement: false,
    form_field_count: 0,
    form_required_field_count: 0
  };
  
  // 폼 필드 분석
  const fields = form.querySelectorAll('input, textarea, select');
  formInfo.form_field_count = fields.length;
  
  fields.forEach(field => {
    if (field.hasAttribute('required')) {
      formInfo.form_has_required_fields = true;
      formInfo.form_required_field_count++;
    }
  });
  
  // 개인정보 동의 체크박스 확인
  const privacyCheckbox = form.querySelector('input[type="checkbox"][name*="privacy"], input[type="checkbox"][name*="agreement"], input[type="checkbox"][name*="동의"]');
  formInfo.form_has_privacy_agreement = !!privacyCheckbox;
  
  // ThinkingData 특화 정보
  if (formType === 'demo_request') {
    formInfo.demo_request_form = true;
    formInfo.form_purpose = '데모 신청';
  } else if (formType === 'contact_inquiry') {
    formInfo.contact_inquiry_form = true;
    formInfo.form_purpose = '문의하기';
  }
  
  return formInfo;
  }

// 마스킹 함수들은 utils.js에서 가져와서 사용

// 세션 활동 업데이트 (직접 전역 함수 호출)
function updateSessionActivity() {
  // 전역 함수가 정의되어 있고, 자기 자신이 아닌 경우에만 호출
  if (typeof window.updateSessionActivity === 'function' && window.updateSessionActivity !== updateSessionActivity) {
    try {
      window.updateSessionActivity();
    } catch (e) {
      console.warn('📝 세션 활동 업데이트 오류:', e);
    }
  } else {
    // 전역 함수가 없거나 자기 자신인 경우 기본 동작
    try {
      if (window.lastActivityTime) {
        window.lastActivityTime = Date.now();
      }
    } catch (e) {
      console.warn('📝 기본 세션 활동 업데이트 오류:', e);
    }
  }
}

// 디버깅용 함수
function debugFormTracking() {
  console.log('📝 폼 추적 디버깅 정보:');
  console.log('- 현재 URL:', window.location.href);
  console.log('- 페이지 제목:', document.title);
  console.log('- 폼 개수:', document.querySelectorAll('form').length);
  console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
  
  // 폼 상세 정보
  document.querySelectorAll('form').forEach((form, index) => {
    console.log(`- 폼 ${index + 1}:`, {
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      field_count: form.querySelectorAll('input, textarea, select').length
    });
  });
}

// 전역 함수로 노출
window.trackFormSubmissions = trackFormSubmissions;
window.debugFormTracking = debugFormTracking;

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📝 DOM 로드 완료, 폼 추적 시작');
    setTimeout(trackFormSubmissions, 1000);
  });
} else {
  // DOM이 이미 로드된 경우
  console.log('📝 DOM 이미 로드됨, 폼 추적 시작');
  setTimeout(trackFormSubmissions, 1000);
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
  console.log('📝 ThinkingData 초기화 완료, 폼 추적 시작');
  setTimeout(trackFormSubmissions, 500);
});

// 🚀 폼 필드 추적 최적화 설정 예시
// 사용자가 이 설정을 통해 이벤트 빈도를 조절할 수 있습니다
/*
window.formTrackingConfig = {
  debounceDelay: 3000,        // 디바운싱 지연 시간 (3초로 증가)
  lengthThreshold: 10,        // 길이 변화 임계값 (10글자 단위로 변경)
  enableDebouncing: true,     // 디바운싱 활성화 (기본값)
  enableLengthCategory: false,// 길이 카테고리 분석 비활성화
  enablePreview: false        // 값 미리보기 비활성화
};
*/

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('📝 페이지 로드 완료, 폼 추적 재확인');
  setTimeout(trackFormSubmissions, 2000);
});