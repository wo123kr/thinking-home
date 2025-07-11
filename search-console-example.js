const GoogleSearchConsoleAPI = require('./google-search-console');

// 설정
const CREDENTIALS_PATH = './credentials/service-account-key.json';
const SITE_URL = 'https://www.thinkingdata.kr';

// API 인스턴스 생성
const searchConsole = new GoogleSearchConsoleAPI(CREDENTIALS_PATH, SITE_URL);

// 사용 예시 함수들
async function exampleUsage() {
    console.log('🚀 Google Search Console API 사용 예시 시작\n');

    // 1. 사이트 소유권 확인
    console.log('1️⃣ 사이트 소유권 확인...');
    const ownership = await searchConsole.verifySiteOwnership();
    if (!ownership) {
        console.log('❌ 사이트 소유권 확인 실패. 설정을 확인해주세요.');
        return;
    }
    console.log('✅ 사이트 소유권 확인 완료\n');

    // 2. 최근 30일 검색 성과 조회
    console.log('2️⃣ 최근 30일 검색 성과 조회...');
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const searchData = await searchConsole.getSearchAnalytics(
        startDate, 
        endDate, 
        ['query', 'page'], 
        100
    );
    
    if (searchData && searchData.rows) {
        console.log(`✅ 검색 데이터 조회 완료: ${searchData.rows.length}개 행`);
        console.log('📊 샘플 데이터:');
        searchData.rows.slice(0, 3).forEach((row, index) => {
            console.log(`   ${index + 1}. 쿼리: "${row.keys[0]}", 페이지: ${row.keys[1]}`);
            console.log(`      클릭: ${row.clicks}, 노출: ${row.impressions}, CTR: ${(row.ctr * 100).toFixed(2)}%`);
        });
    }
    console.log('');

    // 3. 상위 검색어 조회
    console.log('3️⃣ 상위 검색어 조회...');
    const topQueries = await searchConsole.getTopQueries(startDate, endDate, 10);
    if (topQueries.length > 0) {
        console.log('🔝 상위 10개 검색어:');
        topQueries.forEach((query, index) => {
            console.log(`   ${index + 1}. "${query.keys[0]}" - 클릭: ${query.clicks}, 노출: ${query.impressions}`);
        });
    }
    console.log('');

    // 4. 상위 페이지 조회
    console.log('4️⃣ 상위 페이지 조회...');
    const topPages = await searchConsole.getTopPages(startDate, endDate, 10);
    if (topPages.length > 0) {
        console.log('📄 상위 10개 페이지:');
        topPages.forEach((page, index) => {
            console.log(`   ${index + 1}. ${page.keys[0]} - 클릭: ${page.clicks}, 노출: ${page.impressions}`);
        });
    }
    console.log('');

    // 5. 국가별 성과 조회
    console.log('5️⃣ 국가별 성과 조회...');
    const countryData = await searchConsole.getCountryPerformance(startDate, endDate);
    if (countryData.length > 0) {
        console.log('🌍 국가별 성과:');
        countryData.forEach((country, index) => {
            console.log(`   ${index + 1}. ${country.keys[0]} - 클릭: ${country.clicks}, 노출: ${country.impressions}`);
        });
    }
    console.log('');

    // 6. 디바이스별 성과 조회
    console.log('6️⃣ 디바이스별 성과 조회...');
    const deviceData = await searchConsole.getDevicePerformance(startDate, endDate);
    if (deviceData.length > 0) {
        console.log('📱 디바이스별 성과:');
        deviceData.forEach((device, index) => {
            console.log(`   ${index + 1}. ${device.keys[0]} - 클릭: ${device.clicks}, 노출: ${device.impressions}`);
        });
    }
    console.log('');

    // 7. 사이트맵 목록 조회
    console.log('7️⃣ 사이트맵 목록 조회...');
    const sitemaps = await searchConsole.getSitemaps();
    if (sitemaps && sitemaps.sitemap) {
        console.log('🗺️ 등록된 사이트맵:');
        sitemaps.sitemap.forEach((sitemap, index) => {
            console.log(`   ${index + 1}. ${sitemap.path} - 제출: ${sitemap.lastSubmitted}`);
        });
    }
    console.log('');

    console.log('✅ 모든 예시 실행 완료!');
}

// URL 검사 예시
async function inspectUrlExample() {
    console.log('🔍 URL 검사 예시...');
    
    const urlToInspect = 'https://www.thinkingdata.kr/specific-page';
    const inspectionResult = await searchConsole.inspectUrl(urlToInspect);
    
    if (inspectionResult) {
        console.log('📋 URL 검사 결과:');
        console.log(`   URL: ${inspectionResult.inspectionResult.inspectionResultLink}`);
        console.log(`   인덱싱 상태: ${inspectionResult.inspectionResult.indexStatusResult?.verdict || 'N/A'}`);
        console.log(`   모바일 친화성: ${inspectionResult.inspectionResult.mobileUsabilityResult?.verdict || 'N/A'}`);
    }
}

// 사이트맵 제출 예시
async function submitSitemapExample() {
    console.log('📤 사이트맵 제출 예시...');
    
    const sitemapUrl = 'https://www.thinkingdata.kr/sitemap.xml';
    const result = await searchConsole.submitSitemap(sitemapUrl);
    
    if (result) {
        console.log('✅ 사이트맵 제출 성공');
    }
}

// 메인 실행 함수
async function main() {
    try {
        await exampleUsage();
        
        // 추가 예시들 (필요시 주석 해제)
        // await inspectUrlExample();
        // await submitSitemapExample();
        
    } catch (error) {
        console.error('❌ 실행 중 오류 발생:', error.message);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = {
    searchConsole,
    exampleUsage,
    inspectUrlExample,
    submitSitemapExample
}; 