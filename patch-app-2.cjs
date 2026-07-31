const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<DashboardTab[\s\S]*?onNavigateTab=\{handleSwitchTab\}\n\s*\/>/,
`<DashboardTab 
              dataAngkut={dataAngkut}
              dataKetiga={dataKetiga}
              dataPerhutani={dataPerhutani}
              onNavigateTab={handleSwitchTab}
              filterDate={globalFilterDate}
              onFilterDateChange={setGlobalFilterDate}
            />`);

code = code.replace(/<LaporanTab[\s\S]*?onExportCSV=\{m => exportToCSV\('laporan', m\)\}\n\s*\/>/,
`<LaporanTab 
              dataAngkut={dataAngkut}
              dataKetiga={dataKetiga}
              dataPerhutani={dataPerhutani}
              onExportCSV={m => exportToCSV('laporan', m)}
              filterDate={globalFilterDate}
              onFilterDateChange={setGlobalFilterDate}
            />`);

fs.writeFileSync('src/App.tsx', code);
