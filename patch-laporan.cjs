const fs = require('fs');
let code = fs.readFileSync('src/components/LaporanTab.tsx', 'utf8');

// 1. Update Props
code = code.replace(/interface LaporanTabProps \{/, 
`interface LaporanTabProps {
  filterDate: string;
  onFilterDateChange: (date: string) => void;`);

code = code.replace(/export const LaporanTab: React.FC<LaporanTabProps> = \(\{/, 
`export const LaporanTab: React.FC<LaporanTabProps> = ({ filterDate, onFilterDateChange, `);

// 2. Add helpers if missing. But they are already there?
// We need normalizeDateString and formatDateIndoLabel.
const helpers = `
const normalizeDateString = (dateStr: string) => {
  if (!dateStr) return '';
  const d = dateStr.replace(/\\//g, '-');
  const parts = d.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return d;
    if (parts[2].length === 4) return \`\${parts[2]}-\${parts[1].padStart(2, '0')}-\${parts[0].padStart(2, '0')}\`;
  }
  return dateStr;
};

const formatDateIndoLabel = (dateStr: string) => {
  if (!dateStr) return 'Semua Tanggal';
  try {
    const norm = normalizeDateString(dateStr);
    const parts = norm.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
`;

code = code.replace(/export const LaporanTab: React.FC<LaporanTabProps>/, helpers + '\nexport const LaporanTab: React.FC<LaporanTabProps>');

// 3. Update filteredAngkut logic
code = code.replace(/const \[selectedMonth, setSelectedMonth\] = useState\(currentMonthStr\);\n\s*const \[activeSection, setActiveSection\] = useState<'all' \| 'angkut' \| 'ketiga' \| 'perhutani'>\('all'\);\n\n\s*\/\/ Filtered Angkut Harian by Month using robust isSameMonth logic\n\s*const filteredAngkut = useMemo\(\(\) => \{\n\s*return dataAngkut\.filter\(item => isSameMonth\(item\.tanggal, selectedMonth\)\);\n\s*\}, \[dataAngkut, selectedMonth\]\);/,
`const [activeSection, setActiveSection] = useState<'all' | 'angkut' | 'ketiga' | 'perhutani'>('all');

  const filteredAngkut = useMemo(() => {
    return dataAngkut.filter(item => {
      if (!filterDate) return true;
      return normalizeDateString(item.tanggal) === filterDate;
    });
  }, [dataAngkut, filterDate]);`);

// 4. Also rename selectedMonth usages to filterDate if they exist. Wait, what about formatMonthLabel(selectedMonth)?
// The user doesn't want "Bulan", they want Date.
code = code.replace(/Bulan \{formatMonthLabel\(selectedMonth\)\}/g, 
`{filterDate ? formatDateIndoLabel(filterDate) : 'Semua Waktu'}`);
code = code.replace(/PERIODE \$\{month\}/g, 
`TANGGAL \${filterDate || 'Semua'}`);
code = code.replace(/onExportCSV\(selectedMonth\)/g, 
`onExportCSV(filterDate)`);

// 5. Modify the UI Controls in LaporanTab to use Date picker
const startUi = code.indexOf('{/* Month Selector */}');
const endUi = code.indexOf('{/* Export CSV Button */}');

if (startUi !== -1 && endUi !== -1) {
  const newUi = `{/* Date Selector */}
          <div className="flex flex-col gap-1.5 w-full lg:w-auto">
            <label className="text-[13px] text-slate-600 font-medium hidden lg:block opacity-0">Tgl</label>
            <div className="relative flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm min-w-[200px] h-10">
              <div className="flex-1 flex items-center justify-between text-[13px] text-slate-700">
                <span className={filterDate ? 'text-slate-800 font-bold' : 'text-slate-400'}>{filterDate ? formatDateIndoLabel(filterDate) : 'Pilih tanggal'}</span>
                <Calendar className="w-4 h-4 text-slate-600 ml-2 pointer-events-none" />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={e => onFilterDateChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => onFilterDateChange('')}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer text-left lg:absolute lg:-bottom-6"
              >
                Reset Filter
              </button>
            )}
          </div>
          `;
  code = code.slice(0, startUi) + newUi + code.slice(endUi);
}

// Ensure selectedMonth is completely gone
// The remaining use is `dataAngkut.length > 0 && selectedMonth` and similar stuff
code = code.replace(/selectedMonth/g, 'filterDate');
code = code.replace(/Tampilkan Semua Bulan/g, 'Tampilkan Semua Data');
code = code.replace(/Laporan Bulanan Terintegrasi/g, 'Laporan Terintegrasi');

fs.writeFileSync('src/components/LaporanTab.tsx', code);
