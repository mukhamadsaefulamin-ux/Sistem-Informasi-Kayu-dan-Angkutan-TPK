import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Key,
  Plus,
  Download,
  FileSpreadsheet,
  Receipt,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  Vault,
  Calendar,
  Layers,
  Box,
  TrendingUp,
  Filter
, FileText } from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { DataInvoice } from '../types';
import { ConfirmModal } from './ConfirmModal';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getMonthInfo(tanggalStr: string): { key: string; label: string } {
  if (!tanggalStr) return { key: 'Lainnya', label: 'Lainnya' };

  const str = tanggalStr.trim();

  // 1. Check YYYY-MM-DD or YYYY/MM/DD
  let match = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) {
    const year = match[1];
    const mIdx = parseInt(match[2], 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      const mStr = String(mIdx + 1).padStart(2, '0');
      return { key: `${year}-${mStr}`, label: `${monthNames[mIdx]} ${year}` };
    }
  }

  // 2. Check DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY or DD.MM.YYYY
  match = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (match) {
    const n1 = parseInt(match[1], 10);
    const n2 = parseInt(match[2], 10);
    let year = match[3];
    if (year.length === 2) year = '20' + year;

    let mIdx = -1;
    if (n1 > 12 && n2 <= 12) {
      // n1 is Day, n2 is Month (DD/MM/YYYY)
      mIdx = n2 - 1;
    } else if (n2 > 12 && n1 <= 12) {
      // n1 is Month, n2 is Day (MM/DD/YYYY)
      mIdx = n1 - 1;
    } else if (n1 <= 12 && n2 <= 12) {
      // Default to Indonesian standard DD/MM/YYYY (first number is day, second is month)
      mIdx = n2 - 1;
    }

    if (mIdx >= 0 && mIdx < 12) {
      const mStr = String(mIdx + 1).padStart(2, '0');
      return { key: `${year}-${mStr}`, label: `${monthNames[mIdx]} ${year}` };
    }
  }

  // 3. Check textual Indonesian months: e.g. "15 Agustus 2024", "Agt 2024", "15-Agustus-2024"
  const indonesianMonths: Record<string, number> = {
    jan: 0, januari: 0,
    feb: 1, februari: 1,
    mar: 2, maret: 2,
    apr: 3, april: 3,
    mei: 4,
    jun: 5, juni: 5,
    jul: 6, juli: 6,
    agt: 7, agu: 7, agustus: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9,
    nov: 10, november: 10,
    des: 11, desember: 11
  };

  const tokens = str.toLowerCase().split(/[\s\-/,.]+/);
  let foundMonthIdx = -1;
  let foundYear = '';

  for (const tok of tokens) {
    if (indonesianMonths[tok] !== undefined) {
      foundMonthIdx = indonesianMonths[tok];
    } else if (tok.match(/^\d{4}$/)) {
      foundYear = tok;
    } else if (tok.match(/^\d{2}$/) && parseInt(tok, 10) > 31) {
      foundYear = '20' + tok;
    }
  }

  if (foundMonthIdx !== -1 && foundYear) {
    const mStr = String(foundMonthIdx + 1).padStart(2, '0');
    return { key: `${foundYear}-${mStr}`, label: `${monthNames[foundMonthIdx]} ${foundYear}` };
  }

  // 4. Fallback JS Date
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const mIdx = d.getMonth();
    const mStr = String(mIdx + 1).padStart(2, '0');
    return { key: `${year}-${mStr}`, label: `${monthNames[mIdx]} ${year}` };
  }

  return { key: 'Lainnya', label: 'Lainnya' };
}

interface InvoiceTabProps {
  userRole?: 'admin' | 'anggota' | null;
  data: DataInvoice[];
  isUnlocked: boolean;
  onUnlock: (pin: string) => boolean;
  onLock: () => void;
  onAddData: (item: Omit<DataInvoice, 'id'>) => void;
  onUpdateData: (id: string, item: Omit<DataInvoice, 'id'>) => void;
  onDeleteData: (id: string) => void;
  onDeleteAllData?: () => void;
  onExportCSV: () => void;
  onOpenImportModal: () => void;
}

export const InvoiceTab: React.FC<InvoiceTabProps> = ({
  userRole,
  data,
  isUnlocked,
  onUnlock,
  onLock,
  onAddData,
  onUpdateData,
  onDeleteData,
  onDeleteAllData,
  onExportCSV,
  onOpenImportModal
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataInvoice | null>(null);
  const [deletingItem, setDeletingItem] = useState<DataInvoice | null>(null);
  const [isConfirmDeleteAll, setIsConfirmDeleteAll] = useState(false);

  // Form states
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [noInvoice, setNoInvoice] = useState('');
  const [batang, setBatang] = useState('');
  const [volume, setVolume] = useState('');
  const [pembeli, setPembeli] = useState('');
  const [nominal, setNominal] = useState('');
  const [status, setStatus] = useState<'Lunas' | 'Belum Lunas'>('Lunas');

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlock(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinError(false);
      setPinInput('');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setTanggal(new Date().toISOString().split('T')[0]);
    setNoInvoice('INV-' + new Date().getFullYear() + '-' + String(data.length + 1).padStart(3, '0'));
    setBatang('');
    setVolume('');
    setPembeli('');
    setNominal('');
    setStatus('Lunas');
    setIsModalOpen(true);
  };

  const openEditModal = (item: DataInvoice) => {
    setEditingItem(item);
    setTanggal(item.tanggal);
    setNoInvoice(item.no_invoice);
    setBatang(item.batang !== undefined ? String(item.batang) : '');
    setVolume(item.volume !== undefined ? String(item.volume) : '');
    setPembeli(item.pembeli);
    setNominal(String(item.nominal));
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noInvoice.trim()) return;

    const payload = {
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      no_invoice: noInvoice.trim().toUpperCase(),
      batang: parseInt(batang) || 0,
      volume: parseFloat(volume) || 0,
      pembeli: pembeli.trim() || '-',
      nominal: parseFloat(nominal) || 0,
      status
    };

    if (editingItem) {
      onUpdateData(editingItem.id, payload);
    } else {
      onAddData(payload);
    }
    setIsModalOpen(false);
  };

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all');

  // Group by Month using robust getMonthInfo parser
  const monthlySummary = useMemo(() => {
    const map: Record<string, { key: string; label: string; count: number; batang: number; volume: number; nominal: number }> = {};

    data.forEach(item => {
      const { key, label } = getMonthInfo(item.tanggal);

      if (!map[key]) {
        map[key] = { key, label, count: 0, batang: 0, volume: 0, nominal: 0 };
      }

      const nom = typeof item.nominal === 'number'
        ? item.nominal
        : parseFloat(String(item.nominal || 0).replace(/[^0-9.-]+/g, '')) || 0;

      map[key].count += 1;
      map[key].batang += Number(item.batang) || 0;
      map[key].volume += Number(item.volume) || 0;
      map[key].nominal += nom;
    });

    return Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
  }, [data]);

  const filteredData = useMemo(() => {
    if (selectedMonthKey === 'all') return data;
    return data.filter(item => getMonthInfo(item.tanggal).key === selectedMonthKey);
  }, [data, selectedMonthKey]);

  const totalBatang = filteredData.reduce((sum, item) => sum + (Number(item.batang) || 0), 0);
  const totalVolume = filteredData.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);
  const totalPendapatan = filteredData.reduce((sum, item) => {
    const val = typeof item.nominal === 'number'
      ? item.nominal
      : parseFloat(String(item.nominal || 0).replace(/[^0-9.-]+/g, '')) || 0;
    return sum + val;
  }, 0);

  // If locked, show security access screen
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center bg-white rounded-3xl shadow-xs border border-slate-200/80 p-8 sm:p-12 min-h-[60vh] text-center max-w-md mx-auto my-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-3xl mb-6 shadow-inner border border-slate-200">
          <Lock className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Data Pendapatan (Rahasia)</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-xs">
          Informasi ini bersifat rahasia. Masukkan PIN keamanan Anda untuk melanjutkan.
        </p>

        <form onSubmit={handleUnlockSubmit} className="w-full space-y-4">
          <div>
            <input
              type="password"
              placeholder="••••••"
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              maxLength={6}
              className="border-2 border-slate-200 rounded-xl px-6 py-3 w-full text-center text-2xl tracking-[0.4em] focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none bg-slate-50 font-mono transition-all text-slate-800 font-bold"
            />
            {pinError && (
              <p className="text-rose-500 text-xs font-semibold bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl mt-3 flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> PIN yang Anda masukkan salah!
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-5 h-5" />
            <span>Buka Akses Pendapatan</span>
          </button>
        </form>
      </div>
    );
  }

  // Unlocked state view
  return (
    <div className="space-y-6">
      {/* Top Header & Stat Cards */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden space-y-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md border border-white/10 flex-shrink-0">
              <Vault className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-xs md:text-sm">
                Modul Pendapatan & Invoice
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                TPK Talok
              </h2>
            </div>
          </div>

          {/* Banner Action Buttons */}
          <div className="z-10 flex flex-wrap gap-2.5 w-full xl:w-auto xl:justify-end items-center">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Periode:</span>
              <select
                value={selectedMonthKey}
                onChange={e => setSelectedMonthKey(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-white">Semua Bulan ({data.length} Invoice)</option>
                {monthlySummary.map(m => (
                  <option key={m.key} value={m.key} className="bg-slate-900 text-white">
                    {m.label} ({m.count} Invoice)
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onExportCSV}
              className="bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2 text-blue-400" /> Unduh CSV
            </button>
            <button
              onClick={onOpenImportModal}
              className="bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2 text-purple-400" /> Import Data
            </button>
            <button
              onClick={onLock}
              className="bg-white/10 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 flex items-center justify-center cursor-pointer"
            >
              <Lock className="w-4 h-4 mr-2 text-rose-400" /> Kunci Modul
            </button>
            {data.length > 0 && (
              <button
                onClick={() => setIsConfirmDeleteAll(true)}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all backdrop-blur-md border border-rose-500/30 flex items-center justify-center cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2 text-rose-400" /> Hapus Semua
              </button>
            )}
            <button
              onClick={openAddModal}
              className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2" /> Tambah Pendapatan
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Total Pendapatan {selectedMonthKey !== 'all' ? `(${monthlySummary.find(m => m.key === selectedMonthKey)?.label})` : ''}
              </p>
              <p className="text-xl md:text-2xl font-black text-white">
                Rp {totalPendapatan.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Total Batang {selectedMonthKey !== 'all' ? `(${monthlySummary.find(m => m.key === selectedMonthKey)?.label})` : ''}
              </p>
              <p className="text-xl md:text-2xl font-black text-white">
                {totalBatang.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-300">BTG</span>
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Total Volume {selectedMonthKey !== 'all' ? `(${monthlySummary.find(m => m.key === selectedMonthKey)?.label})` : ''}
              </p>
              <p className="text-xl md:text-2xl font-black text-white">
                {totalVolume.toFixed(2)} <span className="text-sm font-normal text-slate-300">M³</span>
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Summary Breakdown Grid inside Banner */}
        {monthlySummary.length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Jumlah & Rincian Per Bulan ({monthlySummary.length} Bulan Terdata)
                </h4>
              </div>
              {selectedMonthKey !== 'all' && (
                <button
                  onClick={() => setSelectedMonthKey('all')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer"
                >
                  Tampilkan Semua Bulan
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {monthlySummary.map(m => {
                const isSelected = selectedMonthKey === m.key;
                return (
                  <div
                    key={m.key}
                    onClick={() => setSelectedMonthKey(isSelected ? 'all' : m.key)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-white">{m.label}</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-semibold text-slate-300">
                        {m.count} Invoice
                      </span>
                    </div>
                    <div className="text-lg font-black text-emerald-400">
                      Rp {m.nominal.toLocaleString('id-ID')}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-white/10">
                      <span><strong className="text-white">{m.batang.toLocaleString('id-ID')}</strong> BTG</span>
                      <span><strong className="text-white">{m.volume.toFixed(2)}</strong> M³</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>



      {/* Main Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Detail Riwayat Tagihan & Invoice</h3>
              <p className="text-xs text-slate-400">Pencatatan rincian per transaksi invoice penjualan kayu TPK Talok</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonthKey}
              onChange={e => setSelectedMonthKey(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Bulan ({data.length} Data)</option>
              {monthlySummary.map(m => (
                <option key={m.key} value={m.key}>
                  {m.label} ({m.count} Invoice)
                </option>
              ))}
            </select>
            {selectedMonthKey !== 'all' && (
              <button
                onClick={() => setSelectedMonthKey('all')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-sm text-slate-800 whitespace-nowrap border-collapse border border-slate-900">
            <thead className="bg-[#dce6f1] text-slate-900 font-bold border-b-2 border-slate-900 text-sm">
              <tr>
                <th className="py-2.5 px-3 text-center border border-slate-900">No</th>
                <th className="py-2.5 px-3 text-center border border-slate-900">Tgl</th>
                <th className="py-2.5 px-3 text-center border border-slate-900">No. Invoice</th>
                <th className="py-2.5 px-3 text-center border border-slate-900">BTG</th>
                <th className="py-2.5 px-3 text-center border border-slate-900">M3</th>
                <th className="py-2.5 px-3 text-center border border-slate-900">Nominal (Rp)</th>
                <th className="py-2.5 px-3 text-center border border-slate-900">Pembeli</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-800 font-medium border border-slate-300">{idx + 1}</td>
                  <td className="py-2.5 px-3 text-center font-medium text-slate-800 border border-slate-300">{item.tanggal}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900 border border-slate-300">{item.no_invoice}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-800 border border-slate-300">{item.batang ?? 0}</td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-800 border border-slate-300">
                    {item.volume ? Number(item.volume).toFixed(2) : '0'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700 border border-slate-300">
                    Rp {Number(item.nominal).toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 border border-slate-300">{item.pembeli}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic border border-slate-300">
                    Belum ada data invoice untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
              <h3 className="text-base font-bold text-slate-800">
                {editingItem ? 'Edit Data Pendapatan' : 'Tambah Data Pendapatan'}
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal (Tgl)</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">No. Invoice</label>
                  <input
                    type="text"
                    required
                    placeholder="INV-2026-001"
                    value={noInvoice}
                    onChange={e => setNoInvoice(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 uppercase text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Batang (BTG)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={batang}
                    onChange={e => setBatang(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Volume (M3)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    value={volume}
                    onChange={e => setVolume(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pembeli</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Pembeli / Perusahaan"
                  value={pembeli}
                  onChange={e => setPembeli(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 15000000"
                  value={nominal}
                  onChange={e => setNominal(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 font-bold text-emerald-700 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status Pembayaran</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as 'Lunas' | 'Belum Lunas')}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500 bg-slate-50 font-semibold text-sm"
                >
                  <option value="Lunas">Lunas</option>
                  <option value="Belum Lunas">Belum Lunas</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-500 transition-all mt-4 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Simpan Pendapatan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Satu Persatu */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Data Invoice?"
        message={`Apakah Anda yakin ingin menghapus invoice No. ${deletingItem?.no_invoice || ''} (${deletingItem?.pembeli || ''})? Data yang dihapus tidak dapat dikembalikan.`}
        onConfirm={() => {
          if (deletingItem) {
            onDeleteData(deletingItem.id);
            setDeletingItem(null);
          }
        }}
        onCancel={() => setDeletingItem(null)}
      />

      {/* Modal Konfirmasi Hapus Semua */}
      <ConfirmModal
        isOpen={isConfirmDeleteAll}
        title="Kosongkan Semua Data Pendapatan Invoice?"
        message="Semua catatan pendapatan invoice akan dihapus secara permanen. Apakah Anda yakin ingin melanjutkan?"
        onConfirm={() => {
          if (onDeleteAllData) {
            onDeleteAllData();
          }
          setIsConfirmDeleteAll(false);
        }}
        onCancel={() => setIsConfirmDeleteAll(false)}
      />
    </div>
  );
};
