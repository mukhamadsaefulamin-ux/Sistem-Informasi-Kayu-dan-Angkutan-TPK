const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

const importPdf = `import { exportToPDF } from '../utils/pdfExport';\nimport { DataMutasi } from '../types';`;
code = code.replace("import { DataMutasi } from '../types';", importPdf);

const exportButton = `
          <button
            onClick={() => {
              const cols = ['Bulan', 'PINUS Btg', 'PINUS Vol', 'JATI Btg', 'JATI Vol', 'SONOKELING Btg', 'SONOKELING Vol', 'MAHONI Btg', 'MAHONI Vol', 'TOTAL Btg', 'TOTAL Vol'];
              const rows = summaryData.map(row => [
                row.bulan,
                row.pinus.btg.toString(),
                row.pinus.vol.toFixed(3),
                row.jati.btg.toString(),
                row.jati.vol.toFixed(3),
                row.sonokeling.btg.toString(),
                row.sonokeling.vol.toFixed(3),
                row.mahoni.btg.toString(),
                row.mahoni.vol.toFixed(3),
                row.total.btg.toString(),
                row.total.vol.toFixed(3)
              ]);
              exportToPDF('Rekap Mutasi Kapling', cols, rows, 'Rekap_Mutasi');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors font-medium text-sm"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={onExportCSV}
`;

code = code.replace("<button\n            onClick={onExportCSV}", exportButton);

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
