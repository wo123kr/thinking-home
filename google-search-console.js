import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

class GoogleSearchConsoleAPI {
    constructor(credentialsPath, siteUrl) {
        this.credentialsPath = credentialsPath;
        this.siteUrl = siteUrl;
        this.auth = null;
        this.searchConsole = null;
        this.ready = this.initialize();
    }

    /**
     * Google API 인증 초기화
     */
    async initialize() {
        try {
            // 서비스 계정 키 파일 로드 (절대경로로 변환)
            const credentials = JSON.parse(fs.readFileSync(path.resolve(this.credentialsPath), 'utf8'));
            
            // JWT 클라이언트 생성 (명시적 파라미터)
            this.auth = new google.auth.JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
            });

            // 👇 인증 강제 적용
            await this.auth.authorize();

            // Search Console API 클라이언트 생성 (searchconsole v1)
            this.searchConsole = google.searchconsole({ version: 'v1' });
            console.log('searchConsole 객체:', this.searchConsole);

            console.log('✅ Google Search Console API 초기화 완료');
        } catch (error) {
            console.error('❌ Google Search Console API 초기화 실패:', error.message);
        }
    }

    /**
     * 사이트 검증 상태 확인
     */
    async verifySiteOwnership() {
        await this.ready;
        try {
            const response = await this.searchConsole.sites.get({
                auth: this.auth,
                siteUrl: this.siteUrl
            });
            
            console.log('✅ 사이트 소유권 확인됨:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ 사이트 소유권 확인 실패:', error.message);
            return null;
        }
    }

    /**
     * 검색 분석 데이터 조회
     * @param {string} startDate - 시작 날짜 (YYYY-MM-DD)
     * @param {string} endDate - 종료 날짜 (YYYY-MM-DD)
     * @param {Array} dimensions - 차원 (query, page, country, device 등)
     * @param {number} rowLimit - 행 제한 (최대 25000)
     */
    async getSearchAnalytics(startDate, endDate, dimensions = ['query'], rowLimit = 1000) {
        await this.ready;
        try {
            const requestBody = {
                startDate: startDate,
                endDate: endDate,
                dimensions: dimensions,
                rowLimit: rowLimit,
                startRow: 0
            };

            const response = await this.searchConsole.searchanalytics.query({
                auth: this.auth,
                siteUrl: this.siteUrl,
                requestBody: requestBody
            });

            console.log(`✅ 검색 분석 데이터 조회 완료: ${response.data.rows?.length || 0}개 행`);
            return response.data;
        } catch (error) {
            console.error('❌ 검색 분석 데이터 조회 실패:', error.message);
            return null;
        }
    }

    /**
     * URL 검사 도구 - URL 상태 확인 (searchconsole v1에는 공식 지원 없음, 생략)
     */

    /**
     * 사이트맵 제출
     * @param {string} sitemapUrl - 사이트맵 URL
     */
    async submitSitemap(sitemapUrl) {
        await this.ready;
        try {
            const response = await this.searchConsole.sitemaps.submit({
                auth: this.auth,
                siteUrl: this.siteUrl,
                feedpath: sitemapUrl
            });

            console.log('✅ 사이트맵 제출 완료:', sitemapUrl);
            return response.data;
        } catch (error) {
            console.error('❌ 사이트맵 제출 실패:', error.message);
            return null;
        }
    }

    /**
     * 사이트맵 목록 조회
     */
    async getSitemaps() {
        await this.ready;
        try {
            const response = await this.searchConsole.sitemaps.list({
                auth: this.auth,
                siteUrl: this.siteUrl
            });

            console.log('✅ 사이트맵 목록 조회 완료');
            return response.data;
        } catch (error) {
            console.error('❌ 사이트맵 목록 조회 실패:', error.message);
            return null;
        }
    }

    /**
     * 인덱싱 상태 확인
     * @param {Array} urls - 확인할 URL 배열
     */
    async checkIndexingStatus(urls) {
        await this.ready;
        try {
            const requestBody = {
                inspectionUrls: urls,
                siteUrl: this.siteUrl
            };

            const response = await this.searchConsole.urlInspection.index.inspect({
                requestBody: requestBody
            });

            console.log('✅ 인덱싱 상태 확인 완료');
            return response.data;
        } catch (error) {
            console.error('❌ 인덱싱 상태 확인 실패:', error.message);
            return null;
        }
    }

    /**
     * 상위 검색어 조회
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     * @param {number} limit - 조회할 개수
     */
    async getTopQueries(startDate, endDate, limit = 100) {
        await this.ready;
        try {
            const data = await this.getSearchAnalytics(
                startDate, 
                endDate, 
                ['query'], 
                limit
            );

            if (data && data.rows) {
                // 클릭수 기준으로 정렬
                const sortedQueries = data.rows.sort((a, b) => b.clicks - a.clicks);
                return { rows: sortedQueries };
            }

            return { rows: [] };
        } catch (error) {
            console.error('❌ 상위 검색어 조회 실패:', error.message);
            return { rows: [] };
        }
    }

    /**
     * 상위 페이지 조회
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     * @param {number} limit - 조회할 개수
     */
    async getTopPages(startDate, endDate, limit = 100) {
        await this.ready;
        try {
            const data = await this.getSearchAnalytics(
                startDate, 
                endDate, 
                ['page'], 
                limit
            );

            if (data && data.rows) {
                // 클릭수 기준으로 정렬
                const sortedPages = data.rows.sort((a, b) => b.clicks - a.clicks);
                return { rows: sortedPages };
            }

            return { rows: [] };
        } catch (error) {
            console.error('❌ 상위 페이지 조회 실패:', error.message);
            return { rows: [] };
        }
    }

    /**
     * 국가별 검색 성과 조회
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async getCountryPerformance(startDate, endDate) {
        await this.ready;
        try {
            const data = await this.getSearchAnalytics(
                startDate, 
                endDate, 
                ['country'], 
                1000
            );

            return data?.rows || [];
        } catch (error) {
            console.error('❌ 국가별 성과 조회 실패:', error.message);
            return [];
        }
    }

    /**
     * 디바이스별 검색 성과 조회
     * @param {string} startDate - 시작 날짜
     * @param {string} endDate - 종료 날짜
     */
    async getDevicePerformance(startDate, endDate) {
        await this.ready;
        try {
            const data = await this.getSearchAnalytics(
                startDate, 
                endDate, 
                ['device'], 
                1000
            );

            return data?.rows || [];
        } catch (error) {
            console.error('❌ 디바이스별 성과 조회 실패:', error.message);
            return [];
        }
    }
}

export default GoogleSearchConsoleAPI; 