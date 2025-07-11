const ThinkingDataAnalytics = require('./thinkingdata-analytics');

// ThinkingData 분석 인스턴스 생성
const analytics = new ThinkingDataAnalytics();

// 메인 실행 함수
async function generateThinkingDataReport() {
    console.log('🚀 ThinkingData 검색 성과 분석 시작\n');
    
    try {
        // 최근 30일 데이터 분석
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        console.log(`📅 분석 기간: ${startDate} ~ ${endDate}\n`);
        
        // 종합 리포트 생성
        const report = await analytics.generateComprehensiveReport(startDate, endDate);
        
        // 리포트 출력
        analytics.printReport(report);
        
        // JSON 파일로 저장
        const fs = require('fs');
        const reportPath = `./exports/search-console/thinkingdata-report-${startDate}-${endDate}.json`;
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`\n💾 리포트가 저장되었습니다: ${reportPath}`);
        
        return report;
        
    } catch (error) {
        console.error('❌ 리포트 생성 중 오류 발생:', error.message);
        return null;
    }
}

// 특정 기간 분석 함수
async function analyzeSpecificPeriod(startDate, endDate) {
    console.log(`📊 특정 기간 분석: ${startDate} ~ ${endDate}\n`);
    
    try {
        const report = await analytics.generateComprehensiveReport(startDate, endDate);
        analytics.printReport(report);
        return report;
    } catch (error) {
        console.error('❌ 분석 중 오류 발생:', error.message);
        return null;
    }
}

// 키워드 카테고리별 상세 분석
async function analyzeKeywordCategories(startDate, endDate) {
    console.log('🔍 키워드 카테고리별 상세 분석\n');
    
    try {
        const keywordAnalysis = await analytics.analyzeThinkingDataKeywords(startDate, endDate);
        
        console.log('📊 키워드 카테고리별 성과:');
        console.log('='.repeat(50));
        
        for (const [category, data] of Object.entries(keywordAnalysis)) {
            console.log(`\n${category.toUpperCase()}:`);
            console.log(`  총 검색어: ${data.totalQueries}개`);
            console.log(`  총 클릭: ${data.totalClicks}회`);
            console.log(`  총 노출: ${data.totalImpressions}회`);
            console.log(`  평균 CTR: ${(data.averageCTR * 100).toFixed(2)}%`);
            console.log(`  평균 순위: ${data.averagePosition.toFixed(1)}위`);
            
            if (data.topQueries.length > 0) {
                console.log(`  🔝 상위 5개 검색어:`);
                data.topQueries.slice(0, 5).forEach((query, index) => {
                    console.log(`    ${index + 1}. "${query.query}"`);
                    console.log(`       클릭: ${query.clicks}, 노출: ${query.impressions}, CTR: ${(query.ctr * 100).toFixed(2)}%, 순위: ${query.position.toFixed(1)}위`);
                });
            }
        }
        
        return keywordAnalysis;
    } catch (error) {
        console.error('❌ 키워드 분석 중 오류 발생:', error.message);
        return null;
    }
}

// 블로그 성과 상세 분석
async function analyzeBlogPerformance(startDate, endDate) {
    console.log('📝 블로그 성과 상세 분석\n');
    
    try {
        const blogData = await analytics.analyzeBlogPerformance(startDate, endDate);
        
        if (blogData) {
            console.log('📊 블로그 성과 요약:');
            console.log('='.repeat(30));
            console.log(`총 블로그 페이지: ${blogData.totalBlogPages}개`);
            console.log(`총 클릭: ${blogData.totalClicks}회`);
            console.log(`총 노출: ${blogData.totalImpressions}회`);
            console.log(`평균 CTR: ${(blogData.averageCTR * 100).toFixed(2)}%`);
            
            if (blogData.topBlogPosts.length > 0) {
                console.log(`\n🔝 상위 10개 블로그 포스트:`);
                blogData.topBlogPosts.forEach((post, index) => {
                    console.log(`\n${index + 1}. ${post.url}`);
                    console.log(`   클릭: ${post.clicks}, 노출: ${post.impressions}`);
                    console.log(`   CTR: ${(post.ctr * 100).toFixed(2)}%, 순위: ${post.position.toFixed(1)}위`);
                });
            }
        } else {
            console.log('❌ 블로그 데이터를 찾을 수 없습니다.');
        }
        
        return blogData;
    } catch (error) {
        console.error('❌ 블로그 분석 중 오류 발생:', error.message);
        return null;
    }
}

// 경쟁사 키워드 상세 분석
async function analyzeCompetitorKeywords(startDate, endDate) {
    console.log('🏆 경쟁사 키워드 상세 분석\n');
    
    try {
        const competitorData = await analytics.analyzeCompetitorKeywords(startDate, endDate);
        
        if (competitorData) {
            console.log('📊 경쟁사 키워드 성과:');
            console.log('='.repeat(30));
            console.log(`총 경쟁사 관련 검색어: ${competitorData.totalCompetitorQueries}개`);
            console.log(`총 클릭: ${competitorData.totalClicks}회`);
            console.log(`총 노출: ${competitorData.totalImpressions}회`);
            
            if (competitorData.competitorQueries.length > 0) {
                console.log(`\n🔝 경쟁사 관련 상위 검색어:`);
                competitorData.competitorQueries.slice(0, 10).forEach((query, index) => {
                    console.log(`\n${index + 1}. "${query.query}"`);
                    console.log(`   클릭: ${query.clicks}, 노출: ${query.impressions}`);
                    console.log(`   CTR: ${(query.ctr * 100).toFixed(2)}%, 순위: ${query.position.toFixed(1)}위`);
                });
            }
        } else {
            console.log('❌ 경쟁사 키워드 데이터를 찾을 수 없습니다.');
        }
        
        return competitorData;
    } catch (error) {
        console.error('❌ 경쟁사 분석 중 오류 발생:', error.message);
        return null;
    }
}

// 월별 트렌드 분석
async function analyzeMonthlyTrends() {
    console.log('📈 월별 트렌드 분석\n');
    
    try {
        const months = [];
        const currentDate = new Date();
        
        // 최근 6개월 데이터 수집
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const startDate = date.toISOString().split('T')[0];
            
            const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const endDate = nextMonth.toISOString().split('T')[0];
            
            months.push({ startDate, endDate, month: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }) });
        }
        
        const trends = [];
        
        for (const month of months) {
            console.log(`📊 ${month.month} 분석 중...`);
            
            const data = await analytics.searchConsole.getSearchAnalytics(
                month.startDate,
                month.endDate,
                ['query'],
                1000
            );
            
            if (data && data.rows) {
                const summary = {
                    month: month.month,
                    totalQueries: data.rows.length,
                    totalClicks: data.rows.reduce((sum, row) => sum + row.clicks, 0),
                    totalImpressions: data.rows.reduce((sum, row) => sum + row.impressions, 0),
                    averageCTR: data.rows.reduce((sum, row) => sum + row.ctr, 0) / data.rows.length,
                    averagePosition: data.rows.reduce((sum, row) => sum + row.position, 0) / data.rows.length
                };
                
                trends.push(summary);
            }
        }
        
        console.log('\n📈 월별 트렌드 요약:');
        console.log('='.repeat(50));
        
        trends.forEach(trend => {
            console.log(`\n${trend.month}:`);
            console.log(`  검색어: ${trend.totalQueries.toLocaleString()}개`);
            console.log(`  클릭: ${trend.totalClicks.toLocaleString()}회`);
            console.log(`  노출: ${trend.totalImpressions.toLocaleString()}회`);
            console.log(`  평균 CTR: ${(trend.averageCTR * 100).toFixed(2)}%`);
            console.log(`  평균 순위: ${trend.averagePosition.toFixed(1)}위`);
        });
        
        return trends;
    } catch (error) {
        console.error('❌ 트렌드 분석 중 오류 발생:', error.message);
        return null;
    }
}

// 메인 실행
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // 기본: 최근 30일 리포트
        await generateThinkingDataReport();
    } else if (args[0] === 'trends') {
        // 월별 트렌드 분석
        await analyzeMonthlyTrends();
    } else if (args[0] === 'keywords') {
        // 키워드 카테고리 분석
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await analyzeKeywordCategories(startDate, endDate);
    } else if (args[0] === 'blog') {
        // 블로그 성과 분석
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await analyzeBlogPerformance(startDate, endDate);
    } else if (args[0] === 'competitors') {
        // 경쟁사 분석
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await analyzeCompetitorKeywords(startDate, endDate);
    } else if (args.length === 2) {
        // 특정 기간 분석
        await analyzeSpecificPeriod(args[0], args[1]);
    } else {
        console.log('사용법:');
        console.log('  node thinkingdata-report-example.js                    # 최근 30일 리포트');
        console.log('  node thinkingdata-report-example.js trends             # 월별 트렌드');
        console.log('  node thinkingdata-report-example.js keywords           # 키워드 카테고리 분석');
        console.log('  node thinkingdata-report-example.js blog               # 블로그 성과 분석');
        console.log('  node thinkingdata-report-example.js competitors        # 경쟁사 분석');
        console.log('  node thinkingdata-report-example.js 2024-01-01 2024-01-31  # 특정 기간 분석');
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = {
    generateThinkingDataReport,
    analyzeSpecificPeriod,
    analyzeKeywordCategories,
    analyzeBlogPerformance,
    analyzeCompetitorKeywords,
    analyzeMonthlyTrends
}; 