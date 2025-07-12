import SearchConsoleTracker from '../core/search-console-tracker.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Search Console 데이터를 ThinkingData로 전송하는 실행 스크립트
 */

// 설정 객체
const config = {
    credentialsPath: path.join(__dirname, '../credentials/service-account-key.json'),
    siteUrl: 'https://www.thinkingdata.kr/',
    thinkingData: {
        appId: process.env.TE_APP_ID || 'test', // 환경변수에서 가져오기
        serverUrl: process.env.TE_SERVER_URL || 'https://te-receiver-naver.thinkingdata.kr/sync_js',
        autoTrack: {
            pageShow: true,
            pageHide: true
        }
    }
};

// 환경변수 확인 로깅
console.log('🔧 환경변수 확인:');
console.log('  TE_APP_ID:', process.env.TE_APP_ID ? '설정됨' : '기본값 사용');
console.log('  TE_SERVER_URL:', process.env.TE_SERVER_URL ? '설정됨' : '기본값 사용');

/**
 * 날짜 범위 계산 함수들
 */
function getDateRanges() {
    const today = new Date();
    
    // 어제 날짜
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // 2일 전 날짜
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // 3일 전 날짜
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return {
        // 일별 데이터 (최근 3일치 재수집)
        yesterday: {
            start: yesterday.toISOString().split('T')[0],
            end: yesterday.toISOString().split('T')[0]
        },
        twoDaysAgo: {
            start: twoDaysAgo.toISOString().split('T')[0],
            end: twoDaysAgo.toISOString().split('T')[0]
        },
        threeDaysAgo: {
            start: threeDaysAgo.toISOString().split('T')[0],
            end: threeDaysAgo.toISOString().split('T')[0]
        },
        
        // 주간/월간 데이터 (참고용)
        lastWeek: {
            start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end: yesterday.toISOString().split('T')[0]
        },
        lastMonth: {
            start: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString().split('T')[0],
            end: yesterday.toISOString().split('T')[0]
        }
    };
}

/**
 * 메인 실행 함수
 */
async function main() {
    console.log('🚀 Search Console → ThinkingData 일별 데이터 전송 시작...');
    
    try {
        // SearchConsoleTracker 초기화
        const tracker = new SearchConsoleTracker(config);
        
        // 날짜 범위 계산
        const dateRanges = getDateRanges();
        
        console.log('📅 분석 기간:', dateRanges);
        
        // 최근 3일치 일별 데이터 전송 (Google Search Console 데이터 확정 특성 고려)
        console.log('\n📊 어제 데이터 전송 중...');
        await tracker.trackDailyPerformance(
            dateRanges.yesterday.start,
            dateRanges.yesterday.end
        );
        
        console.log('\n📊 2일 전 데이터 전송 중...');
        await tracker.trackDailyPerformance(
            dateRanges.twoDaysAgo.start,
            dateRanges.twoDaysAgo.end
        );
        
        console.log('\n📊 3일 전 데이터 전송 중...');
        await tracker.trackDailyPerformance(
            dateRanges.threeDaysAgo.start,
            dateRanges.threeDaysAgo.end
        );
        
        console.log('\n🎉 모든 일별 데이터 전송 완료!');
        
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
        
        // 시작일과 종료일이 같으면 일별 데이터로 처리
        if (startDate === endDate) {
            await tracker.trackDailyPerformance(startDate, endDate);
        } else {
            // 기간이 다르면 기존 방식으로 처리 (주간/월간)
            await tracker.trackAllPerformance(startDate, endDate);
        }
        
        console.log('✅ 특정 기간 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 특정 기간 데이터 전송 실패:', error);
        throw error;
    }
}

/**
 * 개별 분석 데이터 전송 함수들 (일별)
 */
async function trackDailyQueries(startDate, endDate) {
    console.log(`🔍 ${startDate} ~ ${endDate} 검색 쿼리 데이터 전송...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackDailyQueryPerformance(startDate, endDate);
        console.log('✅ 검색 쿼리 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 검색 쿼리 데이터 전송 실패:', error);
        throw error;
    }
}

async function trackDailyPages(startDate, endDate) {
    console.log(`📄 ${startDate} ~ ${endDate} 페이지 데이터 전송...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackDailyPagePerformance(startDate, endDate);
        console.log('✅ 페이지 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 페이지 데이터 전송 실패:', error);
        throw error;
    }
}

async function trackDailyCountries(startDate, endDate) {
    console.log(`🌍 ${startDate} ~ ${endDate} 국가별 데이터 전송...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackDailyCountryPerformance(startDate, endDate);
        console.log('✅ 국가별 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 국가별 데이터 전송 실패:', error);
        throw error;
    }
}

async function trackDailyDevices(startDate, endDate) {
    console.log(`📱 ${startDate} ~ ${endDate} 디바이스별 데이터 전송...`);
    
    try {
        const tracker = new SearchConsoleTracker(config);
        await tracker.trackDailyDevicePerformance(startDate, endDate);
        console.log('✅ 디바이스별 데이터 전송 완료!');
    } catch (error) {
        console.error('❌ 디바이스별 데이터 전송 실패:', error);
        throw error;
    }
}

// 명령행 인수 처리
if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // 기본 실행: 최근 3일치 일별 데이터 전송
        main();
    } else if (args.length === 1) {
        // 특정 타입의 데이터 전송
        const [dataType] = args;
        
        switch (dataType) {
            case 'yesterday':
                console.log('📊 어제 데이터만 전송...');
                const dateRanges = getDateRanges();
                trackSpecificPeriod(dateRanges.yesterday.start, dateRanges.yesterday.end);
                break;
            case 'last-3-days':
                console.log('📊 최근 3일치 데이터 전송...');
                main();
                break;
            case 'last-week':
                console.log('📊 지난 주 데이터 전송...');
                const ranges = getDateRanges();
                trackSpecificPeriod(ranges.lastWeek.start, ranges.lastWeek.end);
                break;
            case 'last-month':
                console.log('📊 지난 달 데이터 전송...');
                const monthRanges = getDateRanges();
                trackSpecificPeriod(monthRanges.lastMonth.start, monthRanges.lastMonth.end);
                break;
            default:
                console.error('❌ 지원하지 않는 데이터 타입:', dataType);
                console.log('💡 지원하는 타입: yesterday, last-3-days, last-week, last-month');
                process.exit(1);
        }
    } else if (args.length === 2) {
        // 특정 기간 데이터 전송
        const [startDate, endDate] = args;
        trackSpecificPeriod(startDate, endDate);
    } else if (args.length === 3) {
        // 특정 분석 유형 + 기간
        const [analysisType, startDate, endDate] = args;
        
        switch (analysisType) {
            case 'queries':
                trackDailyQueries(startDate, endDate);
                break;
            case 'pages':
                trackDailyPages(startDate, endDate);
                break;
            case 'countries':
                trackDailyCountries(startDate, endDate);
                break;
            case 'devices':
                trackDailyDevices(startDate, endDate);
                break;
            default:
                console.error('❌ 지원하지 않는 분석 유형:', analysisType);
                console.log('💡 지원하는 유형: queries, pages, countries, devices');
                process.exit(1);
        }
    } else {
        console.log('💡 사용법:');
        console.log('  node search-performance.js                    # 기본 실행 (최근 3일치 일별)');
        console.log('  node search-performance.js yesterday          # 어제 데이터만');
        console.log('  node search-performance.js last-3-days        # 최근 3일치');
        console.log('  node search-performance.js 2024-01-01 2024-01-31  # 특정 기간');
        console.log('  node search-performance.js queries 2024-01-01 2024-01-31  # 쿼리만');
        console.log('  node search-performance.js pages 2024-01-01 2024-01-31     # 페이지만');
        console.log('  node search-performance.js countries 2024-01-01 2024-01-31 # 국가별만');
        console.log('  node search-performance.js devices 2024-01-01 2024-01-31   # 디바이스별만');
    }
}

export { main, trackSpecificPeriod, trackDailyQueries, trackDailyPages, trackDailyCountries, trackDailyDevices }; 