const fs = require('fs');
const content = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');
fs.writeFileSync('src/components/RekapMutasiTab.tsx.backup', content);
