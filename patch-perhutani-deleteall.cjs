const fs = require('fs');
let code = fs.readFileSync('src/components/PerhutaniTab.tsx', 'utf8');

code = code.replace(
  /onDeleteData: \(id: string\) => void;\n\s*onExportCSV: \(\) => void;/,
  `onDeleteData: (id: string) => void;\n  onDeleteAllData?: () => void;\n  onExportCSV: () => void;`
);

code = code.replace(
  /onDeleteData,\n\s*onExportCSV\n\}\) => \{/,
  `onDeleteData,\n  onDeleteAllData,\n  onExportCSV\n}) => {`
);

const oldButtons = `{userRole === 'admin' && (
<button
            onClick={openAddModal}
            className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/20 flex items-center justify-center cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Data
          </button>
)}`;

const newButtons = `{userRole === 'admin' && (
            <div className="flex items-center gap-2">
              {onDeleteAllData && (
                <button
                  onClick={onDeleteAllData}
                  className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  title="Hapus Semua Data"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus Semua
                </button>
              )}
              <button
                onClick={openAddModal}
                className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/20 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Data
              </button>
            </div>
          )}`;

code = code.replace(oldButtons, newButtons);

fs.writeFileSync('src/components/PerhutaniTab.tsx', code);
