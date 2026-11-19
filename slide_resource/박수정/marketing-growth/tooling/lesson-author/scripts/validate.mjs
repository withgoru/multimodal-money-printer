#!/usr/bin/env node
import { open, readFile, stat } from 'node:fs/promises';
import { resolve, isAbsolute } from 'node:path';

const withSlides = process.argv.includes('--with-slides');
const withPptx = process.argv.includes('--with-pptx');
const dirArg = process.argv.slice(2).find(arg => !['--with-slides', '--with-pptx'].includes(arg));
const dir = resolve(dirArg || '');
const errors = [];
if (!dirArg || dirArg.startsWith('--')) {
  console.error('사용법: node scripts/validate.mjs <교안 출력 폴더> [--with-slides] [--with-pptx]');
  process.exit(2);
}

async function nonemptyFile(name) {
  try {
    const path = resolve(dir, name);
    const file = await stat(path);
    if (!file.isFile() || file.size === 0) errors.push(`${name}: 빈 파일이거나 일반 파일이 아닙니다`);
    return path;
  } catch {
    errors.push(`${name}: 파일이 없습니다`);
    return null;
  }
}

for (const name of ['lesson.json', 'evidence.md', 'lesson.md', 'practice.md', 'review.md']) {
  await nonemptyFile(name);
}

if (withSlides || withPptx) {
  const slideFiles = [...(withSlides ? ['lesson.pdf', 'lesson.html'] : []), ...(withPptx ? ['lesson.pptx'] : [])];
  for (const name of slideFiles) {
    const path = await nonemptyFile(name);
    if (!path) continue;
    try {
      if (name === 'lesson.html') {
        const html = await readFile(path, 'utf8');
        if (!/<(?:!doctype\s+html|html\b)/i.test(html)) errors.push(`${name}: HTML 문서 형식이 아닙니다`);
      } else {
        const file = await open(path, 'r');
        let signature;
        try {
          signature = Buffer.alloc(5);
          await file.read(signature, 0, 5, 0);
        } finally {
          await file.close();
        }
        if (name === 'lesson.pdf' && signature.toString('ascii', 0, 5) !== '%PDF-') {
          errors.push(`${name}: PDF 파일 형식이 아닙니다`);
        }
        if (name === 'lesson.pptx' && signature.toString('ascii', 0, 4) !== 'PK\x03\x04') {
          errors.push(`${name}: PPTX 파일 형식이 아닙니다`);
        }
      }
    } catch (error) {
      errors.push(`${name}: 형식을 확인할 수 없습니다 (${error.message})`);
    }
  }
}

let lesson;
try {
  lesson = JSON.parse(await readFile(resolve(dir, 'lesson.json'), 'utf8'));
} catch (error) {
  errors.push(`lesson.json: JSON 형식이 올바르지 않습니다 (${error.message})`);
}

const hasText = value => typeof value === 'string' && value.trim().length > 0;
if (lesson && typeof lesson === 'object' && !Array.isArray(lesson)) {
  if (lesson.schemaVersion !== 1) errors.push('schemaVersion은 1이어야 합니다');
  if (lesson.status !== 'draft') errors.push('status는 draft여야 합니다');
  for (const key of ['title', 'audience', 'objective', 'assessmentEvidence']) {
    if (!hasText(lesson[key])) errors.push(`${key} 값이 필요합니다`);
  }
  if (!Number.isInteger(lesson.durationMinutes) || lesson.durationMinutes <= 0) {
    errors.push('durationMinutes는 1 이상의 정수여야 합니다');
  }

  const sources = Array.isArray(lesson.sources) ? lesson.sources : [];
  if (!sources.length) errors.push('sources에 출처가 하나 이상 있어야 합니다');
  const ids = new Set();
  for (const [index, source] of sources.entries()) {
    const label = `sources[${index}]`;
    if (!source || !hasText(source.id) || !hasText(source.path) || !hasText(source.locator) || !hasText(source.use)) {
      errors.push(`${label}에 id, path, locator, use가 모두 필요합니다`);
      continue;
    }
    if (ids.has(source.id)) errors.push(`${label}의 id ${source.id}가 중복됩니다`);
    ids.add(source.id);
    if (!/^https?:\/\//i.test(source.path)) {
      const sourcePath = isAbsolute(source.path) ? source.path : resolve(dir, source.path);
      try { if (!(await stat(sourcePath)).isFile()) errors.push(`${label}의 path가 파일을 가리키지 않습니다`); }
      catch { errors.push(`${label}의 path를 찾을 수 없습니다: ${source.path}`); }
    }
  }

  const segments = Array.isArray(lesson.segments) ? lesson.segments : [];
  if (!segments.length) errors.push('segments에 수업 구간이 하나 이상 있어야 합니다');
  let total = 0;
  const kinds = new Set();
  for (const [index, segment] of segments.entries()) {
    const label = `segments[${index}]`;
    if (!segment || !hasText(segment.title) || !hasText(segment.teacher) || !hasText(segment.learner) || !hasText(segment.check)) {
      errors.push(`${label}에 title, teacher, learner, check가 모두 필요합니다`);
      continue;
    }
    if (!['explain', 'demo', 'practice', 'check'].includes(segment.kind)) errors.push(`${label}의 kind 값이 올바르지 않습니다`);
    else kinds.add(segment.kind);
    if (!Number.isInteger(segment.minutes) || segment.minutes <= 0) errors.push(`${label}.minutes는 1 이상의 정수여야 합니다`);
    else total += segment.minutes;
    if (!Array.isArray(segment.sourceIds)) errors.push(`${label}.sourceIds는 배열이어야 합니다`);
    else for (const id of segment.sourceIds) if (!ids.has(id)) errors.push(`${label}가 알 수 없는 출처 ${id}를 참조합니다`);
  }
  if (Number.isInteger(lesson.durationMinutes) && total !== lesson.durationMinutes) {
    errors.push(`수업 구간 시간 합계가 ${total}분입니다. 예정 시간은 ${lesson.durationMinutes}분입니다`);
  }
  if (!kinds.has('practice')) errors.push('학생 실습(practice) 구간이 하나 이상 필요합니다');
  if (!kinds.has('check')) errors.push('결과 확인(check) 구간이 하나 이상 필요합니다');
}

if (errors.length) {
  console.error(`교안 초안 구조 검사 실패 (${errors.length}건):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`교안 초안 구조 검사 통과: ${lesson.title} (${lesson.durationMinutes}분, 출처 ${lesson.sources.length}개, 수업 구간 ${lesson.segments.length}개)`);
