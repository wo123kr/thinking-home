/**
 * 유저 속성 추적 시스템 - ThinkingData 홈페이지 최적화
 * 사용자 행동 패턴, 생명주기, 참여도 등을 추적
 */

// 유저 속성 관리 클래스
class UserAttributeTracker {
    constructor() {
        console.log('👤 유저 속성 추적 시스템 초기화 시작...');
        
        // ThinkingData SDK 확인
        if (typeof window.te === 'undefined') {
            console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
            setTimeout(() => {
                window.userTracker = new UserAttributeTracker();
            }, 3000);
            return;
        }
        
        this.storageKey = 'te_user_attributes';
        this.attributes = this.loadAttributes();
        this.sessionStartTime = Date.now();
        this.pageStartTime = Date.now();
        this.currentPageCategory = null;
        this.contentEngagementTimer = null;
        this.isInitialized = false;
        
        // ThinkingData 홈페이지 섹션 매핑
        this.sectionMapping = {
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
        
        // ThinkingData 홈페이지 카테고리 매핑
        this.contentCategories = {
            'analytics': '분석',
            'feature': '기능',
            'industry': '산업시리즈', 
            'playbook': '플레이북',
            'solution': '솔루션',
            'user_case': '고객사례'
        };
        
        this.initializeUser();
    }
    
    // 속성 로컬스토리지에서 로드
    loadAttributes() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.warn('로컬스토리지 로드 실패:', e);
            return {};
        }
    }
    
    // 속성 로컬스토리지에 저장
    saveAttributes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.attributes));
        } catch (e) {
            console.warn('로컬스토리지 저장 실패:', e);
        }
    }
    
    // ThinkingData SDK 안전 호출
    safeTeCall(method, data) {
        try {
            if (window.te && typeof window.te[method] === 'function') {
                window.te[method](data);
                return true;
            } else {
                console.warn(`ThinkingData SDK ${method} 메서드 사용 불가`);
                return false;
            }
        } catch (e) {
            console.warn(`ThinkingData SDK ${method} 호출 실패:`, e);
            return false;
        }
    }
    
    // 사용자 초기화
    initializeUser() {
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0];
        
        // 1. 최초 방문 시점 기록 (한 번만)
        if (!this.attributes.first_visit_timestamp) {
            this.safeTeCall('userSetOnce', { first_visit_timestamp: new Date(now).toISOString().replace('T', ' ').slice(0, 23) });
            this.attributes.first_visit_timestamp = now;
        }
        
        // 2. 세션 수 증가
        this.safeTeCall('userAdd', { total_sessions: 1 });
        this.attributes.total_sessions = (this.attributes.total_sessions || 0) + 1;
        
        // 3. 오늘 세션 수 (날짜가 바뀌면 리셋)
        const lastVisitDate = this.attributes.last_visit_date;
        if (lastVisitDate !== today) {
            this.safeTeCall('userSet', { session_count_today: 1 });
            this.attributes.session_count_today = 1;
            this.attributes.last_visit_date = today;
        } else {
            this.safeTeCall('userAdd', { session_count_today: 1 });
            this.attributes.session_count_today = (this.attributes.session_count_today || 0) + 1;
        }
        
        // 4. 재방문자 체크 (2번째 세션부터)
        if (this.attributes.total_sessions >= 2) {
            this.safeTeCall('userSet', { is_returning_visitor: true });
            this.attributes.is_returning_visitor = true;
        }
        
        // 5. 최초 유입 정보 기록 (한 번만)
        this.recordFirstVisitSource();
        
        // 6. 기본 시간 정보 업데이트
        this.updateTimeAttributes();
        
        // 7. ThinkingData 홈페이지 특화 정보 설정
        this.setThinkingDataSpecificAttributes();
        
        this.saveAttributes();
        this.isInitialized = true;
        console.log('✅ 유저 속성 초기화 완료:', this.attributes);
    }
    
    // ThinkingData 홈페이지 특화 속성 설정
    setThinkingDataSpecificAttributes() {
        const path = window.location.pathname;
        const pageSection = this.getPageSection(path);
        const pageCategory = this.getPageCategory(path);
        
        // 기본 페이지 정보 설정
        this.safeTeCall('userSet', {
            current_page_section: pageSection,
            current_page_category: pageCategory,
            website_domain: 'thinkingdata.kr',
            is_thinkingdata_website: true
        });
        
        // ThinkingData 특화 관심사 설정
        if (pageSection === 'home') {
            this.safeTeCall('userSet', { 
                interested_in_data_analytics: true,
                potential_customer: true
            });
        }
        
        if (pageSection === 'solution' || pageSection === 'feature') {
            this.safeTeCall('userSet', { 
                interested_in_solutions: true,
                solution_researcher: true
            });
        }
        
        if (pageSection === 'user_case') {
            this.safeTeCall('userSet', { 
                interested_in_case_studies: true,
                case_study_researcher: true
            });
        }
    }
    
    // 최초 유입 소스 기록
    recordFirstVisitSource() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source') || this.inferTrafficSource();
        const utmCampaign = urlParams.get('utm_campaign');
        const referrerDomain = document.referrer ? new URL(document.referrer).hostname : 'direct';
        
        // 최초 방문 시에만 기록
        this.safeTeCall('userSetOnce', {
            first_utm_source: utmSource,
            first_utm_campaign: utmCampaign,
            first_referrer_domain: referrerDomain
        });
        
        // 사용한 유입 소스 누적 (중복 제거)
        this.safeTeCall('userUniqAppend', {
            traffic_sources_used: [utmSource]
        });
        
        // 로컬에도 저장
        if (!this.attributes.first_utm_source) {
            this.attributes.first_utm_source = utmSource;
            this.attributes.first_utm_campaign = utmCampaign;
            this.attributes.first_referrer_domain = referrerDomain;
        }
        
        this.attributes.traffic_sources_used = this.attributes.traffic_sources_used || [];
        if (!this.attributes.traffic_sources_used.includes(utmSource)) {
            this.attributes.traffic_sources_used.push(utmSource);
        }
    }
    
    // 트래픽 소스 추론
    inferTrafficSource() {
        const referrer = document.referrer;
        if (!referrer) return 'direct';
        
        const referrerHost = new URL(referrer).hostname.toLowerCase();
        
        if (referrerHost.includes('google')) return 'google';
        if (referrerHost.includes('naver')) return 'naver';
        if (referrerHost.includes('facebook')) return 'facebook';
        if (referrerHost.includes('instagram')) return 'instagram';
        if (referrerHost.includes('linkedin')) return 'linkedin';
        if (referrerHost.includes('twitter') || referrerHost.includes('t.co')) return 'twitter';
        if (referrerHost.includes('youtube')) return 'youtube';
        if (referrerHost.includes('cafe.naver')) return 'naver_cafe';
        if (referrerHost.includes('blog.naver')) return 'naver_blog';
        
        return 'referral';
    }
    
    // 페이지 관심사 업데이트
    updatePageInterests() {
        const currentPath = window.location.pathname;
        const pageCategory = this.categorizePageContent(currentPath);
        const sectionName = this.getPageSection(currentPath);
        
        console.log('📊 페이지 관심사 업데이트:', { currentPath, pageCategory, sectionName });
        
        // 관심 주제 추가 (ThinkingData 홈페이지 카테고리 기반)
        if (pageCategory) {
            this.safeTeCall('userUniqAppend', { 
                interested_topics: [pageCategory] 
            });
            
            this.attributes.interested_topics = this.attributes.interested_topics || [];
            if (!this.attributes.interested_topics.includes(pageCategory)) {
                this.attributes.interested_topics.push(pageCategory);
            }
        }
        
        // 최근 방문 페이지 추가 (최대 20개 유지)
        this.attributes.viewed_pages = this.attributes.viewed_pages || [];
        this.attributes.viewed_pages.unshift(currentPath);
        if (this.attributes.viewed_pages.length > 20) {
            this.attributes.viewed_pages = this.attributes.viewed_pages.slice(0, 20);
        }
        
        this.safeTeCall('userSet', { 
            viewed_pages: this.attributes.viewed_pages.slice(0, 10) // ThinkingData에는 최근 10개만 전송
        });
        
        // 가장 많이 방문한 섹션 업데이트
        if (sectionName) {
            this.updateMostVisitedSection(sectionName);
        }
        
        // ThinkingData 특화 페이지 정보 업데이트
        this.updateThinkingDataPageInfo(currentPath, pageCategory, sectionName);
        
        this.saveAttributes();
    }
    
    // ThinkingData 특화 페이지 정보 업데이트
    updateThinkingDataPageInfo(path, category, section) {
        const pageInfo = {
            current_page_section: section,
            current_page_category: category,
            last_page_visit: new Date().toISOString().replace('T', ' ').slice(0, 23)
        };
        
        // 특정 페이지 타입별 추가 정보
        if (path.includes('/form-')) {
            pageInfo.visited_conversion_page = true;
            pageInfo.conversion_page_type = path.includes('demo') ? 'demo_request' : 'contact_inquiry';
        }
        
        if (path.includes('/solution/')) {
            pageInfo.visited_solution_page = true;
            pageInfo.solution_interest = true;
        }
        
        if (path.includes('/user-case/')) {
            pageInfo.visited_case_study = true;
            pageInfo.case_study_interest = true;
        }
        
        this.safeTeCall('userSet', pageInfo);
    }
    
    // 페이지 콘텐츠 카테고리 분류 (ThinkingData 홈페이지 기준)
    categorizePageContent(path) {
        // 블로그 카테고리
        if (path.includes('/blog/')) {
            if (path.includes('feature') || path.includes('기능')) return 'feature';
            if (path.includes('industry') || path.includes('산업시리즈')) return 'industry';
            if (path.includes('playbook') || path.includes('플레이북')) return 'playbook';
            return 'analytics'; // 기본값
        }
        
        // 솔루션 페이지
        if (path.includes('/solution/')) {
            if (path.includes('game')) return 'game_solution';
            if (path.includes('ecommerce')) return 'ecommerce_solution';
            if (path.includes('media')) return 'media_solution';
            return 'solution';
        }
        
        // 기타 섹션
        if (path.includes('/user-case')) return 'user_case';
        if (path.includes('/company')) return 'company';
        if (path.includes('/culture')) return 'culture';
        if (path.includes('/news')) return 'news';
        if (path === '/' || path === '') return 'landing';
        
        return null;
    }
    
    // 페이지 섹션 감지
    getPageSection(path) {
        for (const [section, name] of Object.entries(this.sectionMapping)) {
            if (path.startsWith(section)) {
                return name;
            }
        }
        return 'other';
    }
    
    // 페이지 카테고리 분류
    getPageCategory(path) {
        if (path === '/' || path === '') return 'landing';
        if (path.includes('/blog') || path.includes('/user-case')) return 'content';
        if (path.includes('/company') || path.includes('/culture') || path.includes('/news')) return 'company';
        if (path.includes('/solution') || path.includes('/feature')) return 'product';
        if (path.includes('/form-')) return 'conversion';
        
        return 'other';
    }
    
    // 가장 많이 방문한 섹션 업데이트
    updateMostVisitedSection(sectionName) {
        this.attributes.section_visits = this.attributes.section_visits || {};
        this.attributes.section_visits[sectionName] = (this.attributes.section_visits[sectionName] || 0) + 1;
        
        // 가장 많이 방문한 섹션 찾기
        const mostVisited = Object.entries(this.attributes.section_visits)
            .sort(([,a], [,b]) => b - a)[0];
        
        if (mostVisited) {
            this.safeTeCall('userSet', { most_visited_section: mostVisited[0] });
            this.attributes.most_visited_section = mostVisited[0];
        }
    }
    
    // 폼 제출 추적
    trackFormSubmission() {
        this.safeTeCall('userAdd', { total_form_submissions: 1 });
        this.attributes.total_form_submissions = (this.attributes.total_form_submissions || 0) + 1;
        this.updateEngagementLevel();
        this.saveAttributes();
        console.log('📝 폼 제출 추적:', this.attributes.total_form_submissions);
    }
    
    // 다운로드 추적
    trackDownload() {
        this.safeTeCall('userAdd', { total_downloads: 1 });
        this.attributes.total_downloads = (this.attributes.total_downloads || 0) + 1;
        this.updateEngagementLevel();
        this.saveAttributes();
        console.log('📥 다운로드 추적:', this.attributes.total_downloads);
    }
    
    // 비디오 상호작용 추적
    trackVideoInteraction() {
        this.safeTeCall('userAdd', { total_video_interactions: 1 });
        this.attributes.total_video_interactions = (this.attributes.total_video_interactions || 0) + 1;
        this.updateEngagementLevel();
        this.saveAttributes();
        console.log('🎬 비디오 상호작용 추적:', this.attributes.total_video_interactions);
    }
    
    // 100% 스크롤 추적
    trackFullScroll() {
        this.safeTeCall('userAdd', { total_scroll_depth_100: 1 });
        this.attributes.total_scroll_depth_100 = (this.attributes.total_scroll_depth_100 || 0) + 1;
        this.updateContentPreference('deep');
        this.updateEngagementLevel();
        this.saveAttributes();
        console.log('📜 100% 스크롤 추적:', this.attributes.total_scroll_depth_100);
    }
    
    // 팝업 상호작용 추적
    trackPopupInteraction() {
        this.safeTeCall('userAdd', { popup_interactions: 1 });
        this.attributes.popup_interactions = (this.attributes.popup_interactions || 0) + 1;
        this.saveAttributes();
        console.log('🪟 팝업 상호작용 추적:', this.attributes.popup_interactions);
    }
    
    // 외부 링크 클릭 추적
    trackExternalLinkClick() {
        this.safeTeCall('userAdd', { external_link_clicks: 1 });
        this.attributes.external_link_clicks = (this.attributes.external_link_clicks || 0) + 1;
        this.saveAttributes();
        console.log('🔗 외부 링크 클릭 추적:', this.attributes.external_link_clicks);
    }
    
    // 시간 관련 속성 업데이트
    updateTimeAttributes() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.toLocaleDateString('en', {weekday: 'long'}).toLowerCase();
        
        // 선호 방문 시간대
        const timeOfDay = this.getTimeOfDay(hour);
        this.safeTeCall('userSet', { 
            preferred_visit_time: timeOfDay,
            last_visit_day_of_week: dayOfWeek 
        });
        
        this.attributes.preferred_visit_time = timeOfDay;
        this.attributes.last_visit_day_of_week = dayOfWeek;
    }
    
    // 시간대 분류
    getTimeOfDay(hour) {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }
    
    // 세션 종료 시 시간 지표 업데이트
    updateSessionTimeMetrics(sessionDuration) {
        // 총 체류시간 누적
        this.safeTeCall('userAdd', { total_time_spent: sessionDuration });
        this.attributes.total_time_spent = (this.attributes.total_time_spent || 0) + sessionDuration;
        
        // 최장 세션 기록 갱신
        const currentLongest = this.attributes.longest_session_duration || 0;
        if (sessionDuration > currentLongest) {
            this.safeTeCall('userSet', { longest_session_duration: sessionDuration });
            this.attributes.longest_session_duration = sessionDuration;
        }
        
        // 평균 세션 지속시간 계산
        const totalSessions = this.attributes.total_sessions || 1;
        const averageDuration = Math.round(this.attributes.total_time_spent / totalSessions);
        this.safeTeCall('userSet', { average_session_duration: averageDuration });
        this.attributes.average_session_duration = averageDuration;
        
        this.saveAttributes();
        console.log('⏱️ 세션 시간 지표 업데이트:', sessionDuration, '초');
    }
    
    // 참여도 수준 업데이트
    updateEngagementLevel() {
        let score = 0;
        
        // 행동별 점수 계산
        score += (this.attributes.total_form_submissions || 0) * 50;
        score += (this.attributes.total_downloads || 0) * 30;
        score += (this.attributes.total_video_interactions || 0) * 20;
        score += (this.attributes.total_scroll_depth_100 || 0) * 15;
        score += (this.attributes.popup_interactions || 0) * 10;
        score += (this.attributes.external_link_clicks || 0) * 5;
        
        // 세션 수와 체류시간 고려
        score += Math.min((this.attributes.total_sessions || 0) * 10, 100);
        score += Math.min((this.attributes.total_time_spent || 0) / 60, 200); // 분당 1점, 최대 200점
        
        // 참여도 수준 분류
        let level = 'low';
        if (score >= 200) level = 'high';
        else if (score >= 50) level = 'medium';
        
        this.safeTeCall('userSet', { 
            engagement_level: level,
            engagement_score: score 
        });
        
        this.attributes.engagement_level = level;
        this.attributes.engagement_score = score;
        
        // 생명주기 단계 업데이트
        this.updateLifecycleStage();
        console.log('📊 참여도 수준 업데이트:', level, '(', score, '점)');
    }
    
    // 콘텐츠 선호도 업데이트
    updateContentPreference(depth) {
        this.attributes.content_engagement = this.attributes.content_engagement || {};
        
        // 깊이별 선호도 누적
        this.attributes.content_engagement[depth] = (this.attributes.content_engagement[depth] || 0) + 1;
        
        // 가장 선호하는 깊이 찾기
        const preferences = Object.entries(this.attributes.content_engagement)
            .sort(([,a], [,b]) => b - a);
        
        if (preferences.length > 0) {
            this.safeTeCall('userSet', { content_depth_preference: preferences[0][0] });
            this.attributes.content_depth_preference = preferences[0][0];
        }
    }
    
    // 방문자 생명주기 단계 업데이트 (ThinkingData 홈페이지 기준)
    updateLifecycleStage() {
        const sessions = this.attributes.total_sessions || 0;
        const formSubmissions = this.attributes.total_form_submissions || 0;
        const downloads = this.attributes.total_downloads || 0;
        const companyViews = (this.attributes.section_visits && this.attributes.section_visits.company) || 0;
        const userCaseViews = (this.attributes.section_visits && this.attributes.section_visits.user_case) || 0;
        const solutionViews = (this.attributes.section_visits && this.attributes.section_visits.solution) || 0;
        
        let stage = 'awareness';
        
        // Decision: 폼 제출이나 회사 소개/고객사례/솔루션 페이지 여러 번 방문 (구매 검토 단계)
        if (formSubmissions > 0 || companyViews >= 2 || userCaseViews >= 2 || solutionViews >= 2) {
            stage = 'decision';
        }
        // Consideration: 세션 3회 이상 또는 다운로드 경험 또는 회사/고객사례/솔루션 방문
        else if (sessions >= 3 || downloads > 0 || companyViews > 0 || userCaseViews > 0 || solutionViews > 0) {
            stage = 'consideration';
        }
        
        this.safeTeCall('userSet', { visitor_lifecycle_stage: stage });
        this.attributes.visitor_lifecycle_stage = stage;
        console.log('🔄 생명주기 단계 업데이트:', stage);
    }
    
    // 상호작용 빈도 계산
    updateInteractionFrequency() {
        const totalInteractions = (this.attributes.total_form_submissions || 0) +
                                (this.attributes.total_downloads || 0) +
                                (this.attributes.total_video_interactions || 0) +
                                (this.attributes.popup_interactions || 0) +
                                (this.attributes.external_link_clicks || 0);
        
        const sessions = this.attributes.total_sessions || 1;
        const interactionRate = totalInteractions / sessions;
        
        let frequency = 'low';
        if (interactionRate >= 3) frequency = 'high';
        else if (interactionRate >= 1) frequency = 'medium';
        
        this.safeTeCall('userSet', { interaction_frequency: frequency });
        this.attributes.interaction_frequency = frequency;
    }
    
    // 페이지 체류 시간 추적 시작
    startPageEngagement() {
        this.pageStartTime = Date.now();
        
        // 10초 후 콘텐츠 선호도 'medium' 기록
        this.contentEngagementTimer = setTimeout(() => {
            this.updateContentPreference('medium');
        }, 10000);
    }
    
    // 페이지 체류 종료
    endPageEngagement() {
        const engagementTime = Date.now() - this.pageStartTime;
        
        // 타이머 정리
        if (this.contentEngagementTimer) {
            clearTimeout(this.contentEngagementTimer);
        }
        
        // 30초 이상 체류시 'surface' 선호도 기록
        if (engagementTime >= 30000) {
            this.updateContentPreference('surface');
        }
        
        return Math.round(engagementTime / 1000);
    }
    
    // 디버깅용 함수
    debugUserAttributes() {
        console.log('👤 유저 속성 디버깅 정보:');
        console.log('- 세션 수:', this.attributes.total_sessions);
        console.log('- 오늘 세션 수:', this.attributes.session_count_today);
        console.log('- 재방문자:', this.attributes.is_returning_visitor);
        console.log('- 참여도 수준:', this.attributes.engagement_level);
        console.log('- 생명주기 단계:', this.attributes.visitor_lifecycle_stage);
        console.log('- 폼 제출 수:', this.attributes.total_form_submissions);
        console.log('- 다운로드 수:', this.attributes.total_downloads);
        console.log('- 비디오 상호작용 수:', this.attributes.total_video_interactions);
        console.log('- 팝업 상호작용 수:', this.attributes.popup_interactions);
        console.log('- 외부 링크 클릭 수:', this.attributes.external_link_clicks);
        console.log('- 100% 스크롤 수:', this.attributes.total_scroll_depth_100);
        console.log('- 총 체류시간:', this.attributes.total_time_spent, '초');
        console.log('- ThinkingData SDK:', typeof window.te !== 'undefined' ? '로드됨' : '로드 안됨');
    }
}

// 전역 함수로 노출
window.initializeUserAttributeTracker = function() {
    console.log('👤 유저 속성 추적 시스템 시작...');
    
    // ThinkingData SDK 확인
    if (typeof window.te === 'undefined') {
        console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
        setTimeout(window.initializeUserAttributeTracker, 3000);
        return;
    }
    
    // 유저 속성 추적기 인스턴스 생성
    window.userTracker = new UserAttributeTracker();
    
    // 페이지 관심사 업데이트
    window.userTracker.updatePageInterests();
    window.userTracker.startPageEngagement();
    
    // 페이지 종료 시 세션 시간 업데이트
    window.addEventListener('beforeunload', function() {
        if (window.userTracker && window.userTracker.isInitialized) {
        const sessionDuration = Math.round((Date.now() - window.userTracker.sessionStartTime) / 1000);
        window.userTracker.updateSessionTimeMetrics(sessionDuration);
        
        const pageEngagement = window.userTracker.endPageEngagement();
            console.log('📊 페이지 체류 시간:', pageEngagement, '초');
        }
    });
    
    // 기존 이벤트 함수들에 유저 속성 추적 연동
    const originalTrackFormSubmission = window.trackFormSubmission || function() {};
    window.trackFormSubmission = function() {
        originalTrackFormSubmission();
        if (window.userTracker && window.userTracker.isInitialized) {
        window.userTracker.trackFormSubmission();
        }
    };
    
    const originalTrackDownload = window.trackDownload || function() {};
    window.trackDownload = function() {
        originalTrackDownload();
        if (window.userTracker && window.userTracker.isInitialized) {
        window.userTracker.trackDownload();
        }
    };
    
    const originalTrackFullScroll = window.trackFullScroll || function() {};
    window.trackFullScroll = function() {
        originalTrackFullScroll();
        if (window.userTracker && window.userTracker.isInitialized) {
        window.userTracker.trackFullScroll();
        }
    };
    
    // 스크롤 깊이 100% 도달 시 유저 속성 업데이트
    let originalScrollHandler = null;
    if (typeof window.handleScroll === 'function') {
        originalScrollHandler = window.handleScroll;
        window.handleScroll = function() {
            originalScrollHandler();
            
            // 100% 스크롤 체크
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
            );
            
            const scrollPercentage = Math.round(((scrollTop + windowHeight) / documentHeight) * 100);
            
            if (scrollPercentage >= 100 && !window.fullScrollTracked) {
                if (window.userTracker && window.userTracker.isInitialized) {
                window.userTracker.trackFullScroll();
                }
                window.fullScrollTracked = true;
            }
        };
    }
    
    // 팝업 상호작용 추적
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        // 외부 링크 클릭 감지
        if (target.closest('a')) {
            const link = target.closest('a');
            if (link.href && window.isExternalLink && window.isExternalLink(link.href)) {
                if (window.userTracker && window.userTracker.isInitialized) {
                window.userTracker.trackExternalLinkClick();
                }
            }
        }
        
        // 팝업 관련 클릭 감지
        if (target.classList.contains('close') || 
            target.classList.contains('modal-close') ||
            target.textContent.includes('혜택 확인하기')) {
            if (window.userTracker && window.userTracker.isInitialized) {
            window.userTracker.trackPopupInteraction();
            }
        }
    });
    
    // 페이지 변경 감지 (SPA 대응)
    let currentPath = window.location.pathname;
    setInterval(function() {
        if (window.location.pathname !== currentPath) {
            currentPath = window.location.pathname;
            if (window.userTracker && window.userTracker.isInitialized) {
            window.userTracker.updatePageInterests();
            window.userTracker.startPageEngagement();
            }
        }
    }, 1000);
    
    console.log('✅ 유저 속성 추적 시스템 초기화 완료');
};

// 디버깅용 전역 함수
window.debugUserAttributes = function() {
    if (window.userTracker && window.userTracker.isInitialized) {
        window.userTracker.debugUserAttributes();
    } else {
        console.warn('⚠️ 유저 속성 추적기가 초기화되지 않음');
    }
};

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('👤 DOM 로드 완료, 유저 속성 추적 시작');
        setTimeout(window.initializeUserAttributeTracker, 1000);
    });
} else {
    // DOM이 이미 로드된 경우
    console.log('👤 DOM 이미 로드됨, 유저 속성 추적 시작');
    setTimeout(window.initializeUserAttributeTracker, 1000);
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
    console.log('👤 ThinkingData 초기화 완료, 유저 속성 추적 시작');
    setTimeout(window.initializeUserAttributeTracker, 500);
});

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
    console.log('👤 페이지 로드 완료, 유저 속성 추적 재확인');
    setTimeout(window.initializeUserAttributeTracker, 2000);
});

// 10초 후 한 번 더 시도 (안전장치)
setTimeout(function() {
    if (typeof window.te !== 'undefined' && !window.userTracker) {
        console.log('👤 안전장치: 유저 속성 추적 재시도');
        window.initializeUserAttributeTracker();
    }
}, 10000); 