const GoogleSearchConsoleAPI = require('./google-search-console');

class ThinkingDataAnalytics {
    constructor() {
        this.searchConsole = new GoogleSearchConsoleAPI(
            './credentials/service-account-key.json',
            'https://www.thinkingdata.kr'
        );
        
        // ThinkingData 특화 키워드 카테고리
        this.keywordCategories = {
            analytics: ['분석', 'analytics', '데이터 분석', '비즈니스 인텔리전스'],
            tracking: ['추적', 'tracking', '이벤트 추적', '사용자 행동'],
            cdp: ['CDP', '고객 데이터 플랫폼', 'customer data platform'],
            marketing: ['마케팅', 'marketing', '광고', '캠페인'],
            product: ['제품', 'product', '기능', 'feature'],
            company: ['회사', 'company', '기업', 'enterprise']
        };
    }

    /**
     * ThinkingData 관련 키워드 성과 분석
     */
    async analyzeThinkingDataKeywords(startDate, endDate) {
        console.log('🔍 ThinkingData 키워드 분석 시작...');
        
        const results = {};
        
        for (const [category, keywords] of Object.entries(this.keywordCategories)) {
            console.log(`📊 ${category} 카테고리 분석 중...`);
            
            const categoryData = await this.searchConsole.getSearchAnalytics(
                startDate,
                endDate,
                ['query'],
                1000
            );
            
            if (categoryData && categoryData.rows) {
                const filteredQueries = categoryData.rows.filter(row => 
                    keywords.some(keyword => 
                        row.keys[0].toLowerCase().includes(keyword.toLowerCase())
                    )
                );
                
                results[category] = {
                    totalQueries: filteredQueries.length,
                    totalClicks: filteredQueries.reduce((sum, row) => sum + row.clicks, 0),
                    totalImpressions: filteredQueries.reduce((sum, row) => sum + row.impressions, 0),
                    averageCTR: filteredQueries.length > 0 ? 
                        filteredQueries.reduce((sum, row) => sum + row.ctr, 0) / filteredQueries.length : 0,
                    averagePosition: filteredQueries.length > 0 ?
                        filteredQueries.reduce((sum, row) => sum + row.position, 0) / filteredQueries.length : 0,
                    topQueries: filteredQueries
                        .sort((a, b) => b.clicks - a.clicks)
                        .slice(0, 10)
                        .map(row => ({
                            query: row.keys[0],
                            clicks: row.clicks,
                            impressions: row.impressions,
                            ctr: row.ctr,
                            position: row.position
                        }))
                };
            }
        }
        
        return results;
    }

    /**
     * 블로그 콘텐츠 성과 분석
     */
    async analyzeBlogPerformance(startDate, endDate) {
        console.log('📝 블로그 콘텐츠 성과 분석...');
        
        const blogData = await this.searchConsole.getSearchAnalytics(
            startDate,
            endDate,
            ['page'],
            1000
        );
        
        if (blogData && blogData.rows) {
            const blogPages = blogData.rows.filter(row => 
                row.keys[0].includes('/blog/') || 
                row.keys[0].includes('/post/') ||
                row.keys[0].includes('/article/')
            );
            
            return {
                totalBlogPages: blogPages.length,
                totalClicks: blogPages.reduce((sum, row) => sum + row.clicks, 0),
                totalImpressions: blogPages.reduce((sum, row) => sum + row.impressions, 0),
                averageCTR: blogPages.length > 0 ? 
                    blogPages.reduce((sum, row) => sum + row.ctr, 0) / blogPages.length : 0,
                topBlogPosts: blogPages
                    .sort((a, b) => b.clicks - a.clicks)
                    .slice(0, 10)
                    .map(row => ({
                        url: row.keys[0],
                        clicks: row.clicks,
                        impressions: row.impressions,
                        ctr: row.ctr,
                        position: row.position
                    }))
            };
        }
        
        return null;
    }

    /**
     * 제품 페이지 성과 분석
     */
    async analyzeProductPages(startDate, endDate) {
        console.log('🛍️ 제품 페이지 성과 분석...');
        
        const productData = await this.searchConsole.getSearchAnalytics(
            startDate,
            endDate,
            ['page'],
            1000
        );
        
        if (productData && productData.rows) {
            const productPages = productData.rows.filter(row => 
                row.keys[0].includes('/product/') || 
                row.keys[0].includes('/solution/') ||
                row.keys[0].includes('/feature/')
            );
            
            return {
                totalProductPages: productPages.length,
                totalClicks: productPages.reduce((sum, row) => sum + row.clicks, 0),
                totalImpressions: productPages.reduce((sum, row) => sum + row.impressions, 0),
                averageCTR: productPages.length > 0 ? 
                    productPages.reduce((sum, row) => sum + row.ctr, 0) / productPages.length : 0,
                topProductPages: productPages
                    .sort((a, b) => b.clicks - a.clicks)
                    .slice(0, 10)
                    .map(row => ({
                        url: row.keys[0],
                        clicks: row.clicks,
                        impressions: row.impressions,
                        ctr: row.ctr,
                        position: row.position
                    }))
            };
        }
        
        return null;
    }

    /**
     * 경쟁사 키워드 분석
     */
    async analyzeCompetitorKeywords(startDate, endDate) {
        console.log('🏆 경쟁사 키워드 분석...');
        
        const competitorKeywords = [
            'amplitude', 'mixpanel', 'segment', 'rudderstack',
            'google analytics', 'ga4', 'gtm',
            'snowplow', 'posthog', 'heap',
            'customer data platform', 'cdp',
            'data analytics', 'business intelligence'
        ];
        
        const searchData = await this.searchConsole.getSearchAnalytics(
            startDate,
            endDate,
            ['query'],
            1000
        );
        
        if (searchData && searchData.rows) {
            const competitorData = searchData.rows.filter(row => 
                competitorKeywords.some(keyword => 
                    row.keys[0].toLowerCase().includes(keyword.toLowerCase())
                )
            );
            
            return {
                totalCompetitorQueries: competitorData.length,
                totalClicks: competitorData.reduce((sum, row) => sum + row.clicks, 0),
                totalImpressions: competitorData.reduce((sum, row) => sum + row.impressions, 0),
                competitorQueries: competitorData
                    .sort((a, b) => b.clicks - a.clicks)
                    .map(row => ({
                        query: row.keys[0],
                        clicks: row.clicks,
                        impressions: row.impressions,
                        ctr: row.ctr,
                        position: row.position
                    }))
            };
        }
        
        return null;
    }

    /**
     * 종합 성과 리포트 생성
     */
    async generateComprehensiveReport(startDate, endDate) {
        console.log('📊 ThinkingData 종합 성과 리포트 생성...\n');
        
        const report = {
            period: { startDate, endDate },
            generatedAt: new Date().toISOString(),
            summary: {},
            keywordAnalysis: {},
            contentAnalysis: {},
            competitorAnalysis: {}
        };
        
        // 1. 전체 성과 요약
        const overallData = await this.searchConsole.getSearchAnalytics(
            startDate,
            endDate,
            ['query'],
            1000
        );
        
        if (overallData && overallData.rows) {
            report.summary = {
                totalQueries: overallData.rows.length,
                totalClicks: overallData.rows.reduce((sum, row) => sum + row.clicks, 0),
                totalImpressions: overallData.rows.reduce((sum, row) => sum + row.impressions, 0),
                averageCTR: overallData.rows.reduce((sum, row) => sum + row.ctr, 0) / overallData.rows.length,
                averagePosition: overallData.rows.reduce((sum, row) => sum + row.position, 0) / overallData.rows.length
            };
        }
        
        // 2. 키워드 카테고리별 분석
        report.keywordAnalysis = await this.analyzeThinkingDataKeywords(startDate, endDate);
        
        // 3. 콘텐츠 성과 분석
        report.contentAnalysis = {
            blog: await this.analyzeBlogPerformance(startDate, endDate),
            product: await this.analyzeProductPages(startDate, endDate)
        };
        
        // 4. 경쟁사 키워드 분석
        report.competitorAnalysis = await this.analyzeCompetitorKeywords(startDate, endDate);
        
        return report;
    }

    /**
     * 리포트 출력
     */
    printReport(report) {
        console.log('='.repeat(60));
        console.log('📊 ThinkingData 검색 성과 리포트');
        console.log('='.repeat(60));
        console.log(`📅 기간: ${report.period.startDate} ~ ${report.period.endDate}`);
        console.log(`🕐 생성: ${new Date(report.generatedAt).toLocaleString()}\n`);
        
        // 전체 요약
        console.log('📈 전체 성과 요약');
        console.log('-'.repeat(30));
        console.log(`총 검색어: ${report.summary.totalQueries.toLocaleString()}개`);
        console.log(`총 클릭: ${report.summary.totalClicks.toLocaleString()}회`);
        console.log(`총 노출: ${report.summary.totalImpressions.toLocaleString()}회`);
        console.log(`평균 CTR: ${(report.summary.averageCTR * 100).toFixed(2)}%`);
        console.log(`평균 순위: ${report.summary.averagePosition.toFixed(1)}위\n`);
        
        // 키워드 카테고리별 분석
        console.log('🔍 키워드 카테고리별 분석');
        console.log('-'.repeat(30));
        for (const [category, data] of Object.entries(report.keywordAnalysis)) {
            console.log(`\n${category.toUpperCase()}:`);
            console.log(`  검색어: ${data.totalQueries}개`);
            console.log(`  클릭: ${data.totalClicks}회`);
            console.log(`  노출: ${data.totalImpressions}회`);
            console.log(`  평균 CTR: ${(data.averageCTR * 100).toFixed(2)}%`);
            console.log(`  평균 순위: ${data.averagePosition.toFixed(1)}위`);
            
            if (data.topQueries.length > 0) {
                console.log(`  🔝 상위 검색어:`);
                data.topQueries.slice(0, 3).forEach((query, index) => {
                    console.log(`    ${index + 1}. "${query.query}" (${query.clicks}클릭)`);
                });
            }
        }
        
        // 콘텐츠 분석
        if (report.contentAnalysis.blog) {
            console.log('\n📝 블로그 성과');
            console.log('-'.repeat(30));
            const blog = report.contentAnalysis.blog;
            console.log(`총 블로그 페이지: ${blog.totalBlogPages}개`);
            console.log(`총 클릭: ${blog.totalClicks}회`);
            console.log(`평균 CTR: ${(blog.averageCTR * 100).toFixed(2)}%`);
        }
        
        if (report.contentAnalysis.product) {
            console.log('\n🛍️ 제품 페이지 성과');
            console.log('-'.repeat(30));
            const product = report.contentAnalysis.product;
            console.log(`총 제품 페이지: ${product.totalProductPages}개`);
            console.log(`총 클릭: ${product.totalClicks}회`);
            console.log(`평균 CTR: ${(product.averageCTR * 100).toFixed(2)}%`);
        }
        
        // 경쟁사 분석
        if (report.competitorAnalysis) {
            console.log('\n🏆 경쟁사 키워드 분석');
            console.log('-'.repeat(30));
            const competitor = report.competitorAnalysis;
            console.log(`경쟁사 관련 검색어: ${competitor.totalCompetitorQueries}개`);
            console.log(`총 클릭: ${competitor.totalClicks}회`);
            console.log(`총 노출: ${competitor.totalImpressions}회`);
        }
        
        console.log('\n' + '='.repeat(60));
    }
}

module.exports = ThinkingDataAnalytics; 