const fs = require('fs');
let code = fs.readFileSync('src/components/AngkutTab.tsx', 'utf8');

// 1. Remove filterMonth and filterYear state
code = code.replace(/const \[filterMonth, setFilterMonth\] = useState\(''\);\n\s*const \[filterYear, setFilterYear\] = useState\(''\);/, '');

// 2. Remove filterMonth and filterYear from dependencies
code = code.replace(/\[dataKetiga, data, searchQuery, filterDate, filterMonth, filterYear\]\);/, '[dataKetiga, data, searchQuery, filterDate]);');

// 3. Update filteredData logic
code = code.replace(/let matchDate = true;\n\s*if \(filterDate\) \{\n\s*matchDate = normalizeDateString\(item\.tanggal\) === filterDate;\n\s*\} else \{\n\s*const norm = normalizeDateString\(item\.tanggal\);\n\s*const parts = norm\.split\('-'\);\n\s*if \(parts\.length === 3\) \{\n\s*if \(filterYear && parts\[0\] !== filterYear\) matchDate = false;\n\s*if \(filterMonth && parts\[1\] !== filterMonth\) matchDate = false;\n\s*\} else if \(filterMonth \|\| filterYear\) \{\n\s*matchDate = false;\n\s*\}\n\s*\}/, 
`const matchDate = !filterDate || normalizeDateString(item.tanggal) === filterDate;`);

// 4. Update the UI section for Date Filter
const startUi = code.indexOf('{/* Date Filter & Tampilkan Button */}');
const endUi = code.indexOf('{/* Export Excel Button */}');
if (startUi !== -1 && endUi !== -1) {
  const newUi = `{/* Date Filter & Tampilkan Button */}
        <div className="flex flex-wrap items-end gap-3 md:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-slate-600 font-medium">Tanggal</label>
              <div className="relative flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm min-w-[200px] h-10">
                <div className="flex-1 flex items-center justify-between text-[13px] text-slate-700">
                  <span className={filterDate ? 'text-slate-800 font-bold' : 'text-slate-400'}>{filterDate ? formatDateIndoLabel(filterDate) : 'Semua Tanggal'}</span>
                  <Calendar className="w-4 h-4 text-slate-600 ml-2 pointer-events-none" />
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-slate-600 font-medium opacity-0">Dropdown</label>
              <div className="bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm flex items-center min-w-[180px] h-10 relative">
                <select
                  value={filterDate}
                  onChange={e => {
                    setFilterDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-[13px] text-slate-700 bg-transparent outline-none cursor-pointer w-full appearance-none pr-6"
                >
                  <option value="">Semua Tanggal</option>
                  {availableDates.map(d => (
                    <option key={d} value={d}>
                      {formatDateIndoLabel(d)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            
            {filterDate && (
              <button
                onClick={() => {
                  setFilterDate('');
                  setCurrentPage(1);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer ml-2 h-10 flex items-center"
              >
                Reset
              </button>
            )}
          </div>

        `;
  
  code = code.slice(0, startUi) + newUi + code.slice(endUi);
}

fs.writeFileSync('src/components/AngkutTab.tsx', code);
