const fs = require('fs');
let code = fs.readFileSync('src/components/KetigaTab.tsx', 'utf8');

code = code.replace(
  /onDeleteData: \(id: string\) => void;\n\s*onExportCSV: \(\) => void;/,
  `onDeleteData: (id: string) => void;
  onDeleteAllData?: () => void;
  onExportCSV: () => void;`
);

code = code.replace(
  /onDeleteData,\n\s*onExportCSV\n\}\) => \{/,
  `onDeleteData,
  onDeleteAllData,
  onExportCSV
}) => {`
);

const oldButtons = `{userRole === 'admin' && (
<button
              onClick={openAddModal}
              className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/20 flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Data
        </button>
)}`;

const newButtons = `{userRole === 'admin' && (
            <div className="flex items-center gap-2">
              {onDeleteAllData && (
                <button
                  onClick={onDeleteAllData}
                  className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center cursor-pointer"
                  title="Hapus Semua Data"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus Semua
                </button>
              )}
              <button
                onClick={openAddModal}
                className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/20 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" /> Tambah Data
              </button>
            </div>
          )}`;

code = code.replace(oldButtons, newButtons);

fs.writeFileSync('src/components/KetigaTab.tsx', code);
