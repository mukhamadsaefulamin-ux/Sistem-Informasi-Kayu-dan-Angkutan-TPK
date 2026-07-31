const fs = require('fs');
let code = fs.readFileSync('src/components/AngkutTab.tsx', 'utf8');

const targetStr = `        {/* Export Excel Button */}
        <button
          onClick={onExportCSV}
          className="bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors self-end sm:self-auto"
        >
          <div className="bg-emerald-100 text-emerald-800 p-1 rounded font-bold text-[10px]">
            <FileSpreadsheet className="w-3.5 h-3.5" />
          </div>
          <span>Export Excel</span>
        </button>`;

const replaceStr = `        <div className="flex items-center gap-2 self-end sm:self-auto">
          {userRole === 'admin' && (
            <button
              onClick={onConfirmDeleteAll}
              className="bg-white hover:bg-red-50 border border-red-200 text-red-600 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <div className="bg-red-100 text-red-600 p-1 rounded font-bold text-[10px]">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              <span>Hapus Semua</span>
            </button>
          )}
          {/* Export Excel Button */}
          <button
            onClick={onExportCSV}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <div className="bg-emerald-100 text-emerald-800 p-1 rounded font-bold text-[10px]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <span>Export Excel</span>
          </button>
        </div>`;

if (code.includes('Export Excel Button')) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/AngkutTab.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Target string not found");
}
