const fs = require('fs');

const files = [
  'src/components/LaporanTab.tsx',
  'src/components/KetigaTab.tsx',
  'src/components/InvoiceTab.tsx',
  'src/components/RekapMutasiTab.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  const importBlockMatch = code.match(/import \{[^}]*\} from 'lucide-react';/);
  if (importBlockMatch) {
    if (!importBlockMatch[0].includes('FileText')) {
      const newImportBlock = importBlockMatch[0].replace(/\} from 'lucide-react';/, ', FileText } from \'lucide-react\';');
      code = code.replace(importBlockMatch[0], newImportBlock);
      fs.writeFileSync(file, code);
      console.log('Fixed ' + file);
    }
  }
}
