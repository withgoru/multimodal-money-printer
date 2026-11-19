---
tags:
  - agent-package
  - agent/lesson-author
  - type/readme
---

# 교안 제작 에이전트 공유 패키지

이 폴더가 **교안 제작 에이전트의 공유 가능한 정의**다. 코딩 에이전트가 `SKILL.md`를 읽고, 필요한 모듈만 실행한다. AI 모델이나 API 키를 패키지에 넣지 않는다.

## 사용

- Codex: 이 폴더를 `~/.codex/skills/lesson-author`로 복사하거나 링크한 뒤 `$lesson-author`로 요청한다.
- 다른 코딩 에이전트: “`agents/lesson-author/SKILL.md`를 읽고 이 주제로 10분 교안 초안을 만들어 줘”라고 요청한다.
- 생성 결과: 새 출력 폴더에 `lesson.json`, `evidence.md`, `lesson.md`, `practice.md`, `review.md`가 생긴다. 슬라이드는 요청과 프로젝트 기본값에 따른다.
- 구조 확인: `node agents/lesson-author/scripts/validate.mjs <출력 폴더>`.

예시 결과는 [`examples/grounded-answer`](examples/grounded-answer)에 있다. 팀원은 Git으로 이 폴더를 공유하고, 자신의 에이전트에서 같은 `SKILL.md`와 결과 파일을 읽을 수 있다. [구조 설명과 60초 발표 원고](ARCHITECTURE.md)는 조별 발표에 사용할 수 있다.

예시의 [근거 목록](examples/grounded-answer/evidence.md)에서 교안에 연결한 출처와 확인 위치를 볼 수 있다.

이 패키지는 Instructor Studio의 교안 생성 API를 대체하거나 과정 데이터를 수정하지 않는다. 이 저장소의 Instructor Studio 과정과 연결된 교안에는 [KDT 연결 규칙](references/kdt-adapter.md)을 적용한다.
