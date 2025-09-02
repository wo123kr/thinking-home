/**
 * 폼 제출 추적 모듈 - ThinkingData 홈페이지 최적화
 */

import {
  maskEmail,
  maskPhone,
  maskName,
  addTETimeProperties,
  trackingLog,
} from "../core/utils.js";
import { updateSessionActivity } from "../core/session-manager.js";
import { trackFormSubmission } from "../user-attributes.js";

// 폼 제출/오류 추적 메인 함수
export function initFormTracking() {
  trackingLog("📝 폼 추적 초기화 시작...");

  // SDK 로드 체크
  function isSDKLoaded() {
    return (
      typeof window.te !== "undefined" && typeof window.te.track === "function"
    );
  }

  function handleFormSubmit(event) {
    const form = event.target;
    updateSessionActivity();

    trackingLog("📝 폼 제출 감지:", form);

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
    const privacyCheckbox = form.querySelector(
      'input[type="checkbox"][name*="privacy"], input[type="checkbox"][name*="agreement"], input[type="checkbox"][name*="동의"]'
    );
    const privacyAgreed = privacyCheckbox ? privacyCheckbox.checked : false;

    // ThinkingData 공식 폼 구분
    const formType = getFormType(form);
    const formInfo = getThinkingDataFormInfo(form);

    // 실제 폼 값들 수집 (마스킹 전)
    const rawName =
      formData.get("name") ||
      formData.get("이름") ||
      formData.get("gameplus_Name") ||
      "";
    const rawEmail =
      formData.get("email") ||
      formData.get("이메일") ||
      formData.get("gameplus_email") ||
      "";
    const rawPhone =
      formData.get("phone") ||
      formData.get("연락처") ||
      formData.get("gameplus_phone") ||
      "";

    const formSubmitData = {
      form_id: form.id || form.name || "unknown_form",
      form_name: getFormName(form),
      form_type: getFormType(form), // 'demo_request', 'contact_inquiry', 'gameplus', 'other'
      form_url: window.location.href,
      form_page_title: document.title,
      form_fields_submitted_info: {
        name: rawName ? maskName(rawName) : "",
        email: rawEmail ? maskEmail(rawEmail) : "",
        phone: rawPhone ? maskPhone(rawPhone) : "",
        company_name:
          formData.get("company") ||
          formData.get("회사명") ||
          formData.get("gameplus_company") ||
          "",
        inquiry_source:
          formData.get("source") || formData.get("알게된경로") || "",
        message_length: (
          formData.get("message") ||
          formData.get("문의사항") ||
          ""
        ).length,
        // 원본 값 있는지 여부 추가 (디버깅용)
        has_name: !!rawName,
        has_email: !!rawEmail,
        has_phone: !!rawPhone,
      },
      privacy_agreement_checked: privacyAgreed,
      submission_status: "pending",
      // ThinkingData 특화 정보
      form_info: formInfo,
      form_validation_passed: true,
      form_submission_time: new Date()
        .toISOString()
        .replace("T", " ")
        .slice(0, 23),
    };

    // TE 시간 형식 속성 추가
    const formSubmitDataWithTETime = addTETimeProperties(formSubmitData);

    trackEvent("te_form_submit", formSubmitDataWithTETime);
    trackingLog("📝 폼 제출 이벤트 전송:", formSubmitDataWithTETime);

    // 🚀 유저 속성에 폼 제출 추적
    trackFormSubmission();

    // 폼 제출 결과 추적 (AJAX 요청인 경우)
    setTimeout(() => {
      const submitButton = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );
      if (submitButton && submitButton.disabled) {
        // 성공으로 가정
        const successData = {
          ...formSubmitData,
          submission_status: "success",
        };
        trackEvent("te_form_submit", successData);
        trackingLog("📝 폼 제출 성공 이벤트 전송");
      }
    }, 1000);

    // 폼 제출 성공 메시지 감지 (ThinkingData 폼 구조에 맞춤)
    setTimeout(() => {
      const successMessage = document.querySelector(
        ".w-form-done, .success-message, [data-success-message]"
      );
      if (successMessage && successMessage.style.display !== "none") {
        if (window.te && typeof window.te.track === "function") {
          const finalSuccessData = {
            ...formSubmitData,
            submission_status: "success",
            success_message_detected: true,
          };
          window.te.track("te_form_submit", finalSuccessData);
          trackingLog("�� 폼 제출 성공 메시지 감지");
        }
      }
    }, 2000);
  }

  function handleFormInvalid(event) {
    updateSessionActivity();
    const form = event.target.closest("form");
    if (form) {
      const errorData = {
        form_name: getFormName(form),
        form_type: getFormType(form),
        form_url: window.location.href,
        error_type: "validation_error",
        field_name: event.target.name || event.target.id,
        field_type: event.target.type,
        error_message: event.target.validationMessage,
        error_time: new Date().toISOString().replace("T", " ").slice(0, 23),
      };

      // TE 시간 형식 속성 추가
      const errorDataWithTETime = addTETimeProperties(errorData);

      trackEvent("te_form_submit_error", errorDataWithTETime);
      trackingLog("📝 폼 제출 오류 이벤트 전송:", errorDataWithTETime);
    }
  }

  function bindFormEvents() {
    document.addEventListener("submit", handleFormSubmit);
    document.addEventListener("invalid", handleFormInvalid, true);
    trackingLog("📝 폼 이벤트 바인딩 완료");
  }

  // SDK가 로드될 때까지 재시도
  function tryInit(retry = 0) {
    if (isSDKLoaded()) {
      bindFormEvents();
      trackingLog("✅ 폼 트래킹 SDK 연동 및 이벤트 바인딩 완료");
    } else if (retry < 5) {
      trackingLog("⚠️ ThinkingData SDK가 로드되지 않음, 2초 후 재시도...");
      setTimeout(() => tryInit(retry + 1), 2000);
    } else {
      trackingLog("❌ 폼 트래킹: SDK 로드 실패, 이벤트 바인딩 중단");
    }
  }

  tryInit();
}

// 🚀 폼 필드 추적 최적화 설정
const fieldTrackingConfig = {
  debounceDelay: 2000, // 디바운싱 지연 시간 (ms)
  lengthThreshold: 3, // 길이 변화 임계값 (3글자 단위로 변경)
  enableDebouncing: true, // 디바운싱 활성화
  enableLengthCategory: true, // 길이 카테고리 분석 활성화
  enablePreview: true, // 값 미리보기 (개인정보 아닌 경우)
  ...(window.formTrackingConfig || {}), // 사용자 커스텀 설정
};

trackingLog("📝 폼 필드 추적 설정:", fieldTrackingConfig);

// 🚀 최적화된 폼 필드 변경 추적 (이벤트 폭발 방지)
const fieldTrackingState = new Map(); // 필드별 상태 관리
const fieldDebounceTimers = new Map(); // 디바운싱 타이머

function trackFieldInteraction(field, triggerType = "input") {
  const form = field.closest("form");
  if (!form || !isThinkingDataForm(form)) return;

  const fieldKey = `${form.id || "form"}_${field.name || field.id || "field"}`;
  const currentLength = field.value ? field.value.length : 0;
  const hasValue = !!field.value;

  // 이전 상태 가져오기
  const previousState = fieldTrackingState.get(fieldKey) || {
    length: 0,
    hasValue: false,
    lastTrackedLength: 0,
    interactionCount: 0,
  };

  // 의미 있는 변화인지 확인 (설정 기반)
  const isSignificantChange =
    // 1. 상태 변화 (빈 값 ↔ 값 있음)
    previousState.hasValue !== hasValue ||
    // 2. 길이가 설정된 임계값 단위로 변함
    Math.floor(currentLength / fieldTrackingConfig.lengthThreshold) !==
      Math.floor(
        previousState.lastTrackedLength / fieldTrackingConfig.lengthThreshold
      ) ||
    // 3. 포커스 이벤트
    triggerType === "focus" ||
    triggerType === "blur";

  // 상태 업데이트
  const newState = {
    length: currentLength,
    hasValue: hasValue,
    lastTrackedLength: isSignificantChange
      ? currentLength
      : previousState.lastTrackedLength,
    interactionCount: previousState.interactionCount + 1,
  };
  fieldTrackingState.set(fieldKey, newState);

  // 의미 있는 변화가 아니면 디바운싱 적용 (설정에 따라)
  if (
    !isSignificantChange &&
    triggerType === "input" &&
    fieldTrackingConfig.enableDebouncing
  ) {
    // 기존 타이머 클리어
    if (fieldDebounceTimers.has(fieldKey)) {
      clearTimeout(fieldDebounceTimers.get(fieldKey));
    }

    // 설정된 지연 시간 후에 전송하도록 디바운싱
    const timer = setTimeout(() => {
      sendFieldInteractionEvent(field, fieldKey, newState, "debounced");
      fieldDebounceTimers.delete(fieldKey);
    }, fieldTrackingConfig.debounceDelay);

    fieldDebounceTimers.set(fieldKey, timer);
    return;
  }

  // 즉시 전송 (의미 있는 변화)
  sendFieldInteractionEvent(field, fieldKey, newState, triggerType);
}

function sendFieldInteractionEvent(field, fieldKey, state, triggerType) {
  const form = field.closest("form");
  const fieldData = {
    form_name: getFormName(form),
    form_type: getFormType(form),
    field_name: field.name || field.id,
    field_type: field.type,
    field_value_length: state.length,
    field_has_value: state.hasValue,
    interaction_count: state.interactionCount,
    trigger_type: triggerType, // 'input', 'focus', 'blur', 'debounced'
    interaction_time: new Date().toISOString().replace("T", " ").slice(0, 23),
  };

  // 개인정보 필드가 아닌 경우에만 값 미리보기 전송 (설정에 따라)
  if (
    fieldTrackingConfig.enablePreview &&
    !isPersonalInfo(field.name || field.id)
  ) {
    fieldData.field_value_preview = field.value
      ? field.value.substring(0, 10) + "..."
      : "";
  }

  // 길이 구간 정보 추가 (설정에 따라)
  if (fieldTrackingConfig.enableLengthCategory) {
    fieldData.length_category = getLengthCategory(state.length);
  }

  // TE 시간 형식 속성 추가
  const fieldDataWithTETime = addTETimeProperties(fieldData);

  trackEvent("te_form_field_interaction", fieldDataWithTETime);

  trackingLog(
    `📝 필드 상호작용 추적 (${triggerType}):`,
    field.name,
    `길이: ${state.length}`
  );
}

// 길이 카테고리 분류
function getLengthCategory(length) {
  if (length === 0) return "empty";
  if (length <= 5) return "short";
  if (length <= 20) return "medium";
  if (length <= 50) return "long";
  return "very_long";
}

// 🎯 최적화된 이벤트 리스너들
document.addEventListener("input", function (event) {
  const field = event.target;
  if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
    trackFieldInteraction(field, "input");
  }
});

// 🎯 통합된 포커스 추적 (최적화된 시스템과 연동)
document.addEventListener("focusin", function (event) {
  const field = event.target;
  if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
    trackFieldInteraction(field, "focus");
  }
});

document.addEventListener("focusout", function (event) {
  const field = event.target;
  if (field.tagName === "INPUT" || field.tagName === "TEXTAREA") {
    trackFieldInteraction(field, "blur");
  }
});

trackingLog("✅ 폼 추적 초기화 완료");

// ThinkingData 폼인지 확인
function isThinkingDataForm(form) {
  const url = window.location.href;
  return (
    url.includes("/form-demo") ||
    url.includes("/form-ask") ||
    url.includes("/form-gameplus") ||
    form.id?.includes("demo") ||
    form.id?.includes("contact") ||
    form.id?.includes("ask") ||
    form.id?.includes("gameplus") ||
    form.name?.includes("demo") ||
    form.name?.includes("contact") ||
    form.name?.includes("ask") ||
    form.name?.includes("gameplus") ||
    (form.action &&
      (form.action.includes("form-demo") ||
        form.action.includes("form-ask") ||
        form.action.includes("form-gameplus")))
  );
}

// 개인정보 필드 판단 (ThinkingData 폼 구조에 맞춤)
function isPersonalInfo(fieldName) {
  if (!fieldName) return false;

  const personalFields = [
    "email",
    "phone",
    "name",
    "password",
    "ssn",
    "birthday",
    "이메일",
    "연락처",
    "이름",
    "비밀번호",
    "생년월일",
    "tel",
    "mobile",
    "contact",
    "phone_number",
  ];

  return personalFields.some((field) =>
    fieldName.toLowerCase().includes(field)
  );
}

// 폼 이름 추출 (ThinkingData 폼 구조에 맞춤)
function getFormName(form) {
  if (window.location.href.includes("/form-demo")) return "데모 신청 폼";
  if (window.location.href.includes("/form-ask")) return "문의하기 폼";
  if (window.location.href.includes("/form-gameplus")) return "게임더하기 폼";
  if (form.id?.includes("gameplus") || form.name?.includes("gameplus"))
    return "게임더하기 폼";
  return (
    form.title ||
    form.getAttribute("data-form-name") ||
    form.querySelector("h1,h2")?.textContent?.trim() ||
    "알 수 없는 폼"
  );
}

// ThinkingData 공식 폼 타입 구분 (실제 URL 구조 기반)
function getFormType(form) {
  const url = window.location.href;
  if (url.includes("/form-demo") || form.id?.includes("demo"))
    return "demo_request";
  if (
    url.includes("/form-ask") ||
    form.id?.includes("contact") ||
    form.id?.includes("ask")
  )
    return "contact_inquiry";
  if (
    url.includes("/form-gameplus") ||
    form.id?.includes("gameplus") ||
    form.name?.includes("gameplus")
  )
    return "gameplus";
  return "other";
}

// ThinkingData 폼 상세 정보 수집
function getThinkingDataFormInfo(form) {
  const url = window.location.href;
  const formType = getFormType(form);

  const formInfo = {
    form_type: formType,
    form_url: url,
    form_page_title: document.title,
    form_has_required_fields: false,
    form_has_privacy_agreement: false,
    form_field_count: 0,
    form_required_field_count: 0,
  };

  // 폼 필드 분석
  const fields = form.querySelectorAll("input, textarea, select");
  formInfo.form_field_count = fields.length;

  fields.forEach((field) => {
    if (field.hasAttribute("required")) {
      formInfo.form_has_required_fields = true;
      formInfo.form_required_field_count++;
    }
  });

  // 개인정보 동의 체크박스 확인
  const privacyCheckbox = form.querySelector(
    'input[type="checkbox"][name*="privacy"], input[type="checkbox"][name*="agreement"], input[type="checkbox"][name*="동의"]'
  );
  formInfo.form_has_privacy_agreement = !!privacyCheckbox;

  // ThinkingData 특화 정보
  if (formType === "demo_request") {
    formInfo.demo_request_form = true;
    formInfo.form_purpose = "데모 신청";
  } else if (formType === "contact_inquiry") {
    formInfo.contact_inquiry_form = true;
    formInfo.form_purpose = "문의하기";
  }

  return formInfo;
}

// 마스킹 함수들은 utils.js에서 가져와서 사용

// 디버깅용 함수
function debugFormTracking() {
  trackingLog("📝 폼 추적 디버깅 정보:");
  trackingLog("- 현재 URL:", window.location.href);
  trackingLog("- 페이지 제목:", document.title);
  trackingLog("- 폼 개수:", document.querySelectorAll("form").length);
  trackingLog(
    "- ThinkingData SDK:",
    typeof window.te !== "undefined" ? "로드됨" : "로드 안됨"
  );

  // 폼 상세 정보
  document.querySelectorAll("form").forEach((form, index) => {
    trackingLog(`- 폼 ${index + 1}:`, {
      id: form.id,
      name: form.name,
      action: form.action,
      method: form.method,
      field_count: form.querySelectorAll("input, textarea, select").length,
    });
  });
}

// 전역 함수로 노출
window.debugFormTracking = debugFormTracking;
