const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('DataMutasi')) {
  code = code.replace("export interface DataInvoice", "export interface DataMutasi {\n  id: string;\n  tanggal: string;\n  jenis: string;\n  ai_batang: number;\n  ai_volume: number;\n  aii_batang: number;\n  aii_volume: number;\n  aiii_batang: number;\n  aiii_volume: number;\n}\n\nexport interface DataInvoice");
  
  code = code.replace(
    "export type StorageTarget = 'angkut' | 'ketiga' | 'perhutani' | 'invoice' | 'dkp';",
    "export type StorageTarget = 'angkut' | 'ketiga' | 'perhutani' | 'invoice' | 'dkp' | 'mutasi';"
  );
  fs.writeFileSync('src/types.ts', code);
}
