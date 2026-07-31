const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');
code = code.replace(/const totalSisaBatang = sisaBatangKetiga \+ sisaBatangPerhutani;\n\s*const totalSisaVolume = sisaVolKetiga \+ sisaVolPerhutani;\n\s*const totalSisaKapling = dataKetiga\.length \+ dataPerhutani\.length;/, '');
fs.writeFileSync('src/components/DashboardTab.tsx', code);
