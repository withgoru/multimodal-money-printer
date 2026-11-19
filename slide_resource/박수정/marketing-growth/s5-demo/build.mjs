import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseCsv } from './csv.mjs';

const root = dirname(fileURLToPath(import.meta.url));

const rows = parseCsv(await readFile(join(root, 'data/campaign_84d.csv'), 'utf8'));
if (rows.length !== 504 || rows.some(row => row.status !== 'synthetic')) {
  throw new Error('교육용 R4 원본의 행 수 또는 가상 자료 표시가 예상과 다릅니다.');
}
const metrics = ['impressions', 'clicks', 'spend_krw', 'purchases', 'revenue_krw'];
const groups = new Map();
for (const row of rows) {
  const key = `${row.channel}/${row.creative_id}`;
  const group = groups.get(key) ?? Object.fromEntries(metrics.map(name => [name, 0]));
  for (const name of metrics) {
    const value = Number(row[name]);
    if (!Number.isFinite(value) || value < 0) throw new Error(`${key}: ${name} 값 확인 필요`);
    group[name] += value;
  }
  groups.set(key, group);
}
const format = new Intl.NumberFormat('ko-KR');
const pct = (numerator, denominator) => denominator ? `${(100 * numerator / denominator).toFixed(2)}%` : '분모 0';
const krw = (numerator, denominator) => denominator ? `${format.format(Math.round(numerator / denominator))}원` : '분모 0';
const ratio = (numerator, denominator) => denominator ? `${(numerator / denominator).toFixed(2)}배` : '분모 0';
const table = [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `<tr><th scope="row">${key}</th><td>${format.format(value.impressions)}</td><td>${format.format(value.clicks)}</td><td>${format.format(value.spend_krw)}</td><td>${format.format(value.purchases)}</td><td>${format.format(value.revenue_krw)}</td><td>${pct(value.clicks, value.impressions)}</td><td>${krw(value.spend_krw, value.purchases)}</td><td>${ratio(value.revenue_krw, value.spend_krw)}</td></tr>`).join('\n');
let experiment = '<p>실험 검산은 다음 단계에서 연결합니다.</p>';
try {
  const audit = JSON.parse(await readFile(join(root, 'dist/audit.json'), 'utf8'));
  experiment = `<p>별도 합성 실험 R6: 대조군 ${audit.control.purchases}/${audit.control.assigned}명, 처리군 ${audit.treatment.purchases}/${audit.treatment.assigned}명. 구매율의 절대 차이 ${audit.absoluteDifferencePp.toFixed(2)}%p, 95% 정규근사 구간 ${audit.normal95Pp.map(x => x.toFixed(2)).join('~')}%p.</p><p>R6은 R4와 독립된 가상 사례입니다. 실제 캠페인 효과로 일반화하지 않습니다.</p>`;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>그로스 마케팅 검산 데모</title>
<style>body{font:16px/1.6 system-ui,sans-serif;max-width:1100px;margin:2rem auto;padding:0 1rem;color:#152237}h1,h2{color:#0b5370}table{border-collapse:collapse;width:100%;font-size:.88rem}th,td{border:1px solid #c8d4de;padding:.55rem;text-align:right}th:first-child{text-align:left}thead{background:#e9f4f8}section{margin:2rem 0}aside{background:#fff5dc;padding:1rem;border-left:4px solid #be7d00}.scroll{overflow:auto}</style></head><body>
<h1>멀티모달 AI 데이터 기반그로스 마케팅 · 강사 검산 데모</h1>
<aside><strong>교육용 합성 자료</strong> · R4의 84일 관찰 캠페인을 집계했습니다. 이 표는 무작위 실험의 효과를 뜻하지 않습니다.</aside>
<section><h2>채널·소재별 관찰 성과</h2><div class="scroll"><table><thead><tr><th>채널/소재</th><th>노출</th><th>클릭</th><th>광고비</th><th>구매</th><th>매출</th><th>CTR</th><th>CPA</th><th>ROAS</th></tr></thead><tbody>${table}</tbody></table></div><p>CTR = 클릭 합계 ÷ 노출 합계, CPA = 광고비 합계 ÷ 구매 합계, ROAS = 매출 합계 ÷ 광고비 합계. 일별 비율의 단순 평균을 전체 비율로 사용하지 않습니다.</p></section>
<section><h2>실험 해석 검산</h2>${experiment}</section>
<section><h2>검토 질문</h2><ol><li>CTR이 가장 높은 행과 CPA가 가장 낮은 행은 같은가?</li><li>비교를 의사결정에 쓰기 전 어떤 고객 구성·기간·계측 조건을 확인해야 하는가?</li><li>관찰값을 증분 효과라고 부를 수 없는 이유는 무엇인가?</li></ol></section>
<p>원본: <code>campaign_84d.csv</code>. 결과는 <code>node build.mjs</code>로 재생성할 수 있습니다.</p></body></html>\n`;
await mkdir(join(root, 'dist'), { recursive: true });
await writeFile(join(root, 'dist/report.html'), html);
console.log(`R4 ${rows.length}행, 채널×소재 ${groups.size}개 집계 → dist/report.html`);
