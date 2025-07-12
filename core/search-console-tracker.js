import GoogleSearchConsoleAPI from '../google-search-console.js';
import ThinkingDataNode from './thinking-data-node.js';

/**
 * Google Search Console 데이터를 ThinkingData 이벤트로 변환하는 클래스
 */
class SearchConsoleTracker {
    constructor(config) {
        this.searchConsoleAPI = new GoogleSearchConsoleAPI(
            config.credentialsPath,
            config.siteUrl
        );
        this.thinkingData = new ThinkingDataNode(config.thinkingData);
        this.isInitialized = false;
        this.ready = this.initialize();
    }

    /**
     * 초기화
     */
    async initialize() {
        try {
            // Search Console API 연결 확인
            const siteInfo = await this.searchConsoleAPI.verifySiteOwnership();
            if (!siteInfo) {
                throw new Error('Search Console API 연결 실패');
            }

            // ThinkingData API 연결 테스트
            console.log('🧪 ThinkingData API 연결 테스트 중...');
            const teConnectionTest = await this.thinkingData.testConnection();
            if (!teConnectionTest) {
                console.warn('⚠️ ThinkingData API 연결 테스트 실패 - 데이터 전송에 문제가 있을 수 있습니다.');
            }

            this.isInitialized = true;
            console.log('✅ SearchConsoleTracker 초기화 완료');
        } catch (error) {
            console.error('❌ SearchConsoleTracker 초기화 실패:', error);
            throw error;
        }
    }

    /**
     * 검색 성과 데이터를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
     * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
     */
    async trackSearchPerformance(startDate, endDate) {
        await this.ready;
        
        try {
            // 검색 분석 데이터 조회
            const searchData = await this.searchConsoleAPI.getSearchAnalytics(
                startDate, 
                endDate, 
                ['query', 'page', 'country', 'device'], 
                1000
            );

            if (!searchData || !searchData.rows) {
                console.log('📊 조회 기간에 검색 데이터가 없습니다.');
                return;
            }

            console.log(`📊 ${searchData.rows.length}개의 검색 데이터를 ThinkingData로 전송 중...`);

            // 각 행을 개별 이벤트로 전송
            for (const row of searchData.rows) {
                await this.sendSearchEvent(row, startDate, endDate);
            }

            // 남은 버퍼 데이터 전송
            await this.thinkingData.flush();

            console.log('✅ 검색 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 검색 성과 데이터 전송 실패:', error);
        }
    }

    /**
     * 개별 검색 이벤트를 ThinkingData로 전송
     * @param {Object} row - 검색 데이터 행
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async sendSearchEvent(row, startDate, endDate) {
        const eventData = {
            // 기본 검색 정보
            search_query: row.keys[0] || 'unknown',
            page_url: row.keys[1] || 'unknown',
            country: row.keys[2] || 'unknown',
            device: row.keys[3] || 'unknown',
            
            // 성과 지표
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: row.ctr || 0,
            position: row.position || 0,
            
            // 분석 기간
            analysis_start_date: startDate,
            analysis_end_date: endDate,
            
            // 추가 메타데이터
            data_source: 'google_search_console',
            event_category: 'search_performance_v2',
            timestamp: new Date().toISOString()
        };

        // ThinkingData 이벤트 전송
        await this.thinkingData.track('search_performance_v2', eventData);
    }

    /**
     * 키워드별 성과를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackKeywordPerformance(startDate, endDate) {
        await this.ready;
        
        try {
            const keywordData = await this.searchConsoleAPI.getTopQueries(startDate, endDate, 100);
            
            if (!keywordData || !keywordData.rows) {
                console.log('📊 조회 기간에 키워드 데이터가 없습니다.');
                return;
            }

            console.log(`🔍 ${keywordData.rows.length}개의 키워드 데이터를 ThinkingData로 전송 중...`);

            for (const row of keywordData.rows) {
                const eventData = {
                    keyword: row.keys[0] || 'unknown',
                    clicks: row.clicks || 0,
                    impressions: row.impressions || 0,
                    ctr: row.ctr || 0,
                    position: row.position || 0,
                    analysis_start_date: startDate,
                    analysis_end_date: endDate,
                    data_source: 'google_search_console',
                    event_category: 'keyword_performance_v2',
                    timestamp: new Date().toISOString()
                };

                await this.thinkingData.track('keyword_performance_v2', eventData);
            }

            await this.thinkingData.flush();
            console.log('✅ 키워드 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 키워드 성과 데이터 전송 실패:', error);
        }
    }

    /**
     * 페이지별 성과를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackPagePerformance(startDate, endDate) {
        await this.ready;
        
        try {
            const pageData = await this.searchConsoleAPI.getTopPages(startDate, endDate, 100);
            
            if (!pageData || !pageData.rows) {
                console.log('📊 조회 기간에 페이지 데이터가 없습니다.');
                return;
            }

            console.log(`📄 ${pageData.rows.length}개의 페이지 데이터를 ThinkingData로 전송 중...`);

            for (const row of pageData.rows) {
                const eventData = {
                    page_url: row.keys[0] || 'unknown',
                    clicks: row.clicks || 0,
                    impressions: row.impressions || 0,
                    ctr: row.ctr || 0,
                    position: row.position || 0,
                    analysis_start_date: startDate,
                    analysis_end_date: endDate,
                    data_source: 'google_search_console',
                    event_category: 'page_performance_v2',
                    timestamp: new Date().toISOString()
                };

                await this.thinkingData.track('page_performance_v2', eventData);
            }

            await this.thinkingData.flush();
            console.log('✅ 페이지 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 페이지 성과 데이터 전송 실패:', error);
        }
    }

    /**
     * 지역별 성과를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackCountryPerformance(startDate, endDate) {
        await this.ready;
        
        try {
            const countryData = await this.searchConsoleAPI.getCountryPerformance(startDate, endDate);
            
            if (!countryData || !countryData.rows) {
                console.log('📊 조회 기간에 지역 데이터가 없습니다.');
                return;
            }

            console.log(`🌍 ${countryData.rows.length}개의 지역 데이터를 ThinkingData로 전송 중...`);

            for (const row of countryData.rows) {
                const eventData = {
                    country: row.keys[0] || 'unknown',
                    clicks: row.clicks || 0,
                    impressions: row.impressions || 0,
                    ctr: row.ctr || 0,
                    position: row.position || 0,
                    analysis_start_date: startDate,
                    analysis_end_date: endDate,
                    data_source: 'google_search_console',
                    event_category: 'country_performance_v2',
                    timestamp: new Date().toISOString()
                };

                await this.thinkingData.track('country_performance_v2', eventData);
            }

            await this.thinkingData.flush();
            console.log('✅ 지역별 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 지역별 성과 데이터 전송 실패:', error);
        }
    }

    /**
     * 디바이스별 성과를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackDevicePerformance(startDate, endDate) {
        await this.ready;
        
        try {
            const deviceData = await this.searchConsoleAPI.getDevicePerformance(startDate, endDate);
            
            if (!deviceData || !deviceData.rows) {
                console.log('📊 조회 기간에 디바이스별 데이터가 없습니다.');
                return;
            }

            console.log(`📱 ${deviceData.rows.length}개의 디바이스별 데이터를 ThinkingData로 전송 중...`);

            for (const row of deviceData.rows) {
                const eventData = {
                    device: row.keys[0] || 'unknown',
                    clicks: row.clicks || 0,
                    impressions: row.impressions || 0,
                    ctr: row.ctr || 0,
                    position: row.position || 0,
                    analysis_start_date: startDate,
                    analysis_end_date: endDate,
                    data_source: 'google_search_console',
                    event_category: 'device_performance_v2',
                    timestamp: new Date().toISOString()
                };

                await this.thinkingData.track('device_performance_v2', eventData);
            }

            await this.thinkingData.flush();
            console.log('✅ 디바이스별 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 디바이스별 성과 데이터 전송 실패:', error);
        }
    }

    /**
     * 모든 검색 성과 데이터를 한 번에 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackAllPerformance(startDate, endDate) {
        console.log('🚀 모든 검색 성과 데이터 전송 시작...');
        
        try {
            await Promise.all([
                this.trackSearchPerformance(startDate, endDate),
                this.trackKeywordPerformance(startDate, endDate),
                this.trackPagePerformance(startDate, endDate),
                this.trackCountryPerformance(startDate, endDate),
                this.trackDevicePerformance(startDate, endDate)
            ]);

            // 최종 버퍼 정리
            await this.thinkingData.close();

            console.log('🎉 모든 검색 성과 데이터 전송 완료!');
        } catch (error) {
            console.error('❌ 전체 데이터 전송 중 오류 발생:', error);
            // 개별 전송 시도
            console.log('🔄 개별 전송으로 재시도...');
            
            try {
                await this.trackSearchPerformance(startDate, endDate);
                await this.trackKeywordPerformance(startDate, endDate);
                await this.trackPagePerformance(startDate, endDate);
                await this.trackCountryPerformance(startDate, endDate);
                await this.trackDevicePerformance(startDate, endDate);
                await this.thinkingData.close();
                console.log('✅ 개별 전송 완료!');
            } catch (retryError) {
                console.error('❌ 재시도도 실패:', retryError);
                throw retryError;
            }
        }
    }

    /**
     * 일별 검색 성과 데이터를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
     * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
     */
    async trackDailyPerformance(startDate, endDate) {
        console.log(`📅 ${startDate} 일별 데이터 전송 시작...`);
        
        try {
            // 1. 검색 쿼리별 일별 성과
            await this.trackDailyQueryPerformance(startDate, endDate);
            
            // 2. 페이지별 일별 성과
            await this.trackDailyPagePerformance(startDate, endDate);
            
            // 3. 국가별 일별 성과
            await this.trackDailyCountryPerformance(startDate, endDate);
            
            // 4. 디바이스별 일별 성과
            await this.trackDailyDevicePerformance(startDate, endDate);
            
            // 최종 버퍼 정리
            await this.thinkingData.close();
            
            console.log(`✅ ${startDate} 일별 데이터 전송 완료!`);
        } catch (error) {
            console.error(`❌ ${startDate} 일별 데이터 전송 실패:`, error);
            throw error;
        }
    }

    /**
     * 검색 쿼리별 일별 성과를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackDailyQueryPerformance(startDate, endDate) {
        await this.ready;
        
        try {
            const queryData = await this.searchConsoleAPI.getTopQueries(startDate, endDate, 1000);
            
            if (!queryData || !queryData.rows) {
                console.log('📊 조회 기간에 검색 쿼리 데이터가 없습니다.');
                return;
            }

            console.log(`🔍 ${queryData.rows.length}개의 검색 쿼리 데이터를 ThinkingData로 전송 중...`);

            for (const row of queryData.rows) {
                const eventData = {
                    search_query: row.keys[0] || 'unknown',
                    clicks: row.clicks || 0,
                    impressions: row.impressions || 0,
                    ctr: row.ctr || 0,
                    position: row.position || 0,
                    analysis_date: startDate,
                    data_source: 'google_search_console',
                    event_category: 'daily_query_performance',
                    timestamp: new Date().toISOString()
                };

                await this.thinkingData.track('daily_query_performance', eventData);
            }

            await this.thinkingData.flush();
            console.log('✅ 검색 쿼리별 일별 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 검색 쿼리별 일별 성과 데이터 전송 실패:', error);
        }
    }

    /**
     * 페이지별 일별 성과를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackDailyPagePerformance(startDate, endDate) {
        await this.ready;
        
        try {
            const pageData = await this.searchConsoleAPI.getTopPages(startDate, endDate, 1000);
            
            if (!pageData || !pageData.rows) {
                console.log('📊 조회 기간에 페이지 데이터가 없습니다.');
                return;
            }

            console.log(`📄 ${pageData.rows.length}개의 페이지 데이터를 ThinkingData로 전송 중...`);

            for (const row of pageData.rows) {
                const eventData = {
                    page_url: row.keys[0] || 'unknown',
                    clicks: row.clicks || 0,
                    impressions: row.impressions || 0,
                    ctr: row.ctr || 0,
                    position: row.position || 0,
                    analysis_date: startDate,
                    data_source: 'google_search_console',
                    event_category: 'daily_page_performance',
                    timestamp: new Date().toISOString()
                };

                await this.thinkingData.track('daily_page_performance', eventData);
            }

            await this.thinkingData.flush();
            console.log('✅ 페이지별 일별 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 페이지별 일별 성과 데이터 전송 실패:', error);
        }
    }

    /**
     * 국가별 일별 성과를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackDailyCountryPerformance(startDate, endDate) {
        await this.ready;
        
        try {
            const countryData = await this.searchConsoleAPI.getCountryPerformance(startDate, endDate);
            
            if (!countryData || !countryData.rows) {
                console.log('📊 조회 기간에 국가별 데이터가 없습니다.');
                return;
            }

            console.log(`🌍 ${countryData.rows.length}개의 국가별 데이터를 ThinkingData로 전송 중...`);

            for (const row of countryData.rows) {
                const eventData = {
                    country: row.keys[0] || 'unknown',
                    clicks: row.clicks || 0,
                    impressions: row.impressions || 0,
                    ctr: row.ctr || 0,
                    position: row.position || 0,
                    analysis_date: startDate,
                    data_source: 'google_search_console',
                    event_category: 'daily_country_performance',
                    timestamp: new Date().toISOString()
                };

                await this.thinkingData.track('daily_country_performance', eventData);
            }

            await this.thinkingData.flush();
            console.log('✅ 국가별 일별 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 국가별 일별 성과 데이터 전송 실패:', error);
        }
    }

    /**
     * 디바이스별 일별 성과를 ThinkingData 이벤트로 전송
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async trackDailyDevicePerformance(startDate, endDate) {
        await this.ready;
        
        try {
            const deviceData = await this.searchConsoleAPI.getDevicePerformance(startDate, endDate);
            
            if (!deviceData || !deviceData.rows) {
                console.log('📊 조회 기간에 디바이스별 데이터가 없습니다.');
                return;
            }

            console.log(`📱 ${deviceData.rows.length}개의 디바이스별 데이터를 ThinkingData로 전송 중...`);

            for (const row of deviceData.rows) {
                const eventData = {
                    device: row.keys[0] || 'unknown',
                    clicks: row.clicks || 0,
                    impressions: row.impressions || 0,
                    ctr: row.ctr || 0,
                    position: row.position || 0,
                    analysis_date: startDate,
                    data_source: 'google_search_console',
                    event_category: 'daily_device_performance',
                    timestamp: new Date().toISOString()
                };

                await this.thinkingData.track('daily_device_performance', eventData);
            }

            await this.thinkingData.flush();
            console.log('✅ 디바이스별 일별 성과 데이터 전송 완료');
        } catch (error) {
            console.error('❌ 디바이스별 일별 성과 데이터 전송 실패:', error);
        }
    }
}

export default SearchConsoleTracker; 