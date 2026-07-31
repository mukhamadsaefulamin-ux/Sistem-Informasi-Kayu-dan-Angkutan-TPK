const fs = require('fs');
let code = fs.readFileSync('src/components/LaporanTab.tsx', 'utf8');

const importPdf = `import { exportToPDF } from '../utils/pdfExport';\nimport { DataAngkut, DataKetiga, DataPerhutani } from '../types';`;
code = code.replace("import { DataAngkut, DataKetiga, DataPerhutani } from '../types';", importPdf);

const exportButton = `
          {/* Export PDF Button */}
          <button
            onClick={() => {
              const cols = ['Nomor', 'Tanggal', 'Tujuan', 'Volume (m3)', 'Status'];
              // we can export a summary or detail, let's export summary of Laporan.
              const rows = dailyData.map(d => [
                d.tgl, 
                d.tanggalFull, 
                d.angkut.toString() + ' Angkutan', 
                d.totalVolume.toFixed(2), 
                'Selesai'
              ]);
              exportToPDF('Laporan Bulanan', cols, rows, 'Laporan_Bulanan');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Export CSV Button */}
`;

code = code.replace("{/* Export CSV Button */}", exportButton);

fs.writeFileSync('src/components/LaporanTab.tsx', code);
