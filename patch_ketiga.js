const fs = require('fs');
let code = fs.readFileSync('src/components/KetigaTab.tsx', 'utf8');

// replace DataKetiga import with DataAngkut included if needed (already there in types)
code = code.replace(/import { DataKetiga /g, "import { DataKetiga, DataAngkut ");

const useMemoComputed = `
  const computedData = useMemo(() => {
    return data.map(item => {
      let terangkutBatang = 0;
      let terangkutVolume = 0;
      dataAngkut?.forEach(ang => {
        if (
          ang.kapling.trim().toLowerCase() === item.kapling.trim().toLowerCase() &&
          ang.blok.trim().toLowerCase() === item.blok.trim().toLowerCase() &&
          (ang.sortimen.trim().toLowerCase() === item.sortimen.trim().toLowerCase() || ang.jenis?.trim().toLowerCase() === item.jenis.trim().toLowerCase())
        ) {
          terangkutBatang += Number(ang.batang) || 0;
          terangkutVolume += Number(ang.volume) || 0;
        }
      });
      return {
        ...item,
        terangkutBatang,
        terangkutVolume,
        sisaBatang: Math.max(0, (item.batang || 0) - terangkutBatang),
        sisaVolume: Math.max(0, (item.volume || 0) - terangkutVolume)
      };
    });
  }, [data, dataAngkut]);
`;

code = code.replace(
  /const blockSummary = useMemo\(\(\) => {/g,
  `${useMemoComputed}\n  const blockSummary = useMemo(() => {`
);

code = code.replace(
  /data\.forEach\(item => {/g,
  `computedData.forEach(item => {`
);

code = code.replace(
  /map\[b\]\.vol \+= Number\(item\.volume \|\| 0\);/g,
  `map[b].vol += Number(item.sisaVolume || 0);`
);

code = code.replace(
  /map\[b\]\.batang \+= Number\(item\.batang \|\| 0\);/g,
  `map[b].batang += Number(item.sisaBatang || 0);`
);

code = code.replace(
  /return data\.filter\(item => {/g,
  `return computedData.filter(item => {`
);

fs.writeFileSync('src/components/KetigaTab.tsx', code);
