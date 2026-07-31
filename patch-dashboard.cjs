const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');

// 1. Update Props
code = code.replace(/interface DashboardTabProps \{/, 
`interface DashboardTabProps {
  filterDate: string;
  onFilterDateChange: (date: string) => void;`);

code = code.replace(/export const DashboardTab: React.FC<DashboardTabProps> = \(\{/, 
`export const DashboardTab: React.FC<DashboardTabProps> = ({ filterDate, onFilterDateChange, `);

// 2. Remove currentMonthStr logic or keep it but change angkutBulanIni to filteredAngkut
// The user wants: "Jika pengguna memilih atau membuka data tanggal 29 Juli 2026, maka sistem harus otomatis menampilkan: Total DKHP: XX Dokumen, Total Volume: XX,XX m³, Total Batang: XXX Batang, Total Kapling Terangkut: XX Kapling"

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

code = code.replace(/export const DashboardTab: React.FC<DashboardTabProps>/, helpers + '\nexport const DashboardTab: React.FC<DashboardTabProps>');

code = code.replace(/const angkutBulanIni = useMemo\(\(\) => \{\n.*?\}, \[dataAngkut, currentMonthStr\]\);/s, 
`const filteredAngkut = useMemo(() => {
    return dataAngkut.filter(item => {
      if (!filterDate) return true; // wait, if they say "Jika pengguna memilih", we should default to all or no? Let's say all for now, but the metrics depend on it.
      return normalizeDateString(item.tanggal) === filterDate;
    });
  }, [dataAngkut, filterDate]);`);

// Replace occurrences of angkutBulanIni with filteredAngkut
code = code.replace(/angkutBulanIni/g, 'filteredAngkut');

// totalDKHP, totalKapling
code = code.replace(/const totalRitase = filteredAngkut\.length;/, 
`const totalRitase = filteredAngkut.length;
  
  const totalDKHP = useMemo(() => {
    const dkhpSet = new Set<string>();
    filteredAngkut.forEach(item => {
      if (item.no_dkhp && item.no_dkhp !== '-') dkhpSet.add(item.no_dkhp);
    });
    return dkhpSet.size > 0 ? dkhpSet.size : filteredAngkut.length;
  }, [filteredAngkut]);
  
  const totalBatang = useMemo(() => {
    return filteredAngkut.reduce((sum, item) => sum + Number(item.batang || 0), 0);
  }, [filteredAngkut]);
  
  const totalKapling = useMemo(() => {
    const kaplingSet = new Set<string>();
    filteredAngkut.forEach(item => {
      if (item.kapling && item.kapling !== '-') kaplingSet.add(item.kapling);
    });
    return kaplingSet.size;
  }, [filteredAngkut]);`);

// Now modify the 4 KPI cards to match the requested:
// Total DKHP, Total Volume, Total Batang, Total Kapling Terangkut

// The old 4 cards:
// Card 1: Total Ritase
// Card 2: Vol. Pihak Ketiga
// Card 3: Vol. Perhutani
// Card 4: Total kayu di TPK

// The user says:
// "Total DKHP: XX Dokumen
// Total Volume: XX,XX m³
// Total Batang: XXX Batang
// Total Kapling Terangkut: XX Kapling"
// They want this to appear directly. I'll replace the first row of cards with these. Wait, they still want the other data? "Pastikan seluruh menu yang berkaitan dengan: Riwayat Angkut, Dashboard, Laporan, Statistik menggunakan sumber data tanggal yang sama sehingga tidak terjadi perbedaan jumlah DKHP, volume, maupun batang."

code = code.replace(/<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">[\s\S]*?<\/div>\n\s*\{\/\* Visual Interactive Charts \*\/\}/, 
`<div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard & Statistik</h2>
          <p className="text-sm text-slate-500 mt-1">
            {filterDate ? \`Data Angkutan Tanggal: \${formatDateIndoLabel(filterDate)}\` : 'Menampilkan semua data angkutan (Silakan pilih tanggal untuk memfilter)'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-slate-600 font-medium">Filter Tanggal</label>
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
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer self-end"
              >
                Reset Filter
              </button>
            )}
        </div>
      </div>

      {filterDate && filteredAngkut.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-amber-800 font-semibold">Tidak ada data angkutan pada tanggal ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total DKHP */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl z-10 flex-shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Total DKHP
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800">
                {totalDKHP} <span className="text-sm font-normal text-slate-400">Dokumen</span>
              </h3>
            </div>
          </div>

          {/* Card 2: Total Volume */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl z-10 flex-shrink-0">
              <Truck className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Total Volume
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800">
                {totalVolAngkutBulanIni.toFixed(2)}{' '}
                <span className="text-sm font-normal text-slate-400">m³</span>
              </h3>
            </div>
          </div>

          {/* Card 3: Total Batang */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl z-10 flex-shrink-0">
              <Boxes className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Total Batang
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800">
                {totalBatang} <span className="text-sm font-normal text-slate-400">Batang</span>
              </h3>
            </div>
          </div>

          {/* Card 4: Total Kapling */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl z-10 flex-shrink-0">
              <Leaf className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Kapling Terangkut
              </p>
              <h3 className="text-3xl font-extrabold text-purple-900">
                {totalKapling} <span className="text-sm font-normal text-slate-400">Kapling</span>
              </h3>
            </div>
          </div>
        </div>
      )}
      
      {/* Visual Interactive Charts */}`);

fs.writeFileSync('src/components/DashboardTab.tsx', code);
