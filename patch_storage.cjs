const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

if (!code.includes('DataMutasi')) {
  code = code.replace("DataInvoice, DataDKP, StorageTarget", "DataInvoice, DataDKP, DataMutasi, StorageTarget");
  
  code = code.replace(
    "let cachedInvoice: any[] = [];",
    "let cachedInvoice: any[] = [];\nlet cachedMutasi: any[] = [];"
  );

  code = code.replace(
    "  onSnapshot(collection(db, 'invoice'), snap => {\n    cachedInvoice = snap.docs.map(d => ({id: d.id, ...d.data()}));\n  });\n}",
    "  onSnapshot(collection(db, 'invoice'), snap => {\n    cachedInvoice = snap.docs.map(d => ({id: d.id, ...d.data()}));\n  });\n  onSnapshot(collection(db, 'mutasi'), snap => {\n    cachedMutasi = snap.docs.map(d => ({id: d.id, ...d.data()}));\n  });\n}"
  );

  code = code.replace(
    "export const loadDataInvoice = (): DataInvoice[] => cachedInvoice;",
    "export const loadDataInvoice = (): DataInvoice[] => cachedInvoice;\nexport const loadDataMutasi = (): DataMutasi[] => cachedMutasi;"
  );

  code = code.replace(
    "export const saveDataInvoice = (data: DataInvoice[]) => {\n  cachedInvoice = data;\n};",
    "export const saveDataInvoice = (data: DataInvoice[]) => {\n  cachedInvoice = data;\n};\nexport const saveDataMutasi = (data: DataMutasi[]) => {\n  cachedMutasi = data;\n};"
  );
  
  // exportToCSV update for mutasi
  const mutasiCsvBlock = `
  if (target === 'mutasi') {
    const data = loadDataMutasi();
    const filteredData = monthFilter
      ? data.filter(d => isSameMonth(d.tanggal, monthFilter))
      : data;
    const sorted = [...filteredData].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    
    csvContent += 'Tanggal;Jenis Kayu;AI_Batang;AI_Volume;AII_Batang;AII_Volume;AIII_Batang;AIII_Volume;Total_Batang;Total_Volume\\n';
    
    sorted.forEach(item => {
      const totalBtg = item.ai_batang + item.aii_batang + item.aiii_batang;
      const totalVol = item.ai_volume + item.aii_volume + item.aiii_volume;
      const row = [
        item.tanggal,
        item.jenis,
        item.ai_batang,
        item.ai_volume,
        item.aii_batang,
        item.aii_volume,
        item.aiii_batang,
        item.aiii_volume,
        totalBtg,
        totalVol
      ].map(val => \`"\${String(val).replace(/"/g, '""')}"\`).join(';');
      csvContent += row + '\\n';
    });
    filename = \`Data_Mutasi_\${monthFilter || 'Semua'}.csv\`;
  }
`;
  code = code.replace(
    "  const bom = '\\uFEFF';",
    "  const bom = '\\uFEFF';" + mutasiCsvBlock
  );

  fs.writeFileSync('src/lib/storage.ts', code);
}
