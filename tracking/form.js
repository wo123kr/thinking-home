/**
 * 폼 제출 추적 모듈 - ThinkingData 홈페이지 최적화
 */

function trackFormSubmissions() {
  console.log('📝 폼 추적 초기화 시작...');
  
  // ThinkingData SDK 확인
  if (typeof window.te === 'undefined') {
    console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
    setTimeout(trackFormSubmissions, 3000);
    return;
  }
  
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
      form_submission_time: Date.now()
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
        error_time: Date.now()
      };
      
      trackEvent('te_form_submit_error', errorData);
      console.log('📝 폼 제출 오류 이벤트 전송:', errorData);
    }
  }, true);
  
  // 폼 필드 변경 추적 (ThinkingData 폼 구조에 맞춤)
  document.addEventListener('input', function(event) {
    const field = event.target;
    const form = field.closest('form');
    
    if (form && isThinkingDataForm(form)) {
      const fieldData = {
        form_name: getFormName(form),
        form_type: getThinkingDataFormType(form),
        field_name: field.name || field.id,
        field_type: field.type,
        field_value_length: field.value ? field.value.length : 0,
        field_has_value: !!field.value,
        interaction_time: Date.now()
      };
      
      // 개인정보 필드가 아닌 경우에만 값 길이 전송
      if (!isPersonalInfo(field.name || field.id)) {
        fieldData.field_value_preview = field.value ? field.value.substring(0, 10) + '...' : '';
      }
      
      trackEvent('te_form_field_interaction', fieldData);
    }
  });
  
  // 폼 포커스 추적
  document.addEventListener('focusin', function(event) {
    const field = event.target;
    const form = field.closest('form');
    
    if (form && isThinkingDataForm(form)) {
      trackEvent('te_form_field_focus', {
        form_name: getFormName(form),
        form_type: getThinkingDataFormType(form),
        field_name: field.name || field.id,
        field_type: field.type,
        focus_time: Date.now()
      });
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

// 세션 활동 업데이트
function updateSessionActivity() {
  if (typeof window.updateSessionActivity === 'function') {
    window.updateSessionActivity();
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

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
  console.log('📝 페이지 로드 완료, 폼 추적 재확인');
  setTimeout(trackFormSubmissions, 2000);
});