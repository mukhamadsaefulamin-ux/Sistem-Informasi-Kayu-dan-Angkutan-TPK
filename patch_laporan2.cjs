const fs = require('fs');
let code = fs.readFileSync('src/components/LaporanTab.tsx', 'utf8');

const exportButton = `
          {/* Export PDF Button */}
          <button
            onClick={() => {
              const cols = ['No. DKHP', 'Tanggal', 'Tujuan', 'Volume (m3)', 'Status'];
              const rows = filteredAngkut.map(d => [
                d.no_dkhp,
                d.tanggal,
                d.tujuan,
                d.volume?.toString() || '0',
                d.status
              ]);
              exportToPDF('Laporan Angkut Harian', cols, rows, 'Laporan_Angkut');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
`;

// we just replace the whole onClick logic for the button in LaporanTab.tsx
const oldButtonMatch = code.match(/<button\s*onClick={\(\) => \{\s*const cols = \['Nomor'[\s\S]*?<\/button>/m);
if (oldButtonMatch) {
  code = code.replace(oldButtonMatch[0], exportButton);
}
fs.writeFileSync('src/components/LaporanTab.tsx', code);
