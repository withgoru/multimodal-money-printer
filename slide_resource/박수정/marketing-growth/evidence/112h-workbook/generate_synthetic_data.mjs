import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(import.meta.dirname, 'data');
fs.mkdirSync(outDir, { recursive: true });
let state = 20261118;
function rand() {
  state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return state / 4294967296;
}
function shuffle(values) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
function writeCsv(name, rows) {
  fs.writeFileSync(path.join(outDir, name), rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n') + '\n');
}

const baseDate = new Date('2026-08-01T00:00:00.000Z');
const dateAt = (day) => new Date(baseDate.getTime() + day * 86400000).toISOString().slice(0, 10);

const daily = [['date', 'channel', 'campaign_id', 'creative_id', 'impressions', 'clicks', 'spend_krw', 'purchases', 'revenue_krw', 'scenario_note', 'status']];
for (let day = 0; day < 84; day++) {
  for (const [channel, clickRate, buyRate, cpc] of [['search', .038, .035, 420], ['social', .025, .021, 290], ['display', .012, .012, 180]]) {
    for (const creative of ['A', 'B']) {
      const base = channel === 'search' ? 9000 : channel === 'social' ? 12000 : 15000;
      const impressions = Math.max(1000, Math.round(base * (1 + .13 * Math.sin(day * .46) + (rand() - .5) * .18)));
      const shift = day >= 42 && channel === 'social' && creative === 'B' ? 1.10 : 1;
      const clicks = Math.round(impressions * clickRate * (creative === 'B' ? .91 : 1.04) * shift * (.88 + rand() * .24));
      const spend = clicks * cpc;
      const stock = day >= 59 && day <= 64 ? .65 : 1;
      const purchases = Math.round(clicks * buyRate * (creative === 'B' ? 1.16 : .94) * stock * (.76 + rand() * .48));
      const note = day === 42 ? 'social_B_copy_change' : day === 59 ? 'stock_constraint_starts' : day === 65 ? 'stock_constraint_ends' : '';
      daily.push([dateAt(day), channel, `LUMI_${channel.toUpperCase()}`, `creative-${creative}`, impressions, clicks, spend, purchases, purchases * 40000, note, 'synthetic']);
    }
  }
}
writeCsv('campaign_84d.csv', daily);

const events = [['event_id', 'event_date', 'event_timestamp_utc', 'user_id', 'session_id', 'channel', 'campaign_id', 'creative_id', 'device', 'event_name', 'transaction_id', 'value_krw', 'status']];
let eventId = 0;
for (let user = 1; user <= 2400; user++) {
  const userId = `U${String(user).padStart(5, '0')}`;
  const sessionCount = 1 + Math.floor(rand() * 4);
  for (let s = 1; s <= sessionCount; s++) {
    const day = Math.floor(rand() * 84);
    const hour = 7 + Math.floor(rand() * 15);
    const device = rand() < .73 ? 'mobile' : 'desktop';
    const channel = ['search', 'social', 'display', 'organic'][Math.floor(rand() * 4)];
    const campaign = channel === 'organic' ? '' : `LUMI_${channel.toUpperCase()}`;
    const creative = channel === 'organic' ? '' : rand() < .5 ? 'creative-A' : 'creative-B';
    const sessionId = `${userId}_S${s}`;
    const sequence = ['session_start', 'page_view'];
    if (rand() < .76) sequence.push('view_item');
    if (sequence.includes('view_item') && rand() < .32) sequence.push('add_to_cart');
    if (sequence.includes('add_to_cart') && rand() < .22) sequence.push('purchase');
    for (let step = 0; step < sequence.length; step++) {
      const name = sequence[step];
      const timestamp = `${dateAt(day)}T${String(hour).padStart(2, '0')}:${String(step * 7).padStart(2, '0')}:00Z`;
      const transaction = name === 'purchase' ? `T${userId}_${s}` : '';
      const row = [`E${String(++eventId).padStart(6, '0')}`, dateAt(day), timestamp, userId, sessionId, channel, campaign, creative, device, name, transaction, name === 'purchase' ? 40000 : 0, 'synthetic'];
      if (eventId % 211 === 0 && name !== 'purchase') row[6] = '';
      events.push(row);
      if (name === 'purchase' && eventId % 29 === 0) events.push([...row.slice(0, 12), 'synthetic_duplicate']);
    }
  }
}
writeCsv('customer_events.csv', events);

const ids = shuffle(Array.from({ length: 16000 }, (_, i) => i + 1));
const groups = new Map(ids.map((id, index) => [id, index < 8000 ? 'control' : 'treatment']));
const bought = new Set();
for (const [group, n] of [['control', 320], ['treatment', 384]]) {
  for (const id of shuffle(ids.filter((x) => groups.get(x) === group)).slice(0, n)) bought.add(id);
}
const experiment = [['assigned_user_id', 'variant', 'copy_text', 'image_file', 'assigned_date', 'purchased_7d', 'status']];
for (let id = 1; id <= 16000; id++) {
  const group = groups.get(id);
  experiment.push([`X${String(id).padStart(5, '0')}`, group, group === 'control' ? '하루의 끝, 책상 위 작은 빛' : '하루를 밝히는 집중의 빛', 'creative-A-lifestyle.png', dateAt(id % 14), Number(bought.has(id)), 'synthetic']);
}
writeCsv('controlled_copy_experiment.csv', experiment);

const predictors = [['user_id', 'as_of_date', 'cohort', 'channel_first', 'device', 'sessions_prev14d', 'view_item_prev14d', 'cart_prev14d', 'prior_purchase', 'purchase_next7d', 'status']];
for (let user = 1; user <= 5000; user++) {
  const cohort = user <= 3000 ? 'train' : user <= 4000 ? 'validation' : 'test';
  const day = cohort === 'train' ? Math.floor(rand() * 48) : cohort === 'validation' ? 48 + Math.floor(rand() * 15) : 63 + Math.floor(rand() * 14);
  const sessions = Math.floor(rand() * 7);
  const views = Math.max(0, sessions + Math.floor((rand() - .3) * 5));
  const carts = Math.min(views, Math.floor(rand() * 3));
  const prior = rand() < .15 ? 1 : 0;
  const channel = ['search', 'social', 'display', 'organic'][Math.floor(rand() * 4)];
  const device = rand() < .72 ? 'mobile' : 'desktop';
  const probability = Math.min(.6, .015 + sessions * .006 + views * .004 + carts * .065 + prior * .03 + (channel === 'search' ? .015 : 0));
  predictors.push([`P${String(user).padStart(5, '0')}`, dateAt(day), cohort, channel, device, sessions, views, carts, prior, Number(rand() < probability), 'synthetic']);
}
writeCsv('purchase_prediction.csv', predictors);

writeCsv('scenario_markers.csv', [
  ['date', 'marker', 'interpretation', 'status'],
  [dateAt(42), 'social_B_copy_change', 'copy variation introduced in observational campaign; not a randomized test', 'synthetic'],
  [dateAt(59), 'stock_constraint_starts', 'stock constraint can reduce purchases across channels', 'synthetic'],
  [dateAt(65), 'stock_constraint_ends', 'stock availability returns', 'synthetic'],
]);

console.log(JSON.stringify({seed:20261118,daily:daily.length-1,events:events.length-1,experiment:experiment.length-1,prediction:predictors.length-1}));
