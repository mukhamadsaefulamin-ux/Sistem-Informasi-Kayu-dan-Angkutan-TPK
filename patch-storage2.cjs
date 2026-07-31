const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const normalizeSnippet = `
const normalizeDateString = (dateStr: string) => {
  if (!dateStr) return '';
  const d = dateStr.replace(/\\//g, '-');
  const parts = d.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return d;
    if (parts[2].length === 4) return \`\${parts[2]}-\${parts[1].padStart(2, '0')}-\${parts[0].padStart(2, '0')}\`;
  }
  return dateStr;
};
`;

code = code.replace(/export const exportToCSV = /, normalizeSnippet + '\nexport const exportToCSV = ');

code = code.replace(/const normItemDate = item\.tanggal \? item\.tanggal\.replace\(\/\\\\\/\\\/g, '-'\) : '';/, 
`const normItemDate = normalizeDateString(item.tanggal);`);

fs.writeFileSync('src/lib/storage.ts', code);
