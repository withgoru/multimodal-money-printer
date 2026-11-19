---
tags:
  - agent-package
  - agent/lesson-author
  - type/reference
---

# 산출물 계약, 버전 1

교안 출력 폴더에는 아래 파일을 둔다.

| 파일 | 용도 |
|---|---|
| `lesson.json` | 자동 검사와 인계에 쓰는 시간표 |
| `evidence.md` | 자료 출처와 확인 범위 |
| `lesson.md` | 강사용 진행 원고 |
| `practice.md` | 학생 과제와 제출 증거 |
| `review.md` | 검사 결과, 가정, 강사가 결정할 항목 |

전체 교안 생성 요청에는 위 다섯 파일과 함께 같은 차시의 HTML·PDF 발표 자료를 기본으로 제공한다. PPTX는 사용자가 PPTX·PowerPoint 형식을 명시적으로 요청한 경우에만 제공한다. 형식에 대한 명시적 지시가 있으면 그 지시를 우선한다. 기존 초안이나 부분 수정 작업에는 발표 자료를 자동 적용하지 않는다.

| 파일 | 용도 |
|---|---|
| `lesson.pdf` | 배포·검토용 발표 자료 |
| `lesson.html` | 브라우저 발표용 자료 |
| `lesson.pptx` | 명시적으로 요청한 경우의 편집 가능한 발표 자료 |

`lesson.json`의 형식:

```json
{
  "schemaVersion": 1,
  "status": "draft",
  "title": "차시 제목",
  "audience": "학습 대상",
  "durationMinutes": 10,
  "objective": "수업 뒤 학생이 보여 줄 행동",
  "assessmentEvidence": "학생이 제출하거나 보여 줄 증거",
  "sources": [
    { "id": "S1", "path": "source.md", "locator": "절 또는 쪽", "use": "이 자료가 뒷받침하는 내용" }
  ],
  "segments": [
    {
      "title": "도입",
      "kind": "explain",
      "minutes": 2,
      "teacher": "강사가 할 일",
      "learner": "학생이 할 일",
      "check": "확인할 결과 또는 질문",
      "sourceIds": ["S1"]
    }
  ]
}
```

`kind`는 `explain`(설명), `demo`(시연), `practice`(학생 실습), `check`(확인) 중 하나다. 한 차시에 학생 실습과 결과 확인을 각각 한 구간 이상 둔다. 출처 경로는 절대경로가 아니면 출력 폴더를 기준으로 해석한다. 마무리 회고 질문처럼 외부 자료의 사실을 주장하지 않는 구간에서는 `sourceIds`를 비워 둘 수 있다. 검사 스크립트는 파일 유무, 구조, 출처 ID 연결, 시간 합계를 확인한다. `--with-slides`는 HTML·PDF를, `--with-pptx`는 명시적으로 요청받은 PPTX의 존재와 기본 형식을 추가 확인한다. 출처가 실제 주장을 뒷받침하는지와 수업의 질은 강사가 판단한다.
