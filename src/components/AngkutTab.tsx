import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  FileSpreadsheet,
  FileText,
  Package,
  Layers,
  Truck,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { exportToPDF } from '../utils/pdfExport';
import { DataAngkut } from '../types';

interface AngkutTabProps {
  filterDate: string;
  onFilterDateChange: (date: string) => void;
  userRole?: 'admin' | 'anggota' | null;
  data: DataAngkut[];
  dataKetiga?: any;
  onExportCSV: () => void;
  // Legacy optional props for compatibility
  onAddData?: (item: Omit<DataAngkut, 'id'>) => void;
  onUpdateData?: (id: string, item: Omit<DataAngkut, 'id'>) => void;
  onDeleteData?: (id: string) => void;
  onConfirmDeleteAll?: () => void;
}

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

// Format date string to DD/MM/YYYY for table display
const formatDateTable = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const norm = normalizeDateString(dateStr);
    const parts = norm.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

// Format date to Indonesian text representation for datepicker label e.g., "27 Juli 2026"
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

export const AngkutTab: React.FC<AngkutTabProps> = ({ filterDate, onFilterDateChange, 
  userRole, dataKetiga, data, onExportCSV, onConfirmDeleteAll }) => {
    
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Unique list of dates available in data
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    data.forEach(item => {
      if (item.tanggal) set.add(normalizeDateString(item.tanggal));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [data]);

  // Filtered dataset by date and search query
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        (item.no_dkhp && item.no_dkhp.toLowerCase().includes(q)) ||
        (item.supir && item.supir.toLowerCase().includes(q)) ||
        (item.nopol && item.nopol.toLowerCase().includes(q)) ||
        (item.kapling && item.kapling.toLowerCase().includes(q)) ||
        (item.blok && item.blok.toLowerCase().includes(q)) ||
        (item.sortimen && item.sortimen.toLowerCase().includes(q)) ||
        (item.tujuan && item.tujuan.toLowerCase().includes(q)) ||
        (item.alamat && item.alamat.toLowerCase().includes(q));

            const matchDate = !filterDate || normalizeDateString(item.tanggal) === filterDate;

      return matchSearch && matchDate;
    });
  }, [dataKetiga, data, searchQuery, filterDate]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, safeCurrentPage, itemsPerPage]);

  // Summary Metrics calculations
  const totalDKHPCount = useMemo(() => {
    const dkhpSet = new Set<string>();
    filteredData.forEach(item => {
      if (item.no_dkhp && item.no_dkhp !== '-') {
        dkhpSet.add(item.no_dkhp);
      }
    });
    return dkhpSet.size > 0 ? dkhpSet.size : filteredData.length;
  }, [filteredData]);

  const totalVolume = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + Number(item.volume || 0), 0);
  }, [filteredData]);

  const totalBatang = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + Number(item.batang || 0), 0);
  }, [filteredData]);

  const totalKapling = useMemo(() => {
    const kaplingSet = new Set<string>();
    filteredData.forEach(item => {
      if (item.kapling && item.kapling !== '-') kaplingSet.add(item.kapling);
    });
    return kaplingSet.size;
  }, [filteredData]);

  const totalRitase = filteredData.length;

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* 1. TOP BAR: Date Picker & Filter Action + Export Excel */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Date Filter & Tampilkan Button */}
        <div className="flex flex-wrap items-end gap-3 md:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-slate-600 font-medium">Tanggal</label>
              <div className="relative flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm min-w-[200px] h-10">
                <div className="flex-1 flex items-center justify-between text-[13px] text-slate-700">
                  <span className={filterDate ? 'text-slate-800 font-bold' : 'text-slate-400'}>{filterDate ? formatDateIndoLabel(filterDate) : 'Semua Tanggal'}</span>
                  <Calendar className="w-4 h-4 text-slate-600 ml-2 pointer-events-none" />
                </div>
                <input
                  type="date"
                  value={filterDate}
                  onChange={e => {
                    onFilterDateChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-slate-600 font-medium opacity-0">Dropdown</label>
              <div className="bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm flex items-center min-w-[180px] h-10 relative">
                <select
                  value={filterDate}
                  onChange={e => {
                    onFilterDateChange(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-[13px] text-slate-700 bg-transparent outline-none cursor-pointer w-full appearance-none pr-6"
                >
                  <option value="">Semua Tanggal</option>
                  {availableDates.map(d => (
                    <option key={d} value={d}>
                      {formatDateIndoLabel(d)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
            
            {filterDate && (
              <button
                onClick={() => {
                  onFilterDateChange('');
                  setCurrentPage(1);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer ml-2 h-10 flex items-center"
              >
                Reset
              </button>
            )}
          </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {userRole === 'admin' && (
            <button
              onClick={onConfirmDeleteAll}
              className="bg-white hover:bg-red-50 border border-red-200 text-red-600 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <div className="bg-red-100 text-red-600 p-1 rounded font-bold text-[10px]">
                <Trash2 className="w-3.5 h-3.5" />
              </div>
              <span>Hapus Semua</span>
            </button>
          )}
          
          {/* Export PDF Button */}
          <button
            onClick={() => {
              const cols = ['No. DKHP', 'Tanggal', 'Supir', 'Nopol', 'Kapling', 'Blok', 'Tujuan', 'Alamat', 'Total Batang', 'Total Volume (m3)', 'Status'];
              const rows = filteredData.map(item => [
                item.no_dkhp,
                item.tanggal,
                item.supir,
                item.nopol,
                item.kapling,
                item.blok,
                item.tujuan,
                item.alamat,
                item.batang?.toString() || '0',
                item.volume?.toString() || '0',
                item.status
              ]);
              exportToPDF('Data Angkut Harian', cols, rows, 'Data_Angkut');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          
          {/* Export Excel Button */}

          <button
            onClick={onExportCSV}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <div className="bg-emerald-100 text-emerald-800 p-1 rounded font-bold text-[10px]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* 2. TOP KPI CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total DKHP */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total DKHP</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalDKHPCount}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Dokumen</p>
          </div>
        </div>

        {/* Card 2: Total Volume */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Volume</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {formatNumberIndo(totalVolume, 2)}
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">m³</p>
          </div>
        </div>

        {/* Card 3: Total Batang */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Batang</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalBatang}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Batang</p>
          </div>
        </div>

        {/* Card 4: Total Kapling */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-full bg-purple-100/70 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Kapling</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalKapling}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Kapling Terangkut</p>
          </div>
        </div>
      </div>

      {/* 3. MAIN DATA TABLE CARD ("Data Angkut Harian") */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Card Header */}
        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Data Angkut Harian</h3>

          {/* Search Bar */}
          <div className="w-full sm:w-72 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 flex items-center justify-between">
            <input
              type="text"
              placeholder="Cari DKHP, Tujuan, Supir..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs outline-none text-slate-700 placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 text-slate-800 font-bold border-b border-slate-200/80">
                <th className="py-3 px-4 text-center w-10 border-r border-slate-100">No.</th>
                <th className="py-3 px-4 border-r border-slate-100">No. DKHP</th>
                <th className="py-3 px-4 border-r border-slate-100">Tanggal</th>
                <th className="py-3 px-4 border-r border-slate-100">Supir</th>
                <th className="py-3 px-4 border-r border-slate-100">Nopol</th>
                <th className="py-3 px-4 border-r border-slate-100">No. Kapling</th>
                <th className="py-3 px-4 border-r border-slate-100">No. Blok</th>
                <th className="py-3 px-4 border-r border-slate-100">Sortimen</th>
                <th className="py-3 px-4 border-r border-slate-100">Tujuan</th>
                <th className="py-3 px-4 border-r border-slate-100">Alamat</th>
                <th className="py-3 px-4 text-center border-r border-slate-100">Total Batang</th>
                <th className="py-3 px-4 text-right border-r border-slate-100">Total Volume</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
              {paginatedData.map((item, idx) => {
                const rowNo = (safeCurrentPage - 1) * itemsPerPage + idx + 1;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                      {rowNo}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {item.no_dkhp || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDateTable(item.tanggal)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {item.supir || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 uppercase">
                      {item.nopol || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.kapling || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.blok || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                        {item.sortimen || item.jenis || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {item.tujuan || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={item.alamat || ''}>
                      {item.alamat || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-800">
                      {item.batang || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatNumberIndo(Number(item.volume || 0), 2)} m³
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.status === 'Selesai' || item.status === 'Terkirim'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Dalam Perjalanan'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status || 'Selesai'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 italic">
                    Tidak ada data angkutan harian yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <div>
            {totalItems > 0 ? (
              <span>
                Menampilkan{' '}
                <strong>{(safeCurrentPage - 1) * itemsPerPage + 1}</strong> -{' '}
                <strong>{Math.min(safeCurrentPage * itemsPerPage, totalItems)}</strong> dari{' '}
                <strong>{totalItems}</strong> data
              </span>
            ) : (
              <span>Menampilkan 0 data</span>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-7 h-7 rounded-lg border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer transition-colors ${
                    page === safeCurrentPage
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-7 h-7 rounded-lg border border-slate-200/80 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
              >
                <ChevronRight
  className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
