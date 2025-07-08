/**
 * 유저 속성 추적 시스템 - ThinkingData 홈페이지 최적화 (v2.0)
 * 사용자 행동 패턴, 생명주기, 참여도 등을 추적 (중복 전송 최소화)
 */

// 전역 초기화 플래그 (강화된 중복 방지)
if (window.userAttributeTrackerInitialized) {
    console.log('ℹ️ 유저 속성 추적 시스템이 이미 초기화됨');
    // 이미 초기화된 경우에도 인스턴스가 없으면 다시 생성
    if (!window.userTracker) {
        window.userTracker = new UserAttributeTracker();
    }
} else {
    window.userAttributeTrackerInitialized = true;

    // 유저 속성 관리 클래스
    class UserAttributeTracker {
        constructor() {
            console.log('👤 유저 속성 추적 시스템 초기화 시작... (v2.0 - 최적화됨)');
            
            // ThinkingData SDK 확인
            if (typeof window.te === 'undefined') {
                console.warn('⚠️ ThinkingData SDK가 로드되지 않음, 3초 후 재시도...');
                setTimeout(() => {
                    if (!window.userTracker) {
                        window.userTracker = new UserAttributeTracker();
                    }
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
            this.pendingUpdates = {}; // 배치 처리를 위한 대기 업데이트
            this.lastUpdateTime = 0; // 마지막 업데이트 시간
            this.batchTimer = null; // 배치 처리 타이머
            
            // 중복 방지를 위한 세션 키 생성 (더 강력한 중복 방지)
            this.sessionKey = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.initKey = `te_init_${this.sessionKey}`;
            
            // 이미 초기화된 세션인지 확인 (강화된 체크)
            if (localStorage.getItem(this.initKey)) {
                console.log('ℹ️ 이미 이 세션에서 초기화됨, 스킵');
                this.isInitialized = true;
                return;
            }
            
            // 전역 중복 방지 플래그 확인
            if (window.userTrackerSessionInitialized) {
                console.log('ℹ️ 다른 세션에서 이미 초기화됨, 스킵');
                this.isInitialized = true;
                return;
            }
            
            // 초기화 플래그 설정
            localStorage.setItem(this.initKey, 'true');
            window.userTrackerSessionInitialized = true;
            
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
        
        // 배치 처리를 위한 업데이트 대기
        queueUpdate(method, data) {
            if (!this.pendingUpdates[method]) {
                this.pendingUpdates[method] = [];
            }
            this.pendingUpdates[method].push(data);
            
            // 배치 처리 타이머 설정 (2초 후 자동 전송)
            if (this.batchTimer) {
                clearTimeout(this.batchTimer);
            }
            this.batchTimer = setTimeout(() => {
                this.flushUpdates();
            }, 2000);
        }
        
        // 대기 중인 업데이트 처리
        flushUpdates() {
            if (Object.keys(this.pendingUpdates).length === 0) return;
            
            Object.entries(this.pendingUpdates).forEach(([method, updates]) => {
                if (updates.length > 0) {
                    // userSet의 경우 마지막 값만 사용
                    if (method === 'userSet') {
                        const finalData = {};
                        updates.forEach(update => {
                            Object.assign(finalData, update);
                        });
                        if (Object.keys(finalData).length > 0) {
                            this.safeTeCall(method, finalData);
                            console.log('📦 배치 전송 (userSet):', Object.keys(finalData));
                        }
                    } else {
                        // userAdd, userUniqAppend 등은 개별 처리
                        updates.forEach(update => {
                            this.safeTeCall(method, update);
                        });
                        console.log(`📦 배치 전송 (${method}):`, updates.length, '개');
                    }
                }
            });
            this.pendingUpdates = {};
            
            if (this.batchTimer) {
                clearTimeout(this.batchTimer);
                this.batchTimer = null;
            }
        }
        
        // 즉시 전송이 필요한 경우 (중요한 이벤트)
        sendImmediate(method, data) {
            this.safeTeCall(method, data);
        }
        
        // 사용자 초기화 (대폭 최적화됨 - 중복 방지 강화)
        initializeUser() {
            // 이미 초기화된 경우 스킵
            if (this.isInitialized) {
                console.log('ℹ️ 이미 초기화됨, 스킵');
                return;
            }
            
            // 전역 중복 방지 플래그 확인
            if (window.userAttributeInitialized) {
                console.log('ℹ️ 다른 인스턴스에서 이미 초기화됨, 스킵');
                this.isInitialized = true;
                return;
            }
            
            const now = Date.now();
            const today = new Date().toISOString().split('T')[0];
            
            console.log('👤 유저 속성 초기화 시작...');
            
            // 전역 플래그 설정
            window.userAttributeInitialized = true;
            this.isInitialized = true;
            
            // 1. 최초 방문 시점 기록 (한 번만)
            if (!this.attributes.first_visit_timestamp) {
                this.sendImmediate('userSetOnce', { 
                    first_visit_timestamp: new Date(now).toISOString().replace('T', ' ').slice(0, 23) 
                });
                this.attributes.first_visit_timestamp = now;
            }
            
            // 2. 세션 수 증가 (즉시 전송) - 중복 방지
            if (!this.attributes.session_incremented) {
                this.sendImmediate('userAdd', { total_sessions: 1 });
                this.attributes.total_sessions = (this.attributes.total_sessions || 0) + 1;
                this.attributes.session_incremented = true;
            }
            
            // 3. 오늘 세션 수 (날짜가 바뀌면 리셋)
            const lastVisitDate = this.attributes.last_visit_date;
            if (lastVisitDate !== today) {
                this.sendImmediate('userSet', { session_count_today: 1 });
                this.attributes.session_count_today = 1;
                this.attributes.last_visit_date = today;
            } else {
                this.sendImmediate('userAdd', { session_count_today: 1 });
                this.attributes.session_count_today = (this.attributes.session_count_today || 0) + 1;
            }
            
            // 4. 재방문자 체크 (2번째 세션부터)
            if (this.attributes.total_sessions >= 2) {
                this.sendImmediate('userSet', { is_returning_visitor: true });
                this.attributes.is_returning_visitor = true;
            }
            
            // 5. 최초 유입 정보 기록 (한 번만)
            this.recordFirstVisitSource();
            
            // 6. 기본 시간 정보 업데이트
            this.updateTimeAttributes();
            
            this.saveAttributes();
            console.log('✅ 유저 속성 초기화 완료:', this.attributes);
        }
        
        // ThinkingData 홈페이지 특화 속성 설정 (최적화됨)
        setThinkingDataSpecificAttributes() {
            const path = window.location.pathname;
            const pageSection = this.getPageSection(path);
            const pageCategory = this.getPageCategory(path);
            
            // 변경된 경우만 업데이트
            const currentSection = this.attributes.current_page_section;
            const currentCategory = this.attributes.current_page_category;
            
            const updates = {};
            
            if (currentSection !== pageSection) {
                updates.current_page_section = pageSection;
            }
            if (currentCategory !== pageCategory) {
                updates.current_page_category = pageCategory;
            }
            
            // 기본 정보는 한 번만 설정
            if (!this.attributes.website_domain) {
                updates.website_domain = 'thinkingdata.kr';
                updates.is_thinkingdata_website = true;
            }
            
            // ThinkingData 특화 관심사 설정 (한 번만 설정)
            if (pageSection === 'home' && !this.attributes.interested_in_data_analytics) {
                updates.interested_in_data_analytics = true;
                updates.potential_customer = true;
            }
            
            if ((pageSection === 'solution' || pageSection === 'feature') && !this.attributes.interested_in_solutions) {
                updates.interested_in_solutions = true;
                updates.solution_researcher = true;
            }
            
            if (pageSection === 'user_case' && !this.attributes.interested_in_case_studies) {
                updates.interested_in_case_studies = true;
                updates.case_study_researcher = true;
            }
            
            // 변경사항이 있는 경우만 큐에 추가
            if (Object.keys(updates).length > 0) {
                this.queueUpdate('userSet', updates);
                Object.assign(this.attributes, updates);
            }
        }
        
        // 최초 유입 소스 기록
        recordFirstVisitSource() {
            // 이미 기록된 경우 스킵
            if (this.attributes.first_utm_source !== undefined) {
                return;
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const utmSource = urlParams.get('utm_source') || this.inferTrafficSource();
            const utmCampaign = urlParams.get('utm_campaign') || '';
            const referrerDomain = document.referrer ? new URL(document.referrer).hostname : 'direct';
            
            // 최초 방문 시에만 기록 (즉시 전송)
            this.sendImmediate('userSetOnce', {
                first_utm_source: utmSource,
                first_utm_campaign: utmCampaign,
                first_referrer_domain: referrerDomain
            });
            
            // 사용한 유입 소스 누적 (중복 제거)
            this.sendImmediate('userUniqAppend', {
                traffic_sources_used: [utmSource]
            });
            
            // 로컬에도 저장
            this.attributes.first_utm_source = utmSource;
            this.attributes.first_utm_campaign = utmCampaign;
            this.attributes.first_referrer_domain = referrerDomain;
            
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
            
            return 'referral';
        }
        
        // 페이지 관심사 업데이트 (최적화됨)
        updatePageInterests() {
            const currentPath = window.location.pathname;
            const pageCategory = this.categorizePageContent(currentPath);
            const sectionName = this.getPageSection(currentPath);
            
            console.log('📊 페이지 관심사 업데이트:', { currentPath, pageCategory, sectionName });
            
            // 관심 주제 추가 (중복 방지)
            if (pageCategory) {
                this.attributes.interested_topics = this.attributes.interested_topics || [];
                if (!this.attributes.interested_topics.includes(pageCategory)) {
                    this.queueUpdate('userUniqAppend', { 
                        interested_topics: [pageCategory] 
                    });
                    this.attributes.interested_topics.push(pageCategory);
                }
            }
            
            // 최근 방문 페이지 추가 (최대 20개 유지)
            this.attributes.viewed_pages = this.attributes.viewed_pages || [];
            
            // 중복 방지: 같은 페이지가 맨 앞에 있으면 스킵
            if (this.attributes.viewed_pages[0] !== currentPath) {
                this.attributes.viewed_pages.unshift(currentPath);
                if (this.attributes.viewed_pages.length > 20) {
                    this.attributes.viewed_pages = this.attributes.viewed_pages.slice(0, 20);
                }
                
                this.queueUpdate('userSet', { 
                    viewed_pages: this.attributes.viewed_pages.slice(0, 10)
                });
            }
            
            // 가장 많이 방문한 섹션 업데이트
            if (sectionName) {
                this.updateMostVisitedSection(sectionName);
            }
            
            // ThinkingData 특화 페이지 정보 업데이트
            this.updateThinkingDataPageInfo(currentPath, pageCategory, sectionName);
            
            this.saveAttributes();
        }
        
        // ThinkingData 특화 페이지 정보 업데이트 (최적화됨)
        updateThinkingDataPageInfo(path, category, section) {
            const now = Date.now(); // 숫자 형식으로 수정
            const updates = {};
            
            // 변경된 경우만 업데이트
            if (this.attributes.current_page_section !== section) {
                updates.current_page_section = section;
            }
            if (this.attributes.current_page_category !== category) {
                updates.current_page_category = category;
            }
            
            // 마지막 방문 시간 업데이트 (5분 이상 차이날 때만)
            const lastVisit = this.attributes.last_page_visit || 0;
            if (now - lastVisit > 300000) { // 5분 = 300000ms
                updates.last_page_visit = now;
            }
            
            // 특정 페이지 타입별 추가 정보 (한 번만 설정)
            if (path.includes('/form-') && !this.attributes.visited_conversion_page) {
                updates.visited_conversion_page = true;
                updates.conversion_page_type = path.includes('demo') ? 'demo_request' : 'contact_inquiry';
            }
            
            if (path.includes('/solution/') && !this.attributes.visited_solution_page) {
                updates.visited_solution_page = true;
                updates.solution_interest = true;
            }
            
            if (path.includes('/user-case/') && !this.attributes.visited_case_study) {
                updates.visited_case_study = true;
                updates.case_study_interest = true;
            }
            
            // 변경사항이 있는 경우만 큐에 추가
            if (Object.keys(updates).length > 0) {
                this.queueUpdate('userSet', updates);
                Object.assign(this.attributes, updates);
            }
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
        
        // 가장 많이 방문한 섹션 업데이트 (최적화됨)
        updateMostVisitedSection(sectionName) {
            this.attributes.section_visits = this.attributes.section_visits || {};
            this.attributes.section_visits[sectionName] = (this.attributes.section_visits[sectionName] || 0) + 1;
            
            // 가장 많이 방문한 섹션 찾기
            const mostVisited = Object.entries(this.attributes.section_visits)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (mostVisited && this.attributes.most_visited_section !== mostVisited[0]) {
                this.queueUpdate('userSet', { most_visited_section: mostVisited[0] });
                this.attributes.most_visited_section = mostVisited[0];
            }
        }
        
        // 폼 제출 추적
        trackFormSubmission() {
            this.sendImmediate('userAdd', { total_form_submissions: 1 });
            this.attributes.total_form_submissions = (this.attributes.total_form_submissions || 0) + 1;
            this.updateEngagementLevel();
            this.saveAttributes();
            console.log('📝 폼 제출 추적:', this.attributes.total_form_submissions);
        }
        
        // 다운로드 추적
        trackDownload() {
            this.sendImmediate('userAdd', { total_downloads: 1 });
            this.attributes.total_downloads = (this.attributes.total_downloads || 0) + 1;
            this.updateEngagementLevel();
            this.saveAttributes();
            console.log('📥 다운로드 추적:', this.attributes.total_downloads);
        }
        
        // 비디오 상호작용 추적
        trackVideoInteraction() {
            this.sendImmediate('userAdd', { total_video_interactions: 1 });
            this.attributes.total_video_interactions = (this.attributes.total_video_interactions || 0) + 1;
            this.updateEngagementLevel();
            this.saveAttributes();
            console.log('🎬 비디오 상호작용 추적:', this.attributes.total_video_interactions);
        }
        
        // 100% 스크롤 추적
        trackFullScroll() {
            this.sendImmediate('userAdd', { total_scroll_depth_100: 1 });
            this.attributes.total_scroll_depth_100 = (this.attributes.total_scroll_depth_100 || 0) + 1;
            this.updateContentPreference('deep');
            this.updateEngagementLevel();
            this.saveAttributes();
            console.log('📜 100% 스크롤 추적:', this.attributes.total_scroll_depth_100);
        }
        
        // 팝업 상호작용 추적
        trackPopupInteraction() {
            this.queueUpdate('userAdd', { popup_interactions: 1 });
            this.attributes.popup_interactions = (this.attributes.popup_interactions || 0) + 1;
            this.saveAttributes();
            console.log('🪟 팝업 상호작용 추적:', this.attributes.popup_interactions);
        }
        
        // 외부 링크 클릭 추적
        trackExternalLinkClick() {
            this.queueUpdate('userAdd', { external_link_clicks: 1 });
            this.attributes.external_link_clicks = (this.attributes.external_link_clicks || 0) + 1;
            this.saveAttributes();
            console.log('🔗 외부 링크 클릭 추적:', this.attributes.external_link_clicks);
        }
        
        // 시간 관련 속성 업데이트 (최적화됨)
        updateTimeAttributes() {
            console.log('🕐 updateTimeAttributes 시작');
            
            const now = new Date();
            const hour = now.getHours();
            
            console.log('🕐 weekday 옵션 테스트 시작');
            const dayOfWeek = now.toLocaleDateString('en', {weekday: 'long'}).toLowerCase();
            console.log('🕐 weekday 처리 완료:', dayOfWeek);
            
            // 선호 방문 시간대
            const timeOfDay = this.getTimeOfDay(hour);
            
            // 변경된 경우만 업데이트
            const updates = {};
            if (this.attributes.preferred_visit_time !== timeOfDay) {
                updates.preferred_visit_time = timeOfDay;
            }
            if (this.attributes.last_visit_day_of_week !== dayOfWeek) {
                updates.last_visit_day_of_week = dayOfWeek;
            }
            
            // 변경사항이 있는 경우만 큐에 추가
            if (Object.keys(updates).length > 0) {
                this.queueUpdate('userSet', updates);
                Object.assign(this.attributes, updates);
            }
            
            console.log('🕐 updateTimeAttributes 완료');
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
            this.sendImmediate('userAdd', { total_time_spent: sessionDuration });
            this.attributes.total_time_spent = (this.attributes.total_time_spent || 0) + sessionDuration;
            
            // 최장 세션 기록 갱신
            const currentLongest = this.attributes.longest_session_duration || 0;
            if (sessionDuration > currentLongest) {
                this.queueUpdate('userSet', { longest_session_duration: sessionDuration });
                this.attributes.longest_session_duration = sessionDuration;
            }
            
            // 평균 세션 지속시간 계산
            const totalSessions = this.attributes.total_sessions || 1;
            const averageDuration = Math.round(this.attributes.total_time_spent / totalSessions);
            this.queueUpdate('userSet', { average_session_duration: averageDuration });
            this.attributes.average_session_duration = averageDuration;
            
            // 즉시 전송
            this.flushUpdates();
            this.saveAttributes();
        }
        
        // 🚀 최적화된 참여도 수준 업데이트 (중복 방지)
        updateEngagementLevel() {
            // 최근 10초 이내 업데이트 방지
            const now = Date.now();
            const lastUpdate = this.lastUpdates?.get('engagement_level') || 0;
            
            if (now - lastUpdate < 10000) {
                console.log(`📊 참여도 업데이트 중복 방지 (${Math.round((now - lastUpdate)/1000)}초 전에 업데이트됨)`);
                return;
            }
            
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
            
            // 실제로 변경된 경우만 업데이트
            if (this.attributes.engagement_level !== level || this.attributes.engagement_score !== score) {
                this.queueUpdate('userSet', { 
                    engagement_level: level,
                    engagement_score: score 
                });
                
                this.attributes.engagement_level = level;
                this.attributes.engagement_score = score;
                
                // 업데이트 시간 기록
                this.lastUpdates = this.lastUpdates || new Map();
                this.lastUpdates.set('engagement_level', now);
                
                console.log(`📊 참여도 수준 업데이트: ${level} (점수: ${score})`);
                
                // 생명주기 단계 업데이트
                this.updateLifecycleStage();
            } else {
                console.log(`📊 참여도 수준 변화 없음: ${level} (점수: ${score})`);
            }
        }
        
        // 🚀 최적화된 콘텐츠 선호도 업데이트 (중복 방지)
        updateContentPreference(depth) {
            this.attributes.content_engagement = this.attributes.content_engagement || {};
            
            // 이미 같은 깊이가 기록된 최근 5초 이내인지 확인 (중복 방지)
            const now = Date.now();
            const lastUpdateKey = `content_pref_${depth}`;
            const lastUpdate = this.lastUpdates?.get(lastUpdateKey) || 0;
            
            if (now - lastUpdate < 5000) {
                console.log(`📊 콘텐츠 선호도 중복 방지: ${depth} (${Math.round((now - lastUpdate)/1000)}초 전에 업데이트됨)`);
                return;
            }
            
            // 깊이별 선호도 누적
            this.attributes.content_engagement[depth] = (this.attributes.content_engagement[depth] || 0) + 1;
            
            // 가장 선호하는 깊이 찾기
            const preferences = Object.entries(this.attributes.content_engagement)
                .sort(([,a], [,b]) => b - a);
            
            // 실제로 선호도가 변경된 경우만 업데이트
            if (preferences.length > 0) {
                const newPreference = preferences[0][0];
                if (this.attributes.content_depth_preference !== newPreference) {
                    this.queueUpdate('userSet', { content_depth_preference: newPreference });
                    this.attributes.content_depth_preference = newPreference;
                    
                    // 업데이트 시간 기록
                    this.lastUpdates = this.lastUpdates || new Map();
                    this.lastUpdates.set(lastUpdateKey, now);
                    
                    console.log(`📊 콘텐츠 선호도 업데이트: ${depth} → ${newPreference}`);
                } else {
                    console.log(`📊 콘텐츠 선호도 변화 없음: ${newPreference} (기록만 누적)`);
                }
            }
        }
        
        // 방문자 생명주기 단계 업데이트 (ThinkingData 홈페이지 기준)
        updateLifecycleStage() {
            const sessions = this.attributes.total_sessions || 0;
            const formSubmissions = this.attributes.total_form_submissions || 0;
            const downloads = this.attributes.total_downloads || 0;
            const companyViews = (this.attributes.section_visits && this.attributes.section_visits.company) || 0;
            const userCaseViews = (this.attributes.section_visits && this.attributes.section_visits.user_case) || 0;
            
            let stage = 'awareness';
            
            // Decision: 폼 제출이나 회사 소개/고객사례 페이지 여러 번 방문 (구매 검토 단계)
            if (formSubmissions > 0 || companyViews >= 2 || userCaseViews >= 2) {
                stage = 'decision';
            }
            // Consideration: 세션 3회 이상 또는 다운로드 경험 또는 회사/고객사례 방문
            else if (sessions >= 3 || downloads > 0 || companyViews > 0 || userCaseViews > 0) {
                stage = 'consideration';
            }
            
            // 변경된 경우만 업데이트
            if (this.attributes.visitor_lifecycle_stage !== stage) {
                this.queueUpdate('userSet', { visitor_lifecycle_stage: stage });
                this.attributes.visitor_lifecycle_stage = stage;
            }
        }
        
        // 🚀 최적화된 상호작용 빈도 계산 (중복 방지)
        updateInteractionFrequency() {
            // 최근 15초 이내 업데이트 방지
            const now = Date.now();
            const lastUpdate = this.lastUpdates?.get('interaction_frequency') || 0;
            
            if (now - lastUpdate < 15000) {
                console.log(`📊 상호작용 빈도 중복 방지 (${Math.round((now - lastUpdate)/1000)}초 전에 업데이트됨)`);
                return;
            }
            
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
            
            // 실제로 변경된 경우만 업데이트
            if (this.attributes.interaction_frequency !== frequency) {
                this.queueUpdate('userSet', { interaction_frequency: frequency });
                this.attributes.interaction_frequency = frequency;
                
                // 업데이트 시간 기록
                this.lastUpdates = this.lastUpdates || new Map();
                this.lastUpdates.set('interaction_frequency', now);
                
                console.log(`📊 상호작용 빈도 업데이트: ${frequency} (비율: ${interactionRate.toFixed(2)})`);
            } else {
                console.log(`📊 상호작용 빈도 변화 없음: ${frequency} (비율: ${interactionRate.toFixed(2)})`);
            }
        }
        
        // 🚀 최적화된 페이지 체류 시간 추적 시작 (중복 방지)
        startPageEngagement() {
            // 이미 추적 중인 경우 무시
            if (this.pageStartTime && this.contentEngagementTimer) {
                console.log('📊 페이지 참여 추적이 이미 진행 중입니다.');
                return;
            }
            
            this.pageStartTime = Date.now();
            
            // 10초 후 콘텐츠 선호도 'medium' 기록 (한 번만)
            this.contentEngagementTimer = setTimeout(() => {
                this.updateContentPreference('medium');
                this.contentEngagementTimer = null; // 타이머 완료 표시
            }, 10000);
            
            console.log('📊 페이지 참여 추적 시작');
        }
        
        // 🚀 최적화된 페이지 체류 종료 (중복 방지)
        endPageEngagement() {
            if (!this.pageStartTime) {
                console.log('📊 페이지 참여 추적이 시작되지 않았습니다.');
                return 0;
            }
            
            const engagementTime = Date.now() - this.pageStartTime;
            
            // 타이머 정리
            if (this.contentEngagementTimer) {
                clearTimeout(this.contentEngagementTimer);
                this.contentEngagementTimer = null;
            }
            
            // 30초 이상 체류시 'surface' 선호도 기록 (중복 방지 내장)
            if (engagementTime >= 30000) {
                this.updateContentPreference('surface');
            }
            
            // 추적 상태 초기화
            this.pageStartTime = null;
            
            // 남은 배치 업데이트 전송
            this.flushUpdates();
            
            const seconds = Math.round(engagementTime / 1000);
            console.log(`📊 페이지 참여 추적 종료: ${seconds}초`);
            return seconds;
        }
        
        // 디버깅용 유저 속성 출력
        debugUserAttributes() {
            console.log('🔍 현재 유저 속성:', this.attributes);
            console.log('📦 대기 중인 업데이트:', this.pendingUpdates);
        }
    }

    // 유저 속성 추적기 인스턴스 생성
    window.userTracker = new UserAttributeTracker();

    // 기존 이벤트 핸들러에 유저 속성 추적 추가
    document.addEventListener('DOMContentLoaded', function() {
        if (window.userTracker && !window.userTracker.isInitialized) {
            // 페이지 관심사 업데이트
            window.userTracker.updatePageInterests();
            window.userTracker.startPageEngagement();
        }
    });

    // 페이지 종료 시 세션 시간 업데이트
    window.addEventListener('beforeunload', function() {
        if (window.userTracker) {
            const sessionDuration = Math.round((Date.now() - window.userTracker.sessionStartTime) / 1000);
            window.userTracker.updateSessionTimeMetrics(sessionDuration);
            
            const pageEngagement = window.userTracker.endPageEngagement();
            console.log('📊 Page engagement time:', pageEngagement, 'seconds');
        }
    });

    // 기존 이벤트 함수들에 유저 속성 추적 연동
    const originalTrackFormSubmission = window.trackFormSubmission || function() {};
    window.trackFormSubmission = function() {
        originalTrackFormSubmission();
        if (window.userTracker) {
            window.userTracker.trackFormSubmission();
        }
    };

    const originalTrackDownload = window.trackDownload || function() {};
    window.trackDownload = function() {
        originalTrackDownload();
        if (window.userTracker) {
            window.userTracker.trackDownload();
        }
    };

    const originalTrackFullScroll = window.trackFullScroll || function() {};
    window.trackFullScroll = function() {
        originalTrackFullScroll();
        if (window.userTracker) {
            window.userTracker.trackFullScroll();
        }
    };

    // 비디오 이벤트에 유저 속성 추적 연동
    const originalVideoEventHandlers = {
        onPlay: function() { 
            if (window.userTracker) window.userTracker.trackVideoInteraction(); 
        },
        onComplete: function() { 
            if (window.userTracker) window.userTracker.trackVideoInteraction(); 
        }
    };

    // 스크롤 깊이 100% 도달 시 유저 속성 업데이트
    let originalScrollHandler = null;
    if (typeof handleScroll === 'function') {
        originalScrollHandler = handleScroll;
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
                if (window.userTracker) {
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
            if (link.href && isExternalLink(link.href)) {
                if (window.userTracker) {
                    window.userTracker.trackExternalLinkClick();
                }
            }
        }
        
        // 팝업 관련 클릭 감지
        if (target.classList.contains('close') || 
            target.classList.contains('modal-close') ||
            target.textContent.includes('혜택 확인하기')) {
            if (window.userTracker) {
                window.userTracker.trackPopupInteraction();
            }
        }
    });

    // 외부 링크 판단 함수
    function isExternalLink(url) {
        try {
            const linkHost = new URL(url).hostname;
            const currentHost = window.location.hostname;
            return linkHost !== currentHost;
        } catch (e) {
            return false;
        }
    }

    // 페이지 변경 감지 (SPA 대응)
    let currentPath = window.location.pathname;
    setInterval(function() {
        if (window.location.pathname !== currentPath) {
            currentPath = window.location.pathname;
            if (window.userTracker) {
                window.userTracker.updatePageInterests();
                window.userTracker.startPageEngagement();
            }
        }
    }, 1000);

    console.log('✅ User Attribute Tracking System initialized (v2.0 - 최적화됨)');
}

// 디버깅용 전역 함수
window.debugUserAttributes = function() {
    if (window.userTracker && window.userTracker.isInitialized) {
        window.userTracker.debugUserAttributes();
    } else {
        console.warn('⚠️ 유저 속성 추적기가 초기화되지 않음');
    }
};

// 수동 배치 전송 함수
window.flushUserAttributes = function() {
    if (window.userTracker) {
        window.userTracker.flushUpdates();
        console.log('📦 유저 속성 배치 전송 완료');
    }
};

// DOM 로드 완료 후 자동 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('👤 DOM 로드 완료, 유저 속성 추적 시작');
        if (!window.userTracker) {
            window.userTracker = new UserAttributeTracker();
        }
    });
} else {
    // DOM이 이미 로드된 경우
    console.log('👤 DOM 이미 로드됨, 유저 속성 추적 시작');
    if (!window.userTracker) {
        window.userTracker = new UserAttributeTracker();
    }
}

// ThinkingData 초기화 완료 이벤트 감지
window.addEventListener('thinkingdata:ready', function() {
    console.log('👤 ThinkingData 초기화 완료, 유저 속성 추적 시작');
    if (!window.userTracker) {
        window.userTracker = new UserAttributeTracker();
    }
});

// 페이지 로드 완료 후 한 번 더 시도
window.addEventListener('load', function() {
    console.log('👤 페이지 로드 완료, 유저 속성 추적 재확인');
    if (!window.userTracker) {
        window.userTracker = new UserAttributeTracker();
    }
});

// 전역 초기화 함수 (모듈 시스템과 연동) - 중복 방지 강화
window.initializeUserAttributeTracker = function() {
  // 중복 초기화 방지 (강화된 체크)
  if (window.userAttributeTrackingInitialized) {
    console.log('ℹ️ 유저 속성 추적이 이미 초기화됨');
    return;
  }
  
  // 전역 중복 방지 플래그 확인
  if (window.userAttributeInitialized) {
    console.log('ℹ️ 다른 인스턴스에서 이미 초기화됨');
    return;
  }
  
  // 5초 내 재실행 방지
  const now = Date.now();
  if (window.userAttributeLastInitTime && (now - window.userAttributeLastInitTime) < 5000) {
    console.log('ℹ️ 유저 속성 추적이 최근에 초기화됨, 스킵');
    return;
  }
  
  console.log('👤 유저 속성 추적 시스템 시작...');
  
  // 초기화 플래그 설정
  window.userAttributeTrackingInitialized = true;
  window.userAttributeLastInitTime = now;
  
  // 유저 속성 추적기 인스턴스 생성 (중복 방지)
  if (!window.userTracker) {
    window.userTracker = new UserAttributeTracker();
  } else {
    console.log('ℹ️ 유저 속성 추적기 인스턴스가 이미 존재함');
  }
  
  // 초기화 완료 이벤트 발생
  window.dispatchEvent(new CustomEvent('userAttributeTracker:ready'));
}; 