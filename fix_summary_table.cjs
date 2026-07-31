const fs = require('fs');

const addition = `
  const summaryData = useMemo(() => {
    const res: Record<string, any> = {};
    MONTHS.forEach(m => {
      res[m] = {
        bulan: m,
        pinus: { btg: 0, vol: 0 },
        jati: { btg: 0, vol: 0 },
        sonokeling: { btg: 0, vol: 0 },
        mahoni: { btg: 0, vol: 0 },
        total: { btg: 0, vol: 0 }
      };
    });

    filteredData.forEach(item => {
      const parts = (item.tanggal || '').split(' ');
      let monthStr = '';
      if (parts.length > 2) {
        monthStr = parts[parts.length - 2];
      } else {
        const d = item.tanggal?.split('/');
        if (d && d.length >= 2) {
          const mIndex = parseInt(d[1], 10) - 1;
          if (mIndex >= 0 && mIndex < 12) monthStr = MONTHS[mIndex];
        }
      }

      if (monthStr) {
        const monthMatch = MONTHS.find(m => m.toLowerCase() === monthStr.toLowerCase());
        if (monthMatch) {
          const jenis = (item.jenis || '').toLowerCase();
          const btg = (item.ai_batang || 0) + (item.aii_batang || 0) + (item.aiii_batang || 0);
          const vol = (item.ai_volume || 0) + (item.aii_volume || 0) + (item.aiii_volume || 0);
          
          let key = 'total';
          if (jenis.includes('pinus')) key = 'pinus';
          else if (jenis.includes('jati')) key = 'jati';
          else if (jenis.includes('sonokeling')) key = 'sonokeling';
          else if (jenis.includes('mahoni')) key = 'mahoni';

          if (key !== 'total') {
            res[monthMatch][key].btg += btg;
            res[monthMatch][key].vol += vol;
          }
          res[monthMatch].total.btg += btg;
          res[monthMatch].total.vol += vol;
        }
      }
    });

    return MONTHS.map(m => res[m]);
  }, [filteredData]);
`;

let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

const anchor = "const grandTotals = useMemo(() => {";
code = code.replace(anchor, addition + "\\n  " + anchor);

const tableInjection = `
      {/* Tabel Ringkasan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Rekap Mutasi Kapling per Bulan & per Jenis Kayu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead className="bg-white text-[11px] font-bold uppercase tracking-wider">
              <tr className="border-b border-slate-200">
                <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 align-middle text-slate-700 text-left">Bulan</th>
                <th colSpan={2} className="px-4 py-2 border-r border-slate-200 text-emerald-600">PINUS</th>
                <th colSpan={2} className="px-4 py-2 border-r border-slate-200 text-amber-700">JATI</th>
                <th colSpan={2} className="px-4 py-2 border-r border-slate-200 text-purple-600">SONOKELING</th>
                <th colSpan={2} className="px-4 py-2 border-r border-slate-200 text-orange-600">MAHONI</th>
                <th colSpan={2} className="px-4 py-2 text-blue-600">TOTAL SEMUA JENIS</th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50/50">
                <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">Btg</th>
                <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">Vol</th>
                <th className="px-2 py-2 border-r border-slate-200 text-amber-700">Btg</th>
                <th className="px-2 py-2 border-r border-slate-200 text-amber-700">Vol</th>
                <th className="px-2 py-2 border-r border-slate-200 text-purple-600">Btg</th>
                <th className="px-2 py-2 border-r border-slate-200 text-purple-600">Vol</th>
                <th className="px-2 py-2 border-r border-slate-200 text-orange-600">Btg</th>
                <th className="px-2 py-2 border-r border-slate-200 text-orange-600">Vol</th>
                <th className="px-2 py-2 border-r border-slate-200 text-blue-600">Btg</th>
                <th className="px-2 py-2 text-blue-600">Vol</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map(row => (
                <tr key={row.bulan} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 border-r border-slate-200 text-left text-slate-600 font-medium">{row.bulan}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.pinus.btg > 0 ? formatBtg(row.pinus.btg) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.pinus.vol > 0 ? formatVol(row.pinus.vol) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.jati.btg > 0 ? formatBtg(row.jati.btg) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.jati.vol > 0 ? formatVol(row.jati.vol) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.sonokeling.btg > 0 ? formatBtg(row.sonokeling.btg) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.sonokeling.vol > 0 ? formatVol(row.sonokeling.vol) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.mahoni.btg > 0 ? formatBtg(row.mahoni.btg) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.mahoni.vol > 0 ? formatVol(row.mahoni.vol) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200 font-medium text-blue-600 bg-blue-50/30">{row.total.btg > 0 ? formatBtg(row.total.btg) : '-'}</td>
                  <td className="px-2 py-3 font-medium text-blue-600 bg-blue-50/30">{row.total.vol > 0 ? formatVol(row.total.vol) : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold border-t-2 border-slate-200">
              <tr>
                <td className="px-4 py-4 border-r border-slate-200 text-left uppercase text-xs text-slate-800">
                  TOTAL {filterYear ? \\\`JANUARI s/d DESEMBER \\\${filterYear}\\\` : 'SEMUA TAHUN'}
                </td>
                <td className="px-2 py-4 border-r border-slate-200 text-emerald-600">{formatBtg(grandTotals.pinus.btg)}</td>
                <td className="px-2 py-4 border-r border-slate-200 text-emerald-600">{formatVol(grandTotals.pinus.vol)}</td>
                <td className="px-2 py-4 border-r border-slate-200 text-amber-700">{formatBtg(grandTotals.jati.btg)}</td>
                <td className="px-2 py-4 border-r border-slate-200 text-amber-700">{formatVol(grandTotals.jati.vol)}</td>
                <td className="px-2 py-4 border-r border-slate-200 text-purple-600">{formatBtg(grandTotals.sonokeling.btg)}</td>
                <td className="px-2 py-4 border-r border-slate-200 text-purple-600">{formatVol(grandTotals.sonokeling.vol)}</td>
                <td className="px-2 py-4 border-r border-slate-200 text-orange-600">{formatBtg(grandTotals.mahoni.btg)}</td>
                <td className="px-2 py-4 border-r border-slate-200 text-orange-600">{formatVol(grandTotals.mahoni.vol)}</td>
                <td className="px-2 py-4 border-r border-slate-200 text-blue-600">{formatBtg(grandTotals.total.btg)}</td>
                <td className="px-2 py-4 text-blue-600">{formatVol(grandTotals.total.vol)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
`;

const tableAnchor = "{/* Detail Data */}";
code = code.replace(tableAnchor, tableInjection + "\\n      " + tableAnchor);

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
