#!/usr/bin/env node

/**
 * Google Search Console 데이터 수집 전용 진입점
 * GitHub Actions에서 실행되는 Node.js 환경 전용
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import config from './config.js';
import SearchConsoleTracker from './core/search-console-tracker.js';
import { trackingLog } from './core/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 명령행 인수 처리
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        mode: 'daily', // 기본값: 일별 수집
        days: 3,       // 기본값: 최근 3일
        startDate: null,
        endDate: null
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--mode':
                options.mode = args[++i];
                break;
            case '--days':
                options.days = parseInt(args[++i]);
                break;
            case '--start-date':
                options.startDate = args[++i];
                break;
            case '--end-date':
                options.endDate = args[++i];
                break;
            case '--help':
                console.log(`
Google Search Console 데이터 수집 도구

사용법:
  node gsc-collector.js [옵션]

옵션:
  --mode <mode>        수집 모드 (daily: 일별, all: 전체)
  --days <number>      수집할 일수 (기본값: 3)
  --start-date <date>  시작 날짜 (YYYY-MM-DD)
  --end-date <date>    종료 날짜 (YYYY-MM-DD)
  --help               도움말 표시

예시:
  node gsc-collector.js --mode daily --days 3
  node gsc-collector.js --start-date 2024-01-01 --end-date 2024-01-31
                `);
                process.exit(0);
        }
    }

    return options;
}

/**
 * 날짜 계산
 */
function calculateDateRange(options) {
    const today = new Date();
    
    if (options.startDate && options.endDate) {
        return {
            startDate: options.startDate,
            endDate: options.endDate
        };
    }

    // 최근 N일 계산
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1); // 어제까지
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (options.days - 1));
    
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
}

/**
 * 메인 실행 함수
 */
async function main() {
    console.log('🎯 Google Search Console 데이터 수집 시작');
    
    try {
        // 1. 명령행 인수 파싱
        const options = parseArguments();
        console.log('📋 수집 옵션:', options);

        // 2. 날짜 범위 계산
        const dateRange = calculateDateRange(options);
        console.log(`📅 수집 기간: ${dateRange.startDate} ~ ${dateRange.endDate}`);

        // 3. Search Console Tracker 초기화
        const tracker = new SearchConsoleTracker({
            credentialsPath: join(__dirname, 'credentials', 'google-search-console.json'),
            siteUrl: config.googleSearchConsole.siteUrl,
            thinkingData: config.thinkingData
        });

        await tracker.initialize();

        // 4. 데이터 수집 실행
        if (options.mode === 'daily') {
            // 일별 데이터 수집 (최근 3일치)
            console.log('📊 일별 데이터 수집 모드');
            await tracker.trackDailyPerformance(dateRange.startDate, dateRange.endDate);
        } else {
            // 전체 데이터 수집 (기존 방식)
            console.log('📊 전체 데이터 수집 모드');
            await tracker.trackAllPerformance(dateRange.startDate, dateRange.endDate);
        }

        console.log('✅ Google Search Console 데이터 수집 완료!');
        
    } catch (error) {
        console.error('❌ Google Search Console 데이터 수집 실패:', error);
        process.exit(1);
    }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
} 