const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');

const sisaSectionStart = code.indexOf('{/* Sisa Kayu Section */}');
// find the end of the sisa kayu section. Next is probably chart or end of div.
// let's just find "        </div>\n      </div>\n\n      {/* Charts Row */}" or similar.
const chartRowIdx = code.indexOf('{/* Charts Row */}');

if (sisaSectionStart === -1 || chartRowIdx === -1) {
  console.log("Could not find sections");
  process.exit(1);
}

const newSisaSection = `{/* Sisa Kayu Section */}
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

code = code.substring(0, sisaSectionStart) + newSisaSection + code.substring(chartRowIdx);
fs.writeFileSync('src/components/DashboardTab.tsx', code);

