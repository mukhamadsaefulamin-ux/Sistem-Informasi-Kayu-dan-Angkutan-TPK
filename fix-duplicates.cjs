const fs = require('fs');
let code = fs.readFileSync('src/components/LaporanTab.tsx', 'utf8');

// I will remove the first set of functions because they might be at the top, and the second one might be somewhere else. Wait, let's see where they are.
const str = `const normalizeDateString = (dateStr: string) => {
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
};
`;

const firstIndex = code.indexOf(str);
if (firstIndex !== -1) {
  // Check if it appears twice
  const secondIndex = code.indexOf(str, firstIndex + 1);
  if (secondIndex !== -1) {
     code = code.substring(0, secondIndex) + code.substring(secondIndex + str.length);
  } else {
     // Check for the slightly different formatted one.
  }
}

fs.writeFileSync('src/components/LaporanTab.tsx', code);
