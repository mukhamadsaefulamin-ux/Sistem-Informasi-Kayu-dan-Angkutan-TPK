const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// 1. Add refreshing state for the Activity icon
code = code.replace(
  "const [activeTab, setActiveTab] = useState('PINUS');",
  "const [activeTab, setActiveTab] = useState('PINUS');\n  const [isRefreshing, setIsRefreshing] = useState(false);\n  const [showFilterToast, setShowFilterToast] = useState(false);"
);

// 2. Add Activity icon refresh action
const refreshButton = `
          <button 
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 1000);
            }}
            className={\`ml-2 p-1 text-slate-400 hover:text-blue-600 transition-colors \${isRefreshing ? 'animate-spin text-blue-600' : ''}\`}
          >
            <Activity className="w-4 h-4" />
          </button>
`;
code = code.replace(
  /<button className="ml-2 p-1 text-slate-400 hover:text-blue-600 transition-colors">\s*<Activity className="w-4 h-4" \/>\s*<\/button>/g,
  refreshButton
);

// 3. Make Jenis Kayu a select
const jenisKayuSelect = `
            <div className="relative pl-10 pr-2 py-2.5 border border-slate-200 rounded-xl shadow-sm bg-slate-50 flex items-center min-w-[160px]">
              <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 appearance-none cursor-pointer"
              >
                {availableJenis.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
`;
code = code.replace(
  /<div className="pl-10 pr-8 py-2\.5 border border-slate-200 rounded-xl shadow-sm bg-slate-50 text-sm font-bold text-slate-700 flex items-center min-w-\[160px\]">\s*<Bell className="absolute left-3 top-1\/2 -translate-y-1\/2 w-4 h-4 text-slate-400" \/>\s*Semua Jenis\s*<ChevronDown className="absolute right-3 top-1\/2 -translate-y-1\/2 w-4 h-4 text-slate-500" \/>\s*<\/div>/g,
  jenisKayuSelect
);

// 4. Make Filter button show toast
const filterButton = `
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterToast(true);
                setTimeout(() => setShowFilterToast(false), 2000);
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm shadow-blue-600/20 font-semibold text-sm"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {showFilterToast && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 z-50">
                Filter diterapkan!
              </div>
            )}
          </div>
`;
code = code.replace(
  /<button\s*className="flex items-center gap-2 px-6 py-2\.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm shadow-blue-600\/20 font-semibold text-sm"\s*>\s*<Filter className="w-4 h-4" \/>\s*Filter\s*<\/button>/g,
  filterButton
);

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
