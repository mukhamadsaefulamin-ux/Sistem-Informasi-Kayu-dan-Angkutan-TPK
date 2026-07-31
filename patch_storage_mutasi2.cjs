const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const mutasiPreviewBlock = `  } else if (target === 'mutasi') {
    const current = loadDataMutasi();
    const currentFileRows: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 2) {
        let tanggal = cols[0] || new Date().toISOString().split('T')[0];
        let jenis = (cols[1] || '').toUpperCase();
        let ai_batang = parseInt(cols[2]) || 0;
        let ai_volume = parseFloat((cols[3] || '').replace(',', '.')) || 0;
        let aii_batang = parseInt(cols[4]) || 0;
        let aii_volume = parseFloat((cols[5] || '').replace(',', '.')) || 0;
        let aiii_batang = parseInt(cols[6]) || 0;
        let aiii_volume = parseFloat((cols[7] || '').replace(',', '.')) || 0;

        const rowData = { id: 'preview-'+i, tanggal, jenis, ai_batang, ai_volume, aii_batang, aii_volume, aiii_batang, aiii_volume };
        const isDuplicateCondition = (item: any) => {
            return matchStr(item.tanggal, tanggal) && matchStr(item.jenis, jenis);
        };
        
        if (current.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_db', reason: 'Data untuk bulan dan jenis ini sudah ada di database.' });
            result.duplicate++;
        } else if (currentFileRows.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_file', reason: 'Data ganda di dalam file CSV.' });
            result.duplicate++;
        } else {
            result.rows.push({ id: rowData.id, data: rowData, status: 'valid' });
            currentFileRows.push(rowData);
            result.valid++;
        }
      }
    }
  }`;

if (!code.includes("else if (target === 'mutasi') {\n    const current = loadDataMutasi();\n    const currentFileRows")) {
    code = code.replace(
        "  return result;\n};",
        mutasiPreviewBlock + "\n  return result;\n};"
    );
    fs.writeFileSync('src/lib/storage.ts', code);
}
