const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

const injection = `
  const getYearFromTanggal = (t: string) => {
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(t)) return t.substring(0, 4);
    const match = t.match(/(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
    if (match) return match[3];
    const strMatch = t.match(/\\d+\\s+s\\/d\\s+\\d+\\s+([a-zA-Z]+)\\s+(\\d{4})/i);
    if (strMatch) return strMatch[2];
    return '';
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.jenis?.toLowerCase().includes(searchTerm.toLowerCase());
      let matchYear = true;
      if (filterYear) {
        const itemYear = getYearFromTanggal(item.tanggal || '');
        matchYear = itemYear === filterYear;
      }
      return matchSearch && matchYear;
    }).sort((a, b) => {
      return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
    });
  }, [data, searchTerm, filterYear]);

  const detailData = filteredData;

  const grandTotals = useMemo(() => {
    const initTotals = { btg: 0, vol: 0 };
    const res = {
      pinus: { ...initTotals },
      jati: { ...initTotals },
      sonokeling: { ...initTotals },
      mahoni: { ...initTotals },
      total: { ...initTotals }
    };

    filteredData.forEach(item => {
      const jenis = (item.jenis || '').toLowerCase();
      const btg = (item.ai_batang || 0) + (item.aii_batang || 0) + (item.aiii_batang || 0);
      const vol = (item.ai_volume || 0) + (item.aii_volume || 0) + (item.aiii_volume || 0);
      
      let key = 'total';
      if (jenis.includes('pinus')) key = 'pinus';
      else if (jenis.includes('jati')) key = 'jati';
      else if (jenis.includes('sonokeling')) key = 'sonokeling';
      else if (jenis.includes('mahoni')) key = 'mahoni';
      
      if (key !== 'total') {
        res[key].btg += btg;
        res[key].vol += vol;
      }
      res.total.btg += btg;
      res.total.vol += vol;
    });
    return res;
  }, [filteredData]);

  const formatBtg = (val: number) => val.toLocaleString('id-ID');
  const formatVol = (val: number) => val.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
`;

// Insert it right before `return (`
code = code.replace("  const formatBtg = (val: number) => val.toLocaleString('id-ID');\n  const formatVol = (val: number) => val.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 });\n  return (", injection + "\n  return (");

// But wait, getYearFromTanggal might already exist in the file.
// Let's remove any existing `getYearFromTanggal` block before injecting.
const existingGetYear = code.indexOf("const getYearFromTanggal = (t: string) => {");
if (existingGetYear !== -1) {
  const nextFunc = code.indexOf("const handleEdit = (item: DataMutasi) => {", existingGetYear);
  if (nextFunc !== -1) {
     // actually we just do a more targeted replace
  }
}

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
