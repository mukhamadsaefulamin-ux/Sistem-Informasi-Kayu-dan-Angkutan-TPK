const fs = require('fs');

let code = fs.readFileSync('src/components/AngkutTab.tsx', 'utf8');

const importPdf = `import { exportToPDF } from '../utils/pdfExport';\nimport { DataAngkut } from '../types';`;
code = code.replace("import { DataAngkut } from '../types';", importPdf);

const exportButton = `
          {/* Export PDF Button */}
          <button
            onClick={() => {
              const cols = ['No. DKHP', 'Tanggal', 'Supir', 'Nopol', 'Kapling', 'Blok', 'Tujuan', 'Alamat', 'Total Batang', 'Total Volume (m3)', 'Status'];
              const rows = filteredData.map(item => [
                item.no_dkhp,
                item.tanggal,
                item.supir,
                item.nopol,
                item.kapling,
                item.blok,
                item.tujuan,
                item.alamat,
                item.batang?.toString() || '0',
                item.volume?.toString() || '0',
                item.status
              ]);
              exportToPDF('Data Angkut Harian', cols, rows, 'Data_Angkut');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          
          {/* Export Excel Button */}
`;

code = code.replace("{/* Export Excel Button */}", exportButton);

fs.writeFileSync('src/components/AngkutTab.tsx', code);
