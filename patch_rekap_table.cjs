const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// Replace thead
const theadOld = `<table className="w-full text-sm text-center">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-left font-bold text-slate-800 align-middle">Bulan</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-emerald-600">Sortimen AI</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-blue-600">Sortimen AII</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-orange-600">Sortimen AIII</th>
                    <th colSpan={2} className="px-4 py-2 font-black text-slate-800">TOTAL</th>
                    <th rowSpan={2} className="px-2 py-3 w-8"></th>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-blue-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-blue-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-orange-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-orange-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-700">BTG</th>
                    <th className="px-2 py-2 text-slate-700">VOL (m³)</th>
                  </tr>
                </thead>`;

const theadNew = `<table className="w-full text-sm text-center">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-left font-bold text-slate-800 align-middle">Bulan</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-emerald-600">Sortimen AI</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-blue-600">Sortimen AII</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-orange-600">Sortimen AIII</th>
                    <th colSpan={2} className={\`px-4 py-2 font-black text-slate-800 \${isAdmin ? 'border-r border-slate-200' : ''}\`}>TOTAL</th>
                    {isAdmin && <th rowSpan={2} className="px-4 py-3 font-bold text-slate-800 w-24 align-middle">Aksi</th>}
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-blue-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-blue-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-orange-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-orange-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-700">BTG</th>
                    <th className={\`px-2 py-2 text-slate-700 \${isAdmin ? 'border-r border-slate-200' : ''}\`}>VOL (m³)</th>
                  </tr>
                </thead>`;

code = code.replace(theadOld, theadNew);

// Replace tbody map
const tbodyOld = `<tbody className="divide-y divide-slate-100">
                  {activeTypeData.monthlySummary.map((row) => (
                    <React.Fragment key={row.bulan}>
                      <tr 
                        className={\`transition-colors cursor-pointer \${expandedMonth === row.bulan ? 'bg-blue-50/40' : 'hover:bg-slate-50'}\`}
                        onClick={() => setExpandedMonth(expandedMonth === row.bulan ? null : row.bulan)}
                      >
                        <td className="px-4 py-3.5 border-r border-slate-100 text-left font-medium text-slate-700">{row.bulan}</td>
                        <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.ai_btg || '-'}</td>
                        <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.ai_vol > 0 ? row.ai_vol.toFixed(4) : '-'}</td>
                        <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aii_btg || '-'}</td>
                        <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aii_vol > 0 ? row.aii_vol.toFixed(4) : '-'}</td>
                        <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aiii_btg || '-'}</td>
                        <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aiii_vol > 0 ? row.aiii_vol.toFixed(4) : '-'}</td>
                        <td className="px-2 py-3.5 border-r border-slate-100 font-bold text-slate-800">{row.total_btg || '-'}</td>
                        <td className="px-2 py-3.5 font-bold text-slate-800">{row.total_vol > 0 ? row.total_vol.toFixed(4) : '-'}</td>
                        <td className="px-2 py-3.5 text-slate-400">
                          {row.entries.length > 0 && (
                            expandedMonth === row.bulan ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />
                          )}
                        </td>
                      </tr>
                      {/* Expanded Details Row */}
                      {expandedMonth === row.bulan && row.entries.length > 0 && (
                        <tr>
                          <td colSpan={10} className="p-0 border-b border-slate-200">
                            <div className="bg-slate-50 p-4 border-l-4 border-blue-500 shadow-inner">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-slate-700 uppercase">Detail Data {row.bulan}</h4>
                              </div>
                              <table className="w-full text-xs text-left bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                <thead className="bg-slate-100 text-slate-600">
                                  <tr>
                                    <th className="px-3 py-2 border-b border-slate-200 font-semibold">Tanggal</th>
                                    <th className="px-3 py-2 border-b border-slate-200 font-semibold text-center">AI (Btg/Vol)</th>
                                    <th className="px-3 py-2 border-b border-slate-200 font-semibold text-center">AII (Btg/Vol)</th>
                                    <th className="px-3 py-2 border-b border-slate-200 font-semibold text-center">AIII (Btg/Vol)</th>
                                    {isAdmin && <th className="px-3 py-2 border-b border-slate-200 text-center font-semibold w-24">Aksi</th>}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {row.entries.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-3 py-2 font-medium text-slate-700">{entry.tanggal}</td>
                                      <td className="px-3 py-2 text-center text-slate-600">{entry.ai_batang || 0} / {entry.ai_volume || 0}</td>
                                      <td className="px-3 py-2 text-center text-slate-600">{entry.aii_batang || 0} / {entry.aii_volume || 0}</td>
                                      <td className="px-3 py-2 text-center text-slate-600">{entry.aiii_batang || 0} / {entry.aiii_volume || 0}</td>
                                      {isAdmin && (
                                        <td className="px-3 py-2 text-center">
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
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>`;

const tbodyNew = `<tbody className="divide-y divide-slate-100">
                  {activeTypeData.monthlySummary.map((row) => (
                    <tr key={row.bulan} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 border-r border-slate-100 text-left font-medium text-slate-700">{row.bulan}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.ai_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.ai_vol > 0 ? row.ai_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aii_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aii_vol > 0 ? row.aii_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aiii_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aiii_vol > 0 ? row.aiii_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-bold text-slate-800">{row.total_btg || '-'}</td>
                      <td className={\`px-2 py-3.5 font-bold text-slate-800 \${isAdmin ? 'border-r border-slate-100' : ''}\`}>{row.total_vol > 0 ? row.total_vol.toFixed(4) : '-'}</td>
                      {isAdmin && (
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
                      )}
                    </tr>
                  ))}
                </tbody>`;

code = code.replace(tbodyOld, tbodyNew);

// Fix colSpan in tfoot
const tfootOld = `<td className="px-2 py-4" colSpan={2}>{formatVol(activeTypeData.yearlyTotal.total_vol)}</td>`;
const tfootNew = `<td className={\`px-2 py-4 \${isAdmin ? 'border-r border-slate-200' : ''}\`}>{formatVol(activeTypeData.yearlyTotal.total_vol)}</td>
                    {isAdmin && <td className="px-2 py-4"></td>}`;
code = code.replace(tfootOld, tfootNew);

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
