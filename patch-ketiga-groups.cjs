const fs = require('fs');
let code = fs.readFileSync('src/components/KetigaTab.tsx', 'utf8');

const groupedByJenisStr = `
  const groupedByJenis = useMemo(() => {
    const groups: Record<string, { items: typeof filteredData; totalKapling: Set<string>; totalBatang: number; totalVolume: number }> = {};
    let grandTotalKapling = new Set<string>();
    let grandTotalBatang = 0;
    let grandTotalVolume = 0;

    filteredData.forEach(item => {
      const jenis = (item.jenis || 'Lainnya').trim().toUpperCase();
      const b = Number(item.sisaBatang || 0);
      const v = Number(item.sisaVolume || 0);

      // Only include if there is remaining stock
      if (b > 0 || v > 0) {
        if (!groups[jenis]) {
          groups[jenis] = { items: [], totalKapling: new Set(), totalBatang: 0, totalVolume: 0 };
        }
        groups[jenis].items.push(item);
        if (item.kapling && item.kapling !== '-') {
          groups[jenis].totalKapling.add(item.kapling.trim().toLowerCase());
          grandTotalKapling.add(item.kapling.trim().toLowerCase());
        }
        groups[jenis].totalBatang += b;
        groups[jenis].totalVolume += v;

        grandTotalBatang += b;
        grandTotalVolume += v;
      }
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => a.localeCompare(b)).map(key => ({
      jenis: key,
      items: groups[key].items,
      kaplingCount: groups[key].totalKapling.size,
      totalBatang: groups[key].totalBatang,
      totalVolume: groups[key].totalVolume,
    }));

    return {
      groups: sortedGroups,
      grandTotalKapling: grandTotalKapling.size,
      grandTotalBatang,
      grandTotalVolume
    };
  }, [filteredData]);
`;

code = code.replace(/const filteredData = useMemo\(\(\) => \{[\s\S]*?\}, \[dataAngkut, data, searchQuery\]\);/, `$&` + groupedByJenisStr);

const tableStartIdx = code.indexOf('{/* Table */}');
const tableEndIdx = code.indexOf('{/* Modal Form */}');

if (tableStartIdx === -1 || tableEndIdx === -1) {
  console.error("Could not find table boundaries");
  process.exit(1);
}

const newTableStr = `{/* Table */}
        <div className="overflow-x-auto p-4 space-y-8 bg-slate-50/50">
          {groupedByJenis.groups.map(group => (
            <div key={group.jenis} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
              <div className="bg-slate-50/80 p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{group.jenis}</h4>
                <div className="flex gap-6 md:gap-10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Kapling</p>
                    <p className="text-lg font-bold text-slate-700">{group.kaplingCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Batang</p>
                    <p className="text-lg font-bold text-slate-700">{group.totalBatang}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Volume</p>
                    <p className="text-lg font-black text-amber-600">{group.totalVolume.toFixed(2)} <span className="text-xs font-semibold text-amber-600/70">m³</span></p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                  <thead className="bg-white text-slate-400 font-bold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-center w-12">No.</th>
                      <th className="py-3 px-4">No. Kapling</th>
                      <th className="py-3 px-4">No. Blok</th>
                      <th className="py-3 px-4">Sortimen</th>
                      <th className="py-3 px-4 text-right">Panjang (m)</th>
                      <th className="py-3 px-4 text-right">Diameter (cm)</th>
                      <th className="py-3 px-4">Mutu</th>
                      <th className="py-3 px-4 text-center">Batang</th>
                      <th className="py-3 px-4 text-right">Volume</th>
                      <th className="py-3 px-4">Pembeli / Mitra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {group.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{item.kapling}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-900">{item.blok}</td>
                        <td className="py-3.5 px-4">{item.sortimen}</td>
                        <td className="py-3.5 px-4 text-right">{item.panjang}</td>
                        <td className="py-3.5 px-4 text-right">{item.diameter}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={\`px-2 py-0.5 rounded-md text-[11px] font-bold border \${
                              item.mutu.startsWith('A')
                                ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                : 'border-slate-200 text-slate-600 bg-slate-50'
                            }\`}
                          >
                            {item.mutu}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">{item.sisaBatang}</td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-700">{Number(item.sisaVolume).toFixed(2)}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{item.pembeli}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {groupedByJenis.groups.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic bg-white rounded-2xl border border-slate-200 shadow-sm">
              Tidak ada data sisa kayu pihak ketiga.
            </div>
          )}

          {groupedByJenis.groups.length > 0 && (
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h4 className="text-xl md:text-2xl font-black tracking-tight text-white">Grand Total Keseluruhan</h4>
                <p className="text-sm font-medium text-slate-400 mt-1">Total semua jenis kayu pihak ketiga yang memiliki sisa stok.</p>
              </div>
              <div className="flex gap-6 md:gap-12">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Kapling</p>
                  <p className="text-2xl md:text-3xl font-bold">{groupedByJenis.grandTotalKapling}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Batang</p>
                  <p className="text-2xl md:text-3xl font-bold">{groupedByJenis.grandTotalBatang}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Volume</p>
                  <p className="text-2xl md:text-3xl font-black text-amber-400">{groupedByJenis.grandTotalVolume.toFixed(2)} <span className="text-lg font-semibold text-amber-400/80">m³</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      `;

code = code.substring(0, tableStartIdx) + newTableStr + code.substring(tableEndIdx);

fs.writeFileSync('src/components/KetigaTab.tsx', code);
