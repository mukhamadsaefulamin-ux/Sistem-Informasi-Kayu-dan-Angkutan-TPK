import React from 'react';
import { Menu, Cloud, UserCheck, Lock, Unlock, LogOut } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onToggleSidebar: () => void;
  userRole: 'admin' | 'anggota' | null;
  onLogout: () => void;
  isInvoiceUnlocked: boolean;
  onLockInvoice: () => void;
}

const tabTitles: Record<TabType, string> = {
  dashboard: 'Ringkasan Sistem TPK Talok',
  dkp: 'Dokumen Kayu Produksi (DKP)',
  angkut: 'Manajemen Angkutan Harian Kayu',
  ketiga: 'Manajemen Sisa Pihak Ketiga',
  perhutani: 'Manajemen Sisa Perhutani',
  laporan: 'Laporan & Rekapitulasi Bulanan',
  rekap_mutasi: 'Rekap Mutasi Kapling',
  invoice: 'Data Pendapatan (Restricted)'
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onToggleSidebar,
  userRole,
  onLogout,
  isInvoiceUnlocked,
  onLockInvoice
}) => {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 md:px-8 no-print flex-shrink-0 w-full sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="group relative w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 flex items-center justify-center border border-slate-700/80 active:scale-95 transition-all shadow-md cursor-pointer flex-shrink-0"
          title="Tampilkan / Sembunyikan Menu"
        >
          <Menu className="w-5 h-5 text-slate-200" />
          <div className="absolute left-full ml-2.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap border border-slate-700 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 flex items-center gap-1.5">
            <span>Tampilkan Menu</span>
          </div>
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">
            {tabTitles[currentTab]}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            TPK Talok • Sistem Informasi Stok & Angkutan Kayu
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        {/* Cloud Storage Indicator */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200/80 shadow-xs"
          title="Data tersimpan otomatis dan aman di Cloud Database (Real-time)"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud Storage Aktif</span>
        </div>

        {/* Invoice lock indicator if in invoice tab or unlocked */}
        {isInvoiceUnlocked && (
          <button
            onClick={onLockInvoice}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full hover:bg-rose-200 transition-colors border border-rose-200"
            title="Kunci Modul Pendapatan"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Akses Terbuka</span>
          </button>
        )}

        {/* User Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {userRole === 'admin' ? 'AD' : 'AG'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {userRole === 'admin' ? 'Admin TPK Talok' : 'Anggota TPK'}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </p>
          </div>
          <button
            onClick={onLogout}
            className="ml-1 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
