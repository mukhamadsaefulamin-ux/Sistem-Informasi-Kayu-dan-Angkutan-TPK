const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

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

code = code.replace(oldDetailAksi, newDetailAksi);
fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
