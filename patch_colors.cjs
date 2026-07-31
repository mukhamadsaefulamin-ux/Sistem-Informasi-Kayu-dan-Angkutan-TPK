const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

const oldTheadSub = `<tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-blue-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-blue-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-orange-600">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-orange-600">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-700">BTG</th>
                    <th className={\`px-2 py-2 text-slate-700 \${isAdmin ? 'border-r border-slate-200' : ''}\`}>VOL (m³)</th>
                  </tr>`;

const newTheadSub = `<tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-500">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-emerald-600 bg-emerald-50/50">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-500">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-blue-600 bg-blue-50/50">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-500">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-orange-600 bg-orange-50/50">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-500">BTG</th>
                    <th className={\`px-2 py-2 text-slate-800 bg-slate-100/50 \${isAdmin ? 'border-r border-slate-200' : ''}\`}>VOL (m³)</th>
                  </tr>`;

code = code.replace(oldTheadSub, newTheadSub);

const oldTbodyRows = `<td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.ai_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.ai_vol > 0 ? row.ai_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aii_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aii_vol > 0 ? row.aii_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aiii_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-700">{row.aiii_vol > 0 ? row.aiii_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-bold text-slate-800">{row.total_btg || '-'}</td>
                      <td className={\`px-2 py-3.5 font-bold text-slate-800 \${isAdmin ? 'border-r border-slate-100' : ''}\`}>{row.total_vol > 0 ? row.total_vol.toFixed(4) : '-'}</td>`;

const newTbodyRows = `<td className="px-2 py-3.5 border-r border-slate-100 text-slate-600">{row.ai_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-semibold text-emerald-700 bg-emerald-50/30">{row.ai_vol > 0 ? row.ai_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-600">{row.aii_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-semibold text-blue-700 bg-blue-50/30">{row.aii_vol > 0 ? row.aii_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-600">{row.aiii_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-semibold text-orange-700 bg-orange-50/30">{row.aiii_vol > 0 ? row.aiii_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-semibold text-slate-700">{row.total_btg || '-'}</td>
                      <td className={\`px-2 py-3.5 font-bold text-slate-900 bg-slate-50/50 \${isAdmin ? 'border-r border-slate-100' : ''}\`}>{row.total_vol > 0 ? row.total_vol.toFixed(4) : '-'}</td>`;

code = code.replace(oldTbodyRows, newTbodyRows);

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
