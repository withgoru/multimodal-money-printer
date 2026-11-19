import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT는 0~65535 정수여야 합니다.');
const routes = new Map([
  ['/', ['dist/report.html', 'text/html; charset=utf-8']],
  ['/audit.json', ['dist/audit.json', 'application/json; charset=utf-8']],
]);
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (pathname === '/health') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    response.end(JSON.stringify({ status: 'ok', data: 'synthetic-training-only' }));
    return;
  }
  const route = routes.get(pathname);
  if (!route) { response.writeHead(404); response.end('Not found'); return; }
  try {
    const body = await readFile(join(root, route[0]));
    response.writeHead(200, { 'content-type': route[1], 'cache-control': 'no-store' });
    response.end(body);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 503 : 500);
    response.end('데모 결과가 없습니다. npm run build를 먼저 실행하세요.');
  }
});
server.listen(port, host, () => {
  console.log(`교육용 보고서: http://${host}:${server.address().port}/`);
});
