const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

const newAksiCell = `{isAdmin && (
                        <td className="px-2 py-3.5 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              disabled={row.entries.length === 0}
                              onClick={() => row.entries.length > 0 && handleEdit(row.entries[0])}
                              className={\`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm \${
                                row.entries.length > 0
                                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                  : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                              }\`}
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              disabled={row.entries.length === 0}
                              onClick={() => row.entries.length > 0 && setDeleteConfirm({ isOpen: true, id: row.entries[0].id, type: 'single' })}
                              className={\`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors shadow-sm \${
                                row.entries.length > 0
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                              }\`}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </td>
                      )}`;

const oldAksiCell = `{isAdmin && (
                        <td className="px-2 py-3.5 text-center">
                          {row.entries.length > 0 ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(row.entries[0])}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shadow-sm bg-blue-50"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ isOpen: true, id: row.entries[0].id, type: 'single' })}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors shadow-sm bg-red-50"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                resetForm();
                                // Try to determine the month index (row.monthIdx) to construct a default date
                                const year = filterYear || new Date().getFullYear().toString();
                                const monthNum = String(row.monthIdx + 1).padStart(2, '0');
                                const lastDay = new Date(parseInt(year), row.monthIdx + 1, 0).getDate();
                                setFormData(prev => ({
                                  ...prev, 
                                  jenis: activeTab,
                                  tanggal: \`01/\${monthNum}/\${year} s/d \${lastDay}/\${monthNum}/\${year}\`
                                }));
                                setIsModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              + Tambah
                            </button>
                          )}
                        </td>
                      )}`;

code = code.replace(newAksiCell, oldAksiCell);

const newDetailAksi = `<td className="px-3 py-2 text-center">
                                          <div className="flex justify-center gap-2">
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}
                                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
                                            >
                                              <Edit2 className="w-3.5 h-3.5" /> Edit
                                            </button>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, id: entry.id, type: 'single' }); }}
                                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                                            </button>
                                          </div>
                                        </td>`;

const oldDetailAksi = `<td className="px-3 py-2 text-center">
                                          <div className="flex justify-center gap-2">
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}
                                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                            >
                                              <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, id: entry.id, type: 'single' }); }}
                                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>`;

code = code.replace(newDetailAksi, oldDetailAksi);

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
