import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { DataAngkut, DataKetiga, DataPerhutani, DataInvoice, DataDKP, DataMutasi, StorageTarget } from '../types';
import { initialDataAngkut, initialDataKetiga, initialDataPerhutani, initialDataInvoice, initialDataDKP } from '../data/sampleData';


import { collection, onSnapshot } from 'firebase/firestore';

let cachedAngkut: any[] = [];
let cachedKetiga: any[] = [];
let cachedPerhutani: any[] = [];
let cachedDKP: any[] = [];
let cachedInvoice: any[] = [];
let cachedMutasi: any[] = [];

// Initialize subscriptions immediately so cache is populated
if (typeof window !== 'undefined') {
  onSnapshot(collection(db, 'angkut'), snap => {
    cachedAngkut = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'ketiga'), snap => {
    cachedKetiga = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'perhutani'), snap => {
    cachedPerhutani = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'dkp'), snap => {
    cachedDKP = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'invoice'), snap => {
    cachedInvoice = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'mutasi'), snap => {
    cachedMutasi = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
}

const KEY_ANGKUT = 'tpk_angkut';
const KEY_KETIGA = 'tpk_ketiga';
const KEY_PERHUTANI = 'tpk_perhutani';
const KEY_DKP = 'tpk_dkp';
const KEY_INVOICE = 'tpk_invoice';

export const clearAllStoredData = () => {
  localStorage.removeItem(KEY_ANGKUT);
  localStorage.removeItem(KEY_KETIGA);
  localStorage.removeItem(KEY_PERHUTANI);
  localStorage.removeItem(KEY_DKP);
  localStorage.removeItem(KEY_INVOICE);
};

export const loadDataAngkut = (): DataAngkut[] => cachedAngkut;

export const saveDataAngkut = (data: DataAngkut[]) => {
  localStorage.setItem(KEY_ANGKUT, JSON.stringify(data));
};

export const loadDataKetiga = (): DataKetiga[] => cachedKetiga;

export const saveDataKetiga = (data: DataKetiga[]) => {
  localStorage.setItem(KEY_KETIGA, JSON.stringify(data));
};

export const loadDataPerhutani = (): DataPerhutani[] => cachedPerhutani;

export const saveDataPerhutani = (data: DataPerhutani[]) => {
  localStorage.setItem(KEY_PERHUTANI, JSON.stringify(data));
};

export const loadDataDKP = (): DataDKP[] => cachedDKP;

export const saveDataDKP = (data: DataDKP[]) => {
  localStorage.setItem(KEY_DKP, JSON.stringify(data));
};

export const loadDataInvoice = (): DataInvoice[] => cachedInvoice;
export const loadDataMutasi = (): DataMutasi[] => cachedMutasi;

export const saveDataInvoice = (data: DataInvoice[]) => {
  localStorage.setItem(KEY_INVOICE, JSON.stringify(data));
};
export const saveDataMutasi = (data: DataMutasi[]) => {
  // Do nothing for cache, handled by Firestore
};

export const isSameMonth = (itemDate?: string, targetMonth?: string): boolean => {
  if (!targetMonth || targetMonth === 'all' || targetMonth === '') return true;
  if (!itemDate) return false;
  
  if (itemDate.startsWith(targetMonth)) return true;

  const [selYear, selMonth] = targetMonth.split('-');
  if (!selYear || !selMonth) return true;

  const parts = itemDate.split(/[\/-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return parts[0] === selYear && parts[1].padStart(2, '0') === selMonth;
    }
    if (parts[2].length === 4) {
      return parts[2] === selYear && parts[1].padStart(2, '0') === selMonth;
    }
  }

  return false;
};

// CSV Export Generator

const normalizeDateString = (dateStr: string) => {
  if (!dateStr) return '';
  const d = dateStr.replace(/\//g, '-');
  const parts = d.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return d;
    if (parts[2].length === 4) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
};

export const exportToCSV = (target: StorageTarget | 'laporan', currentMonthFilter?: string) => {
  let csvContent = '';
  let fileName = '';
  const todayStr = new Date().toISOString().split('T')[0];

  if (target === 'angkut') {
    const data = loadDataAngkut();
    csvContent += 'No. DKHP,Tanggal,Supir,Nopol,No. Kapling,No. Blok,Sortimen,Tujuan,Alamat,Total Batang,Total Volume,Status\n';
    data.forEach(row => {
      csvContent += `"${row.no_dkhp || '-'}","${row.tanggal}","${row.supir || '-'}","${row.nopol}","${row.kapling || '-'}","${row.blok || '-'}","${row.sortimen || '-'}","${row.tujuan || '-'}","${row.alamat || '-'}",${row.batang || 0},${row.volume || 0},"${row.status || 'Selesai'}"\n`;
    });
    fileName = `Data_Angkut_Harian_TPK_Talok_${todayStr}.csv`;
  
  } else if (target === 'ketiga') {
    const allAngkut = loadDataAngkut();
    const data = loadDataKetiga().map(item => {
      let terangkutBatang = 0;
      let terangkutVolume = 0;
      allAngkut.forEach(ang => {
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
      return {
        ...item,
        sisaBatang: Math.max(0, (item.batang || 0) - terangkutBatang),
        sisaVolume: Math.max(0, (item.volume || 0) - terangkutVolume)
      };
    });
    csvContent += 'No,No. Kapling,No. Blok,Jenis Kayu,Sortimen,Panjang (m),Diameter (cm),Mutu,Awal Batang,Awal Volume,Sisa Batang,Sisa Volume (m3),Pembeli\n';
    data.forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.kapling}","${row.blok}","${row.jenis || '-'}","${row.sortimen}",${row.panjang},${row.diameter},"${row.mutu}",${row.batang},${row.volume},${row.sisaBatang},${row.sisaVolume.toFixed(2)},"${row.pembeli}"\n`;
    });
    fileName = `Data_Sisa_Pihak_Ketiga_TPK_Talok_${todayStr}.csv`;

  } else if (target === 'perhutani') {
    const data = loadDataPerhutani();
    csvContent += 'No,Tanggal Kapling,No. Kapling,No. Blok,Jenis Kayu,Sortimen,Panjang (m),Diameter (cm),Mutu,Batang,Volume (m3)\n';
    data.forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.tgl_kapling || '-'}","${row.kapling || '-'}","${row.blok || '-'}","${row.jenis || '-'}","${row.sortimen || '-'}",${row.panjang || 0},${row.diameter || 0},"${row.mutu}",${row.batang || 0},${row.volume}\n`;
    });
    fileName = `Data_Sisa_Perhutani_TPK_Talok_${todayStr}.csv`;
    } else if (target === 'mutasi') {
    const data = loadDataMutasi();
    csvContent += 'Tanggal,Jenis Kayu,AI_Batang,AI_Volume,AII_Batang,AII_Volume,AIII_Batang,AIII_Volume,Total_Batang,Total_Volume\n';
    
    data.forEach(item => {
      const totalBtg = (item.ai_batang||0) + (item.aii_batang||0) + (item.aiii_batang||0);
      const totalVol = (item.ai_volume||0) + (item.aii_volume||0) + (item.aiii_volume||0);
      const row = [
        item.tanggal,
        item.jenis,
        item.ai_batang,
        item.ai_volume,
        item.aii_batang,
        item.aii_volume,
        item.aiii_batang,
        item.aiii_volume,
        totalBtg,
        totalVol
      ].map(val => `"${String(val || '').replace(/"/g, '""')}"`).join(',');
      csvContent += row + '\n';
    });
    fileName = `Data_Mutasi_Kapling_${todayStr}.csv`;

  } else if (target === 'dkp') {
    const data = loadDataDKP();
    csvContent += 'No,No. DKP,Tanggal,No. Kapling,No. Blok,Jenis Kayu,Sortimen,Panjang (m),Diameter (cm),Mutu,Batang,Volume (m3),Petugas,Status\n';
    data.forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.no_dkp || '-'}","${row.tanggal || '-'}","${row.kapling || '-'}","${row.blok || '-'}","${row.jenis || '-'}","${row.sortimen || '-'}",${row.panjang || 0},${row.diameter || 0},"${row.mutu || '-'}",${row.batang || 0},${row.volume || 0},"${row.petugas || '-'}","${row.status || 'Tersedia'}"\n`;
    });
    fileName = `Data_DKP_Produksi_TPK_Talok_${todayStr}.csv`;
  } else if (target === 'invoice') {
    const data = loadDataInvoice();
    csvContent += 'No,Tanggal,No. Invoice,BTG,M3,Nominal (Rp),Pembeli,Status\n';
    data.forEach((row, idx) => {
      csvContent += `${idx + 1},${row.tanggal},"${row.no_invoice}",${row.batang || 0},${row.volume || 0},${row.nominal},"${row.pembeli}","${row.status}"\n`;
    });
    fileName = `Data_Pendapatan_Invoice_TPK_Talok_${todayStr}.csv`;
  } else if (target === 'laporan') {
    const filterDate = currentMonthFilter || '';
    const dataAngkut = loadDataAngkut().filter(item => {
      if (!filterDate) return true;
      const normItemDate = normalizeDateString(item.tanggal);
      return normItemDate === filterDate;
    });
    const dataKetiga = loadDataKetiga();
    const dataPerhutani = loadDataPerhutani();

    csvContent += `=== LAPORAN TERINTEGRASI TPK TALOK (TANGGAL ${filterDate || "Semua"}) ===\n\n`;
    
    // Section 1: Angkut Harian
    csvContent += `1. DATA ANGKUTAN HARIAN (TANGGAL ${filterDate || "Semua"})\n`;
    csvContent += 'No,No. DKHP,Tanggal,Supir,Nopol,No. Kapling,No. Blok,Sortimen,Tujuan,Alamat,Total Batang,Total Volume (m3),Status\n';
    let totalVolAngkut = 0;
    let totalBatangAngkut = 0;
    dataAngkut.forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.no_dkhp || '-'}","${row.tanggal}","${row.supir || '-'}","${row.nopol}","${row.kapling || '-'}","${row.blok || '-'}","${row.sortimen || '-'}","${row.tujuan || '-'}","${row.alamat || '-'}",${row.batang || 0},${row.volume || 0},"${row.status || 'Selesai'}"\n`;
      totalVolAngkut += Number(row.volume || 0);
      totalBatangAngkut += Number(row.batang || 0);
    });
    csvContent += `Subtotal Angkut Harian,, , , , , , , , ,${totalBatangAngkut},${totalVolAngkut.toFixed(2)},\n\n`;

    
    const allAngkut = loadDataAngkut();
    const dataKetigaComputed = loadDataKetiga().map(item => {
      let terangkutBatang = 0;
      let terangkutVolume = 0;
      allAngkut.forEach(ang => {
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
      return {
        ...item,
        sisaBatang: Math.max(0, (item.batang || 0) - terangkutBatang),
        sisaVolume: Math.max(0, (item.volume || 0) - terangkutVolume)
      };
    });

    csvContent += `2. DATA SISA KAYU PIHAK KETIGA\n`;
    csvContent += 'No,No. Kapling,No. Blok,Jenis Kayu,Sortimen,Panjang (m),Diameter (cm),Mutu,Sisa Batang,Sisa Volume (m3),Pembeli\n';
    let totalVolKetiga = 0;
    let totalBatangKetiga = 0;
    dataKetigaComputed.forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.kapling}","${row.blok}","${row.jenis || '-'}","${row.sortimen}",${row.panjang},${row.diameter},"${row.mutu}",${row.sisaBatang},${row.sisaVolume.toFixed(2)},"${row.pembeli}"\n`;
      totalVolKetiga += Number(row.sisaVolume || 0);
      totalBatangKetiga += Number(row.sisaBatang || 0);
    });

    csvContent += `Subtotal Sisa Pihak Ketiga,, , , , , , ,${totalBatangKetiga},${totalVolKetiga.toFixed(2)},\n\n`;

    // Section 3: Sisa Perhutani
    csvContent += `3. DATA SISA KAYU PERHUTANI\n`;
    csvContent += 'No,Tanggal Kapling,No. Kapling,No. Blok,Jenis Kayu,Sortimen,Panjang (m),Diameter (cm),Mutu,Batang,Volume (m3)\n';
    let totalVolPerhutani = 0;
    let totalBatangPerhutani = 0;
    dataPerhutani.forEach((row, idx) => {
      csvContent += `${idx + 1},"${row.tgl_kapling || '-'}","${row.kapling || '-'}","${row.blok || '-'}","${row.jenis || '-'}","${row.sortimen || '-'}",${row.panjang || 0},${row.diameter || 0},"${row.mutu}",${row.batang || 0},${row.volume}\n`;
      totalVolPerhutani += Number(row.volume || 0);
      totalBatangPerhutani += Number(row.batang || 0);
    });
    csvContent += `Subtotal Sisa Perhutani,, , , , , , , ,${totalBatangPerhutani},${totalVolPerhutani.toFixed(2)}\n\n`;

    // Grand Totals
    csvContent += `=== RINGKASAN REKAPITULASI KONSOLIDASI ===\n`;
    csvContent += `Total Volume Angkut Harian, ${totalVolAngkut.toFixed(2)} m3, (${totalBatangAngkut} Batang)\n`;
    csvContent += `Total Volume Sisa Pihak Ketiga, ${totalVolKetiga.toFixed(2)} m3, (${totalBatangKetiga} Batang)\n`;
    csvContent += `Total Volume Sisa Perhutani, ${totalVolPerhutani.toFixed(2)} m3, (${totalBatangPerhutani} Batang)\n`;
    csvContent += `GRAND TOTAL VOLUME TERKONSOLIDASI, ${(totalVolAngkut + totalVolKetiga + totalVolPerhutani).toFixed(2)} m3, (${totalBatangAngkut + totalBatangKetiga + totalBatangPerhutani} Batang)\n`;

    fileName = `Laporan_Bulanan_Terintegrasi_TPK_Talok_${filterDate || 'Semua'}.csv`;
  }

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// CSV Import Parser with Duplicate Prevention

export const splitCsv = (str: string, delimiter: string = ',') => {
  let arr: string[] = [];
  let inQuote = false;
  let token = "";
  for(let i=0; i<str.length; i++) {
    if(str[i] === '"') inQuote = !inQuote;
    else if(str[i] === delimiter && !inQuote) {
      arr.push(token); token = "";
    } else { token += str[i]; }
  }
  arr.push(token);
  return arr;
};

export const parseAndImportCSV = (
  csvText: string,
  target: StorageTarget
): { importedCount: number; duplicatesCount: number } => {
  const rows = csvText.split('\n').filter(r => r.trim().length > 0);
  if (rows.length <= 1) throw new Error('Data CSV kosong atau format tidak sesuai.');

  let importedCount = 0;
  let duplicatesCount = 0;

  if (target === 'angkut') {
    const current = loadDataAngkut();
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 4) {
        const no_dkhp = cols[0] || '-';
        const tanggal = cols[1] || new Date().toISOString().split('T')[0];
        const supir = cols[2] || '-';
        const nopol = cols[3] || 'K 0000 XX';
        const kapling = cols[4] || '-';
        const blok = cols[5] || '-';
        const sortimen = cols[6] || '-';
        const jenis = cols[6] || 'Jati';
        const tujuan = cols[7] || '-';
        const alamat = cols[8] || '-';
        const batang = parseInt(cols[9]) || 0;
        const volume = parseFloat((cols[10] || '').replace(',', '.')) || 0;
        
        const status = cols[11] || 'Selesai';
        
        // --- VALIDASI SISA STOK PIHAK KETIGA ---
        // Requirement: Sistem harus mencegah stok menjadi minus atau bernilai negatif.
        const dataKetiga = loadDataKetiga();
        let totalStokAwalBatang = 0;
        let totalStokAwalVolume = 0;
        let hasKetigaMatch = false;
        
        dataKetiga.forEach(k => {
           if (k.kapling.trim().toLowerCase() === kapling.trim().toLowerCase() && 
               k.blok.trim().toLowerCase() === blok.trim().toLowerCase()) {
               const isMatchSortimen = !sortimen || sortimen === '-' || sortimen.trim().toLowerCase() === k.sortimen.trim().toLowerCase() || sortimen.trim().toLowerCase() === k.jenis.trim().toLowerCase();
               if (isMatchSortimen) {
                   totalStokAwalBatang += Number(k.batang || 0);
                   totalStokAwalVolume += Number(k.volume || 0);
                   hasKetigaMatch = true;
               }
           }
        });
        
        if (hasKetigaMatch) {
            let totalTerangkutBatang = 0;
            let totalTerangkutVolume = 0;
            current.forEach(ang => {
                if (ang.kapling.trim().toLowerCase() === kapling.trim().toLowerCase() && 
                    ang.blok.trim().toLowerCase() === blok.trim().toLowerCase()) {
                    const isMatchSortimen = !ang.sortimen || ang.sortimen === '-' || ang.sortimen.trim().toLowerCase() === sortimen.trim().toLowerCase() || ang.sortimen.trim().toLowerCase() === jenis.trim().toLowerCase();
                    if (isMatchSortimen) {
                        totalTerangkutBatang += Number(ang.batang || 0);
                        totalTerangkutVolume += Number(ang.volume || 0);
                    }
                }
            });
            
            // Periksa jika akan jadi minus
            if ((totalStokAwalBatang - totalTerangkutBatang - batang) < 0 || (totalStokAwalVolume - totalTerangkutVolume - volume) < 0) {
                 throw new Error(`Gagal Impor: Data Angkut (Kapling ${kapling}, Blok ${blok}) melebihi Sisa Stok Pihak Ketiga (Mencegah Stok Minus). Sisa Stok: ${Math.max(0, totalStokAwalBatang - totalTerangkutBatang)} Btg / ${Math.max(0, totalStokAwalVolume - totalTerangkutVolume).toFixed(2)} m³`);
            }
        }
        // --- END VALIDASI ---


        // Check duplicate
        const isDuplicate = current.some(item => {
          if (no_dkhp !== '-' && item.no_dkhp && item.no_dkhp !== '-') {
            if (item.no_dkhp.trim().toLowerCase() === no_dkhp.trim().toLowerCase()) return true;
          }
          return (
            item.tanggal === tanggal &&
            item.kapling === kapling &&
            item.nopol === nopol &&
            item.batang === batang &&
            item.volume === volume
          );
        });

        if (isDuplicate) {
          duplicatesCount++;
        } else {
          current.push({
            id: 'ang-imp-' + Date.now() + '-' + i,
            no_dkhp,
            tanggal,
            supir,
            nopol,
            kapling,
            blok,
            sortimen,
            jenis,
            tujuan,
            alamat,
            batang,
            volume,
            status
          });
          importedCount++;
        }
      }
    }
    saveDataAngkut(current);
  } else if (target === 'ketiga') {
    const current = loadDataKetiga();
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 10) {
        const kapling = cols[1] || '-';
        const blok = cols[2] || '-';
        const jenis = cols[3] || '-';
        const sortimen = cols[4] || '-';
        const panjang = parseFloat((cols[5] || '').replace(',', '.')) || 0;
        const diameter = parseFloat((cols[6] || '').replace(',', '.')) || 0;
        const mutu = cols[7] || '-';
        const batang = parseInt(cols[8]) || 0;
        const volume = parseFloat((cols[9] || '').replace(',', '.')) || 0;
        const pembeli = cols[10] || '-';

        // Check duplicate
        const isDuplicate = current.some(item => {
          return (
            item.kapling === kapling &&
            item.pembeli.trim().toLowerCase() === pembeli.trim().toLowerCase() &&
            item.jenis.trim().toLowerCase() === jenis.trim().toLowerCase() &&
            item.batang === batang &&
            item.volume === volume
          );
        });

        if (isDuplicate) {
          duplicatesCount++;
        } else {
          current.push({
            id: 'ktg-imp-' + Date.now() + '-' + i,
            kapling,
            blok,
            jenis,
            sortimen,
            panjang,
            diameter,
            mutu,
            batang,
            volume,
            pembeli
          });
          importedCount++;
        }
      }
    }
    saveDataKetiga(current);
  } else if (target === 'perhutani') {
    const current = loadDataPerhutani();
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 10) {
        const tgl_kapling = cols[1] || new Date().toISOString().split('T')[0];
        const kapling = cols[2] || '-';
        const blok = cols[3] || '-';
        const jenis = cols[4] || '-';
        const sortimen = cols[5] || '-';
        const panjang = parseFloat((cols[6] || '').replace(',', '.')) || 0;
        const diameter = parseFloat((cols[7] || '').replace(',', '.')) || 0;
        const mutu = cols[8] || '-';
        const batang = parseInt(cols[9]) || 0;
        const volume = parseFloat((cols[10] || '').replace(',', '.')) || 0;

        // Check duplicate
        const isDuplicate = current.some(item => {
          return (
            item.kapling === kapling &&
            item.tgl_kapling === tgl_kapling &&
            item.blok === blok &&
            item.batang === batang &&
            item.volume === volume
          );
        });

        if (isDuplicate) {
          duplicatesCount++;
        } else {
          current.push({
            id: 'pht-imp-' + Date.now() + '-' + i,
            tgl_kapling,
            kapling,
            blok,
            jenis,
            sortimen,
            panjang,
            diameter,
            mutu,
            batang,
            volume
          });
          importedCount++;
        }
      }
    }
    saveDataPerhutani(current);
  } else if (target === 'dkp') {
    const current = loadDataDKP();
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 6) {
        const no_dkp = cols[1] || 'DKP/' + new Date().getFullYear() + '/' + (i.toString().padStart(3, '0'));
        const tanggal = cols[2] || new Date().toISOString().split('T')[0];
        const kapling = cols[3] || '-';
        const blok = cols[4] || '-';
        const jenis = cols[5] || 'Jati';
        const sortimen = cols[6] || 'A II';
        const panjang = parseFloat((cols[7] || '').replace(',', '.')) || 0;
        const diameter = parseFloat((cols[8] || '').replace(',', '.')) || 0;
        const mutu = cols[9] || 'Utama';
        const batang = parseInt(cols[10]) || 1;
        const volume = parseFloat((cols[11] || '').replace(',', '.')) || 0;
        const petugas = cols[12] || 'Penguji TPK';
        const status = cols[13] || 'Tersedia';

        // Check duplicate
        const isDuplicate = current.some(item => {
          if (no_dkp !== '-' && item.no_dkp && item.no_dkp !== '-') {
            if (item.no_dkp.trim().toLowerCase() === no_dkp.trim().toLowerCase()) return true;
          }
          return (
            item.kapling === kapling &&
            item.tanggal === tanggal &&
            item.batang === batang &&
            item.volume === volume
          );
        });

        if (isDuplicate) {
          duplicatesCount++;
        } else {
          current.push({
            id: 'dkp-imp-' + Date.now() + '-' + i,
            no_dkp,
            tanggal,
            kapling,
            blok,
            jenis,
            sortimen,
            panjang,
            diameter,
            mutu,
            batang,
            volume,
            petugas,
            status
          });
          importedCount++;
        }
      }
    }
    saveDataDKP(current);
  } else if (target === 'invoice') {
    const current = loadDataInvoice();
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 5) {
        let tanggal = new Date().toISOString().split('T')[0];
        let no_invoice = 'INV-' + i;
        let batang = 0;
        let volume = 0;
        let nominal = 0;
        let pembeli = '-';
        let status: 'Lunas' | 'Belum Lunas' = 'Lunas';

        if (cols.length >= 7) {
          tanggal = cols[1] || tanggal;
          no_invoice = cols[2] || no_invoice;
          batang = parseInt(cols[3]) || 0;
          volume = parseFloat((cols[4] || '').replace(',', '.')) || 0;
          nominal = parseFloat(cols[5].replace(/[^0-9.-]+/g, '')) || 0;
          pembeli = cols[6] || '-';
          status = cols[7] === 'Lunas' ? 'Lunas' : 'Belum Lunas';
        } else {
          tanggal = cols[1] || tanggal;
          no_invoice = cols[2] || no_invoice;
          pembeli = cols[3] || '-';
          nominal = parseFloat(cols[4].replace(/[^0-9.-]+/g, '')) || 0;
          status = cols[5] === 'Lunas' ? 'Lunas' : 'Belum Lunas';
        }

        // Check duplicate
        const isDuplicate = current.some(item => {
          if (no_invoice !== '-' && item.no_invoice && item.no_invoice !== '-') {
            if (item.no_invoice.trim().toLowerCase() === no_invoice.trim().toLowerCase()) return true;
          }
          return (
            item.tanggal === tanggal &&
            item.pembeli.trim().toLowerCase() === pembeli.trim().toLowerCase() &&
            item.nominal === nominal
          );
        });

        if (isDuplicate) {
          duplicatesCount++;
        } else {
          current.push({
            id: 'inv-imp-' + Date.now() + '-' + i,
            tanggal,
            no_invoice,
            batang,
            volume,
            nominal,
            pembeli,
            status
          });
          importedCount++;
        }
      }
    }
    saveDataInvoice(current);
  }

  return { importedCount, duplicatesCount };
};


export interface PreviewRow {
  id: string;
  data: any;
  status: 'valid' | 'duplicate_db' | 'duplicate_file' | 'error';
  reason?: string;
}

export interface PreviewResult {
  rows: PreviewRow[];
  total: number;
  valid: number;
  duplicate: number;
  error: number;
}

export const previewImportCSV = (csvText: string, target: StorageTarget): PreviewResult => {
  const rows = csvText.split('\n').filter(r => r.trim().length > 0);
  if (rows.length <= 1) throw new Error('Data CSV kosong atau format tidak sesuai.');

  const result: PreviewResult = { rows: [], total: 0, valid: 0, duplicate: 0, error: 0 };
  result.total = rows.length - 1;

  const matchStr = (a: string | undefined, b: string | undefined) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
  // simpler fallback

  if (target === 'angkut') {
    const current = loadDataAngkut();
    const currentFileRows: any[] = []; // To check duplicates within the file itself

    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 4) {
        const no_dkhp = cols[0] || '-';
        const tanggal = cols[1] || new Date().toISOString().split('T')[0];
        const supir = cols[2] || '-';
        const nopol = cols[3] || 'K 0000 XX';
        const kapling = cols[4] || '-';
        const blok = cols[5] || '-';
        const sortimen = cols[6] || '-';
        const jenis = cols[6] || 'Jati';
        const tujuan = cols[7] || '-';
        const alamat = cols[8] || '-';
        const batang = parseInt(cols[9]) || 0;
        const volume = parseFloat((cols[10] || '').replace(',', '.')) || 0;
        const status = cols[11] || 'Selesai';

        const rowData = { id: 'preview-'+i, no_dkhp, tanggal, supir, nopol, kapling, blok, sortimen, jenis, tujuan, alamat, batang, volume, status };

        // Duplicate Check Logic for Angkut
        const isDuplicateCondition = (item: any) => {
            let match = true;
            if (item.no_dkhp !== '-' && no_dkhp !== '-') {
                if (!matchStr(item.no_dkhp, no_dkhp)) match = false;
            }
            if (!matchStr(item.kapling, kapling)) match = false;
            if (!matchStr(item.blok, blok)) match = false;
            if (!matchStr(item.sortimen, sortimen) && !matchStr(item.jenis, jenis)) match = false;
            if (batang > 0 && item.batang > 0 && item.batang !== batang) match = false;
            if (!matchStr(item.nopol, nopol)) match = false;
            return match;
        };

        const isDuplicateDb = current.some(isDuplicateCondition);
        const isDuplicateFile = currentFileRows.some(isDuplicateCondition);

        if (isDuplicateDb) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_db', reason: 'Data sudah ada di database.' });
            result.duplicate++;
        } else if (isDuplicateFile) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_file', reason: 'Data ganda di dalam file Excel.' });
            result.duplicate++;
        } else {
            // Validation Logic
            let hasError = false;
            let errorReason = '';

            const dataKetiga = loadDataKetiga();
            let totalStokAwalBatang = 0;
            let totalStokAwalVolume = 0;
            let hasKetigaMatch = false;
            
            dataKetiga.forEach(k => {
               if (matchStr(k.kapling, kapling) && matchStr(k.blok, blok)) {
                   const isMatchSortimen = !sortimen || sortimen === '-' || matchStr(sortimen, k.sortimen) || matchStr(sortimen, k.jenis);
                   if (isMatchSortimen) {
                       totalStokAwalBatang += Number(k.batang || 0);
                       totalStokAwalVolume += Number(k.volume || 0);
                       hasKetigaMatch = true;
                   }
               }
            });
            
            if (hasKetigaMatch) {
                let totalTerangkutBatang = 0;
                let totalTerangkutVolume = 0;
                current.forEach(ang => {
                    if (matchStr(ang.kapling, kapling) && matchStr(ang.blok, blok)) {
                        const isMatchSortimen = !ang.sortimen || ang.sortimen === '-' || matchStr(ang.sortimen, sortimen) || matchStr(ang.sortimen, jenis);
                        if (isMatchSortimen) {
                            totalTerangkutBatang += Number(ang.batang || 0);
                            totalTerangkutVolume += Number(ang.volume || 0);
                        }
                    }
                });
                
                // Add the current file valid rows to terangkut check
                currentFileRows.forEach(ang => {
                    if (matchStr(ang.kapling, kapling) && matchStr(ang.blok, blok)) {
                        const isMatchSortimen = !ang.sortimen || ang.sortimen === '-' || matchStr(ang.sortimen, sortimen) || matchStr(ang.sortimen, jenis);
                        if (isMatchSortimen) {
                            totalTerangkutBatang += Number(ang.batang || 0);
                            totalTerangkutVolume += Number(ang.volume || 0);
                        }
                    }
                });
                
                if ((totalStokAwalBatang - totalTerangkutBatang - batang) < 0 || (totalStokAwalVolume - totalTerangkutVolume - volume) < 0) {
                     hasError = true;
                     errorReason = `Data melebihi sisa stok pihak ketiga.`;
                }
            }

            if (hasError) {
                result.rows.push({ id: rowData.id, data: rowData, status: 'error', reason: errorReason });
                result.error++;
            } else {
                result.rows.push({ id: rowData.id, data: rowData, status: 'valid' });
                currentFileRows.push(rowData);
                result.valid++;
            }
        }
      }
    }
  } else if (target === 'ketiga') {
    const current = loadDataKetiga();
    const currentFileRows: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 10) {
        const kapling = cols[1] || '-';
        const blok = cols[2] || '-';
        const jenis = cols[3] || '-';
        const sortimen = cols[4] || '-';
        const panjang = parseFloat((cols[5] || '').replace(',', '.')) || 0;
        const diameter = parseFloat((cols[6] || '').replace(',', '.')) || 0;
        const mutu = cols[7] || '-';
        const batang = parseInt(cols[8]) || 0;
        const volume = parseFloat((cols[9] || '').replace(',', '.')) || 0;
        const pembeli = cols[10] || '-';
        
        const rowData = { id: 'preview-'+i, kapling, blok, jenis, sortimen, panjang, diameter, mutu, batang, volume, pembeli };
        const isDuplicateCondition = (item: any) => {
          return matchStr(item.kapling, kapling) && matchStr(item.blok, blok) && matchStr(item.pembeli, pembeli) && matchStr(item.jenis, jenis) && item.batang === batang && item.volume === volume;
        };

        const isDuplicateDb = current.some(isDuplicateCondition);
        const isDuplicateFile = currentFileRows.some(isDuplicateCondition);

        if (isDuplicateDb) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_db', reason: 'Data sudah ada di database.' });
            result.duplicate++;
        } else if (isDuplicateFile) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_file', reason: 'Data ganda di dalam file Excel.' });
            result.duplicate++;
        } else {
            result.rows.push({ id: rowData.id, data: rowData, status: 'valid' });
            currentFileRows.push(rowData);
            result.valid++;
        }
      }
    }
  } else if (target === 'perhutani') {
    const current = loadDataPerhutani();
    const currentFileRows: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 10) {
        const tgl_kapling = cols[1] || new Date().toISOString().split('T')[0];
        const kapling = cols[2] || '-';
        const blok = cols[3] || '-';
        const jenis = cols[4] || '-';
        const sortimen = cols[5] || '-';
        const panjang = parseFloat((cols[6] || '').replace(',', '.')) || 0;
        const diameter = parseFloat((cols[7] || '').replace(',', '.')) || 0;
        const mutu = cols[8] || '-';
        const batang = parseInt(cols[9]) || 0;
        const volume = parseFloat((cols[10] || '').replace(',', '.')) || 0;
        
        const rowData = { id: 'preview-'+i, tgl_kapling, kapling, blok, jenis, sortimen, panjang, diameter, mutu, batang, volume };
        const isDuplicateCondition = (item: any) => matchStr(item.kapling, kapling) && matchStr(item.blok, blok) && matchStr(item.tgl_kapling, tgl_kapling) && item.batang === batang && item.volume === volume;

        if (current.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_db', reason: 'Data sudah ada di database.' });
            result.duplicate++;
        } else if (currentFileRows.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_file', reason: 'Data ganda di dalam file Excel.' });
            result.duplicate++;
        } else {
            result.rows.push({ id: rowData.id, data: rowData, status: 'valid' });
            currentFileRows.push(rowData);
            result.valid++;
        }
      }
    }
  } else if (target === 'dkp') {
    const current = loadDataDKP();
    const currentFileRows: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 6) {
        const no_dkp = cols[1] || 'DKP/' + new Date().getFullYear() + '/' + (i.toString().padStart(3, '0'));
        const tanggal = cols[2] || new Date().toISOString().split('T')[0];
        const kapling = cols[3] || '-';
        const blok = cols[4] || '-';
        const jenis = cols[5] || 'Jati';
        const sortimen = cols[6] || 'A II';
        const panjang = parseFloat((cols[7] || '').replace(',', '.')) || 0;
        const diameter = parseFloat((cols[8] || '').replace(',', '.')) || 0;
        const mutu = cols[9] || 'Utama';
        const batang = parseInt(cols[10]) || 1;
        const volume = parseFloat((cols[11] || '').replace(',', '.')) || 0;
        const petugas = cols[12] || 'Penguji TPK';
        const status = cols[13] || 'Tersedia';
        
        const rowData = { id: 'preview-'+i, no_dkp, tanggal, kapling, blok, jenis, sortimen, panjang, diameter, mutu, batang, volume, petugas, status };
        const isDuplicateCondition = (item: any) => {
            if (no_dkp !== '-' && item.no_dkp && item.no_dkp !== '-') {
                if (matchStr(item.no_dkp, no_dkp)) return true;
            }
            return matchStr(item.kapling, kapling) && matchStr(item.tanggal, tanggal) && item.batang === batang && item.volume === volume;
        };

        if (current.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_db', reason: 'Data sudah ada di database.' });
            result.duplicate++;
        } else if (currentFileRows.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_file', reason: 'Data ganda di dalam file Excel.' });
            result.duplicate++;
        } else {
            result.rows.push({ id: rowData.id, data: rowData, status: 'valid' });
            currentFileRows.push(rowData);
            result.valid++;
        }
      }
    }
  } else if (target === 'invoice') {
    const current = loadDataInvoice();
    const currentFileRows: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 5) {
        let tanggal = new Date().toISOString().split('T')[0];
        let no_invoice = 'INV-' + i;
        let batang = 0;
        let volume = 0;
        let nominal = 0;
        let pembeli = '-';
        let status: 'Lunas' | 'Belum Lunas' = 'Lunas';
        if (cols.length >= 7) {
          tanggal = cols[1] || tanggal;
          no_invoice = cols[2] || no_invoice;
          batang = parseInt(cols[3]) || 0;
          volume = parseFloat((cols[4] || '').replace(',', '.')) || 0;
          nominal = parseFloat(cols[5].replace(/[^0-9.-]+/g, '')) || 0;
          pembeli = cols[6] || '-';
          status = cols[7] === 'Lunas' ? 'Lunas' : 'Belum Lunas';
        } else {
          tanggal = cols[1] || tanggal;
          no_invoice = cols[2] || no_invoice;
          pembeli = cols[3] || '-';
          nominal = parseFloat(cols[4].replace(/[^0-9.-]+/g, '')) || 0;
          status = cols[5] === 'Lunas' ? 'Lunas' : 'Belum Lunas';
        }
        
        const rowData = { id: 'preview-'+i, tanggal, no_invoice, batang, volume, nominal, pembeli, status };
        const isDuplicateCondition = (item: any) => {
            if (no_invoice !== '-' && item.no_invoice && item.no_invoice !== '-') {
                if (matchStr(item.no_invoice, no_invoice)) return true;
            }
            return matchStr(item.tanggal, tanggal) && matchStr(item.pembeli, pembeli) && item.nominal === nominal;
        };

        if (current.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_db', reason: 'Data sudah ada di database.' });
            result.duplicate++;
        } else if (currentFileRows.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_file', reason: 'Data ganda di dalam file Excel.' });
            result.duplicate++;
        } else {
            result.rows.push({ id: rowData.id, data: rowData, status: 'valid' });
            currentFileRows.push(rowData);
            result.valid++;
        }
      }
    }
  } else if (target === 'mutasi') {
    const current = loadDataMutasi();
    const currentFileRows: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = splitCsv(rows[i], rows[0] && rows[0].includes(';') ? ';' : ',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length >= 2) {
        let tanggal = cols[0] || new Date().toISOString().split('T')[0];
        let jenis = (cols[1] || '').toUpperCase();
        let ai_batang = parseInt(cols[2]) || 0;
        let ai_volume = parseFloat((cols[3] || '').replace(',', '.')) || 0;
        let aii_batang = parseInt(cols[4]) || 0;
        let aii_volume = parseFloat((cols[5] || '').replace(',', '.')) || 0;
        let aiii_batang = parseInt(cols[6]) || 0;
        let aiii_volume = parseFloat((cols[7] || '').replace(',', '.')) || 0;

        const rowData = { id: 'preview-'+i, tanggal, jenis, ai_batang, ai_volume, aii_batang, aii_volume, aiii_batang, aiii_volume };
        const isDuplicateCondition = (item: any) => {
            return matchStr(item.tanggal, tanggal) && matchStr(item.jenis, jenis);
        };
        
        if (current.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_db', reason: 'Data untuk bulan dan jenis ini sudah ada di database.' });
            result.duplicate++;
        } else if (currentFileRows.some(isDuplicateCondition)) {
            result.rows.push({ id: rowData.id, data: rowData, status: 'duplicate_file', reason: 'Data ganda di dalam file CSV.' });
            result.duplicate++;
        } else {
            result.rows.push({ id: rowData.id, data: rowData, status: 'valid' });
            currentFileRows.push(rowData);
            result.valid++;
        }
      }
    }
  }
  return result;
};

export const commitImportCSV = async (previewRows: PreviewRow[], target: StorageTarget) => {
  const validRows = previewRows.filter(r => r.status === 'valid').map(r => r.data);
  let importedCount = validRows.length;
  if (importedCount === 0) return { importedCount: 0 };
  const time = Date.now();
  
  // Create batch (max 500 operations per batch in Firestore)
  let batch = writeBatch(db);
  let batchCount = 0;
  const promises: Promise<void>[] = [];
  
  for (let idx = 0; idx < validRows.length; idx++) {
    const r = validRows[idx];
    let prefix = 'imp';
    if (target === 'angkut') prefix = 'ang';
    else if (target === 'ketiga') prefix = 'ktg';
    else if (target === 'perhutani') prefix = 'pht';
    else if (target === 'dkp') prefix = 'dkp';
    else if (target === 'invoice') prefix = 'inv';
    else if (target === 'mutasi') prefix = 'mut';
    r.id = `${prefix}-imp-${time}-${idx}`;
    
    batch.set(doc(db, target, r.id), r);
    batchCount++;
    
    // If batch is full, commit and create a new one
    if (batchCount === 490) {
      promises.push(batch.commit());
      batch = writeBatch(db);
      batchCount = 0;
    }
  }
  
  // Commit any remaining
  if (batchCount > 0) {
    promises.push(batch.commit());
  }
  
  // Fire and forget: We do not await promises here so the UI returns instantly.
  // Firestore's latency compensation will immediately update local snapshot listeners.
  Promise.all(promises).catch(err => console.error('Batch commit error:', err));
  
  return { importedCount };
};
const dummyCommit = (previewRows: PreviewRow[], target: StorageTarget) => {
  const validRows = previewRows.filter(r => r.status === 'valid').map(r => r.data);
  let importedCount = validRows.length;
  
  if (importedCount === 0) return { importedCount: 0 };
  
  // Assign new IDs
  const time = Date.now();
  validRows.forEach((r, idx) => {
      let prefix = 'imp';
      if (target === 'angkut') prefix = 'ang';
      else if (target === 'ketiga') prefix = 'ktg';
      else if (target === 'perhutani') prefix = 'pht';
      else if (target === 'dkp') prefix = 'dkp';
      else if (target === 'invoice') prefix = 'inv';
      
      r.id = `${prefix}-imp-${time}-${idx}`;
  });

  if (target === 'angkut') {
    const current = loadDataAngkut();
    saveDataAngkut([...validRows, ...current]);
  } else if (target === 'ketiga') {
    const current = loadDataKetiga();
    saveDataKetiga([...validRows, ...current]);
  } else if (target === 'perhutani') {
    const current = loadDataPerhutani();
    saveDataPerhutani([...validRows, ...current]);
  } else if (target === 'dkp') {
    const current = loadDataDKP();
    saveDataDKP([...validRows, ...current]);
  } else if (target === 'invoice') {
    const current = loadDataInvoice();
    saveDataInvoice([...validRows, ...current]);
  }
  
  return { importedCount };
};
