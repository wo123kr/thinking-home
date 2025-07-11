const SearchConsoleTracker = require('../core/search-console-tracker');
const path = require('path');

/**
 * Search Console 데이터를 ThinkingData로 전송하는 실행 스크립트
 */

// 설정 객체
const config = {
    credentialsPath: path.join(__dirname, '../credentials/service-account-key.json'),
    siteUrl: 'https://www.thinkingdata.kr/',
    thinkingData: {
        appId: 'test', // 실제 ThinkingData 프로젝트 ID로 변경
        serverUrl: 'https://te-receiver-naver.thinkingdata.kr/sync_js',
        autoTrack: {
            pageShow: true,
            pageHide: true
        }
    }
};

/**
 * 날짜 범위 계산 함수들
 */
function getDateRanges() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return {
        yesterday: {
            start: yesterday.toISOString().split('T')[0],
            end: yesterday.toISOString().split('T')[0]
        },
        lastWeek: {
            start: lastWeek.toISOString().split('T')[0],
            end: yesterday.toISOString().split('T')[0]
        },
        lastMonth: {
            start: lastMonth.toISOString().split('T')[0],
            end: yesterday.toISOString().split('T')[0]
        }
    };
}

/**
 * 메인 실행 함수
 */
async function main() {
    console.log('🚀 Search Console → ThinkingData 데이터 전송 시작...');
    
    try {
        // SearchConsoleTracker 초기화
        const tracker = new SearchConsoleTracker(config);
        
        // 날짜 범위 계산
        const dateRanges = getDateRanges();
        
        console.log('📅 분석 기간:', dateRanges);
        
        // 어제 데이터 전송
        console.log('\n📊 어제 데이터 전송 중...');
        await tracker.trackAllPerformance(
            dateRanges.yesterday.start,
            dateRanges.yesterday.end
        );
        
        // 지난 주 데이터 전송
        console.log('\n📊 지난 주 데이터 전송 중...');
        await tracker.trackAllPerformance(
            dateRanges.lastWeek.start,
            dateRanges.lastWeek.end
        );
        
        // 지난 달 데이터 전송
        console.log('\n📊 지난 달 데이터 전송 중...');
        await tracker.trackAllPerformance(
            dateRanges.lastMonth.start,
            dateRanges.lastMonth.end
        );
        
        console.log('\n🎉 모든 데이터 전송 완료!');
        
    } catch (error) {
        console.error('❌ 데이터 전송 중 오류 발생:', error);
        process.exit(1);
    }
}

/**
 * 특정 기간 데이터 전송 함수
 */
async function trackSpecificPeriod(startDate, endDate) {
    console.log(`🚀 ${startDate} ~ ${endDate} 기간 데이터 전송 시작...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackAllPerformance(startDate, endDate);
        console.log('✅ 특정 기간 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 특정 기간 데이터 전송 실패:', error);
        throw error;
    }
}

/**
 * 개별 분석 데이터 전송 함수들
 */
async function trackKeywords(startDate, endDate) {
    console.log(`🔍 ${startDate} ~ ${endDate} 키워드 데이터 전송...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackKeywordPerformance(startDate, endDate);
        console.log('✅ 키워드 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 키워드 데이터 전송 실패:', error);
        throw error;
    }
}

async function trackPages(startDate, endDate) {
    console.log(`📄 ${startDate} ~ ${endDate} 페이지 데이터 전송...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackPagePerformance(startDate, endDate);
        console.log('✅ 페이지 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 페이지 데이터 전송 실패:', error);
        throw error;
    }
}

async function trackCountries(startDate, endDate) {
    console.log(`🌍 ${startDate} ~ ${endDate} 지역별 데이터 전송...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackCountryPerformance(startDate, endDate);
        console.log('✅ 지역별 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 지역별 데이터 전송 실패:', error);
        throw error;
    }
}

async function trackDevices(startDate, endDate) {
    console.log(`📱 ${startDate} ~ ${endDate} 디바이스별 데이터 전송...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackDevicePerformance(startDate, endDate);
        console.log('✅ 디바이스별 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 디바이스별 데이터 전송 실패:', error);
        throw error;
    }
}

// 명령행 인수 처리
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // 기본 실행: 어제, 지난주, 지난달 데이터 전송
        main();
    } else if (args.length === 2) {
        // 특정 기간 데이터 전송
        const [startDate, endDate] = args;
        trackSpecificPeriod(startDate, endDate);
    } else if (args.length === 3) {
        // 특정 분석 유형 + 기간
        const [analysisType, startDate, endDate] = args;
        
        switch (analysisType) {
            case 'keywords':
                trackKeywords(startDate, endDate);
                break;
            case 'pages':
                trackPages(startDate, endDate);
                break;
            case 'countries':
                trackCountries(startDate, endDate);
                break;
            case 'devices':
                trackDevices(startDate, endDate);
                break;
            default:
                console.error('❌ 지원하지 않는 분석 유형:', analysisType);
                console.log('💡 지원하는 유형: keywords, pages, countries, devices');
                process.exit(1);
        }
    } else {
        console.log('💡 사용법:');
        console.log('  node search-performance.js                    # 기본 실행 (어제, 지난주, 지난달)');
        console.log('  node search-performance.js 2024-01-01 2024-01-31  # 특정 기간');
        console.log('  node search-performance.js keywords 2024-01-01 2024-01-31  # 키워드만');
        console.log('  node search-performance.js pages 2024-01-01 2024-01-31     # 페이지만');
        console.log('  node search-performance.js countries 2024-01-01 2024-01-31 # 지역별만');
        console.log('  node search-performance.js devices 2024-01-01 2024-01-31   # 디바이스별만');
    }
}

module.exports = {
    main,
    trackSpecificPeriod,
    trackKeywords,
    trackPages,
    trackCountries,
    trackDevices
}; 