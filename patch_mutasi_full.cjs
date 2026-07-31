const fs = require('fs');
const content = `import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, Plus, Download, Search, X, Edit2, Trash2, Calendar, 
  ChevronDown, ChevronUp, Database, TreePine, Disc, FileText, Tag 
} from 'lucide-react';
import { DataMutasi } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface RekapMutasiTabProps {
  userRole?: 'admin' | 'anggota' | null;
  data: DataMutasi[];
  onAddData: (item: Omit<DataMutasi, 'id'>) => void;
  onUpdateData: (id: string, item: Omit<DataMutasi, 'id'>) => void;
  onDeleteData: (id: string) => void;
  onExportCSV: () => void;
}

export const RekapMutasiTab: React.FC<RekapMutasiTabProps> = ({
  userRole,
  data,
  onAddData,
  onUpdateData,
  onDeleteData,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [showSummary, setShowSummary] = useState(true);
  const [showDetail, setShowDetail] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const today = new Date();
  const d = String(today.getDate()).padStart(2, '0');
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const y = today.getFullYear();
  const defaultTanggal = \`01/\${m}/\${y} s/d 30/\${m}/\${y}\`;
  
  const [formData, setFormData] = useState<any>({
    tanggal: defaultTanggal,
    jenis: 'PINUS',
    ai_batang: '',
    ai_volume: '',
    aii_batang: '',
    aii_volume: '',
    aiii_batang: '',
    aiii_volume: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; type: 'single' }>({
    isOpen: false,
    id: null,
    type: 'single'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedData = {
      ...formData,
      ai_batang: parseInt(formData.ai_batang) || 0,
      ai_volume: parseFloat(formData.ai_volume) || 0,
      aii_batang: parseInt(formData.aii_batang) || 0,
      aii_volume: parseFloat(formData.aii_volume) || 0,
      aiii_batang: parseInt(formData.aiii_batang) || 0,
      aiii_volume: parseFloat(formData.aiii_volume) || 0,
    };
    if (editingId) {
      onUpdateData(editingId, parsedData);
    } else {
      onAddData(parsedData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (item: DataMutasi) => {
    setEditingId(item.id);
    setFormData({
      tanggal: item.tanggal,
      jenis: item.jenis,
      ai_batang: item.ai_batang || '',
      ai_volume: item.ai_volume || '',
      aii_batang: item.aii_batang || '',
      aii_volume: item.aii_volume || '',
      aiii_batang: item.aiii_batang || '',
      aiii_volume: item.aiii_volume || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      tanggal: defaultTanggal,
      jenis: 'PINUS',
      ai_batang: '',
      ai_volume: '',
      aii_batang: '',
      aii_volume: '',
      aiii_batang: '',
      aiii_volume: '',
    });
    setEditingId(null);
  };

  const getYearFromTanggal = (t: string) => {
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(t)) return t.substring(0, 4);
    const match = t.match(/(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
    if (match) return match[3];
    const strMatch = t.match(/\\d+\\s+s\\/d\\s+\\d+\\s+([a-zA-Z]+)\\s+(\\d{4})/i);
    if (strMatch) return strMatch[2];
    return '';
  };

  const getMonthIndexFromTanggal = (t: string) => {
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(t)) return parseInt(t.substring(5, 7)) - 1;
    const match = t.match(/(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
    if (match) return parseInt(match[2]) - 1;
    const strMatch = t.match(/\\d+\\s+s\\/d\\s+\\d+\\s+([a-zA-Z]+)\\s+(\\d{4})/i);
    if (strMatch) {
      const mNames = ['januari','februari','maret','april','mei','juni','juli','agustus','september','oktober','november','desember'];
      return mNames.findIndex(m => m === strMatch[1].toLowerCase());
    }
    return -1;
  };

  const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const summaryData = useMemo(() => {
    const yearData = data.filter(d => {
      const matchYear = filterYear ? getYearFromTanggal(d.tanggal) === filterYear : true;
      const matchSearch = searchTerm ? (d.jenis || '').toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return matchYear && matchSearch;
    });
    
    const result = MONTHS.map(m => ({
      bulan: m,
      pinus: { btg: 0, vol: 0 },
      jati: { btg: 0, vol: 0 },
      sonokeling: { btg: 0, vol: 0 },
      mahoni: { btg: 0, vol: 0 },
      total: { btg: 0, vol: 0 }
    }));

    yearData.forEach(item => {
      const mIdx = getMonthIndexFromTanggal(item.tanggal);
      if (mIdx >= 0 && mIdx < 12) {
        const btg = (Number(item.ai_batang) || 0) + (Number(item.aii_batang) || 0) + (Number(item.aiii_batang) || 0);
        const vol = (Number(item.ai_volume) || 0) + (Number(item.aii_volume) || 0) + (Number(item.aiii_volume) || 0);
        
        const j = (item.jenis || '').toUpperCase().trim();
        if (j.includes('PINUS')) {
          result[mIdx].pinus.btg += btg;
          result[mIdx].pinus.vol += vol;
        } else if (j.includes('JATI')) {
          result[mIdx].jati.btg += btg;
          result[mIdx].jati.vol += vol;
        } else if (j.includes('SONO')) {
          result[mIdx].sonokeling.btg += btg;
          result[mIdx].sonokeling.vol += vol;
        } else if (j.includes('MAHONI')) {
          result[mIdx].mahoni.btg += btg;
          result[mIdx].mahoni.vol += vol;
        }
        result[mIdx].total.btg += btg;
        result[mIdx].total.vol += vol;
      }
    });
    
    return result;
  }, [data, filterYear, searchTerm]);

  const grandTotals = useMemo(() => summaryData.reduce((acc, row) => {
    acc.pinus.btg += row.pinus.btg;
    acc.pinus.vol += row.pinus.vol;
    acc.jati.btg += row.jati.btg;
    acc.jati.vol += row.jati.vol;
    acc.sonokeling.btg += row.sonokeling.btg;
    acc.sonokeling.vol += row.sonokeling.vol;
    acc.mahoni.btg += row.mahoni.btg;
    acc.mahoni.vol += row.mahoni.vol;
    acc.total.btg += row.total.btg;
    acc.total.vol += row.total.vol;
    return acc;
  }, {
    pinus: { btg: 0, vol: 0 },
    jati: { btg: 0, vol: 0 },
    sonokeling: { btg: 0, vol: 0 },
    mahoni: { btg: 0, vol: 0 },
    total: { btg: 0, vol: 0 }
  }), [summaryData]);

  const detailData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = searchTerm ? (item.jenis || '').toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const matchYear = filterYear ? getYearFromTanggal(item.tanggal) === filterYear : true;
      return matchSearch && matchYear;
    }).sort((a, b) => {
      const getSortTime = (t: string) => {
        if (/^\\d{4}-\\d{2}-\\d{2}$/.test(t)) return new Date(t).getTime();
        const m = getMonthIndexFromTanggal(t);
        const y = getYearFromTanggal(t);
        if (m >= 0 && y) return new Date(\`\${y}-\${String(m+1).padStart(2, '0')}-01\`).getTime();
        return 0;
      };
      return getSortTime(b.tanggal) - getSortTime(a.tanggal);
    });
  }, [data, searchTerm, filterYear]);

  const formatBtg = (val: number) => val.toLocaleString('id-ID');
  const formatVol = (val: number) => val.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rekap Mutasi Kapling</h2>
          <p className="text-slate-500 mt-1">Kelola data rekap mutasi harian</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-white appearance-none text-sm font-medium text-slate-700"
            >
              <option value="">Semua Tahun</option>
              {['2024', '2025', '2026', '2027', '2028', '2029'].map(y => (
                <option key={y} value={y}>Januari - Desember {y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari jenis kayu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          <button
            onClick={onExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm shadow-indigo-600/20 font-medium text-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan Total */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <button 
          onClick={() => setShowSummary(!showSummary)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-200"
        >
          <h3 className="font-bold text-slate-800">Ringkasan Total {filterYear ? \`Januari s/d Desember \${filterYear}\` : 'Semua Data'}</h3>
          {showSummary ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </button>
        
        {showSummary && (
          <div className="p-4 md:p-6 bg-slate-50/30 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white px-3 py-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">TOTAL SEMUA JENIS KAYU</h4>
                  <div className="flex gap-3 text-[13px]">
                    <div><span className="text-blue-800 font-medium">Big:</span> <span className="font-bold text-blue-600">{formatBtg(grandTotals.total.btg)}</span></div>
                    <div><span className="text-blue-800 font-medium">Vol:</span> <span className="font-bold text-blue-600">{formatVol(grandTotals.total.vol)}</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white px-3 py-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 hover:border-emerald-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <TreePine className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">PINUS</h4>
                  <div className="flex gap-3 text-[13px]">
                    <div><span className="text-emerald-800 font-medium">Big:</span> <span className="font-bold text-emerald-600">{formatBtg(grandTotals.pinus.btg)}</span></div>
                    <div><span className="text-emerald-800 font-medium">Vol:</span> <span className="font-bold text-emerald-600">{formatVol(grandTotals.pinus.vol)}</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white px-3 py-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 hover:border-amber-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                  <Disc className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">JATI</h4>
                  <div className="flex gap-3 text-[13px]">
                    <div><span className="text-amber-900 font-medium">Big:</span> <span className="font-bold text-amber-700">{formatBtg(grandTotals.jati.btg)}</span></div>
                    <div><span className="text-amber-900 font-medium">Vol:</span> <span className="font-bold text-amber-700">{formatVol(grandTotals.jati.vol)}</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white px-3 py-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 hover:border-purple-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">SONOKELING</h4>
                  <div className="flex gap-3 text-[13px]">
                    <div><span className="text-purple-900 font-medium">Big:</span> <span className="font-bold text-purple-600">{formatBtg(grandTotals.sonokeling.btg)}</span></div>
                    <div><span className="text-purple-900 font-medium">Vol:</span> <span className="font-bold text-purple-600">{formatVol(grandTotals.sonokeling.vol)}</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white px-3 py-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3 hover:border-orange-300 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold text-orange-900 uppercase tracking-wider mb-1">MAHONI</h4>
                  <div className="flex gap-3 text-[13px]">
                    <div><span className="text-orange-900 font-medium">Big:</span> <span className="font-bold text-orange-600">{formatBtg(grandTotals.mahoni.btg)}</span></div>
                    <div><span className="text-orange-900 font-medium">Vol:</span> <span className="font-bold text-orange-600">{formatVol(grandTotals.mahoni.vol)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabel Ringkasan */}
        <div className="p-4 border-b border-slate-200 bg-white">
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
                <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">Big</th>
                <th className="px-2 py-2 border-r border-slate-200 text-emerald-600">Vol</th>
                <th className="px-2 py-2 border-r border-slate-200 text-amber-700">Big</th>
                <th className="px-2 py-2 border-r border-slate-200 text-amber-700">Vol</th>
                <th className="px-2 py-2 border-r border-slate-200 text-purple-600">Big</th>
                <th className="px-2 py-2 border-r border-slate-200 text-purple-600">Vol</th>
                <th className="px-2 py-2 border-r border-slate-200 text-orange-600">Big</th>
                <th className="px-2 py-2 border-r border-slate-200 text-orange-600">Vol</th>
                <th className="px-2 py-2 border-r border-slate-200 text-blue-600">Big</th>
                <th className="px-2 py-2 text-blue-600">Vol</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map(row => (
                <tr key={row.bulan} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 border-r border-slate-200 text-left text-slate-600">{row.bulan}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.pinus.btg > 0 ? formatBtg(row.pinus.btg) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.pinus.vol > 0 ? formatVol(row.pinus.vol) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.jati.btg > 0 ? formatBtg(row.jati.btg) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.jati.vol > 0 ? formatVol(row.jati.vol) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.sonokeling.btg > 0 ? formatBtg(row.sonokeling.btg) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.sonokeling.vol > 0 ? formatVol(row.sonokeling.vol) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.mahoni.btg > 0 ? formatBtg(row.mahoni.btg) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200">{row.mahoni.vol > 0 ? formatVol(row.mahoni.vol) : '-'}</td>
                  <td className="px-2 py-3 border-r border-slate-200 font-medium text-blue-600">{row.total.btg > 0 ? formatBtg(row.total.btg) : '-'}</td>
                  <td className="px-2 py-3 font-medium text-blue-600">{row.total.vol > 0 ? formatVol(row.total.vol) : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50/80 font-bold border-t-2 border-slate-200">
              <tr>
                <td className="px-4 py-4 border-r border-slate-200 text-left uppercase text-xs text-slate-800">
                  TOTAL {filterYear ? \`JANUARI s/d DESEMBER \${filterYear}\` : 'SEMUA TAHUN'}
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

      {/* Detail Data Accordion for Edit/Delete */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <button 
          onClick={() => setShowDetail(!showDetail)}
          className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors border-b border-slate-200"
        >
          <h3 className="font-bold text-slate-800">Data Detail Harian (Untuk Edit & Hapus)</h3>
          {showDetail ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </button>
        
        {showDetail && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 border-r border-slate-200">Tanggal</th>
                  <th className="px-4 py-3 border-r border-slate-200">Bulan</th>
                  <th className="px-4 py-3 border-r border-slate-200">Tahun</th>
                  <th className="px-4 py-3 border-r border-slate-200">Jenis Kayu</th>
                  <th colSpan={2} className="px-4 py-3 border-r border-slate-200 text-center">Sortimen AI</th>
                  <th colSpan={2} className="px-4 py-3 border-r border-slate-200 text-center">Sortimen AII</th>
                  <th colSpan={2} className="px-4 py-3 border-r border-slate-200 text-center">Sortimen AIII</th>
                  <th colSpan={2} className="px-4 py-3 border-r border-slate-200 text-center">Jumlah</th>
                  {isAdmin && <th className="px-4 py-3 text-center">Aksi</th>}
                </tr>
                <tr className="border-t border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500">
                  <th colSpan={4} className="border-r border-slate-200"></th>
                  <th className="px-2 py-2 border-r border-slate-200 text-center">Btg</th>
                  <th className="px-2 py-2 border-r border-slate-200 text-center">Vol</th>
                  <th className="px-2 py-2 border-r border-slate-200 text-center">Btg</th>
                  <th className="px-2 py-2 border-r border-slate-200 text-center">Vol</th>
                  <th className="px-2 py-2 border-r border-slate-200 text-center">Btg</th>
                  <th className="px-2 py-2 border-r border-slate-200 text-center">Vol</th>
                  <th className="px-2 py-2 border-r border-slate-200 text-center">Btg</th>
                  <th className="px-2 py-2 border-r border-slate-200 text-center">Vol</th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {detailData.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 13 : 12} className="px-4 py-8 text-center text-slate-500">
                      Tidak ada data detail.
                    </td>
                  </tr>
                ) : (
                  detailData.map((item) => {
                    let tanggal = item.tanggal;
                    let bulan = '-';
                    let tahun = '-';

                    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(item.tanggal)) {
                      const dateObj = new Date(item.tanggal);
                      tanggal = dateObj.getDate().toString().padStart(2, '0');
                      bulan = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                      tahun = dateObj.getFullYear().toString();
                    } else if (item.tanggal.includes('s/d')) {
                      const parts = item.tanggal.split('s/d').map(p => p.trim());
                      if (parts.length === 2) {
                        const p1 = parts[0].split('/');
                        const p2 = parts[1].split('/');
                        if (p1.length === 3 && p2.length === 3) {
                          tanggal = \`\${p1[0]} s/d \${p2[0]}\`;
                          bulan = p1[1];
                          tahun = p1[2];
                        } else {
                          const strMatch = item.tanggal.match(/(\\d+)\\s+s\\/d\\s+(\\d+)\\s+([a-zA-Z]+)\\s+(\\d{4})/i);
                          if (strMatch) {
                            tanggal = \`\${strMatch[1]} s/d \${strMatch[2]}\`;
                            bulan = strMatch[3];
                            tahun = strMatch[4];
                          }
                        }
                      }
                    }

                    const totBtg = (item.ai_batang||0) + (item.aii_batang||0) + (item.aiii_batang||0);
                    const totVol = (item.ai_volume||0) + (item.aii_volume||0) + (item.aiii_volume||0);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100">
                        <td className="px-4 py-3 border-r border-slate-100">{tanggal}</td>
                        <td className="px-4 py-3 border-r border-slate-100">{bulan}</td>
                        <td className="px-4 py-3 border-r border-slate-100">{tahun}</td>
                        <td className="px-4 py-3 border-r border-slate-100 font-medium">{item.jenis}</td>
                        <td className="px-2 py-3 text-center border-r border-slate-100">{item.ai_batang}</td>
                        <td className="px-2 py-3 text-center border-r border-slate-100">{item.ai_volume?.toFixed(4)}</td>
                        <td className="px-2 py-3 text-center border-r border-slate-100">{item.aii_batang}</td>
                        <td className="px-2 py-3 text-center border-r border-slate-100">{item.aii_volume?.toFixed(4)}</td>
                        <td className="px-2 py-3 text-center border-r border-slate-100">{item.aiii_batang}</td>
                        <td className="px-2 py-3 text-center border-r border-slate-100">{item.aiii_volume?.toFixed(4)}</td>
                        <td className="px-2 py-3 text-center border-r border-slate-100 font-semibold">{totBtg}</td>
                        <td className="px-2 py-3 text-center border-r border-slate-100 font-semibold">{totVol.toFixed(4)}</td>
                        {isAdmin && (
                          <td className="px-2 py-3">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ isOpen: true, id: item.id, type: 'single' })}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal form ... */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Edit Data Mutasi' : 'Tambah Data Mutasi'}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="mutasiForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Tanggal</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 01/01/2026 s/d 30/01/2026"
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs text-red-500 mt-1">Contoh: 1 s/d 30 Januari 2026 atau 01/01/2026 s/d 30/01/2026</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Jenis Kayu</label>
                    <input
                      type="text"
                      required
                      value={formData.jenis}
                      onChange={(e) => setFormData({ ...formData, jenis: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase"
                      placeholder="Contoh: PINUS, JATI"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Sortimen AI</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.ai_batang}
                        onChange={(e) => setFormData({ ...formData, ai_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Volume</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={formData.ai_volume}
                        onChange={(e) => setFormData({ ...formData, ai_volume: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Sortimen AII</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.aii_batang}
                        onChange={(e) => setFormData({ ...formData, aii_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Volume</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={formData.aii_volume}
                        onChange={(e) => setFormData({ ...formData, aii_volume: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-200 pb-2">Sortimen AIII</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.aiii_batang}
                        onChange={(e) => setFormData({ ...formData, aiii_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Volume</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={formData.aiii_volume}
                        onChange={(e) => setFormData({ ...formData, aiii_volume: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="mutasiForm"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-indigo-600/20 active:scale-95"
              >
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, type: 'single' })}
        onConfirm={() => {
          if (deleteConfirm.id) {
            onDeleteData(deleteConfirm.id);
          }
          setDeleteConfirm({ isOpen: false, id: null, type: 'single' });
        }}
        title="Hapus Data"
        message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};
`;
fs.writeFileSync('src/components/RekapMutasiTab.tsx', content);
