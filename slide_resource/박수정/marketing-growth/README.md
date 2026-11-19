---
tags:
  - course/marketing-growth
  - type/index
---

# 멀티모달 AI 데이터 기반그로스 마케팅 · 과정 자료

112시간 독립 과정의 기획·근거·학습자료와 팀 교안 제작 과제를 모은 **공개용 복사본**이다. Instructor Studio 과정 ID `course-11e227c0534d`와 S5 26/26은 원래 KDT 작업 공간에서 확인한 2026-11-18 기록이다. 이 저장소는 Studio 데이터베이스를 포함하지 않으며 현재 상태를 자동으로 갱신하지 않는다. 실제 클라우드 공개·광고 집행도 검증되지 않았다. 당시 완료 범위는 [단계별 산출물 지도](./진행_현황.md)에서 확인한다.

| 묶음 | 파일 |
|---|---|
| 제작 에이전트 | [과정별 에이전트 지침](AGENTS.md) · [공용 교안 제작 스킬](tooling/lesson-author/SKILL.md) |
| 팀 공동 작업 | [팀 자료 목차](team-agents/README.md) · [공유 브리프](team-agents/공유_브리프.md) · [실행 순서](team-agents/실행_순서.md) |
| 기획과 편성 | [과정 기획서](./과정_기획서.md) · [NCS 선택과 채택 커리큘럼](./NCS_선정_기록.md) · [선택표](MARKETING_GROWTH_NCS_SELECTION_2026-11-18.xlsx) · [교과·차시 편성](./교과_차시_편성.md) |
| 통합 기획서 | [최종 과정 기획서 PDF](./최종_과정_기획서.pdf) · [팀 기획서 3종 비교](./team-agents/기획서/기획서_비교.md) |
| 실습·데모 설계 | [23개 실습 차시와 3단계 설계](./실습_데모_설계.md) · [재현 가능한 로컬 강사 데모](./s5-demo/README.md) |
| 차시 교안 초안 | [M1-1-T 이론 3시간](./lesson-drafts/M1-1-T/lesson.md) · [HTML 발표 자료](./lesson-drafts/M1-1-T/lesson.html) · [PDF 발표 자료](./lesson-drafts/M1-1-T/lesson.pdf) · [M1-1-P 실습 1시간](./lesson-drafts/M1-1-P/lesson.md) |
| 진행 기록 | [단계별 산출물 지도](./진행_현황.md) · [제작 과정 메모](./제작_절차_기록_2026-11-18.md) · [Studio 적용 기록](./LMS_적용_기록_2026-11-18.md) |
| 원고·실습 입력 | [근거 목록](./evidence/근거_목록.md) · [근거 중심 학습서](./evidence/근거_중심_학습서.md) · [112시간 워크북](./evidence/112h-workbook/112시간_실습_워크북.md) · [가상 데이터·소재](evidence/multimodal-assets/README.md) |
| PDF | [112시간 통합 학습 패키지](pdf/marketing-growth-112h-study-package-2026-11-18.pdf) |

REF-031~033 요약은 [참고 자료](references/INDEX.md)에 포함했다. NCS와 연구 논문의 원본 PDF는 재배포하지 않고 [공식 검색 경로와 원문 위치](references/NCS.md) 및 [근거 목록](evidence/근거_목록.md)에 연결했다. 이 과정의 통합 학습자료 PDF는 위 한 개다.

팀의 10분 시강 세부 주제는 아직 제안 단계다. [기존 제작 절차 발표덱](references/PROJECT-SOURCES.md)은 AI 답변 예시로 작성됐으며, 이번 과정의 시강 완료 증거는 아니다. 팀 실행 결과는 `team-agents/결과/`에 모은다.

팀 기획서 3종은 시수와 운영 전제가 다르다. 이 저장소의 채택 과정은 **112시간 독립 과정**이며, [비교 문서](./team-agents/기획서/기획서_비교.md)의 다른 안은 검토 자료다.

## SJ 에이전트 분석 기준

팀원이 SJ가 구성한 에이전트를 분석하거나 다른 에이전트와 비교할 때는 이 PDF의 시스템 설계도와 11~12절을 기준으로 사용합니다. 이 문서는 KDT 자료 수집부터 Instructor Studio의 과정 설계, 교안 제작, LMS 운영까지 에이전트와 강사가 어떻게 작업하는지 설명합니다. [KDT 팀 시스템 및 에이전트 설명서](pdf/kdt-team-system-and-agents.pdf)

분석할 때는 각 에이전트와 도구의 **역할과 사용 시점**, **입력과 산출물**, **강사 검토·적용·저장이 필요한 단계**를 확인하고, 판단 근거로 PDF 쪽이나 절을 남깁니다.

## 다시 실행하기

- 차시 구조 검사: `node tooling/lesson-author/scripts/validate.mjs lesson-drafts/M1-1-T --with-slides`
- 로컬 강사 데모: `cd s5-demo && npm run build && npm start` ([실행 안내](s5-demo/README.md))
- 통합 PDF 재생성: `uv run --with pypdf --with reportlab python evidence/112h-workbook/build_full_pdf.py`

원래 KDT 저장소의 Git 기준점과 Studio revision은 역사적 기록이다. 이 공개 저장소에서 해당 커밋으로 이동하거나 Studio 저장을 실행할 수 없다. [의존 자료 범위](references/PROJECT-SOURCES.md)를 확인한다.
