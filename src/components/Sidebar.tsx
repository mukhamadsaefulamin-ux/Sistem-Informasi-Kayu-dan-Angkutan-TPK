import React from 'react';
import { HardDrive,
  Trees,
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Leaf,
  FileCheck,
  Printer,
  Receipt,
  FileSpreadsheet,
  LogOut,
  X,
  Lock,
  Unlock,
  Menu
} from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSwitchTab: (tab: TabType) => void;
  isOpen: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  onOpenImportModal: () => void;
  onOpenDriveBackupModal?: () => void;
  onLogout: () => void;
  isInvoiceUnlocked: boolean;
  userRole: 'admin' | 'anggota' | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSwitchTab,
  isOpen,
  onToggleExpand,
  onClose,
  onOpenImportModal,
  onOpenDriveBackupModal,
  onLogout,
  isInvoiceUnlocked,
  userRole
}) => {
  const menuItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Overview',
      category: 'Menu Utama',
      icon: <LayoutDashboard className="w-5 h-5 text-blue-400" />,
      activeClass: 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
    },
    {
      id: 'rekap_mutasi' as TabType,
      label: 'Rekap Mutasi Kapling',
      category: 'Menu Utama',
      icon: <FileSpreadsheet className="w-5 h-5 text-indigo-400" />,
      activeClass: 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
    },
    {
      id: 'dkp' as TabType,
      label: 'DKP Produksi',
      category: 'Manajemen Data Kayu',
      icon: <FileCheck className="w-5 h-5 text-emerald-400" />,
      activeClass: 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
    },
    {
      id: 'angkut' as TabType,
      label: 'Angkut Harian',
      category: 'Manajemen Data Kayu',
      icon: <ClipboardList className="w-5 h-5 text-blue-400" />,
      activeClass: 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
    },
    {
      id: 'ketiga' as TabType,
      label: 'Sisa Pihak Ketiga',
      category: 'Manajemen Data Kayu',
      icon: <Boxes className="w-5 h-5 text-amber-400" />,
      activeClass: 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
    },
    {
      id: 'perhutani' as TabType,
      label: 'Sisa Perhutani',
      category: 'Manajemen Data Kayu',
      icon: <Leaf className="w-5 h-5 text-emerald-400" />,
      activeClass: 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
    },
    {
      id: 'laporan' as TabType,
      label: 'Laporan Bulanan',
      category: 'Laporan & Integrasi',
      icon: <Printer className="w-5 h-5 text-purple-400" />,
      activeClass: 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
    },
    {
      id: 'invoice' as TabType,
      label: 'Pendapatan Invoice',
      category: 'Keuangan (Rahasia)',
      icon: <Receipt className="w-5 h-5 text-rose-400" />,
      restricted: true,
      activeClass: 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/20'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`bg-slate-900 text-slate-300 flex flex-col h-full no-print flex-shrink-0 fixed md:relative z-40 transition-all duration-300 ${
          isOpen
            ? 'w-72 translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        {/* COLLAPSED VIEW ON DESKTOP (When isOpen is false) */}
        {!isOpen && (
          <div className="hidden md:flex flex-col h-full w-full items-center py-4 justify-between">
            {/* Top Toggle Button (as in uploaded screenshot) */}
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={onToggleExpand}
                className="group relative w-11 h-11 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95"
                title="Tampilkan Sidebar"
              >
                <Menu className="w-5 h-5 text-slate-200" />
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap border border-slate-700 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 flex items-center gap-1.5">
                  <span>Tampilkan Menu</span>
                </div>
              </button>

              <div className="w-8 h-[1px] bg-slate-800 my-1" />

              {/* Icon Only Buttons */}
              <div className="flex flex-col gap-2">
                {menuItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSwitchTab(item.id)}
                      className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap border border-slate-700 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.restricted && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
                            {isInvoiceUnlocked ? 'Terbuka' : 'Terkunci'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {userRole === 'admin' && (
                <button
                  onClick={onOpenImportModal}
                  className="group relative w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap border border-slate-700 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                    Import CSV / Sheets
                  </div>
                </button>
                )}
              </div>
            </div>

            {/* Bottom Logout */}
            <button
              onClick={onLogout}
              className="group relative w-11 h-11 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-rose-400 text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap border border-slate-700 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                Keluar dari Sistem
              </div>
            </button>
          </div>
        )}

        {/* EXPANDED VIEW (When isOpen is true) */}
        {isOpen && (
          <div className="flex flex-col h-full w-full">
            {/* Brand Header */}
            <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
                  <Trees className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg leading-tight truncate">TPK Talok</h1>
                  <p className="text-xs text-slate-400 font-medium">Sistem Informasi Kayu</p>
                </div>
              </div>

              {/* Menu Toggle Button (matches uploaded image styling) */}
              <button
                type="button"
                onClick={onToggleExpand}
                className="group relative w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 flex-shrink-0"
                title="Sembunyikan Sidebar"
              >
                <Menu className="w-5 h-5 text-slate-200" />
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap border border-slate-700 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                  Sembunyikan Menu
                </div>
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onClose}
                className="md:hidden w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
              {/* Menu Utama */}
              <div>
                <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Menu Utama
                </p>
                <button
                  onClick={() => {
                    onSwitchTab('dashboard');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium text-sm ${
                    currentTab === 'dashboard'
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5 text-blue-400" />
                  <span>Dashboard Overview</span>
                </button>
                <button
                  onClick={() => {
                    onSwitchTab('rekap_mutasi');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium text-sm ${
                    currentTab === 'rekap_mutasi'
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  <span>Rekap Mutasi Kapling</span>
                </button>

              </div>

              {/* Manajemen Data Kayu */}
              <div>
                <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Manajemen Data Kayu
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSwitchTab('dkp');
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium text-sm ${
                      currentTab === 'dkp'
                        ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <span>DKP Produksi</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchTab('angkut');
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium text-sm ${
                      currentTab === 'angkut'
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <ClipboardList className="w-5 h-5 text-blue-400" />
                    <span>Angkut Harian</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchTab('ketiga');
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium text-sm ${
                      currentTab === 'ketiga'
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Boxes className="w-5 h-5 text-amber-400" />
                    <span>Sisa Pihak Ketiga</span>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchTab('perhutani');
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium text-sm ${
                      currentTab === 'perhutani'
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Leaf className="w-5 h-5 text-emerald-400" />
                    <span>Sisa Perhutani</span>
                  </button>
                </div>
              </div>

              {/* Laporan & Utilities */}
              <div>
                <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Laporan & Integrasi
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSwitchTab('laporan');
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors font-medium text-sm ${
                      currentTab === 'laporan'
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Printer className="w-5 h-5 text-purple-400" />
                    <span>Laporan Bulanan</span>
                  </button>

                  {userRole === 'admin' && (
      <>
        <button
          onClick={() => {
            onOpenImportModal();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/10 transition-colors text-slate-300 font-medium text-sm cursor-pointer"
        >
          <FileSpreadsheet className="w-5 h-5 text-teal-400" />
          <span>Import CSV / Sheets</span>
        </button>
        <button
          onClick={() => {
            if (onOpenDriveBackupModal) onOpenDriveBackupModal();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/10 transition-colors text-slate-300 font-medium text-sm cursor-pointer"
        >
          <HardDrive className="w-5 h-5 text-blue-400" />
          <span>Google Drive Backup</span>
        </button>
      </>
  )}
                </div>
              </div>

              {/* Keuangan */}
              <div>
                <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Keuangan (Rahasia)
                </p>
                <button
                  onClick={() => {
                    onSwitchTab('invoice');
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors font-medium text-sm ${
                    currentTab === 'invoice'
                      ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-600/20'
                      : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Receipt className="w-5 h-5 text-rose-400" />
                    <span>Pendapatan Invoice</span>
                  </div>
                  {isInvoiceUnlocked ? (
                    <Unlock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>
            </nav>

            {/* Footer Logout Button */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Sistem</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

