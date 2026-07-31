import React, { useMemo } from 'react';
import { Truck, Boxes, Leaf, TrendingUp, Calendar, Layers, ArrowUpRight, Building2, TreePine } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { DataAngkut, DataKetiga, DataPerhutani } from '../types';

interface DashboardTabProps {
  filterDate: string;
  onFilterDateChange: (date: string) => void;
  dataAngkut: DataAngkut[];
  dataKetiga: DataKetiga[];
  dataPerhutani: DataPerhutani[];
  onNavigateTab: (tab: any) => void;
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

export const DashboardTab: React.FC<DashboardTabProps> = ({ filterDate, onFilterDateChange, 
  dataAngkut,
  dataKetiga,
  dataPerhutani,
  onNavigateTab
}) => {
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  }, []);

  // Filter current month daily haul items
  const filteredAngkut = useMemo(() => {
    return dataAngkut.filter(item => {
      if (!filterDate) return true; // wait, if they say "Jika pengguna memilih", we should default to all or no? Let's say all for now, but the metrics depend on it.
      return normalizeDateString(item.tanggal) === filterDate;
    });
  }, [dataAngkut, filterDate]);

  // Aggregate totals
  const totalRitase = filteredAngkut.length;
  
  const totalDKHP = useMemo(() => {
    const dkhpSet = new Set<string>();
    filteredAngkut.forEach(item => {
      if (item.no_dkhp && item.no_dkhp !== '-') dkhpSet.add(item.no_dkhp);
    });
    return dkhpSet.size > 0 ? dkhpSet.size : filteredAngkut.length;
  }, [filteredAngkut]);
  
  const totalBatang = useMemo(() => {
    return filteredAngkut.reduce((sum, item) => sum + Number(item.batang || 0), 0);
  }, [filteredAngkut]);
  
  const totalKapling = useMemo(() => {
    const kaplingSet = new Set<string>();
    filteredAngkut.forEach(item => {
      if (item.kapling && item.kapling !== '-') kaplingSet.add(item.kapling);
    });
    return kaplingSet.size;
  }, [filteredAngkut]);

  const totalVolAngkutBulanIni = useMemo(() => {
    return filteredAngkut.reduce((sum, item) => sum + Number(item.volume || 0), 0);
  }, [filteredAngkut]);

  
  

  

  


  
  const sisaPihakKetigaGroups = useMemo(() => {
    const groups: Record<string, { kapling: Set<string>; batang: number; volume: number }> = {};
    
    dataKetiga.forEach(item => {
      let terangkutBatang = 0;
      let terangkutVolume = 0;
      dataAngkut?.forEach(ang => {
        if (
          ang.kapling.trim().toLowerCase() === item.kapling.trim().toLowerCase() &&
          ang.blok.trim().toLowerCase() === item.blok.trim().toLowerCase()
        ) {
          const isMatchSortimen = !ang.sortimen || ang.sortimen === '-' || ang.sortimen.trim().toLowerCase() === item.sortimen.trim().toLowerCase() || ang.sortimen.trim().toLowerCase() === (item.jenis || '').trim().toLowerCase();
          if (isMatchSortimen) {
            terangkutBatang += Number(ang.batang) || 0;
            terangkutVolume += Number(ang.volume) || 0;
          }
        }
      });
      const sBtg = Math.max(0, (item.batang || 0) - terangkutBatang);
      const sVol = Math.max(0, (item.volume || 0) - terangkutVolume);

      if (sBtg > 0 || sVol > 0) {
        const jenis = (item.jenis || 'Lainnya').trim().toUpperCase();
        if (!groups[jenis]) {
          groups[jenis] = { kapling: new Set(), batang: 0, volume: 0 };
        }
        if (item.kapling && item.kapling !== '-') {
          groups[jenis].kapling.add(item.kapling.trim().toLowerCase());
        }
        groups[jenis].batang += sBtg;
        groups[jenis].volume += sVol;
      }
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => a.localeCompare(b)).map(k => ({
      jenis: k,
      kaplingCount: groups[k].kapling.size,
      batang: groups[k].batang,
      volume: groups[k].volume
    }));

    return sortedGroups;
  }, [dataKetiga, dataAngkut]);

  const sisaPerhutaniGroups = useMemo(() => {
    const groups: Record<string, { kapling: Set<string>; batang: number; volume: number }> = {};
    
    dataPerhutani.forEach(item => {
      const sBtg = Number(item.batang || 0);
      const sVol = Number(item.volume || 0);

      if (sBtg > 0 || sVol > 0) {
        const jenis = (item.jenis || 'Lainnya').trim().toUpperCase();
        if (!groups[jenis]) {
          groups[jenis] = { kapling: new Set(), batang: 0, volume: 0 };
        }
        if (item.kapling && item.kapling !== '-') {
          groups[jenis].kapling.add(item.kapling.trim().toLowerCase());
        }
        groups[jenis].batang += sBtg;
        groups[jenis].volume += sVol;
      }
    });

    const sortedGroups = Object.keys(groups).sort((a, b) => a.localeCompare(b)).map(k => ({
      jenis: k,
      kaplingCount: groups[k].kapling.size,
      batang: groups[k].batang,
      volume: groups[k].volume
    }));

    return sortedGroups;
  }, [dataPerhutani]);

  // Chart data: daily volume breakdown
  const dailyChartData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    filteredAngkut.forEach(item => {
      const day = item.tanggal.split('-')[2];
      dayMap[day] = (dayMap[day] || 0) + Number(item.volume || 0);
    });

    return Object.keys(dayMap)
      .sort((a, b) => Number(a) - Number(b))
      .map(day => ({
        tgl: `Tgl ${day}`,
        volume: Number(dayMap[day].toFixed(2))
      }));
  }, [filteredAngkut]);

  // Species composition data for bar chart
  const speciesChartData = useMemo(() => {
    const speciesMap: Record<string, number> = {};
    dataAngkut.forEach(item => {
      const species = item.sortimen || item.jenis || 'Lainnya';
      speciesMap[species] = (speciesMap[species] || 0) + Number(item.volume || 0);
    });

    return Object.keys(speciesMap).map(sp => ({
      jenis: sp,
      volume: Number(speciesMap[sp].toFixed(2))
    }));
  }, [dataAngkut]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard & Statistik</h2>
          <p className="text-sm text-slate-500 mt-1">
            {filterDate ? `Data Angkutan Tanggal: ${formatDateIndoLabel(filterDate)}` : 'Menampilkan semua data angkutan (Silakan pilih tanggal untuk memfilter)'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] text-slate-600 font-medium">Filter Tanggal</label>
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
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer self-end"
              >
                Reset Filter
              </button>
            )}
        </div>
      </div>

      {filterDate && filteredAngkut.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center shadow-sm">
          <p className="text-amber-800 font-semibold">Tidak ada data angkutan pada tanggal ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total DKHP */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl z-10 flex-shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Total DKHP
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800">
                {totalDKHP} <span className="text-sm font-normal text-slate-400">Dokumen</span>
              </h3>
            </div>
          </div>

          {/* Card 2: Total Volume */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl z-10 flex-shrink-0">
              <Truck className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Total Volume
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800">
                {totalVolAngkutBulanIni.toFixed(2)}{' '}
                <span className="text-sm font-normal text-slate-400">m³</span>
              </h3>
            </div>
          </div>

          {/* Card 3: Total Batang */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl z-10 flex-shrink-0">
              <Boxes className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Total Batang
              </p>
              <h3 className="text-3xl font-extrabold text-slate-800">
                {totalBatang} <span className="text-sm font-normal text-slate-400">Batang</span>
              </h3>
            </div>
          </div>

          {/* Card 4: Total Kapling */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex items-center gap-5 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl z-10 flex-shrink-0">
              <Leaf className="w-7 h-7" />
            </div>
            <div className="z-10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Kapling Terangkut
              </p>
              <h3 className="text-3xl font-extrabold text-purple-900">
                {totalKapling} <span className="text-sm font-normal text-slate-400">Kapling</span>
              </h3>
            </div>
          </div>
        </div>
      )}
      
      
      {/* Sisa Kayu Section */}
      <div className="mt-12 mb-6 flex items-center gap-4 border-t border-slate-200/80 pt-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Total Sisa Kayu Pihak Ketiga</h2>
          <p className="text-sm text-slate-500 mt-1">
            Akumulasi sisa stok milik Pihak Ketiga dikelompokkan berdasarkan jenis kayu
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {sisaPihakKetigaGroups.map(group => (
          <div key={group.jenis} className="bg-slate-900 rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all text-white">
            <h3 className="text-xl font-black text-white mb-5 uppercase tracking-wide">{group.jenis}</h3>
            
            <div className="flex flex-col gap-4 z-10">
              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Kapling</span>
                </div>
                <span className="text-lg font-bold text-white">{group.kaplingCount}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-amber-400 flex items-center justify-center">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Batang</span>
                </div>
                <span className="text-lg font-bold text-white">{group.batang}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-blue-400 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Volume</span>
                </div>
                <span className="text-lg font-black text-amber-400">{group.volume.toFixed(2)} <span className="text-xs font-normal text-amber-400/60">m³</span></span>
              </div>
            </div>
          </div>
        ))}
        {sisaPihakKetigaGroups.length === 0 && (
          <div className="col-span-full py-10 bg-slate-50 border border-slate-200/80 rounded-3xl text-center text-slate-500 italic">
            Belum ada sisa stok pihak ketiga
          </div>
        )}
      </div>

      <div className="mt-12 mb-6 flex items-center gap-4 border-t border-slate-200/80 pt-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Total Sisa Kayu Perhutani</h2>
          <p className="text-sm text-slate-500 mt-1">
            Akumulasi sisa stok milik Perhutani dikelompokkan berdasarkan jenis kayu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {sisaPerhutaniGroups.map(group => (
          <div key={group.jenis} className="bg-emerald-950 rounded-3xl p-6 shadow-md border border-emerald-900/50 flex flex-col relative overflow-hidden group hover:shadow-lg transition-all text-white">
            <h3 className="text-xl font-black text-white mb-5 uppercase tracking-wide">{group.jenis}</h3>
            
            <div className="flex flex-col gap-4 z-10">
              <div className="flex justify-between items-center bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-300 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Kapling</span>
                </div>
                <span className="text-lg font-bold text-white">{group.kaplingCount}</span>
              </div>

              <div className="flex justify-between items-center bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Batang</span>
                </div>
                <span className="text-lg font-bold text-white">{group.batang}</span>
              </div>

              <div className="flex justify-between items-center bg-emerald-900/60 p-3 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-800 text-blue-300 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Volume</span>
                </div>
                <span className="text-lg font-black text-amber-400">{group.volume.toFixed(2)} <span className="text-xs font-normal text-amber-400/60">m³</span></span>
              </div>
            </div>
          </div>
        ))}
        {sisaPerhutaniGroups.length === 0 && (
          <div className="col-span-full py-10 bg-slate-50 border border-slate-200/80 rounded-3xl text-center text-slate-500 italic">
            Belum ada sisa stok Perhutani
          </div>
        )}
      </div>

      {/* Visual Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Volume Angkut Harian Bulan Ini */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Grafik Volume Angkut Harian
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tren pengangkutan kayu dalam m³</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {filterDate ? formatDateIndoLabel(filterDate) : "Semua Waktu"}
            </span>
          </div>

          <div className="h-72 w-full">
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="tgl" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    name="Volume (m³)"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <p>Belum ada data angkutan untuk bulan ini.</p>
                <button
                  onClick={() => onNavigateTab('angkut')}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
                >
                  + Tambah Angkut Harian
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart: Species Composition */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Komposisi Jenis Kayu
            </h3>
            <p className="text-xs text-slate-400 mb-4">Volume berdasarkan jenis kayu (Jati, Mahoni, etc)</p>

            <div className="h-60 w-full">
              {speciesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={speciesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="jenis" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="volume" name="Volume (m³)" fill="#059669" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Tidak ada data kayu.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

          </div>
  );
};
