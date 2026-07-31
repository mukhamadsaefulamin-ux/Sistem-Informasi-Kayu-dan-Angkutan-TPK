const fs = require('fs');
let code = fs.readFileSync('src/components/InvoiceTab.tsx', 'utf8');

const importPdf = `import { exportToPDF } from '../utils/pdfExport';\nimport { DataInvoice } from '../types';`;
code = code.replace("import { DataInvoice } from '../types';", importPdf);

const exportButton = `
              <button
                onClick={() => {
                  const cols = ['Tanggal', 'No. Invoice', 'Pembeli', 'Batang', 'Volume (m3)', 'Nominal (Rp)', 'Status'];
                  const rows = filteredData.map(item => [
                    item.tanggal,
                    item.no_invoice,
                    item.pembeli,
                    item.batang?.toString() || '-',
                    item.volume?.toString() || '-',
                    item.nominal.toLocaleString('id-ID'),
                    item.status
                  ]);
                  exportToPDF('Data Pendapatan & Invoice', cols, rows, 'Invoice_Pendapatan');
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

fs.writeFileSync('src/components/InvoiceTab.tsx', code);
