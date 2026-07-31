import React, { useState, useMemo } from 'react';
import {
  Leaf,
  Plus,
  Download,
  Search,
  X,
  Edit2,
  Trash2,
  Filter,
  Layers,
  Box
, FileText } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { DataPerhutani } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface PerhutaniTabProps {
  userRole?: 'admin' | 'anggota' | null;
  data: DataPerhutani[];
  onAddData: (item: Omit<DataPerhutani, 'id'>) => void;
  onUpdateData: (id: string, item: Omit<DataPerhutani, 'id'>) => void;
  onDeleteData: (id: string) => void;
  onDeleteAllData?: () => void;
  onExportCSV: () => void;
}

export const PerhutaniTab: React.FC<PerhutaniTabProps> = ({
  userRole,
  data,
  onAddData,
  onUpdateData,
  onDeleteData,
  onDeleteAllData,
  onExportCSV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenisFilter, setSelectedJenisFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataPerhutani | null>(null);
  const [deletingItem, setDeletingItem] = useState<DataPerhutani | null>(null);

  // Form states
  const [tglKapling, setTglKapling] = useState(new Date().toISOString().split('T')[0]);
  const [kapling, setKapling] = useState('');
  const [blok, setBlok] = useState('');
  const [jenis, setJenis] = useState('Jati TPK');
  const [sortimen, setSortimen] = useState('AI (Pertukaran)');
  const [panjang, setPanjang] = useState('');
  const [diameter, setDiameter] = useState('');
  const [mutu, setMutu] = useState('A (Baik)');
  const [batang, setBatang] = useState('');
  const [volume, setVolume] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setTglKapling(new Date().toISOString().split('T')[0]);
    setKapling('');
    setBlok('');
    setJenis('Jati TPK');
    setSortimen('AI (Pertukaran)');
    setPanjang('');
    setDiameter('');
    setMutu('A (Baik)');
    setBatang('');
    setVolume('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: DataPerhutani) => {
    setEditingItem(item);
    setTglKapling(item.tgl_kapling || new Date().toISOString().split('T')[0]);
    setKapling(item.kapling);
    setBlok(item.blok);
    setJenis(item.jenis);
    setSortimen(item.sortimen);
    setPanjang(String(item.panjang));
    setDiameter(String(item.diameter));
    setMutu(item.mutu);
    setBatang(String(item.batang));
    setVolume(String(item.volume));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      tgl_kapling: tglKapling || new Date().toISOString().split('T')[0],
      kapling: kapling.trim() || '-',
      blok: blok.trim() || '-',
      jenis: jenis.trim() || '-',
      sortimen: sortimen.trim() || '-',
      panjang: parseFloat(panjang) || 0,
      diameter: parseFloat(diameter) || 0,
      mutu: mutu.trim() || '-',
      batang: parseInt(batang) || 0,
      volume: parseFloat(volume) || 0
    };

    if (editingItem) {
      onUpdateData(editingItem.id, payload);
    } else {
      onAddData(payload);
    }
    setIsModalOpen(false);
  };

  // Get list of unique Jenis Kayu options
  const jenisOptions = useMemo(() => {
    const setJenis = new Set<string>();
    data.forEach(item => {
      if (item.jenis && item.jenis.trim() !== '') {
        setJenis.add(item.jenis.trim());
      }
    });
    return Array.from(setJenis).sort();
  }, [data]);

  // Filtered data based on search and selected jenis
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch =
        item.kapling.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.blok.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sortimen.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesJenis =
        selectedJenisFilter === 'ALL' ||
        item.jenis.trim().toLowerCase() === selectedJenisFilter.trim().toLowerCase();

      return matchesSearch && matchesJenis;
    });
  }, [data, searchQuery, selectedJenisFilter]);

  // Group filtered data by Jenis Kayu
  const groupedData = useMemo(() => {
    const groups: { [jenisKey: string]: DataPerhutani[] } = {};

    filteredData.forEach(item => {
      const key = item.jenis?.trim() || 'Lain-Lain';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return groups;
  }, [filteredData]);

  // Calculate totals per group and overall
  const groupSummaries = useMemo(() => {
    return Object.keys(groupedData).map(jenisKey => {
      const items = groupedData[jenisKey];
      const totalBatang = items.reduce((acc, cur) => acc + (Number(cur.batang) || 0), 0);
      const totalVolume = items.reduce((acc, cur) => acc + (Number(cur.volume) || 0), 0);
      return {
        jenisKey,
        items,
        totalBatang,
        totalVolume,
        count: items.length
      };
    });
  }, [groupedData]);

  const grandTotal = useMemo(() => {
    const totalBatang = filteredData.reduce((acc, cur) => acc + (Number(cur.batang) || 0), 0);
    const totalVolume = filteredData.reduce((acc, cur) => acc + (Number(cur.volume) || 0), 0);
    return { totalBatang, totalVolume, count: filteredData.length };
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-800">Sisa Stok Perhutani</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3" /> Terdiferensiasi Jenis
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan & Pengelompokan persediaan stok resmi milik Perhutani di TPK Talok
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 flex items-center gap-2 flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kapling, blok..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs outline-none text-slate-700 w-28 sm:w-36"
            />
          </div>

          {/* Jenis Kayu Filter Dropdown */}
          <div className="bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={selectedJenisFilter}
              onChange={e => setSelectedJenisFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer py-1"
            >
              <option value="ALL">Semua Jenis Kayu ({jenisOptions.length})</option>
              {jenisOptions.map(j => (
                <option key={j} value={j}>
                  Jenis: {j}
                </option>
              ))}
            </select>
          </div>

          
          {/* Export PDF Button */}
          <button
            onClick={() => {
              const cols = ['Tgl Kapling', 'Kapling', 'Blok', 'Jenis', 'Sortimen', 'Panjang (m)', 'Diameter (cm)', 'Mutu', 'Batang', 'Volume (m3)'];
              const rows = filteredData.map(item => [
                item.tgl_kapling,
                item.kapling,
                item.blok,
                item.jenis,
                item.sortimen,
                item.panjang?.toString() || '0',
                item.diameter?.toString() || '0',
                item.mutu,
                item.batang?.toString() || '0',
                item.volume?.toString() || '0'
              ]);
              exportToPDF('Sisa Perhutani', cols, rows, 'Sisa_Perhutani');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          
          {/* Export CSV Button */}

          <button
            onClick={onExportCSV}
            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> CSV
          </button>

          {/* Add Data Button */}
          {userRole === 'admin' && (
            <div className="flex items-center gap-2">
              {onDeleteAllData && (
                <button
                  onClick={onDeleteAllData}
                  className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  title="Hapus Semua Data"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus Semua
                </button>
              )}
              <button
                onClick={openAddModal}
                className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/20 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Tambah Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards Per Jenis Kayu */}
      {jenisOptions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white p-4 rounded-2xl shadow-sm">
            <p className="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">
              Total Semua Stok Kayu
            </p>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-black">{grandTotal.totalVolume.toFixed(2)} m³</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-bold">
                {grandTotal.totalBatang} btg
              </span>
            </div>
            <p className="text-[10px] text-emerald-100/80 mt-1">
              Total {grandTotal.count} kapling terdaftar
            </p>
          </div>

          {groupSummaries.map(summary => (
            <div
              key={summary.jenisKey}
              onClick={() => setSelectedJenisFilter(summary.jenisKey)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedJenisFilter === summary.jenisKey
                  ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-emerald-600" />
                  {summary.jenisKey}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  {summary.count} kapling
                </span>
              </div>
              <div className="flex justify-between items-baseline mt-3">
                <span className="text-lg font-extrabold text-slate-900">
                  {summary.totalVolume.toFixed(2)} m³
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  {summary.totalBatang} Btg
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grouped Data Sections */}
      {groupSummaries.length > 0 ? (
        groupSummaries.map(group => (
          <div
            key={group.jenisKey}
            className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden"
          >
            {/* Group Header Banner */}
            <div className="p-4 md:p-5 bg-gradient-to-r from-emerald-50/80 via-slate-50 to-white border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <h4 className="text-base font-extrabold text-slate-800">
                  Jenis Kayu: <span className="text-emerald-700">{group.jenisKey}</span>
                </h4>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  {group.count} Rincian Kapling
                </span>
              </div>

              {/* Subtotal metrics */}
              <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                <span className="bg-white px-3 py-1 rounded-xl border border-slate-200">
                  Subtotal Batang: <b className="text-slate-900">{group.totalBatang}</b> btg
                </span>
                <span className="bg-emerald-600 text-white px-3 py-1 rounded-xl shadow-xs">
                  Subtotal Volume: <b>{group.totalVolume.toFixed(2)}</b> m³
                </span>
              </div>
            </div>

            {/* Table for this specific Jenis Kayu */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-center w-12">No.</th>
                    <th className="py-3 px-4">Tgl Kapling</th>
                    <th className="py-3 px-4">No. Kapling</th>
                    <th className="py-3 px-4">No. Blok</th>
                    <th className="py-3 px-4">Sortimen</th>
                    <th className="py-3 px-4 text-right">Panjang (m)</th>
                    <th className="py-3 px-4 text-right">Diameter (cm)</th>
                    <th className="py-3 px-4">Mutu</th>
                    <th className="py-3 px-4 text-center">Batang</th>
                    <th className="py-3 px-4 text-right">Volume (m³)</th>
                    {userRole === 'admin' && <th className="py-3 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {group.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">{item.tgl_kapling}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{item.kapling}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-900">{item.blok}</td>
                      <td className="py-3 px-4 text-xs text-slate-700">{item.sortimen}</td>
                      <td className="py-3 px-4 text-right text-xs">{item.panjang}</td>
                      <td className="py-3 px-4 text-right text-xs">{item.diameter}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                            item.mutu.startsWith('A')
                              ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                              : 'border-slate-200 text-slate-600 bg-slate-50'
                          }`}
                        >
                          {item.mutu}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {item.batang}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {Number(item.volume).toFixed(2)}
                      </td>
                      {userRole === 'admin' && (
<td className="py-3 px-4 text-center">
<div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Edit Data"
>
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Hapus Data Baris Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
</button>
</div>
</td>
)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-12 text-center text-slate-400">
          <Leaf className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600 mb-1">
            Belum ada data sisa kayu Perhutani.
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Klik &quot;Tambah Data&quot; atau lakukan Import data CSV/Google Sheets untuk mengisi persediaan kayu.
          </p>
          {userRole === 'admin' && (
<button
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Sekarang</span>
          </button>
)}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingItem ? 'Edit Data Sisa Perhutani' : 'Tambah Data Sisa Perhutani'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tanggal Kapling
                </label>
                <input
                  type="date"
                  required
                  value={tglKapling}
                  onChange={e => setTglKapling(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    No. Kapling
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="KAP-P01"
                    value={kapling}
                    onChange={e => setKapling(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    No. Blok
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="BLK-01"
                    value={blok}
                    onChange={e => setBlok(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Jenis Kayu
                  </label>
                  <input
                    type="text"
                    placeholder="Jati TPK"
                    value={jenis}
                    onChange={e => setJenis(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Sortimen
                  </label>
                  <input
                    type="text"
                    placeholder="AI (Pertukaran)"
                    value={sortimen}
                    onChange={e => setSortimen(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Panjang (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2.4"
                    value={panjang}
                    onChange={e => setPanjang(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Diameter (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="35"
                    value={diameter}
                    onChange={e => setDiameter(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Mutu Kayu
                  </label>
                  <select
                    value={mutu}
                    onChange={e => setMutu(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                  >
                    <option value="A (Baik)">A (Baik)</option>
                    <option value="B (Sedang)">B (Sedang)</option>
                    <option value="C (Afkir)">C (Afkir)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Jumlah Batang
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={batang}
                    onChange={e => setBatang(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Volume (m³)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={volume}
                  onChange={e => setVolume(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-all mt-4 cursor-pointer"
              >
                Simpan Data Perhutani
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Satu Persatu */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Data Perhutani?"
        message={`Apakah Anda yakin ingin menghapus data kayu ${deletingItem?.jenis || ''} No. Kapling ${deletingItem?.kapling || ''} (Blok ${deletingItem?.blok || ''})? Data yang dihapus tidak dapat dikembalikan.`}
        onConfirm={() => {
          if (deletingItem) {
            onDeleteData(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};

