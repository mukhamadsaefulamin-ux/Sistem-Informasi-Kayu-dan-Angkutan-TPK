const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');

const sisaGroupsLogic = `
  const sisaPihakKetigaGroups = useMemo(() => {
    const groups: Record<string, { kapling: Set<string>; batang: number; volume: number }> = {};
    
    dataKetiga.forEach(item => {
      let terangkutBatang = 0;
      let terangkutVolume = 0;
      dataAngkut?.forEach(ang => {
        if (
          ang.kapling.trim().toLowerCase() === item.kapling.trim().toLowerCase() &&
          ang.blok.trim().toLowerCase() === item.blok.trim().toLowerCase()
        ) {
          const isMatchSortimen = !ang.sortimen || ang.sortimen === '-' || ang.sortimen.trim().toLowerCase() === item.sortimen.trim().toLowerCase() || ang.sortimen.trim().toLowerCase() === (item.jenis || '').trim().toLowerCase();
          if (isMatchSortimen) {
            terangkutBatang += Number(ang.batang) || 0;
            terangkutVolume += Number(ang.volume) || 0;
          }
        }
      });
      const sBtg = Math.max(0, (item.batang || 0) - terangkutBatang);
      const sVol = Math.max(0, (item.volume || 0) - terangkutVolume);

      if (sBtg > 0 || sVol > 0) {
        const jenis = (item.jenis || 'Lainnya').trim().toUpperCase();
        if (!groups[jenis]) {
          groups[jenis] = { kapling: new Set(), batang: 0, volume: 0 };
        }
        if (item.kapling && item.kapling !== '-') {
          groups[jenis].kapling.add(item.kapling.trim().toLowerCase());
        }
        groups[jenis].batang += sBtg;
        groups[jenis].volume += sVol;
      }
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => a.localeCompare(b)).map(k => ({
      jenis: k,
      kaplingCount: groups[k].kapling.size,
      batang: groups[k].batang,
      volume: groups[k].volume
    }));

    return sortedGroups;
  }, [dataKetiga, dataAngkut]);

  const sisaPerhutaniGroups = useMemo(() => {
    const groups: Record<string, { kapling: Set<string>; batang: number; volume: number }> = {};
    
    dataPerhutani.forEach(item => {
      const sBtg = Number(item.batang || 0);
      const sVol = Number(item.volume || 0);

      if (sBtg > 0 || sVol > 0) {
        const jenis = (item.jenis || 'Lainnya').trim().toUpperCase();
        if (!groups[jenis]) {
          groups[jenis] = { kapling: new Set(), batang: 0, volume: 0 };
        }
        if (item.kapling && item.kapling !== '-') {
          groups[jenis].kapling.add(item.kapling.trim().toLowerCase());
        }
        groups[jenis].batang += sBtg;
        groups[jenis].volume += sVol;
      }
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => a.localeCompare(b)).map(k => ({
      jenis: k,
      kaplingCount: groups[k].kapling.size,
      batang: groups[k].batang,
      volume: groups[k].volume
    }));

    return sortedGroups;
  }, [dataPerhutani]);
`;

code = code.replace(
  /\/\/ Chart data: daily volume breakdown/,
  sisaGroupsLogic + '\n  // Chart data: daily volume breakdown'
);

// We need to replace the UI for Sisa Kayu Section.
const oldSisaSection = `      {/* Sisa Kayu Section */}
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
          <div className="absolute -right-6 -top-6 text-emerald-600/5 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 pointer-events-none">
            <Building2 className="w-32 h-32" />
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
          <div className="absolute -right-6 -top-6 text-blue-600/5 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 pointer-events-none">
            <Boxes className="w-32 h-32" />
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
          <div className="absolute -right-6 -top-6 text-amber-600/5 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 pointer-events-none">
            <TreePine className="w-32 h-32" />
          </div>
        </div>
      </div>`;

const newSisaSection = `      {/* Sisa Kayu Section */}
      <div className="mt-12 mb-6 flex items-center gap-4 border-t border-slate-200/80 pt-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Total Sisa Kayu Pihak Ketiga</h2>
          <p className="text-sm text-slate-500 mt-1">
            Akumulasi sisa stok milik Pihak Ketiga dikelompokkan berdasarkan jenis kayu
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {sisaPihakKetigaGroups.map(group => (
          <div key={group.jenis} className="bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all text-white">
            <h3 className="text-xl font-black text-white mb-5 uppercase tracking-wide">{group.jenis}</h3>
            
            <div className="flex flex-col gap-4 z-10">
              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Kapling</span>
                </div>
                <span className="text-lg font-bold text-white">{group.kaplingCount}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-amber-400 flex items-center justify-center">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Batang</span>
                </div>
                <span className="text-lg font-bold text-white">{group.batang}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-blue-400 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Volume</span>
                </div>
                <span className="text-lg font-black text-amber-400">{group.volume.toFixed(2)} <span className="text-xs font-normal text-amber-400/60">m³</span></span>
              </div>
            </div>
          </div>
        ))}
        {sisaPihakKetigaGroups.length === 0 && (
          <div className="col-span-full py-10 bg-slate-50 border border-slate-200/80 rounded-3xl text-center text-slate-500 italic">
            Belum ada sisa stok pihak ketiga
          </div>
        )}
      </div>

      <div className="mt-12 mb-6 flex items-center gap-4 border-t border-slate-200/80 pt-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Total Sisa Kayu Perhutani</h2>
          <p className="text-sm text-slate-500 mt-1">
            Akumulasi sisa stok milik Perhutani dikelompokkan berdasarkan jenis kayu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {sisaPerhutaniGroups.map(group => (
          <div key={group.jenis} className="bg-emerald-950 rounded-3xl p-6 shadow-md border border-emerald-900/50 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all text-white">
            <h3 className="text-xl font-black text-white mb-5 uppercase tracking-wide">{group.jenis}</h3>
            
            <div className="flex flex-col gap-4 z-10">
              <div className="flex justify-between items-center bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-300 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Kapling</span>
                </div>
                <span className="text-lg font-bold text-white">{group.kaplingCount}</span>
              </div>

              <div className="flex justify-between items-center bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Batang</span>
                </div>
                <span className="text-lg font-bold text-white">{group.batang}</span>
              </div>

              <div className="flex justify-between items-center bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-blue-300 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Volume</span>
                </div>
                <span className="text-lg font-black text-amber-400">{group.volume.toFixed(2)} <span className="text-xs font-normal text-amber-400/60">m³</span></span>
              </div>
            </div>
          </div>
        ))}
        {sisaPerhutaniGroups.length === 0 && (
          <div className="col-span-full py-10 bg-slate-50 border border-slate-200/80 rounded-3xl text-center text-slate-500 italic">
            Belum ada sisa stok Perhutani
          </div>
        )}
      </div>
`;

code = code.replace(oldSisaSection, newSisaSection);

fs.writeFileSync('src/components/DashboardTab.tsx', code);
