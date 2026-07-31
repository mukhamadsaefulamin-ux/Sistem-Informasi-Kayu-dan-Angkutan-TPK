const fs = require('fs');
let code = fs.readFileSync('src/components/AngkutTab.tsx', 'utf8');

// I need to add back the `Hapus Semua` and the wrapper.
// Let's find `{/* Export Excel Button */}` and prepend the wrapper.
const exportBtn = `{/* Export Excel Button */}`;
const fix = `<div className="flex items-center gap-2 self-end sm:self-auto">
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
          {/* Export Excel Button */}`;

code = code.replace(exportBtn, fix);

fs.writeFileSync('src/components/AngkutTab.tsx', code);
