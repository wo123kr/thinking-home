/**
 * 클릭 이벤트 추적 모듈
 */

// 버튼 및 링크 클릭 추적
function trackClickEvents() {
  document.addEventListener('click', function(event) {
    const target = event.target;
    const closestClickable = target.closest('a, button, [role="button"], .btn, .button');
    
    if (closestClickable) {
      updateSessionActivity();
      
      const elementData = {
        element_id: closestClickable.id || null,
        element_class_list: closestClickable.className ? closestClickable.className.split(' ') : [],
        element_name: closestClickable.textContent ? closestClickable.textContent.trim() : null,
        element_tag_name: closestClickable.tagName.toLowerCase(),
        element_target_url: closestClickable.href || null,
        page_url: window.location.href,
        click_coordinates_page: {
          x_coordinate: event.pageX,
          y_coordinate: event.pageY
        }
      };
      
      // 메뉴 클릭 감지 (GNB 등)
      if (closestClickable.closest('nav') || 
          closestClickable.closest('.navigation') ||
          closestClickable.closest('.menu') ||
          closestClickable.closest('header')) {
        te.track('te_menu_click', {
          ...elementData,
          menu_id: closestClickable.id || elementData.element_name || 'unknown',
          menu_name: elementData.element_name,
          menu_depth: getMenuDepth(closestClickable),
          menu_position: getMenuPosition(closestClickable),
          menu_target_url: elementData.element_target_url
        });
      }
      // 외부 링크 클릭 감지
      else if (closestClickable.href && isExternalLink(closestClickable.href)) {
        te.track('te_outbound_link_click', {
          outbound_url: closestClickable.href,
          link_text: elementData.element_name,
          link_id: elementData.element_id,
          link_class_list: elementData.element_class_list
        });
      }
      // 일반 요소 클릭
      else {
        te.track('te_element_click', elementData);
      }
    }
  });
}

// 메뉴 깊이 판단
function getMenuDepth(element) {
  let depth = 1;
  let parent = element.parentElement;
  
  while (parent && !parent.closest('nav, .navigation, .menu')) {
    if (parent.tagName === 'UL' || parent.tagName === 'OL') {
      depth++;
    }
    parent = parent.parentElement;
  }
  
  return depth + '차';
}

// 메뉴 위치 판단
function getMenuPosition(element) {
  const nav = element.closest('nav, .navigation, .menu');
  if (!nav) return 'unknown';
  
  const rect = nav.getBoundingClientRect();
  if (rect.top < 100) return '상단';
  if (rect.left < 100) return '사이드';
  if (rect.bottom > window.innerHeight - 100) return '푸터';
  
  return '기타';
}

// 외부 링크 판단
function isExternalLink(url) {
  try {
    const linkHost = new URL(url).hostname;
    const currentHost = window.location.hostname;
    return linkHost !== currentHost;
  } catch (e) {
    return false;
  }
}

// 전역 함수로 노출
window.trackClickEvents = trackClickEvents;
window.isExternalLink = isExternalLink;