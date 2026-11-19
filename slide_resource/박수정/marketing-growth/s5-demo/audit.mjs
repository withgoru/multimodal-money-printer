import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseCsv } from './csv.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const rows = parseCsv(await readFile(join(root, 'data/controlled_copy_experiment.csv'), 'utf8'));
if (rows.length !== 16000 || rows.some(row => row.status !== 'synthetic')) {
  throw new Error('교육용 R6 원본의 행 수 또는 가상 자료 표시가 예상과 다릅니다.');
}
const ids = new Set(rows.map(row => row.assigned_user_id));
if (ids.size !== rows.length) throw new Error('배정 사용자 ID 중복을 확인하세요.');
const groups = Object.fromEntries(['control', 'treatment'].map(key => [key, { assigned: 0, purchases: 0 }]));
for (const row of rows) {
  const group = groups[row.variant];
  if (!group) throw new Error(`알 수 없는 집단: ${row.variant}`);
  if (!['0', '1'].includes(row.purchased_7d)) throw new Error('구매 결과는 0/1이어야 합니다.');
  group.assigned++;
  group.purchases += Number(row.purchased_7d);
}
if (groups.control.assigned !== 8000 || groups.treatment.assigned !== 8000) {
  throw new Error('집단별 배정 수가 예상과 다릅니다.');
}
const p0 = groups.control.purchases / groups.control.assigned;
const p1 = groups.treatment.purchases / groups.treatment.assigned;
const difference = p1 - p0;
const standardError = Math.sqrt(p0 * (1 - p0) / groups.control.assigned + p1 * (1 - p1) / groups.treatment.assigned);
const audit = {
  source: 'R6 controlled_copy_experiment.csv · 교육용 합성 실험',
  control: groups.control,
  treatment: groups.treatment,
  absoluteDifferencePp: 100 * difference,
  relativeChangePct: 100 * difference / p0,
  normal95Pp: [100 * (difference - 1.96 * standardError), 100 * (difference + 1.96 * standardError)],
  assumptions: ['배정 사용자를 분모로 사용', '독립 배정과 이항 결과를 가정한 단순 정규근사'],
  limitations: ['실제 플랫폼 실험이 아님', '노출·광고비·매출·환불 정보 없음', 'R4 관찰 캠페인과 독립된 사례'],
  simulatedAiClaims: [
    { claim: '처리군의 7일 구매자 비율이 0.8%p 높다', decision: '수용', evidence: 'R6 집단별 구매/배정 사용자 집계' },
    { claim: '처리군의 ROAS가 20% 높다', decision: '폐기', evidence: 'R6에 광고비와 매출이 없음' },
    { claim: '모든 채널에서 같은 효과가 난다', decision: '폐기', evidence: 'R6에 채널별 일반화 검증 자료가 없음' },
  ],
};
await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/audit.json'), `${JSON.stringify(audit, null, 2)}\n`);
console.log(`R6 ${rows.length}명, 대조 ${groups.control.purchases}/${groups.control.assigned}, 처리 ${groups.treatment.purchases}/${groups.treatment.assigned} → dist/audit.json`);
