const fs = require('fs');
let code = fs.readFileSync('src/components/AngkutTab.tsx', 'utf8');

const totalBatangCode = `const totalBatang = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + Number(item.batang || 0), 0);
  }, [filteredData]);`;

const addKaplingCode = `const totalBatang = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + Number(item.batang || 0), 0);
  }, [filteredData]);

  const totalKapling = useMemo(() => {
    const kaplingSet = new Set<string>();
    filteredData.forEach(item => {
      if (item.kapling && item.kapling !== '-') kaplingSet.add(item.kapling);
    });
    return kaplingSet.size;
  }, [filteredData]);`;

code = code.replace(totalBatangCode, addKaplingCode);

const ritaseCardCode = `{/* Card 4: Total Ritase */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Ritase</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalRitase}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Rit</p>
          </div>
        </div>`;

const kaplingCardCode = `{/* Card 4: Total Kapling */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Kapling</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalKapling}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Kapling Terangkut</p>
          </div>
        </div>`;

code = code.replace(ritaseCardCode, kaplingCardCode);

fs.writeFileSync('src/components/AngkutTab.tsx', code);
