const fs = require('fs');
let code = fs.readFileSync('src/components/KetigaTab.tsx', 'utf8');

const thAksi = `{userRole === 'admin' && <th className="py-4 px-4 text-center">Aksi</th>}`;
code = code.replace(thAksi, '');

const tdAksi = `{userRole === 'admin' && (
<td className="py-3.5 px-4 text-center">
<div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Edit Data"
>
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Hapus Data Baris Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
</button>
</div>
</td>
)}`;
code = code.replace(tdAksi, '');

fs.writeFileSync('src/components/KetigaTab.tsx', code);
