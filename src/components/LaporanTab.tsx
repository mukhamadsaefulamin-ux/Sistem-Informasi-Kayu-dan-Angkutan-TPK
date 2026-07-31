import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Calendar,
  FileText,
  Truck,
  Building2,
  TreePine,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { DataAngkut, DataKetiga, DataPerhutani } from '../types';

import { isSameMonth } from '../lib/storage';

interface LaporanTabProps {
  filterDate: string;
  onFilterDateChange: (date: string) => void;
  dataAngkut: DataAngkut[];
  dataKetiga: DataKetiga[];
  dataPerhutani: DataPerhutani[];
  onExportCSV: (monthFilter: string) => void;
}

// Format date to Indonesian text representation e.g. "Juli 2026"
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

const formatDateIndoLabel = (dateStr: string) => {
  if (!dateStr) return 'Semua Tanggal';
  try {
    const norm = normalizeDateString(dateStr);
    const parts = norm.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

// Helper for formatting float numbers with Indonesian comma decimal (e.g., 24,50)
const formatNumberIndo = (num: number, decimals: number = 2) => {
  if (isNaN(num)) return '0,00';
  return num.toFixed(decimals).replace('.', ',');
};

// Format date DD/MM/YYYY for tables
const formatDateTable = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};



export const LaporanTab: React.FC<LaporanTabProps> = ({ filterDate, onFilterDateChange, 
  dataAngkut,
  dataKetiga,
  dataPerhutani,
  onExportCSV
}) => {
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }, []);

  const [activeSection, setActiveSection] = useState<'all' | 'angkut' | 'ketiga' | 'perhutani'>('all');

  const filteredAngkut = useMemo(() => {
    return dataAngkut.filter(item => {
      if (!filterDate) return true;
      return normalizeDateString(item.tanggal) === filterDate;
    });
  }, [dataAngkut, filterDate]);

  // Metrics - 1. Angkut Harian
  const totalRitase = filteredAngkut.length;
  const totalBatangAngkut = filteredAngkut.reduce((sum, item) => sum + Number(item.batang || 0), 0);
  const totalVolAngkut = filteredAngkut.reduce((sum, item) => sum + Number(item.volume || 0), 0);

  // Metrics - 2. Sisa Pihak Ketiga
  
  const { totalBatangKetiga, totalVolKetiga, computedKetiga } = useMemo(() => {
    let sisaBtg = 0;
    let sisaVol = 0;
    
    const computed = dataKetiga.map(item => {
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
      const currentSisaBtg = Math.max(0, (item.batang || 0) - terangkutBatang);
      const currentSisaVol = Math.max(0, (item.volume || 0) - terangkutVolume);
      
      sisaBtg += currentSisaBtg;
      sisaVol += currentSisaVol;
      
      return {
        ...item,
        sisaBtg: currentSisaBtg,
        sisaVol: currentSisaVol
      };
    });

    return {
      totalBatangKetiga: sisaBtg,
      totalVolKetiga: sisaVol,
      computedKetiga: computed
    };
  }, [dataKetiga, dataAngkut]);


  // Metrics - 3. Sisa Perhutani
  const totalBatangPerhutani = dataPerhutani.reduce((sum, item) => sum + Number(item.batang || 0), 0);
  const totalVolPerhutani = dataPerhutani.reduce((sum, item) => sum + Number(item.volume || 0), 0);

  // Grand Totals Combined
  const grandTotalVolume = totalVolAngkut + totalVolKetiga + totalVolPerhutani;
  const grandTotalBatang = totalBatangAngkut + totalBatangKetiga + totalBatangPerhutani;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* 1. TOP CONTROL BAR */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-5 no-print flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Laporan Terintegrasi</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 3 Menu Terintegrasi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Konsolidasi Laporan Angkut Harian, Sisa Pihak Ketiga, dan Sisa Perhutani (TPK Talok)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Date Selector */}
          <div className="flex flex-col gap-1.5 w-full lg:w-auto">
            <label className="text-[13px] text-slate-600 font-medium hidden lg:block opacity-0">Tgl</label>
            <div className="relative flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm min-w-[200px] h-10">
              <div className="flex-1 flex items-center justify-between text-[13px] text-slate-700">
                <span className={filterDate ? 'text-slate-800 font-bold' : 'text-slate-400'}>{filterDate ? formatDateIndoLabel(filterDate) : 'Pilih tanggal'}</span>
                <Calendar className="w-4 h-4 text-slate-600 ml-2 pointer-events-none" />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={e => onFilterDateChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
            {filterDate && (
              <button
                onClick={() => onFilterDateChange('')}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer text-left lg:absolute lg:-bottom-6"
              >
                Reset Filter
              </button>
            )}
          </div>
          
          {/* Export PDF Button */}
          
          {/* Export PDF Button */}
          <button
            onClick={() => {
              const cols = ['No. DKHP', 'Tanggal', 'Tujuan', 'Volume (m3)', 'Status'];
              const rows = filteredAngkut.map(d => [
                d.no_dkhp,
                d.tanggal,
                d.tujuan,
                d.volume?.toString() || '0',
                d.status
              ]);
              exportToPDF('Laporan Angkut Harian', cols, rows, 'Laporan_Angkut');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>


          {/* Export CSV Button */}

          <button
            onClick={() => onExportCSV(filterDate)}
            className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV / Excel
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan (Print)
          </button>
        </div>
      </div>

      {/* 2. SECTION / SUB-TAB SWITCHER */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs no-print flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSection('all')}
          className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === 'all'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Semua Terintegrasi</span>
        </button>

        <button
          onClick={() => setActiveSection('angkut')}
          className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === 'angkut'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>1. Angkut Harian ({totalRitase} Rit)</span>
        </button>

        <button
          onClick={() => setActiveSection('ketiga')}
          className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === 'ketiga'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>2. Sisa Pihak Ketiga ({dataKetiga.length} Item)</span>
        </button>

        <button
          onClick={() => setActiveSection('perhutani')}
          className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === 'perhutani'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TreePine className="w-4 h-4" />
          <span>3. Sisa Perhutani ({dataPerhutani.length} Item)</span>
        </button>
      </div>

      {/* 3. INTEGRATED KPI METRICS GRID (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Card 1: Angkut Harian */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">1. Angkut Harian</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {formatNumberIndo(totalVolAngkut, 2)} <span className="text-xs font-normal text-slate-500">m³</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {totalRitase} Rit | {totalBatangAngkut} Batang
            </p>
          </div>
        </div>

        {/* Card 2: Sisa Pihak Ketiga */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">2. Sisa Pihak Ketiga</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {formatNumberIndo(totalVolKetiga, 2)} <span className="text-xs font-normal text-slate-500">m³</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {dataKetiga.length} Kayu | {totalBatangKetiga} Batang
            </p>
          </div>
        </div>

        {/* Card 3: Sisa Perhutani */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <TreePine className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">3. Sisa Perhutani</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {formatNumberIndo(totalVolPerhutani, 2)} <span className="text-xs font-normal text-slate-500">m³</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {dataPerhutani.length} Kayu | {totalBatangPerhutani} Batang
            </p>
          </div>
        </div>

        {/* Card 4: Total Rekap Konsolidasi */}
        <div className="bg-emerald-900 text-white p-5 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-emerald-200 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">Total Konsolidasi</p>
            <p className="text-xl font-extrabold text-white mt-0.5">
              {formatNumberIndo(grandTotalVolume, 2)} <span className="text-xs font-normal text-emerald-200">m³</span>
            </p>
            <p className="text-xs text-emerald-200 mt-0.5 font-medium">
              Total {grandTotalBatang} Batang Kayu
            </p>
          </div>
        </div>
      </div>

      {/* 4. OFFICIAL PRINTABLE INTEGRATED DOCUMENT CONTAINER */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 md:p-8 print-container space-y-8">
        {/* Printable Official Letterhead Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5">
          <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-wide">
            LAPORAN REKAPITULASI KAYU
          </h2>
          <h3 className="text-base font-bold text-slate-700 mt-0.5">
            TEMPAT PENIMBUNAN KAYU (TPK) TALOK
          </h3>
          <p className="text-slate-600 text-xs mt-1 font-semibold">
            Periode Laporan: {filterDate ? formatDateIndoLabel(filterDate) : 'Semua Waktu'}
          </p>

          <div className="mt-3 flex justify-center gap-2 flex-wrap text-[11px] font-semibold text-slate-600">
            <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              ✓ 1. Data Angkut Harian ({totalRitase} Rit)
            </span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              ✓ 2. Data Sisa Pihak Ketiga ({dataKetiga.length} Item)
            </span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              ✓ 3. Data Sisa Perhutani ({dataPerhutani.length} Item)
            </span>
          </div>
        </div>

        {/* SECTION 1: DATA ANGKUT HARIAN */}
        {(activeSection === 'all' || activeSection === 'angkut') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  1. Data Laporan Angkutan Harian Kayu ({filterDate ? formatDateIndoLabel(filterDate) : 'Semua Waktu'})
                </h4>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Total {totalRitase} Ritase Kendaraan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300 whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border border-slate-300 text-center w-8">No.</th>
                    <th className="py-2.5 px-3 border border-slate-300">No. DKHP</th>
                    <th className="py-2.5 px-3 border border-slate-300">Tanggal</th>
                    <th className="py-2.5 px-3 border border-slate-300">Supir</th>
                    <th className="py-2.5 px-3 border border-slate-300">Nopol</th>
                    <th className="py-2.5 px-3 border border-slate-300">No. Kapling</th>
                    <th className="py-2.5 px-3 border border-slate-300">No. Blok</th>
                    <th className="py-2.5 px-3 border border-slate-300">Sortimen</th>
                    <th className="py-2.5 px-3 border border-slate-300">Tujuan</th>
                    <th className="py-2.5 px-3 border border-slate-300">Alamat</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Total Batang</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Total Volume</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredAngkut.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border border-slate-300 text-center font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 border border-slate-300 font-bold text-emerald-800">{item.no_dkhp || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{formatDateTable(item.tanggal)}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.supir || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 uppercase font-semibold">{item.nopol || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.kapling || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.blok || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.sortimen || item.jenis || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.tujuan || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 max-w-xs truncate">{item.alamat || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-semibold">{item.sisaBtg || 0}</td>
   <td className="py-2 px-3 border border-slate-300 text-right font-bold text-slate-900">
      {formatNumberIndo(Number(item.sisaVol || 0), 2)} m³
   </td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-medium">{item.status || 'Selesai'}</td>
                    </tr>
                  ))}
                  {filteredAngkut.length === 0 && (
                    <tr>
                      <td colSpan={13} className="py-8 text-center text-slate-500 border border-slate-300 bg-slate-50/50">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Truck className="w-8 h-8 text-slate-300" />
                          <p className="font-medium text-xs">
                            {dataAngkut.length > 0 ? (
                              <>
                                Tidak ada data angkutan harian pada periode <span className="font-bold text-slate-700">{formatDateIndoLabel(filterDate)}</span>.
                                <span className="block text-[11px] text-slate-400 mt-0.5">
                                  (Terdapat {dataAngkut.length} catatan angkutan harian di periode lainnya)
                                </span>
                              </>
                            ) : (
                              'Belum ada catatan angkutan harian. Data dari menu Angkut Harian akan otomatis terintegrasi di sini.'
                            )}
                          </p>
                          {dataAngkut.length > 0 && filterDate && (
                            <button
                              onClick={() => onFilterDateChange('')}
                              className="mt-1 inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-all cursor-pointer shadow-xs"
                            >
                              Tampilkan Semua Data ({dataAngkut.length} Record)
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                  <tr>
                    <td colSpan={10} className="py-2.5 px-3 border border-slate-300 text-right uppercase text-[11px]">
                      Subtotal Angkut Harian ({totalRitase} Rit):
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-extrabold">
                      {totalBatangAngkut}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-right font-extrabold text-blue-900">
                      {formatNumberIndo(totalVolAngkut, 2)} m³
                    </td>
                    <td className="border border-slate-300" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 2: DATA SISA PIHAK KETIGA */}
        {(activeSection === 'all' || activeSection === 'ketiga') && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  2. Data Laporan Sisa Kayu Pihak Ketiga
                </h4>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Total {dataKetiga.length} Record Kayu
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300 whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border border-slate-300 text-center w-8">No.</th>
                    <th className="py-2.5 px-3 border border-slate-300">No. Kapling</th>
                    <th className="py-2.5 px-3 border border-slate-300">No. Blok</th>
                    <th className="py-2.5 px-3 border border-slate-300">Jenis Kayu</th>
                    <th className="py-2.5 px-3 border border-slate-300">Sortimen</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Panjang (m)</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Diameter (cm)</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Mutu</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Batang</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Volume (m³)</th>
                    <th className="py-2.5 px-3 border border-slate-300">Pembeli / Pemilik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {computedKetiga.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border border-slate-300 text-center font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-800">{item.kapling || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.blok || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 font-medium">{item.jenis || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.sortimen || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center">{item.panjang || 0}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center">{item.diameter || 0}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-semibold">{item.mutu || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-semibold">{item.sisaBtg || 0}</td>
   <td className="py-2 px-3 border border-slate-300 text-right font-bold text-slate-900">
      {formatNumberIndo(Number(item.sisaVol || 0), 2)} m³
   </td>
                      <td className="py-2 px-3 border border-slate-300 font-medium text-slate-800">{item.pembeli || '-'}</td>
                    </tr>
                  ))}
                  {dataKetiga.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-6 text-center text-slate-400 italic border border-slate-300">
                        Tidak ada data sisa kayu pihak ketiga.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                  <tr>
                    <td colSpan={8} className="py-2.5 px-3 border border-slate-300 text-right uppercase text-[11px]">
                      Subtotal Sisa Pihak Ketiga:
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-extrabold">
                      {totalBatangKetiga}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-right font-extrabold text-amber-900">
                      {formatNumberIndo(totalVolKetiga, 2)} m³
                    </td>
                    <td className="border border-slate-300" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3: DATA SISA PERHUTANI */}
        {(activeSection === 'all' || activeSection === 'perhutani') && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  3. Data Laporan Sisa Kayu Perhutani
                </h4>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Total {dataPerhutani.length} Record Kayu
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse border border-slate-300 whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border border-slate-300 text-center w-8">No.</th>
                    <th className="py-2.5 px-3 border border-slate-300">Tanggal Kapling</th>
                    <th className="py-2.5 px-3 border border-slate-300">No. Kapling</th>
                    <th className="py-2.5 px-3 border border-slate-300">No. Blok</th>
                    <th className="py-2.5 px-3 border border-slate-300">Jenis Kayu</th>
                    <th className="py-2.5 px-3 border border-slate-300">Sortimen</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Panjang (m)</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Diameter (cm)</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Mutu</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-center">Batang</th>
                    <th className="py-2.5 px-3 border border-slate-300 text-right">Volume (m³)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {dataPerhutani.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 border border-slate-300 text-center font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 border border-slate-300">{formatDateTable(item.tgl_kapling || '')}</td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-800">{item.kapling || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.blok || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 font-medium">{item.jenis || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300">{item.sortimen || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center">{item.panjang || 0}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center">{item.diameter || 0}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-semibold">{item.mutu || '-'}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-semibold">{item.sisaBtg || 0}</td>
   <td className="py-2 px-3 border border-slate-300 text-right font-bold text-slate-900">
      {formatNumberIndo(Number(item.sisaVol || 0), 2)} m³
   </td>
                    </tr>
                  ))}
                  {dataPerhutani.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-6 text-center text-slate-400 italic border border-slate-300">
                        Tidak ada data sisa kayu Perhutani.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                  <tr>
                    <td colSpan={9} className="py-2.5 px-3 border border-slate-300 text-right uppercase text-[11px]">
                      Subtotal Sisa Perhutani:
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-center font-extrabold">
                      {totalBatangPerhutani}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-right font-extrabold text-emerald-900">
                      {formatNumberIndo(totalVolPerhutani, 2)} m³
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* GRAND REKAPITULASI KONSOLIDASI SUMMARY TABLE */}
        <div className="pt-6 border-t-2 border-slate-800">
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-3">
            RINGKASAN REKAPITULASI KONSOLIDASI KAYU (TPK TALOK)
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="py-2.5 px-3 border border-slate-800 text-center w-10">No.</th>
                  <th className="py-2.5 px-3 border border-slate-800">Kategori Laporan Kayu</th>
                  <th className="py-2.5 px-3 border border-slate-800 text-center">Jumlah Ritase / Record</th>
                  <th className="py-2.5 px-3 border border-slate-800 text-center">Total Batang Kayu</th>
                  <th className="py-2.5 px-3 border border-slate-800 text-right">Total Volume (m³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                <tr>
                  <td className="py-2.5 px-3 border border-slate-300 text-center font-bold">1</td>
                  <td className="py-2.5 px-3 border border-slate-300 font-bold text-blue-900">
                    Laporan Angkutan Harian Kayu ({filterDate ? formatDateIndoLabel(filterDate) : 'Semua Waktu'})
                  </td>
                  <td className="py-2.5 px-3 border border-slate-300 text-center">{totalRitase} Rit</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-center font-semibold">{totalBatangAngkut} Batang</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-right font-bold text-slate-900">
                    {formatNumberIndo(totalVolAngkut, 2)} m³
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 border border-slate-300 text-center font-bold">2</td>
                  <td className="py-2.5 px-3 border border-slate-300 font-bold text-amber-900">
                    Laporan Sisa Kayu Pihak Ketiga
                  </td>
                  <td className="py-2.5 px-3 border border-slate-300 text-center">{dataKetiga.length} Item</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-center font-semibold">{totalBatangKetiga} Batang</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-right font-bold text-slate-900">
                    {formatNumberIndo(totalVolKetiga, 2)} m³
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 border border-slate-300 text-center font-bold">3</td>
                  <td className="py-2.5 px-3 border border-slate-300 font-bold text-emerald-900">
                    Laporan Sisa Kayu Perhutani
                  </td>
                  <td className="py-2.5 px-3 border border-slate-300 text-center">{dataPerhutani.length} Item</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-center font-semibold">{totalBatangPerhutani} Batang</td>
                  <td className="py-2.5 px-3 border border-slate-300 text-right font-bold text-slate-900">
                    {formatNumberIndo(totalVolPerhutani, 2)} m³
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-emerald-100 font-extrabold text-emerald-950 text-xs border-t-2 border-slate-900">
                <tr>
                  <td colSpan={2} className="py-3 px-4 border border-slate-400 text-right uppercase">
                    GRAND TOTAL REKAPITULASI KONSOLIDASI:
                  </td>
                  <td className="py-3 px-3 border border-slate-400 text-center">
                    {totalRitase + dataKetiga.length + dataPerhutani.length} Total Record
                  </td>
                  <td className="py-3 px-3 border border-slate-400 text-center text-sm">
                    {grandTotalBatang} Batang
                  </td>
                  <td className="py-3 px-3 border border-slate-400 text-right text-sm text-emerald-900">
                    {formatNumberIndo(grandTotalVolume, 2)} m³
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Official Signature Area for Print */}
        <div className="mt-12 pt-6 flex justify-end border-t border-slate-200">
          <div className="text-center w-64">
            <p className="text-xs text-slate-600 mb-1">
              Talok, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs font-bold text-slate-800 mb-16">
              Mengetahui,<br />
              <strong>Kepala TPK Talok</strong>
            </p>
            <p className="text-xs font-bold text-slate-900 underline">
              ...................................
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">NIP. .........................</p>
          </div>
        </div>
      </div>
    </div>
  );
};
