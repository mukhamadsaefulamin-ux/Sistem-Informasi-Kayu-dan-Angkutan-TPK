const fs = require('fs');
let code = fs.readFileSync('src/components/KetigaTab.tsx', 'utf8');

const importPdf = `import { exportToPDF } from '../utils/pdfExport';\nimport { DataKetiga } from '../types';`;
code = code.replace("import { DataKetiga } from '../types';", importPdf);

const exportButton = `
              <button
                onClick={() => {
                  const cols = ['Kapling', 'Blok', 'Jenis', 'Sortimen', 'Panjang (m)', 'Diameter (cm)', 'Mutu', 'Batang', 'Volume (m3)', 'Pembeli'];
                  const rows = filteredData.map(item => [
                    item.kapling,
                    item.blok,
                    item.jenis,
                    item.sortimen,
                    item.panjang?.toString() || '0',
                    item.diameter?.toString() || '0',
                    item.mutu,
                    item.batang?.toString() || '0',
                    item.volume?.toString() || '0',
                    item.pembeli || '-'
                  ]);
                  exportToPDF('Sisa Pihak Ketiga', cols, rows, 'Sisa_Pihak_Ketiga');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <button
                onClick={onExportCSV}
`;

code = code.replace("<button\n                onClick={onExportCSV}", exportButton);

fs.writeFileSync('src/components/KetigaTab.tsx', code);
