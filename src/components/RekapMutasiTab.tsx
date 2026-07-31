
import React, { useState, useMemo } from 'react';
import { 
  Plus, Download, Search, X, Edit2, Trash2, Calendar, 
  Database, TreePine, FileText, Filter, ChevronDown, ChevronUp, Bell, Activity, ChevronRight, Info
} from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { DataMutasi } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

interface RekapMutasiTabProps {
  userRole?: 'admin' | 'anggota' | null;
  data: DataMutasi[];
  onAddData: (item: Omit<DataMutasi, 'id'>) => void;
  onUpdateData: (id: string, item: Omit<DataMutasi, 'id'>) => void;
  onDeleteData: (id: string) => void;
  onExportCSV: () => void;
}

const RekapMutasiTab: React.FC<RekapMutasiTabProps> = ({ 
  userRole, data, onAddData, onUpdateData, onDeleteData, onExportCSV 
}) => {
  const isAdmin = userRole === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [activeTab, setActiveTab] = useState('PINUS');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilterToast, setShowFilterToast] = useState(false);
  
  const defaultTanggal = `01/01/${new Date().getFullYear()} s/d 30/01/${new Date().getFullYear()}`;
  
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
    if (!t) return '';
    const matchSlash = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (matchSlash) return matchSlash[3];
    const parts = t.split(' ');
    if (parts.length >= 1) {
      const yearStr = parts[parts.length - 1];
      if (/^\d{4}$/.test(yearStr)) return yearStr;
    }
    const matchDash = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matchDash) return matchDash[1];
    return '';
  };

  const getMonthIndexFromTanggal = (t: string) => {
    if (!t) return -1;
    const matchSlash = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (matchSlash) {
      return parseInt(matchSlash[2], 10) - 1;
    }
    const parts = t.split(' ');
    if (parts.length >= 2) {
      const monthStr = parts[parts.length - 2];
      const idx = MONTHS.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
      if (idx !== -1) return idx;
    }
    const matchDash = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (matchDash) {
      return parseInt(matchDash[2], 10) - 1;
    }
    return -1;
  };

  const formatBtg = (val: number) => val.toLocaleString('id-ID');
  const formatVol = (val: number) => val.toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

  const dataForYear = useMemo(() => {
    return data.filter(item => {
      const itemYear = getYearFromTanggal(item.tanggal || '');
      return filterYear ? itemYear === filterYear : true;
    });
  }, [data, filterYear]);

  // Available jenis kayu from data
  const availableJenis = useMemo(() => {
    const jenisSet = new Set<string>();
    // Default types always available
    jenisSet.add('PINUS');
    jenisSet.add('JATI');
    jenisSet.add('SONOKELING');
    dataForYear.forEach(item => {
      if (item.jenis) jenisSet.add(item.jenis.toUpperCase());
    });
    return Array.from(jenisSet).sort();
  }, [dataForYear]);

  // Overall totals for top cards
  const topCardsData = useMemo(() => {
    const res: Record<string, { btg: number, vol: number }> = {};
    let totalAll = { btg: 0, vol: 0 };

    availableJenis.forEach(j => res[j] = { btg: 0, vol: 0 });

    dataForYear.forEach(item => {
      const j = (item.jenis || '').toUpperCase();
      const btg = (item.ai_batang || 0) + (item.aii_batang || 0) + (item.aiii_batang || 0);
      const vol = (item.ai_volume || 0) + (item.aii_volume || 0) + (item.aiii_volume || 0);
      
      if (res[j]) {
        res[j].btg += btg;
        res[j].vol += vol;
      } else {
        res[j] = { btg, vol };
      }
      totalAll.btg += btg;
      totalAll.vol += vol;
    });

    return { totalAll, byJenis: res };
  }, [dataForYear, availableJenis]);

  // Process data for the active tab (specific wood type)
  const activeTypeData = useMemo(() => {
    const entries = dataForYear.filter(d => (d.jenis || '').toUpperCase() === activeTab);
    
    // Group by month
    const monthlySummary = MONTHS.map((m, idx) => ({
      bulan: m,
      monthIdx: idx,
      ai_btg: 0, ai_vol: 0,
      aii_btg: 0, aii_vol: 0,
      aiii_btg: 0, aiii_vol: 0,
      total_btg: 0, total_vol: 0,
      entries: [] as DataMutasi[]
    }));

    let yearlyTotal = {
      ai_btg: 0, ai_vol: 0,
      aii_btg: 0, aii_vol: 0,
      aiii_btg: 0, aiii_vol: 0,
      total_btg: 0, total_vol: 0,
    };

    entries.forEach(item => {
      const mIdx = getMonthIndexFromTanggal(item.tanggal || '');
      if (mIdx >= 0 && mIdx < 12) {
        monthlySummary[mIdx].entries.push(item);
        monthlySummary[mIdx].ai_btg += (item.ai_batang || 0);
        monthlySummary[mIdx].ai_vol += (item.ai_volume || 0);
        monthlySummary[mIdx].aii_btg += (item.aii_batang || 0);
        monthlySummary[mIdx].aii_vol += (item.aii_volume || 0);
        monthlySummary[mIdx].aiii_btg += (item.aiii_batang || 0);
        monthlySummary[mIdx].aiii_vol += (item.aiii_volume || 0);
        
        const totBtg = (item.ai_batang || 0) + (item.aii_batang || 0) + (item.aiii_batang || 0);
        const totVol = (item.ai_volume || 0) + (item.aii_volume || 0) + (item.aiii_volume || 0);
        monthlySummary[mIdx].total_btg += totBtg;
        monthlySummary[mIdx].total_vol += totVol;

        yearlyTotal.ai_btg += (item.ai_batang || 0);
        yearlyTotal.ai_vol += (item.ai_volume || 0);
        yearlyTotal.aii_btg += (item.aii_batang || 0);
        yearlyTotal.aii_vol += (item.aii_volume || 0);
        yearlyTotal.aiii_btg += (item.aiii_batang || 0);
        yearlyTotal.aiii_vol += (item.aiii_volume || 0);
        yearlyTotal.total_btg += totBtg;
        yearlyTotal.total_vol += totVol;
      }
    });

    return { monthlySummary, yearlyTotal };
  }, [dataForYear, activeTab]);

  const chartData = useMemo(() => {
    return activeTypeData.monthlySummary.map(m => ({
      name: m.bulan.substring(0, 3), // Jan, Feb
      volume: m.total_vol,
      batang: m.total_btg
    }));
  }, [activeTypeData]);

  const handleExportPDF = () => {
    const cols = ['Bulan', 'Sortimen AI (Btg)', 'Sortimen AI (Vol)', 'Sortimen AII (Btg)', 'Sortimen AII (Vol)', 'Sortimen AIII (Btg)', 'Sortimen AIII (Vol)', 'Total (Btg)', 'Total (Vol)'];
    const rows = activeTypeData.monthlySummary.map(m => [
      m.bulan,
      m.ai_btg.toString(), m.ai_vol.toFixed(4),
      m.aii_btg.toString(), m.aii_vol.toFixed(4),
      m.aiii_btg.toString(), m.aiii_vol.toFixed(4),
      m.total_btg.toString(), m.total_vol.toFixed(4)
    ]);
    exportToPDF(`Rekap Mutasi Kapling - ${activeTab}`, cols, rows, `Rekap_Mutasi_${activeTab}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <TreePine className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Rekap Mutasi Kapling</h1>
            <p className="text-sm text-slate-500 mt-0.5">Ringkasan jumlah Batang (BTG) dan Volume (m³) per bulan, jenis kayu, dan sortimen.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 shadow-sm rounded-xl">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Update terakhir</p>
            <p className="text-xs font-semibold text-slate-700">{new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <button 
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => setIsRefreshing(false), 1000);
            }}
            className={`ml-2 p-1 text-slate-400 hover:text-blue-600 transition-colors ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
          >
            <Activity className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* CONTROLS SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-500 uppercase">Tahun</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="pl-4 pr-8 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm bg-slate-50 hover:bg-slate-100 appearance-none text-sm font-bold text-slate-700 w-32"
            >
              <option value="">Semua</option>
              {['2024', '2025', '2026', '2027', '2028', '2029'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
          <div className="relative hidden sm:block">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] font-bold text-slate-500 uppercase">Jenis Kayu</label>
            
            <div className="relative pl-10 pr-2 py-2.5 border border-slate-200 rounded-xl shadow-sm bg-slate-50 flex items-center min-w-[160px]">
              <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full bg-transparent outline-none text-sm font-bold text-slate-700 appearance-none cursor-pointer"
              >
                {availableJenis.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>

          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl transition-all font-semibold text-sm shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Export Excel
          </button>
          
          <div className="relative">
            <button
              onClick={() => {
                setShowFilterToast(true);
                setTimeout(() => setShowFilterToast(false), 2000);
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm shadow-blue-600/20 font-semibold text-sm"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {showFilterToast && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 z-50">
                Filter diterapkan!
              </div>
            )}
          </div>

        </div>
      </div>

      {/* TOP CARDS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-sm border border-blue-200">
            <Database className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-wider mb-2">TOTAL SEMUA JENIS</h4>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl font-black text-slate-800">{formatBtg(topCardsData.totalAll.btg)}</p>
                <p className="text-[10px] text-slate-500 font-medium">Batang</p>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div>
                <p className="text-xl font-black text-slate-800">{formatVol(topCardsData.totalAll.vol)}</p>
                <p className="text-[10px] text-slate-500 font-medium">Volume (m³)</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dynamic Cards for each Jenis */}
        {['PINUS', 'JATI', 'SONOKELING'].map((jenis) => {
          const data = topCardsData.byJenis[jenis] || { btg: 0, vol: 0 };
          let colorTheme = 'emerald';
          if (jenis === 'JATI') colorTheme = 'amber';
          if (jenis === 'SONOKELING') colorTheme = 'purple';

          return (
            <div key={jenis} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 relative overflow-hidden group">
              <div className={`absolute right-0 top-0 w-24 h-24 bg-${colorTheme}-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform`}></div>
              <div className={`w-12 h-12 rounded-xl bg-${colorTheme}-100 flex items-center justify-center text-${colorTheme}-600 shrink-0 shadow-sm border border-${colorTheme}-200`}>
                <TreePine className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className={`text-[11px] font-black text-${colorTheme}-600 uppercase tracking-wider mb-2`}>{jenis}</h4>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xl font-black text-slate-800">{formatBtg(data.btg)}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Batang</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div>
                    <p className={`text-xl font-black text-${colorTheme}-600`}>{formatVol(data.vol)}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Volume (m³)</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* LEFT PANEL: TABS & TABLE */}
        <div className="flex-1 space-y-4">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-2 pt-2">
            {availableJenis.map(jenis => (
              <button
                key={jenis}
                onClick={() => {
                  setActiveTab(jenis);
                  setExpandedMonth(null);
                }}
                className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
                  activeTab === jenis 
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-xl'
                }`}
              >
                {jenis}
              </button>
            ))}
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Rekap Mutasi Kapling - <span className="text-emerald-700">{activeTab}</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> PDF
                </button>

              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 text-left font-bold text-slate-800 align-middle">Bulan</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-emerald-600">Sortimen AI</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-blue-600">Sortimen AII</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 font-bold text-orange-600">Sortimen AIII</th>
                    <th colSpan={2} className={`px-4 py-2 font-black text-slate-800 ${isAdmin ? 'border-r border-slate-200' : ''}`}>TOTAL</th>
                    {isAdmin && <th rowSpan={2} className="px-4 py-3 font-bold text-slate-800 w-24 align-middle">Aksi</th>}
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] uppercase tracking-wider font-bold">
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-500">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-emerald-600 bg-emerald-50/50">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-500">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-blue-600 bg-blue-50/50">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-500">BTG</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-orange-600 bg-orange-50/50">VOL (m³)</th>
                    <th className="px-2 py-2 border-r border-slate-200 text-slate-500">BTG</th>
                    <th className={`px-2 py-2 text-slate-800 bg-slate-100/50 ${isAdmin ? 'border-r border-slate-200' : ''}`}>VOL (m³)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTypeData.monthlySummary.map((row) => (
                    <tr key={row.bulan} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 border-r border-slate-100 text-left font-medium text-slate-700">{row.bulan}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-600">{row.ai_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-semibold text-emerald-700 bg-emerald-50/30">{row.ai_vol > 0 ? row.ai_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-600">{row.aii_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-semibold text-blue-700 bg-blue-50/30">{row.aii_vol > 0 ? row.aii_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 text-slate-600">{row.aiii_btg || '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-semibold text-orange-700 bg-orange-50/30">{row.aiii_vol > 0 ? row.aiii_vol.toFixed(4) : '-'}</td>
                      <td className="px-2 py-3.5 border-r border-slate-100 font-semibold text-slate-700">{row.total_btg || '-'}</td>
                      <td className={`px-2 py-3.5 font-bold text-slate-900 bg-slate-50/50 ${isAdmin ? 'border-r border-slate-100' : ''}`}>{row.total_vol > 0 ? row.total_vol.toFixed(4) : '-'}</td>
                      {isAdmin && (
                        <td className="px-2 py-3.5 text-center">
                          {row.entries.length > 0 ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(row.entries[0]); }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm flex items-center justify-center gap-1.5 mx-auto"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resetForm();
                                const year = filterYear || new Date().getFullYear().toString();
                                const monthNum = String(row.monthIdx + 1).padStart(2, '0');
                                const lastDay = new Date(parseInt(year), row.monthIdx + 1, 0).getDate();
                                setFormData(prev => ({
                                  ...prev, 
                                  jenis: activeTab,
                                  tanggal: `01/${monthNum}/${year} s/d ${lastDay}/${monthNum}/${year}`
                                }));
                                setIsModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm flex items-center justify-center gap-1 mx-auto whitespace-nowrap"
                            >
                              <Plus className="w-3.5 h-3.5" /> Tambah
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-black text-slate-800 border-t-2 border-slate-200">
                  <tr>
                    <td className="px-4 py-4 border-r border-slate-200 text-left uppercase text-xs">
                      TOTAL TAHUN {filterYear || 'SEMUA'}
                    </td>
                    <td className="px-2 py-4 border-r border-slate-200 text-emerald-700">{formatBtg(activeTypeData.yearlyTotal.ai_btg)}</td>
                    <td className="px-2 py-4 border-r border-slate-200 text-emerald-700">{formatVol(activeTypeData.yearlyTotal.ai_vol)}</td>
                    <td className="px-2 py-4 border-r border-slate-200 text-blue-700">{formatBtg(activeTypeData.yearlyTotal.aii_btg)}</td>
                    <td className="px-2 py-4 border-r border-slate-200 text-blue-700">{formatVol(activeTypeData.yearlyTotal.aii_vol)}</td>
                    <td className="px-2 py-4 border-r border-slate-200 text-orange-700">{formatBtg(activeTypeData.yearlyTotal.aiii_btg)}</td>
                    <td className="px-2 py-4 border-r border-slate-200 text-orange-700">{formatVol(activeTypeData.yearlyTotal.aiii_vol)}</td>
                    <td className="px-2 py-4 border-r border-slate-200">{formatBtg(activeTypeData.yearlyTotal.total_btg)}</td>
                    <td className={`px-2 py-4 ${isAdmin ? 'border-r border-slate-200' : ''}`}>{formatVol(activeTypeData.yearlyTotal.total_vol)}</td>
                    {isAdmin && <td className="px-2 py-4"></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CHARTS & SUMMARIES */}
        <div className="w-full xl:w-80 flex flex-col gap-6">
          
          {/* Chart Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Grafik Volume (m³) - <span className="text-emerald-600">{activeTab}</span>
              </h3>
              <div className="bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 px-2 py-1 rounded-lg flex items-center gap-1">
                Volume (m³) <ChevronDown className="w-3 h-3" />
              </div>
            </div>
            <div className="h-48 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sortimen Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Ringkasan Sortimen - <span className="text-emerald-600">{activeTab}</span> <span className="text-slate-500 font-medium text-xs">(Total Tahun {filterYear || ''})</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {/* AI */}
              <div className="col-span-2 sm:col-span-1 xl:col-span-2 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-emerald-700 uppercase">Sortimen AI</h4>
                  <p className="text-lg font-black text-slate-800 leading-tight">
                    {formatBtg(activeTypeData.yearlyTotal.ai_btg)} <span className="text-[10px] font-medium text-slate-500">BTG</span>
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {formatVol(activeTypeData.yearlyTotal.ai_vol)} <span className="text-[10px] font-medium text-slate-500">m³</span>
                  </p>
                </div>
              </div>
              
              {/* AII */}
              <div className="col-span-2 sm:col-span-1 xl:col-span-2 bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-blue-700 uppercase">Sortimen AII</h4>
                  <p className="text-lg font-black text-slate-800 leading-tight">
                    {formatBtg(activeTypeData.yearlyTotal.aii_btg)} <span className="text-[10px] font-medium text-slate-500">BTG</span>
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {formatVol(activeTypeData.yearlyTotal.aii_vol)} <span className="text-[10px] font-medium text-slate-500">m³</span>
                  </p>
                </div>
              </div>

              {/* AIII */}
              <div className="col-span-2 sm:col-span-1 xl:col-span-2 bg-orange-50/50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-orange-700 uppercase">Sortimen AIII</h4>
                  <p className="text-lg font-black text-slate-800 leading-tight">
                    {formatBtg(activeTypeData.yearlyTotal.aiii_btg)} <span className="text-[10px] font-medium text-slate-500">BTG</span>
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {formatVol(activeTypeData.yearlyTotal.aiii_vol)} <span className="text-[10px] font-medium text-slate-500">m³</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Keterangan */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 flex gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-800 mb-1">Keterangan</h4>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Data rekap dihitung berdasarkan dokumen mutasi yang telah diinputkan pada bulan dan tahun yang terpilih.
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* MODALS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Edit Data Mutasi' : 'Tambah Data Mutasi'}
                </h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <form id="mutasiForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Tanggal</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 01/01/2026 s/d 30/01/2026"
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-medium"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Jenis Kayu</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.jenis}
                        onChange={(e) => setFormData({ ...formData, jenis: e.target.value.toUpperCase() })}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase shadow-sm font-medium"
                        placeholder="Contoh: PINUS, JATI"
                      />
                      <TreePine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Data Sortimen Fields (AI, AII, AIII) */}
                <div className="space-y-4">
                  {[
                    { label: 'Sortimen AI', btg: 'ai_batang', vol: 'ai_volume', color: 'emerald' },
                    { label: 'Sortimen AII', btg: 'aii_batang', vol: 'aii_volume', color: 'blue' },
                    { label: 'Sortimen AIII', btg: 'aiii_batang', vol: 'aiii_volume', color: 'orange' }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2 mb-4">
                        <span className={`w-2.5 h-2.5 rounded-full bg-${s.color}-500`}></span> {s.label}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batang</label>
                          <input
                            type="number"
                            min="0"
                            value={formData[s.btg]}
                            onChange={(e) => setFormData({ ...formData, [s.btg]: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume (m³)</label>
                          <input
                            type="number"
                            step="0.0001"
                            min="0"
                            value={formData[s.vol]}
                            onChange={(e) => setFormData({ ...formData, [s.vol]: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="flex items-center gap-2 px-6 py-2.5 text-slate-700 font-semibold bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="mutasiForm"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-95"
              >
                {editingId ? 'Simpan Perubahan' : 'Simpan Data'}
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
        message="Apakah Anda yakin ingin menghapus data mutasi ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export { RekapMutasiTab };
