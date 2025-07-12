import https from 'https';
import http from 'http';

/**
 * Node.js 환경에서 ThinkingData RESTful API를 사용하여 데이터를 전송하는 클래스
 * TE 데이터 규칙에 맞게 구현
 */
class ThinkingDataNode {
    constructor(config) {
        this.appId = config.appId;
        this.serverUrl = config.serverUrl;
        this.secretKey = config.secretKey || null;
        this.batchSize = config.batchSize || 20;
        this.buffer = [];
        this.isInitialized = true;
        
        // TE RESTful API 엔드포인트 설정
        this.apiEndpoint = this.serverUrl.endsWith('/sync_json') 
            ? this.serverUrl 
            : this.serverUrl.replace(/\/?$/, '') + '/sync_json';
    }

    /**
     * 시간 포맷을 TE 표준 포맷으로 변환
     * @param {string|Date} date - 변환할 날짜 (ISO 문자열, Date 객체, 또는 기타 날짜 형식)
     * @returns {string} TE 표준 포맷 ("yyyy-MM-dd HH:mm:ss.SSS")
     */
    toTETimeFormat(date) {
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) {
                throw new Error('Invalid date');
            }
            return d.toISOString().replace('T', ' ').slice(0, 23);
        } catch (error) {
            console.warn('⚠️ 시간 변환 실패, 현재 시간 사용:', error.message);
            return new Date().toISOString().replace('T', ' ').slice(0, 23);
        }
    }

    /**
     * 속성 객체의 timestamp를 TE 포맷으로 자동 변환
     * @param {Object} properties - 이벤트 속성 객체
     * @returns {Object} 변환된 속성 객체
     */
    normalizeProperties(properties) {
        const normalized = { ...properties };
        
        // timestamp 필드가 있으면 TE 포맷으로 변환
        if (normalized.timestamp) {
            normalized.timestamp = this.toTETimeFormat(normalized.timestamp);
        }
        
        // analysis_start_date, analysis_end_date도 변환 (날짜만)
        if (normalized.analysis_start_date) {
            normalized.analysis_start_date = this.toTETimeFormat(normalized.analysis_start_date + ' 00:00:00');
        }
        if (normalized.analysis_end_date) {
            normalized.analysis_end_date = this.toTETimeFormat(normalized.analysis_end_date + ' 23:59:59');
        }
        
        return normalized;
    }

    /**
     * 단일 이벤트 전송
     * @param {string} eventName - 이벤트 이름
     * @param {Object} properties - 이벤트 속성
     * @param {string} distinctId - 사용자 ID (선택사항)
     * @param {string} accountId - 계정 ID (선택사항)
     */
    async track(eventName, properties = {}, distinctId = null, accountId = null) {
        // 속성의 시간 필드들을 TE 포맷으로 자동 변환
        const normalizedProperties = this.normalizeProperties(properties);
        
        const eventData = {
            "#type": "track",
            "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
            "#event_name": eventName,
            "properties": normalizedProperties
        };

        if (distinctId) {
            eventData["#distinct_id"] = distinctId;
        }
        if (accountId) {
            eventData["#account_id"] = accountId;
        }

        // 배치 전송을 위해 버퍼에 추가
        this.buffer.push(eventData);

        // 버퍼가 가득 차면 전송
        if (this.buffer.length >= this.batchSize) {
            await this.flush();
        }
    }

    /**
     * 사용자 속성 설정
     * @param {Object} properties - 사용자 속성
     * @param {string} distinctId - 사용자 ID (선택사항)
     * @param {string} accountId - 계정 ID (선택사항)
     */
    async userSet(properties, distinctId = null, accountId = null) {
        const eventData = {
            "#type": "user_set",
            "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
            "properties": properties
        };

        if (distinctId) {
            eventData["#distinct_id"] = distinctId;
        }
        if (accountId) {
            eventData["#account_id"] = accountId;
        }

        this.buffer.push(eventData);

        if (this.buffer.length >= this.batchSize) {
            await this.flush();
        }
    }

    /**
     * 사용자 속성 한 번만 설정
     * @param {Object} properties - 사용자 속성
     * @param {string} distinctId - 사용자 ID (선택사항)
     * @param {string} accountId - 계정 ID (선택사항)
     */
    async userSetOnce(properties, distinctId = null, accountId = null) {
        const eventData = {
            "#type": "user_setOnce",
            "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
            "properties": properties
        };

        if (distinctId) {
            eventData["#distinct_id"] = distinctId;
        }
        if (accountId) {
            eventData["#account_id"] = accountId;
        }

        this.buffer.push(eventData);

        if (this.buffer.length >= this.batchSize) {
            await this.flush();
        }
    }

    /**
     * 사용자 속성 누적
     * @param {Object} properties - 사용자 속성 (숫자만 가능)
     * @param {string} distinctId - 사용자 ID (선택사항)
     * @param {string} accountId - 계정 ID (선택사항)
     */
    async userAdd(properties, distinctId = null, accountId = null) {
        const eventData = {
            "#type": "user_add",
            "#time": new Date().toISOString().replace('T', ' ').slice(0, 23),
            "properties": properties
        };

        if (distinctId) {
            eventData["#distinct_id"] = distinctId;
        }
        if (accountId) {
            eventData["#account_id"] = accountId;
        }

        this.buffer.push(eventData);

        if (this.buffer.length >= this.batchSize) {
            await this.flush();
        }
    }

    /**
     * 버퍼의 데이터를 서버로 전송
     */
    async flush() {
        if (this.buffer.length === 0) {
            return;
        }

        try {
            // TE RESTful API 규칙에 맞는 payload 구조
            // 여러 데이터를 배열로 전송
            const payload = this.buffer.map(eventData => ({
                appid: this.appId,
                data: eventData,
                debug: 1 // 디버그 모드 활성화
            }));

            await this.sendRequest(payload);
            console.log(`✅ ${this.buffer.length}개 이벤트 전송 완료`);
            this.buffer = [];
        } catch (error) {
            console.error('❌ 이벤트 전송 실패:', error.message);
            throw error;
        }
    }

    /**
     * HTTP 요청 전송 (TE RESTful API 규칙 준수)
     * @param {Object} payload - 전송할 데이터
     */
    async sendRequest(payload) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(payload);
            
            // URL 파싱
            const url = new URL(this.apiEndpoint);
            const isHttps = url.protocol === 'https:';
            const client = isHttps ? https : http;

            const options = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'client': '1' // 클라이언트 IP 수집 활성화
                }
            };

            const req = client.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.code === 0) {
                            resolve(response);
                        } else {
                            console.error('❌ TE API Error (debug):', {
                                code: response.code,
                                msg: response.msg,
                                raw: data
                            });
                            reject(new Error(`TE API Error: ${response.msg || 'Unknown error'}`));
                        }
                    } catch (parseError) {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(data);
                        } else {
                            console.error('❌ TE API HTTP Error:', {
                                status: res.statusCode,
                                raw: data
                            });
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * 강제로 모든 버퍼 데이터 전송
     */
    async close() {
        if (this.buffer.length > 0) {
            await this.flush();
        }
    }
}

export default ThinkingDataNode; 