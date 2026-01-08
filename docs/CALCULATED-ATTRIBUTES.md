# 계산되는 유저 속성 정리

> 단순 기록이 아닌, **계산 로직을 통해 집계되는 속성들**만 정리

---

## 1. engagement_score (참여도 점수)

**계산 공식:**
```
engagement_score =
    (total_form_submissions × 50) +      // 폼 제출 1회당 50점
    (total_downloads × 30) +             // 다운로드 1회당 30점
    (total_scroll_depth_100 × 15) +      // 100% 스크롤 1회당 15점
    (popup_interactions × 10) +          // 팝업 상호작용 1회당 10점
    (external_link_clicks × 5) +         // 외부링크 클릭 1회당 5점
    min(total_sessions × 10, 100) +      // 세션당 10점, 최대 100점
    min(total_time_spent / 60, 200)      // 분당 1점, 최대 200점
```

**예시:**
- 폼 제출 1회 + 다운로드 2회 + 세션 5회 = 50 + 60 + 50 = **160점**

---

## 2. engagement_level (참여도 레벨)

**계산 조건:**
| engagement_score | engagement_level |
|------------------|------------------|
| 0 ~ 49 | `low` |
| 50 ~ 199 | `medium` |
| 200+ | `high` |

---

## 3. visitor_lifecycle_stage (방문자 생명주기)

**계산 조건 (우선순위 순):**

| 조건 | 단계 |
|------|------|
| 폼 제출 > 0 **또는** 회사소개 2회+ **또는** 고객사례 2회+ | `decision` |
| 세션 3회+ **또는** 다운로드 > 0 **또는** 회사/고객사례 방문 | `consideration` |
| 기본값 | `awareness` |

---

## 4. interaction_frequency (상호작용 빈도)

**계산 공식:**
```
interaction_rate = (폼제출 + 다운로드 + 팝업상호작용 + 외부링크클릭) / total_sessions
```

| interaction_rate | interaction_frequency |
|------------------|----------------------|
| 0 ~ 0.99 | `low` |
| 1 ~ 2.99 | `medium` |
| 3+ | `high` |

---

## 5. content_depth_preference (콘텐츠 깊이 선호도)

**기록 조건:**
| 사용자 행동 | 기록되는 깊이 |
|-------------|---------------|
| 페이지 10초 이상 체류 | `medium` |
| 페이지 30초 이상 체류 | `surface` |
| 100% 스크롤 도달 | `deep` |

**계산:** 가장 많이 기록된 깊이가 `content_depth_preference`가 됨

---

## 6. most_visited_section (최다 방문 섹션)

**계산:** `section_visits` 객체에서 방문 횟수가 가장 높은 섹션

```javascript
section_visits = {
    home: 5,
    blog: 12,      // ← 가장 높음
    solution: 3
}
// → most_visited_section = "blog"
```

---

## 7. average_session_duration (평균 세션 시간)

**계산 공식:**
```
average_session_duration = total_time_spent / total_sessions
```

---

## 8. is_returning_visitor (재방문자 여부)

**계산 조건:**
```
is_returning_visitor = (total_sessions >= 2)
```

---

## 9. first_channel (최초 유입 채널)

**계산 로직 (우선순위 순):**

| 조건 | 채널 |
|------|------|
| `gclid` 있음 | `Paid Search` |
| `utm_medium` = cpc, ppc | `Paid Search` |
| `utm_medium` = cpm, cpa | `Paid Social` |
| referrer가 google, naver, daum 등 | `Organic Search` |
| `utm_medium` = social 또는 referrer가 SNS | `Social` |
| referrer만 있고 UTM 없음 | `Referral` |
| 아무것도 없음 | `Direct` |
| 기타 | `Other` |

---

## 10. preferred_visit_time (선호 방문 시간대)

| 방문 시간 | 값 |
|-----------|-----|
| 06:00 ~ 11:59 | `morning` |
| 12:00 ~ 17:59 | `afternoon` |
| 18:00 ~ 21:59 | `evening` |
| 22:00 ~ 05:59 | `night` |

---

## 11. is_engaged_session (참여 세션 여부)

**계산 조건:**
```
is_engaged_session = (체류시간 >= 10초) OR (상호작용 횟수 >= 2회)
```

---

## 요약 표

| 속성 | 계산 방식 | 결과 타입 |
|------|-----------|-----------|
| `engagement_score` | 행동별 가중치 합산 | 숫자 |
| `engagement_level` | 점수 구간 분류 | low/medium/high |
| `visitor_lifecycle_stage` | 행동 조건 체크 | awareness/consideration/decision |
| `interaction_frequency` | 세션당 상호작용 비율 | low/medium/high |
| `content_depth_preference` | 체류시간/스크롤 기반 | surface/medium/deep |
| `most_visited_section` | 방문 횟수 최대값 | 섹션명 |
| `average_session_duration` | 총시간/총세션 | 초 단위 숫자 |
| `is_returning_visitor` | 세션 2회 이상 | true/false |
| `first_channel` | UTM/gclid/referrer 분석 | 채널명 |
| `preferred_visit_time` | 방문 시간대 | morning/afternoon/evening/night |
| `is_engaged_session` | 10초 또는 2회 상호작용 | true/false |
