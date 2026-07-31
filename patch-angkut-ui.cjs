const fs = require('fs');
let code = fs.readFileSync('src/components/AngkutTab.tsx', 'utf8');

// Replace state variables
code = code.replace(
  /const \[selectedDateFilter, setSelectedDateFilter\] = useState\(''\);/,
  `const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');`
);

// Update filteredData logic
code = code.replace(
  /const matchDate = \!selectedDateFilter \|\| normalizeDateString\(item\.tanggal\) === selectedDateFilter;/m,
  `      let matchDate = true;
      if (filterDate) {
        matchDate = normalizeDateString(item.tanggal) === filterDate;
      } else {
        const norm = normalizeDateString(item.tanggal);
        const parts = norm.split('-');
        if (parts.length === 3) {
          if (filterYear && parts[0] !== filterYear) matchDate = false;
          if (filterMonth && parts[1] !== filterMonth) matchDate = false;
        } else if (filterMonth || filterYear) {
          matchDate = false;
        }
      }`
);

// Update dependency array for filteredData
code = code.replace(
  /\[dataKetiga, data, searchQuery, selectedDateFilter\]\);/m,
  `[dataKetiga, data, searchQuery, filterDate, filterMonth, filterYear]);`
);

// Replace UI section
const uiOld = `<div className="flex flex-wrap items-center gap-2">
          {/* Custom Date Input Display */}
          <div className="relative flex items-center bg-white border border-slate-200/90 rounded-xl px-3 py-2 shadow-xs min-w-[220px]">
            <span className="text-xs text-slate-500 font-medium mr-3">Tanggal</span>
            <div className="flex-1 flex items-center justify-between text-xs font-bold text-slate-800">
              <span>{formatDateIndoLabel(selectedDateFilter)}</span>
              <Calendar className="w-4 h-4 text-slate-400 ml-2 pointer-events-none" />
            </div>
            {/* Hidden native date picker overlay */}
            <input
              type="date"
              value={selectedDateFilter}
              onChange={e => {
                setSelectedDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          {/* Quick Dropdown if multiple dates */}
          <div className="bg-white border border-slate-200/90 rounded-xl px-2 py-2 shadow-xs flex items-center">
            <select
              value={selectedDateFilter}
              onChange={e => {
                setSelectedDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium bg-transparent outline-none cursor-pointer text-slate-700"
            >
              <option value="">Semua Tanggal</option>
              {availableDates.map(d => (
                <option key={d} value={d}>
                  {d} ({formatDateIndoLabel(d)})
                </option>
              ))}
            </select>
          </div>

          {/* Tampilkan Button */}
          <button
            onClick={() => setCurrentPage(1)}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <span>Tampilkan</span>
            <Search className="w-3.5 h-3.5" />
          </button>

          {selectedDateFilter && (
            <button
              onClick={() => {
                setSelectedDateFilter('');
                setCurrentPage(1);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer ml-1"
            >
              Reset
            </button>
          )}
        </div>`;

const uiNew = `<div className="flex flex-wrap items-end gap-3 md:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-slate-600 font-medium">Tanggal</label>
              <div className="relative flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm min-w-[200px] h-10">
                <div className="flex-1 flex items-center justify-between text-[13px] text-slate-700">
                  <span className={filterDate ? 'text-slate-800 font-bold' : 'text-slate-400'}>{filterDate ? formatDateIndoLabel(filterDate) : 'Pilih tanggal'}</span>
                  <Calendar className="w-4 h-4 text-slate-600 ml-2 pointer-events-none" />
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => {
                    setFilterDate(e.target.value);
                    setFilterMonth('');
                    setFilterYear('');
                    setCurrentPage(1);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-slate-600 font-medium">Bulan</label>
              <div className="bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm flex items-center min-w-[160px] h-10 relative">
                <select
                  value={filterMonth}
                  onChange={e => {
                    setFilterMonth(e.target.value);
                    setFilterDate('');
                    if (e.target.value && !filterYear) setFilterYear(new Date().getFullYear().toString());
                    setCurrentPage(1);
                  }}
                  className="text-[13px] text-slate-700 bg-transparent outline-none cursor-pointer w-full appearance-none pr-6"
                >
                  <option value="">Semua Bulan</option>
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-slate-600 font-medium">Tahun</label>
              <div className="bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm flex items-center min-w-[120px] h-10 relative">
                <select
                  value={filterYear}
                  onChange={e => {
                    setFilterYear(e.target.value);
                    setFilterDate('');
                    setCurrentPage(1);
                  }}
                  className="text-[13px] text-slate-700 bg-transparent outline-none cursor-pointer w-full appearance-none pr-6"
                >
                  <option value="">Semua Tahun</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            
            {(filterDate || filterMonth || filterYear) && (
              <button
                onClick={() => {
                  setFilterDate('');
                  setFilterMonth('');
                  setFilterYear('');
                  setCurrentPage(1);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer ml-2 h-10 flex items-center"
              >
                Reset
              </button>
            )}
          </div>`;

// Now this requires string replacement.
// Wait, the formatting in the file might slightly differ from uiOld.
// It's safer to use regex to extract the block between \`{/\* Date Filter & Tampilkan Button \*/}\` and \`{/\* Export Excel Button \*/}\`

const startIndex = code.indexOf('{/* Date Filter & Tampilkan Button */}');
const endIndex = code.indexOf('{/* Export Excel Button */}');

if (startIndex !== -1 && endIndex !== -1) {
  const codeBefore = code.slice(0, startIndex);
  const codeAfter = code.slice(endIndex);
  code = codeBefore + '{/* Date Filter & Tampilkan Button */}\n        ' + uiNew + '\n\n        ' + codeAfter;
} else {
  console.log("Could not find the UI replacement markers.");
}

fs.writeFileSync('src/components/AngkutTab.tsx', code);
