// Google Search Console API 설정
module.exports = {
    // 기본 설정
    credentials: {
        // 서비스 계정 키 파일 경로
        path: './credentials/service-account-key.json',
        
        // API 스코프
        scopes: [
            'https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/webmasters'
        ]
    },

    // 사이트 설정
    sites: {
        // 기본 사이트 URL (도메인 속성)
        default: 'https://www.thinkingdata.kr',
        
        // 여러 사이트가 있는 경우
        properties: [
            'https://www.thinkingdata.kr',
            'https://thinkingdata.kr' // www 없는 버전
        ]
    },

    // 데이터 조회 설정
    analytics: {
        // 기본 조회 기간 (일)
        defaultDays: 30,
        
        // 최대 행 수
        maxRows: 25000,
        
        // 기본 차원
        defaultDimensions: ['query', 'page'],
        
        // 사용 가능한 차원들
        availableDimensions: [
            'query',      // 검색어
            'page',       // 페이지
            'country',    // 국가
            'device',     // 디바이스
            'searchAppearance' // 검색 외관
        ]
    },

    // 캐싱 설정
    caching: {
        // 캐시 활성화
        enabled: true,
        
        // 캐시 만료 시간 (분)
        ttl: 60,
        
        // 캐시 디렉토리
        directory: './cache/search-console'
    },

    // 로깅 설정
    logging: {
        // 로그 레벨
        level: 'info', // 'error', 'warn', 'info', 'debug'
        
        // 로그 파일 경로
        file: './logs/search-console.log',
        
        // 콘솔 출력 활성화
        console: true
    },

    // 에러 처리 설정
    errorHandling: {
        // 재시도 횟수
        maxRetries: 3,
        
        // 재시도 간격 (밀리초)
        retryDelay: 1000,
        
        // 타임아웃 (밀리초)
        timeout: 30000
    },

    // 데이터 내보내기 설정
    export: {
        // CSV 내보내기 활성화
        csv: true,
        
        // JSON 내보내기 활성화
        json: true,
        
        // 내보내기 디렉토리
        directory: './exports/search-console'
    }
}; 