const fs = require('fs');
let code = fs.readFileSync('src/components/LaporanTab.tsx', 'utf8');

// Replace the bad formatDateIndoLabel function
code = code.replace(/const formatDateIndoLabel = \(monthStr: string\) => \{\n\s*if \(\!monthStr \|\| monthStr === 'all'\) return 'Semua Periode';[\s\S]*?return monthStr;\n\s*\}\n\};/m,
`const normalizeDateString = (dateStr: string) => {
  if (!dateStr) return '';
  const d = dateStr.replace(/\\//g, '-');
  const parts = d.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return d;
    if (parts[2].length === 4) return \`\${parts[2]}-\${parts[1].padStart(2, '0')}-\${parts[0].padStart(2, '0')}\`;
  }
  return dateStr;
};

const formatDateIndoLabel = (dateStr: string) => {
  if (!dateStr) return 'Semua Tanggal';
  try {
    const norm = normalizeDateString(dateStr);
    const parts = norm.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};`);

fs.writeFileSync('src/components/LaporanTab.tsx', code);
