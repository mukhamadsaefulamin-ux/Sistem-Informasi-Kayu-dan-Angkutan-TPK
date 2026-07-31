const fs = require('fs');
let code = fs.readFileSync('src/components/PerhutaniTab.tsx', 'utf8');

const importPdf = `import { exportToPDF } from '../utils/pdfExport';\nimport { DataPerhutani } from '../types';`;
code = code.replace("import { DataPerhutani } from '../types';", importPdf);

const exportButton = `
          {/* Export PDF Button */}
          <button
            onClick={() => {
              const cols = ['Tgl Kapling', 'Kapling', 'Blok', 'Jenis', 'Sortimen', 'Panjang (m)', 'Diameter (cm)', 'Mutu', 'Batang', 'Volume (m3)'];
              const rows = filteredData.map(item => [
                item.tgl_kapling,
                item.kapling,
                item.blok,
                item.jenis,
                item.sortimen,
                item.panjang?.toString() || '0',
                item.diameter?.toString() || '0',
                item.mutu,
                item.batang?.toString() || '0',
                item.volume?.toString() || '0'
              ]);
              exportToPDF('Sisa Perhutani', cols, rows, 'Sisa_Perhutani');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          
          {/* Export CSV Button */}
`;

code = code.replace("{/* Export CSV Button */}", exportButton);

fs.writeFileSync('src/components/PerhutaniTab.tsx', code);
