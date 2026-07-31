import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Download,
  Search,
  X,
  Edit2,
  Trash2,
  BarChart2
, FileText } from 'lucide-react';
import { DataKetiga, DataAngkut } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface KetigaTabProps {
  userRole?: 'admin' | 'anggota' | null;
  data: DataKetiga[];
  onAddData: (item: Omit<DataKetiga, 'id'>) => void;
  onUpdateData: (id: string, item: Omit<DataKetiga, 'id'>) => void;
  onDeleteData: (id: string) => void;
  onDeleteAllData?: () => void;
  onExportCSV: () => void;
}

export const KetigaTab: React.FC<KetigaTabProps> = ({
  userRole,
  dataAngkut, data,
  onAddData,
  onUpdateData,
  onDeleteData,
  onDeleteAllData,
  onExportCSV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataKetiga | null>(null);
  const [deletingItem, setDeletingItem] = useState<DataKetiga | null>(null);

  // Form states
  const [kapling, setKapling] = useState('');
  const [blok, setBlok] = useState('');
  const [jenis, setJenis] = useState('Jati');
  const [sortimen, setSortimen] = useState('AI (Log)');
  const [panjang, setPanjang] = useState('');
  const [diameter, setDiameter] = useState('');
  const [mutu, setMutu] = useState('A (Baik)');
  const [batang, setBatang] = useState('');
  const [volume, setVolume] = useState('');
  const [pembeli, setPembeli] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setKapling('');
    setBlok('');
    setJenis('Jati');
    setSortimen('AI (Log)');
    setPanjang('');
    setDiameter('');
    setMutu('A (Baik)');
    setBatang('');
    setVolume('');
    setPembeli('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: DataKetiga) => {
    setEditingItem(item);
    setKapling(item.kapling);
    setBlok(item.blok);
    setJenis(item.jenis);
    setSortimen(item.sortimen);
    setPanjang(String(item.panjang));
    setDiameter(String(item.diameter));
    setMutu(item.mutu);
    setBatang(String(item.batang));
    setVolume(String(item.volume));
    setPembeli(item.pembeli);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      kapling: kapling.trim() || '-',
      blok: blok.trim() || '-',
      jenis: jenis.trim() || '-',
      sortimen: sortimen.trim() || '-',
      panjang: parseFloat(panjang) || 0,
      diameter: parseFloat(diameter) || 0,
      mutu: mutu.trim() || '-',
      batang: parseInt(batang) || 0,
      volume: parseFloat(volume) || 0,
      pembeli: pembeli.trim() || '-'
    };

    if (editingItem) {
      onUpdateData(editingItem.id, payload);
    } else {
      onAddData(payload);
    }
    setIsModalOpen(false);
  };

  // Grouping by Block for summary cards
  
  const computedData = useMemo(() => {
    return data.map(item => {
      let terangkutBatang = 0;
      let terangkutVolume = 0;
      dataAngkut?.forEach(ang => {
        if (
          ang.kapling.trim().toLowerCase() === item.kapling.trim().toLowerCase() &&
          ang.blok.trim().toLowerCase() === item.blok.trim().toLowerCase()
        ) {
          // If sortimen is available in angkut, match it. If empty or '-', match.
          // In real life, sortimen in Angkut often acts as "Jenis" or just standard sortimen.
          const isMatchSortimen = !ang.sortimen || ang.sortimen === '-' || ang.sortimen.trim().toLowerCase() === item.sortimen.trim().toLowerCase() || ang.sortimen.trim().toLowerCase() === item.jenis.trim().toLowerCase();
          if (isMatchSortimen) {
            terangkutBatang += Number(ang.batang) || 0;
            terangkutVolume += Number(ang.volume) || 0;
          }
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

  const blockSummary = useMemo(() => {
    const map: Record<string, { vol: number; batang: number; count: number }> = {};
    computedData.forEach(item => {
      const b = item.blok || 'Lainnya';
      if (!map[b]) map[b] = { vol: 0, batang: 0, count: 0 };
      map[b].vol += Number(item.sisaVolume || 0);
      map[b].batang += Number(item.sisaBatang || 0);
      map[b].count += 1;
    });
    return map;
  }, [data]);

  const filteredData = useMemo(() => {
    return computedData.filter(item => {
      return (
        item.kapling.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.blok.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.jenis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pembeli.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [dataAngkut, data, searchQuery]);
  const groupedByJenis = useMemo(() => {
    const groups: Record<string, { items: typeof filteredData; totalKapling: Set<string>; totalBatang: number; totalVolume: number }> = {};
    let grandTotalKapling = new Set<string>();
    let grandTotalBatang = 0;
    let grandTotalVolume = 0;

    filteredData.forEach(item => {
      const jenis = (item.jenis || 'Lainnya').trim().toUpperCase();
      const b = Number(item.sisaBatang || 0);
      const v = Number(item.sisaVolume || 0);

      // Only include if there is remaining stock
      if (b > 0 || v > 0) {
        if (!groups[jenis]) {
          groups[jenis] = { items: [], totalKapling: new Set(), totalBatang: 0, totalVolume: 0 };
        }
        groups[jenis].items.push(item);
        if (item.kapling && item.kapling !== '-') {
          groups[jenis].totalKapling.add(item.kapling.trim().toLowerCase());
          grandTotalKapling.add(item.kapling.trim().toLowerCase());
        }
        groups[jenis].totalBatang += b;
        groups[jenis].totalVolume += v;

        grandTotalBatang += b;
        grandTotalVolume += v;
      }
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => a.localeCompare(b)).map(key => ({
      jenis: key,
      items: groups[key].items,
      kaplingCount: groups[key].totalKapling.size,
      totalBatang: groups[key].totalBatang,
      totalVolume: groups[key].totalVolume,
    }));

    return {
      groups: sortedGroups,
      grandTotalKapling: grandTotalKapling.size,
      grandTotalBatang,
      grandTotalVolume
    };
  }, [filteredData]);


  return (
    <div className="space-y-6">
      {/* Block Rekapitulasi Cards */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-amber-500" />
          <span>Rekapitulasi Sisa Stok Per Blok</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(blockSummary).map(bKey => (
            <div
              key={bKey}
              className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200/60">
                  Blok {bKey}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {blockSummary[bKey].count} Entri
                </span>
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-800">
                  {blockSummary[bKey].vol.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-400">m³</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Total {blockSummary[bKey].batang} batang
                </p>
              </div>
            </div>
          ))}
          {Object.keys(blockSummary).length === 0 && (
            <div className="col-span-full bg-white rounded-2xl p-4 text-slate-400 text-sm italic border border-slate-200">
              Belum ada data sisa kayu pihak ketiga.
            </div>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Sisa Pihak Ketiga</h3>
              <p className="text-xs text-slate-400">Daftar stok sisa kayu milik mitra/pihak ketiga</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kapling, blok, pembeli..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none text-slate-700 w-36 sm:w-48"
              />
            </div>
            <button
              onClick={onExportCSV}
              className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" /> Unduh CSV
            </button>
            {userRole === 'admin' && (
            <div className="flex items-center gap-2">
              {onDeleteAllData && (
                <button
                  onClick={onDeleteAllData}
                  className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center cursor-pointer"
                  title="Hapus Semua Data"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Hapus Semua
                </button>
              )}
              <button
                onClick={openAddModal}
                className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/20 flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" /> Tambah Data
              </button>
            </div>
          )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-4 space-y-8 bg-slate-50/50">
          {groupedByJenis.groups.map(group => (
            <div key={group.jenis} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
              <div className="bg-slate-50/80 p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h4 className="text-xl font-black text-slate-800 tracking-tight">{group.jenis}</h4>
                <div className="flex gap-6 md:gap-10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Kapling</p>
                    <p className="text-lg font-bold text-slate-700">{group.kaplingCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Batang</p>
                    <p className="text-lg font-bold text-slate-700">{group.totalBatang}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Volume</p>
                    <p className="text-lg font-black text-amber-600">{group.totalVolume.toFixed(2)} <span className="text-xs font-semibold text-amber-600/70">m³</span></p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                  <thead className="bg-white text-slate-400 font-bold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-center w-12">No.</th>
                      <th className="py-3 px-4">No. Kapling</th>
                      <th className="py-3 px-4">No. Blok</th>
                      <th className="py-3 px-4">Sortimen</th>
                      <th className="py-3 px-4 text-right">Panjang (m)</th>
                      <th className="py-3 px-4 text-right">Diameter (cm)</th>
                      <th className="py-3 px-4">Mutu</th>
                      <th className="py-3 px-4 text-center">Batang</th>
                      <th className="py-3 px-4 text-right">Volume</th>
                      <th className="py-3 px-4">Pembeli / Mitra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {group.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{item.kapling}</td>
                        <td className="py-3.5 px-4 font-bold text-amber-900">{item.blok}</td>
                        <td className="py-3.5 px-4">{item.sortimen}</td>
                        <td className="py-3.5 px-4 text-right">{item.panjang}</td>
                        <td className="py-3.5 px-4 text-right">{item.diameter}</td>
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">{item.sisaBatang}</td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-700">{Number(item.sisaVolume).toFixed(2)}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{item.pembeli}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {groupedByJenis.groups.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic bg-white rounded-2xl border border-slate-200 shadow-sm">
              Tidak ada data sisa kayu pihak ketiga.
            </div>
          )}

          {groupedByJenis.groups.length > 0 && (
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h4 className="text-xl md:text-2xl font-black tracking-tight text-white">Grand Total Keseluruhan</h4>
                <p className="text-sm font-medium text-slate-400 mt-1">Total semua jenis kayu pihak ketiga yang memiliki sisa stok.</p>
              </div>
              <div className="flex gap-6 md:gap-12">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Kapling</p>
                  <p className="text-2xl md:text-3xl font-bold">{groupedByJenis.grandTotalKapling}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Batang</p>
                  <p className="text-2xl md:text-3xl font-bold">{groupedByJenis.grandTotalBatang}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Volume</p>
                  <p className="text-2xl md:text-3xl font-black text-amber-400">{groupedByJenis.grandTotalVolume.toFixed(2)} <span className="text-lg font-semibold text-amber-400/80">m³</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {editingItem ? 'Edit Data Sisa Pihak Ketiga' : 'Tambah Data Sisa Pihak Ketiga'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">No. Kapling</label>
                  <input
                    type="text"
                    required
                    placeholder="KAP-01"
                    value={kapling}
                    onChange={e => setKapling(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">No. Blok</label>
                  <input
                    type="text"
                    required
                    placeholder="BLK-01"
                    value={blok}
                    onChange={e => setBlok(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jenis Kayu</label>
                  <input
                    type="text"
                    placeholder="Contoh: Jati"
                    value={jenis}
                    onChange={e => setJenis(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sortimen</label>
                  <input
                    type="text"
                    placeholder="Contoh: AI (Log)"
                    value={sortimen}
                    onChange={e => setSortimen(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Panjang (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={panjang}
                    onChange={e => setPanjang(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Diameter (cm)</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={diameter}
                    onChange={e => setDiameter(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mutu Kayu</label>
                  <input
                    type="text"
                    placeholder="A (Baik)"
                    value={mutu}
                    onChange={e => setMutu(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Batang</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={batang}
                    onChange={e => setBatang(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Volume (m³)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={volume}
                    onChange={e => setVolume(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Pembeli / Mitra</label>
                  <input
                    type="text"
                    placeholder="CV Jati Makmur"
                    value={pembeli}
                    onChange={e => setPembeli(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 bg-slate-50 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-all mt-4 cursor-pointer"
              >
                Simpan Data Pihak Ketiga
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Satu Persatu */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Data Pihak Ketiga?"
        message={`Apakah Anda yakin ingin menghapus data kayu No. Kapling ${deletingItem?.kapling || ''} (Blok ${deletingItem?.blok || ''})? Data yang dihapus tidak dapat dikembalikan.`}
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
