/**
 * 폼 제출 추적 모듈
 */

function trackFormSubmissions() {
  document.addEventListener('submit', function(event) {
    const form = event.target;
    updateSessionActivity();
    
    // 폼 데이터 수집 (개인정보 제외)
    const formData = new FormData(form);
    const formFields = {};
    
    // 개인정보가 아닌 필드만 수집
    for (let [key, value] of formData.entries()) {
      if (!isPersonalInfo(key)) {
        formFields[key] = value;
      }
    }
    
    // 개인정보 동의 체크박스 확인
    const privacyCheckbox = form.querySelector('input[type="checkbox"][name*="privacy"], input[type="checkbox"][name*="agreement"]');
    const privacyAgreed = privacyCheckbox ? privacyCheckbox.checked : null;
    
    // ThinkingData 공식 폼 구분
    const formType = getThinkingDataFormType(form);
    
    const formSubmitData = {
      form_id: form.id || form.name || 'unknown_form',
      form_name: getFormName(form),
      form_type: formType, // 'demo_request', 'contact_inquiry', 'other'
      form_url: window.location.href,
      form_fields_submitted_info: {
        name: formData.get('name') ? maskName(formData.get('name')) : null,
        email: formData.get('email') ? maskEmail(formData.get('email')) : null,
        phone: formData.get('phone') ? maskPhone(formData.get('phone')) : null,
        company_name: formData.get('company') || formData.get('company_name') || null, // 회사명은 마스킹 안함
        inquiry_source: formData.get('source') || formData.get('how_did_you_know') || null,
        message_length: formData.get('message') ? formData.get('message').length : null // 메시지 길이만
      },
      privacy_agreement_checked: privacyAgreed,
      submission_status: 'pending'
    };
    
    te.track('te_form_submit', formSubmitData);
    
    // 폼 제출 결과 추적 (AJAX 요청인 경우)
    setTimeout(() => {
      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitButton && submitButton.disabled) {
        // 성공으로 가정
        te.track('te_form_submit', {
          ...formSubmitData,
          submission_status: 'success'
        });
      }
    }, 1000);
  });
  
  // 폼 제출 오류 추적
  document.addEventListener('invalid', function(event) {
    updateSessionActivity();
    const form = event.target.closest('form');
    if (form) {
      te.track('te_form_submit_error', {
        form_name: getFormName(form),
        error_type: 'validation_error',
        field_name: event.target.name || event.target.id,
        error_message: event.target.validationMessage
      });
    }
  }, true);
}

// 개인정보 필드 판단
function isPersonalInfo(fieldName) {
  const personalFields = ['email', 'phone', 'name', 'password', 'ssn', 'birthday'];
  return personalFields.some(field => fieldName.toLowerCase().includes(field));
}

// 폼 이름 추출
function getFormName(form) {
  return form.title || 
    form.getAttribute('data-form-name') ||
    form.closest('[data-form-name]')?.getAttribute('data-form-name') ||
    '알 수 없는 폼';
}

// ThinkingData 공식 폼 타입 구분
function getThinkingDataFormType(form) {
  const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
  const url = window.location.href;
  
  // URL과 버튼 ID 기반으로 구분
  if (url.includes('/form-demo') || (submitButton && submitButton.id === 'demo_submit')) {
    return 'demo_request';
  } else if (url.includes('/form-ask') || (submitButton && submitButton.id === 'ask_submit')) {
    return 'contact_inquiry';
  } else {
    return 'other';
  }
}

// 🎭 개선된 마스킹 함수들 (실제 데이터 패턴 유지하면서 보안)
function maskEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const parts = email.split('@');
  if (parts.length !== 2) return '***@***.***';
  
  const [localPart, domain] = parts;
  const domainParts = domain.split('.');
  
  // 이메일 패턴: 첫글자 + *** + @도메인첫글자*** + .확장자
  const maskedLocal = localPart.length > 1 ? localPart[0] + '***' : '***';
  const maskedDomain = domainParts.length > 1 ? 
    domainParts[0][0] + '***.' + domainParts[domainParts.length - 1] : 
    '***.' + domainParts[0];
    
  return maskedLocal + '@' + maskedDomain;
}

function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  
  // 숫자만 추출
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length >= 10) {
    // 010-****-1234 형태로 마스킹 (앞3자리, 뒤4자리 보이고 중간 마스킹)
    return numbers.substring(0, 3) + '-****-' + numbers.slice(-4);
  } else if (numbers.length >= 7) {
    return numbers.substring(0, 2) + '***' + numbers.slice(-2);
  } else {
    return '***-****-****';
  }
}

function maskName(name) {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim();
  
  if (trimmed.length <= 1) {
    return '*';
  } else if (trimmed.length === 2) {
    return trimmed[0] + '*';
  } else {
    // 3글자 이상: 첫글자 + *** + 마지막글자
    return trimmed[0] + '***' + trimmed[trimmed.length - 1];
  }
}

// 전역 함수로 노출
window.trackFormSubmissions = trackFormSubmissions;