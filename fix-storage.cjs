const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(/const month = currentMonthFilter !== undefined \? currentMonthFilter : todayStr\.substring\(0, 7\);\n\s*const dataAngkut = loadDataAngkut\(\)\.filter\(item => isSameMonth\(item\.tanggal, month\)\);/, 
`const filterDate = currentMonthFilter || '';
    const dataAngkut = loadDataAngkut().filter(item => {
      if (!filterDate) return true;
      const normItemDate = normalizeDateString(item.tanggal);
      return normItemDate === filterDate;
    });`);

fs.writeFileSync('src/lib/storage.ts', code);
