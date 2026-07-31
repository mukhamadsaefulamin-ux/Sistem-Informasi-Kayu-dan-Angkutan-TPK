const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');

const sisaGroupsLogic = `
  const sisaPihakKetigaGroups = useMemo(() => {
    const groups: Record<string, { kapling: Set<string>; batang: number; volume: number }> = {};
    let totalKaplingCount = 0;
    
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
  /const \{ sisaBatangKetiga, sisaVolKetiga \} = useMemo\(\(\) => \{[\s\S]*?sisaBatangPerhutani \+ sisaBatangKetiga;\n\s*const totalSisaVolume = sisaVolPerhutani \+ sisaVolKetiga;\n\s*const totalSisaKapling = dataKetiga\.length \+ dataPerhutani\.length;/, 
  (match) => sisaGroupsLogic + match // Wait, if I replace, I'll mess up the variables. Let's just insert before `// Chart data: daily volume breakdown`.
);
