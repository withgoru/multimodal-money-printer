export function parseCsv(source) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"') {
      if (quoted && source[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) { row.push(field); field = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && source[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
    } else field += ch;
  }
  if (quoted) throw new Error('닫히지 않은 CSV 인용부호');
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...values] = rows;
  if (!headers) throw new Error('빈 CSV');
  return values.map((cells, index) => {
    if (cells.length !== headers.length) throw new Error(`CSV ${index + 2}행의 열 수 불일치`);
    return Object.fromEntries(headers.map((header, column) => [header, cells[column]]));
  });
}
