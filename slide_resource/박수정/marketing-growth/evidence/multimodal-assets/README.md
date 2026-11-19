---
tags:
  - output
  - course/curriculum-design
  - status/draft
---

# 멀티모달 그로스 마케팅 · 가상 데이터 원본

작성일: 2026-11-18

이 폴더의 파일은 [112시간 통합 학습 패키지 PDF](../../pdf/marketing-growth-112h-study-package-2026-11-18.pdf)에 첨부한 원본이다. 모두 **가상 생성 자료**이며 공개 GA4 예제나 실제 고객·광고 성과를 복제한 데이터가 아니다. 강사 검토용 초안으로 보관한다.

| 파일 | 내용·단위 | 생성 방식 |
|---|---|---|
| `creative-A-lifestyle.png`, `creative-B-product.png` | 가상 조명 제품의 생활 장면형·제품 중심형 광고 이미지 | 이미지 생성 도구, 인물·제품·브랜드 모두 가상 |
| `creative-A-voice.mp3`, `creative-B-voice.mp3` | 각 광고의 한국어 합성 음성 | 동일한 가상 문구를 macOS Yuna 음성으로 합성 |
| `creative-A-lifestyle.mp4`, `creative-B-product.mp4` | 각 이미지와 해당 합성 음성을 합친 약 5초 정지 클립 | FFmpeg 합성. 촬영 영상·실제 광고 집행 파일 아님 |
| `creative_metadata.csv` | 소재 ID, 양식·파일명, 문구, 특징, CTA | 가상 특징을 사람이 작성. 검증된 AI 분류 결과 아님 |
| `daily_campaign_metrics.csv` | A/B 캠페인별 14일, 총 28행의 노출·클릭·비용·구매·매출 | [학습서](../근거_중심_학습서.md)의 가상 합계에 맞춰 생성. 관찰 비교 데이터 |
| `ab_user_assignments.csv` | 합성 사용자 ID 2,000개, 집단·배정일·7일 구매 여부 | 난수 시드 `20261118`로 ID를 섞은 별도의 가상 배정 사례. 각 1,000명 중 대조군 40명, 처리군 46명 구매 |

`daily_campaign_metrics.csv`와 `ab_user_assignments.csv`는 **서로 다른 가상 사례**다. 캠페인 A/B의 관찰된 성과를 실험의 처리 효과로 해석하지 않는다. 공개 GA4 이벤트 자료는 [Google의 공식 BigQuery 예제 안내](https://developers.google.com/analytics/bigquery/web-ecommerce-demo-dataset)에서 접근할 수 있다. 해당 공개 데이터는 이 폴더에 복사하거나 가상 캠페인과 결합하지 않았다.

두 생성 이미지에는 배경뿐 아니라 조명 형태도 함께 달라졌다. 따라서 단일 요소의 효과를 측정하는 A/B 실험의 처리 소재로 그대로 사용하면 안 된다. 이 이미지는 멀티모달 특징 수집과 관찰 데이터 해석의 사례로 쓴다.

PDF의 첨부파일 패널을 지원하는 뷰어에서는 위 원본을 PDF 안에서 추출할 수 있다. 첨부파일 패널이 보이지 않을 때는 이 폴더의 파일을 사용한다.
