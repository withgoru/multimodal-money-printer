---
tags:
  - agent-package
  - agent/lesson-author
  - type/reference
---

# KDT 프로젝트 연결 규칙

이 저장소의 Instructor Studio 과정과 연결된 교안에만 이 문서를 적용한다.

- 저장소에 `AGENTS.md`와 `.Codex/constitution.md`가 있으면 먼저 읽고 담당 영역을 지킨다.
- 교안은 표준 흐름의 S3 목차, S4 자료 결정, S5 실습, S6 교안, S7 평가와 연결한다. 초안에서 이 단계를 언급할 수 있지만 완료 상태로 표시하지 않는다.
- 가능한 읽기 도구로 과정 상태와 자료 목록을 확인한다. 기존 자료와 NCS 원문 위치는 근거이며, 생성한 문장은 제안이다.
- 강사가 명시적으로 검토하고 반영하기 전에는 `lesson.json`과 Markdown 결과물을 `output/course/studio/courses/{courseId}/` 밖에 둔다. 생성 단계에서 `/api/agent-auto-outline-apply`, `/api/autopilot-apply`, 교안 저장 또는 과정 확정을 호출하지 않는다.
- 이 공개 저장소의 기본 슬라이드는 `tooling/slides-template/README.md`를 따른다. 전체 교안 요청의 HTML·PDF는 초안 옆에 두고 강사 전용 메모는 `lesson.md`에 둔다. PPTX는 명시적으로 요청받았을 때만 생성한다. 원래 KDT 작업 공간의 Instructor Studio CLI는 PPTX·PDF를 함께 생성하므로 PPTX 미요청 작업의 기본 출력 경로로 사용하지 않는다.
- 새 API나 `apps/instructor-studio/src/{domain,store,ai,ingest,mcp}`, `src/web/server.ts`, `test/`의 수정이 필요하면 003 인터페이스 계약을 확인하고 해당 코드 담당자에게 요청한다. 이 스킬은 검토 가능한 교안 초안까지 만들 수 있다.
