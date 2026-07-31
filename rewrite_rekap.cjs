const fs = require('fs');

const code = `import React, { useState, useMemo } from 'react';
import { 
  Plus, Download, Search, X, Edit2, Trash2, Calendar, 
  Database, TreePine
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

const RekapMutasiTab: React.FC<RekapMutasiTabProps> = ({ 
  userRole, data, onAddData, onUpdateData, onDeleteData, onExportCSV 
}) => {
  const isAdmin = userRole === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterYear, setFilterYear] = useState('');

  const defaultTanggal = \\\`01/01/\\\${new Date().getFullYear()} s/d 30/01/\\\${new Date().getFullYear()}\\\`;
  
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
          </div>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari jenis kayu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
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
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm shadow-blue-600/20 font-medium text-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Data</span>
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan Total */}
      <div className="p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-4">Ringkasan Total {filterYear ? \\\`Januari s/d Desember \\\${filterYear}\\\` : 'Semua Data'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-50 px-3 py-4 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">TOTAL SEMUA JENIS</h4>
              <div className="flex gap-3 text-[13px]">
                <div><span className="text-slate-500 mr-1">Btg:</span><span className="font-bold text-slate-800">{formatBtg(grandTotals.total.btg)}</span></div>
                <div><span className="text-slate-500 mr-1">Vol:</span><span className="font-bold text-slate-800">{formatVol(grandTotals.total.vol)}</span></div>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50/50 px-3 py-4 rounded-xl border border-emerald-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <TreePine className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">PINUS</h4>
              <div className="flex gap-3 text-[13px]">
                <div><span className="text-slate-500 mr-1">Btg:</span><span className="font-bold text-emerald-700">{formatBtg(grandTotals.pinus.btg)}</span></div>
                <div><span className="text-slate-500 mr-1">Vol:</span><span className="font-bold text-emerald-700">{formatVol(grandTotals.pinus.vol)}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 px-3 py-4 rounded-xl border border-amber-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <TreePine className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">JATI</h4>
              <div className="flex gap-3 text-[13px]">
                <div><span className="text-slate-500 mr-1">Btg:</span><span className="font-bold text-amber-800">{formatBtg(grandTotals.jati.btg)}</span></div>
                <div><span className="text-slate-500 mr-1">Vol:</span><span className="font-bold text-amber-800">{formatVol(grandTotals.jati.vol)}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50/50 px-3 py-4 rounded-xl border border-purple-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <TreePine className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-purple-900 uppercase tracking-wider mb-1">SONOKELING</h4>
              <div className="flex gap-3 text-[13px]">
                <div><span className="text-slate-500 mr-1">Btg:</span><span className="font-bold text-purple-700">{formatBtg(grandTotals.sonokeling.btg)}</span></div>
                <div><span className="text-slate-500 mr-1">Vol:</span><span className="font-bold text-purple-700">{formatVol(grandTotals.sonokeling.vol)}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50/50 px-3 py-4 rounded-xl border border-orange-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <TreePine className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-bold text-orange-900 uppercase tracking-wider mb-1">MAHONI</h4>
              <div className="flex gap-3 text-[13px]">
                <div><span className="text-slate-500 mr-1">Btg:</span><span className="font-bold text-orange-700">{formatBtg(grandTotals.mahoni.btg)}</span></div>
                <div><span className="text-slate-500 mr-1">Vol:</span><span className="font-bold text-orange-700">{formatVol(grandTotals.mahoni.vol)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Data */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 border-r border-slate-200">Tanggal</th>
                <th className="px-4 py-3 border-r border-slate-200">Jenis Kayu</th>
                <th className="px-4 py-3 border-r border-slate-200 text-center" colSpan={2}>Sortimen AI</th>
                <th className="px-4 py-3 border-r border-slate-200 text-center" colSpan={2}>Sortimen AII</th>
                <th className="px-4 py-3 border-r border-slate-200 text-center" colSpan={2}>Sortimen AIII</th>
                <th className="px-4 py-3 border-r border-slate-200 text-center" colSpan={2}>Jumlah</th>
                {isAdmin && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
              <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="border-r border-slate-200"></th>
                <th className="border-r border-slate-200"></th>
                <th className="px-2 py-2 text-center border-r border-slate-200">Btg</th>
                <th className="px-2 py-2 text-center border-r border-slate-200">Vol</th>
                <th className="px-2 py-2 text-center border-r border-slate-200">Btg</th>
                <th className="px-2 py-2 text-center border-r border-slate-200">Vol</th>
                <th className="px-2 py-2 text-center border-r border-slate-200">Btg</th>
                <th className="px-2 py-2 text-center border-r border-slate-200">Vol</th>
                <th className="px-2 py-2 text-center border-r border-slate-200 text-blue-600">Btg</th>
                <th className="px-2 py-2 text-center border-r border-slate-200 text-blue-600">Vol</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="font-medium">Tidak ada data mutasi kapling.</p>
                      <p className="text-xs text-slate-400 mt-1">Gunakan tombol Tambah Data untuk memasukkan data baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const sumBtg = (item.ai_batang || 0) + (item.aii_batang || 0) + (item.aiii_batang || 0);
                  const sumVol = (item.ai_volume || 0) + (item.aii_volume || 0) + (item.aiii_volume || 0);
                  
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 border-r border-slate-100 font-medium text-slate-700 whitespace-nowrap">{item.tanggal}</td>
                      <td className="px-4 py-3 border-r border-slate-100 font-bold text-slate-800">{item.jenis}</td>
                      <td className="px-2 py-3 text-center border-r border-slate-100 text-slate-600">{item.ai_batang || '-'}</td>
                      <td className="px-2 py-3 text-center border-r border-slate-100 text-slate-600">{item.ai_volume || '-'}</td>
                      <td className="px-2 py-3 text-center border-r border-slate-100 text-slate-600">{item.aii_batang || '-'}</td>
                      <td className="px-2 py-3 text-center border-r border-slate-100 text-slate-600">{item.aii_volume || '-'}</td>
                      <td className="px-2 py-3 text-center border-r border-slate-100 text-slate-600">{item.aiii_batang || '-'}</td>
                      <td className="px-2 py-3 text-center border-r border-slate-100 text-slate-600">{item.aiii_volume || '-'}</td>
                      <td className="px-2 py-3 text-center border-r border-slate-100 font-bold text-blue-600 bg-blue-50/30">{sumBtg || '-'}</td>
                      <td className="px-2 py-3 text-center border-r border-slate-100 font-bold text-blue-600 bg-blue-50/30">{sumVol ? sumVol.toFixed(4) : '-'}</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
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
      </div>

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
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
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-red-500 mt-1">Contoh: 1 s/d 30 Januari 2026 atau 01/01/2026 s/d 30/01/2026</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Jenis Kayu</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.jenis}
                        onChange={(e) => setFormData({ ...formData, jenis: e.target.value.toUpperCase() })}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase shadow-sm"
                        placeholder="Contoh: PINUS, JATI"
                      />
                      <TreePine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sortimen AI
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.ai_batang}
                        onChange={(e) => setFormData({ ...formData, ai_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sortimen AII
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.aii_batang}
                        onChange={(e) => setFormData({ ...formData, aii_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sortimen AIII
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.aiii_batang}
                        onChange={(e) => setFormData({ ...formData, aiii_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="flex items-center gap-2 px-6 py-2.5 text-slate-700 font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                type="submit"
                form="mutasiForm"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-95"
              >
                <Database className="w-4 h-4" />
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
        message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default RekapMutasiTab;
`;

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
