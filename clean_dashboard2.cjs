const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');
code = code.replace(/const \{ sisaBatangKetiga, sisaVolKetiga \} = useMemo\(\(\) => \{[\s\S]*?\}, \[dataKetiga, dataAngkut\]\);/, '');
code = code.replace(/const \{ sisaBatangPerhutani, sisaVolPerhutani \} = useMemo\(\(\) => \{[\s\S]*?\}, \[dataPerhutani\]\);/, '');
fs.writeFileSync('src/components/DashboardTab.tsx', code);
