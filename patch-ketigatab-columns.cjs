const fs = require('fs');
let code = fs.readFileSync('src/components/KetigaTab.tsx', 'utf8');

const oldHeader = `<th className="py-4 px-4 text-center">Awal Btg</th>
   <th className="py-4 px-4 text-right">Awal (m³)</th>
   <th className="py-4 px-4 text-center bg-amber-50">Terangkut Btg</th>
   <th className="py-4 px-4 text-right bg-amber-50">Terangkut (m³)</th>
   <th className="py-4 px-4 text-center bg-emerald-50">Sisa Btg</th>
   <th className="py-4 px-4 text-right bg-emerald-50">Sisa (m³)</th>`;

const newHeader = `<th className="py-4 px-4 text-center">Batang</th>
                <th className="py-4 px-4 text-right">Volume</th>`;

const oldRow = `<td className="py-3.5 px-4 text-center text-slate-500">{item.batang}</td>
   <td className="py-3.5 px-4 text-right text-slate-500">{Number(item.volume).toFixed(2)}</td>
   <td className="py-3.5 px-4 text-center text-amber-600 font-semibold">{item.terangkutBatang}</td>
   <td className="py-3.5 px-4 text-right text-amber-600 font-semibold">{Number(item.terangkutVolume).toFixed(2)}</td>
   <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{item.sisaBatang}</td>
   <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">{Number(item.sisaVolume).toFixed(2)}</td>`;

const newRow = `<td className="py-3.5 px-4 text-center font-semibold text-slate-700">{item.batang}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700">{Number(item.volume).toFixed(2)}</td>`;

code = code.replace(oldHeader, newHeader);
code = code.replace(oldRow, newRow);

fs.writeFileSync('src/components/KetigaTab.tsx', code);
