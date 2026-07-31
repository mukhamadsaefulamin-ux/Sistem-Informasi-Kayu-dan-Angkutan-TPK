const fs = require('fs');
let code = fs.readFileSync('src/components/PerhutaniTab.tsx', 'utf8');

if (!code.includes('FileText')) {
  // It shouldn't happen but wait, we see `<FileText className...` but not the import.
}
// just replace `} from 'lucide-react';` with `, FileText } from 'lucide-react';` if FileText is not in imports
const importBlockMatch = code.match(/import \{[^}]*\} from 'lucide-react';/);
if (importBlockMatch) {
  if (!importBlockMatch[0].includes('FileText')) {
    const newImportBlock = importBlockMatch[0].replace(/\} from 'lucide-react';/, ', FileText } from \'lucide-react\';');
    code = code.replace(importBlockMatch[0], newImportBlock);
  }
}
fs.writeFileSync('src/components/PerhutaniTab.tsx', code);
