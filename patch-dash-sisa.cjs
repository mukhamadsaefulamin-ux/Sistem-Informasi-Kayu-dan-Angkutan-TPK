const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');

const oldVolKetiga = /const \{ volKetigaAwal, volKetigaTerangkut, volKetigaSisa \} = useMemo\(\(\) => \{[\s\S]*?\}, \[dataKetiga, dataAngkut\]\);\s*const volPerhutani = useMemo\(\(\) => \{[\s\S]*?\}, \[dataPerhutani\]\);/;

const newVolKetiga = `const { sisaBatangKetiga, sisaVolKetiga } = useMemo(() => {
    let sisaBtg = 0;
    let sisaVol = 0;
    
    dataKetiga.forEach(item => {
      let terangkutBatang = 0;
      let terangkutVolume = 0;
      dataAngkut?.forEach(ang => {
        if (
          ang.kapling.trim().toLowerCase() === item.kapling.trim().toLowerCase() &&
          ang.blok.trim().toLowerCase() === item.blok.trim().toLowerCase()
        ) {
          const isMatchSortimen = !ang.sortimen || ang.sortimen === '-' || ang.sortimen.trim().toLowerCase() === item.sortimen.trim().toLowerCase() || ang.sortimen.trim().toLowerCase() === item.jenis.trim().toLowerCase();
          if (isMatchSortimen) {
            terangkutBatang += Number(ang.batang) || 0;
            terangkutVolume += Number(ang.volume) || 0;
          }
        }
      });
      sisaBtg += Math.max(0, (item.batang || 0) - terangkutBatang);
      sisaVol += Math.max(0, (item.volume || 0) - terangkutVolume);
    });
    
    return {
      sisaBatangKetiga: sisaBtg,
      sisaVolKetiga: sisaVol
    };
  }, [dataKetiga, dataAngkut]);

  const { sisaBatangPerhutani, sisaVolPerhutani } = useMemo(() => {
    return {
      sisaBatangPerhutani: dataPerhutani.reduce((sum, item) => sum + Number(item.batang || 0), 0),
      sisaVolPerhutani: dataPerhutani.reduce((sum, item) => sum + Number(item.volume || 0), 0)
    };
  }, [dataPerhutani]);

  const totalSisaBatang = sisaBatangKetiga + sisaBatangPerhutani;
  const totalSisaVolume = sisaVolKetiga + sisaVolPerhutani;
  const totalSisaKapling = dataKetiga.length + dataPerhutani.length;`;

code = code.replace(oldVolKetiga, newVolKetiga);

// We need to inject the new section for "Total Sisa Kayu Pinus"
// Let's find: {/* Visual Interactive Charts */} and insert right before it.

const newSection = `
      {/* Sisa Kayu Section */}
      <div className="mt-8 mb-6 flex items-center justify-between gap-4 border-t border-slate-200/80 pt-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Total Sisa Kayu Pinus</h2>
          <p className="text-sm text-slate-500 mt-1">
            Akumulasi sisa stok dari Pihak Ketiga dan Perhutani
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Sisa Kapling */}
        <div className="bg-slate-50 rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-white text-emerald-600 shadow-sm flex items-center justify-center text-2xl z-10 flex-shrink-0 border border-slate-200/50">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="z-10">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Total Kapling
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800">
              {totalSisaKapling} <span className="text-sm font-normal text-slate-400">Kapling</span>
            </h3>
          </div>
        </div>

        {/* Sisa Volume */}
        <div className="bg-slate-50 rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-white text-blue-600 shadow-sm flex items-center justify-center text-2xl z-10 flex-shrink-0 border border-slate-200/50">
            <Boxes className="w-7 h-7" />
          </div>
          <div className="z-10">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Total Volume
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800">
              {totalSisaVolume.toFixed(2)} <span className="text-sm font-normal text-slate-400">m³</span>
            </h3>
          </div>
        </div>

        {/* Sisa Batang */}
        <div className="bg-slate-50 rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-white text-amber-600 shadow-sm flex items-center justify-center text-2xl z-10 flex-shrink-0 border border-slate-200/50">
            <TreePine className="w-7 h-7" />
          </div>
          <div className="z-10">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Total Batang
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800">
              {totalSisaBatang} <span className="text-sm font-normal text-slate-400">Batang</span>
            </h3>
          </div>
        </div>
      </div>
`;

code = code.replace(/\{\/\* Visual Interactive Charts \*\/\}/, newSection + '\n      {/* Visual Interactive Charts */}');

fs.writeFileSync('src/components/DashboardTab.tsx', code);
