import React, { useState, useEffect, useRef } from 'react';
import { TabType, DataAngkut, DataKetiga, DataPerhutani, DataDKP, DataInvoice } from './types';
import {
  loadDataAngkut,
  saveDataAngkut,
  loadDataKetiga,
  saveDataKetiga,
  loadDataPerhutani,
  saveDataPerhutani,
  loadDataDKP,
  saveDataDKP,
  loadDataInvoice,
  saveDataInvoice,
  exportToCSV,
  clearAllStoredData
} from './lib/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { DashboardTab } from './components/DashboardTab';
import { AngkutTab } from './components/AngkutTab';
import { KetigaTab } from './components/KetigaTab';
import { PerhutaniTab } from './components/PerhutaniTab';
import { DKPTab } from './components/DKPTab';
import { LaporanTab } from './components/LaporanTab';
import { InvoiceTab } from './components/InvoiceTab';
import { ImportModal } from './components/ImportModal';
import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default logged in for smooth immediate access
  const [userEmail, setUserEmail] = useState<string | null>('Admin TPK Talok');

  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);

  // Security Lock State for Restricted Invoice Tab
  const [isInvoiceUnlocked, setIsInvoiceUnlocked] = useState(false);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core Data Collections
  const [dataAngkut, setDataAngkut] = useState<DataAngkut[]>([]);
  const [dataKetiga, setDataKetiga] = useState<DataKetiga[]>([]);
  const [dataPerhutani, setDataPerhutani] = useState<DataPerhutani[]>([]);
  const [dataDKP, setDataDKP] = useState<DataDKP[]>([]);
  const [dataInvoice, setDataInvoice] = useState<DataInvoice[]>([]);

  // Initial Data Load - Empty all data on request
  const refreshAllData = () => {
    setDataAngkut(loadDataAngkut());
    setDataKetiga(loadDataKetiga());
    setDataPerhutani(loadDataPerhutani());
    setDataDKP(loadDataDKP());
    setDataInvoice(loadDataInvoice());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Auto-lock invoice timer logic
  const resetInvoiceTimer = () => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    if (isInvoiceUnlocked) {
      lockTimerRef.current = setTimeout(() => {
        setIsInvoiceUnlocked(false);
      }, 60000); // 60 seconds auto-lock
    }
  };

  useEffect(() => {
    if (isInvoiceUnlocked) {
      resetInvoiceTimer();
    }
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [isInvoiceUnlocked]);

  // Lock invoice when switching tabs away from invoice
  const handleSwitchTab = (tab: TabType) => {
    if (tab !== 'invoice' && isInvoiceUnlocked) {
      setIsInvoiceUnlocked(false);
    }
    setCurrentTab(tab);
  };

  const handleUnlockInvoice = (pin: string) => {
    if (pin === '072026' || pin === '123456') {
      setIsInvoiceUnlocked(true);
      return true;
    }
    return false;
  };

  const handleLockInvoice = () => {
    setIsInvoiceUnlocked(false);
  };

  // CRUD Handlers for DataAngkut
  const handleAddAngkut = (item: Omit<DataAngkut, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataAngkut.some(d => {
        let match = true;
        if (d.no_dkhp !== '-' && item.no_dkhp !== '-') {
            if (!matchStr(d.no_dkhp, item.no_dkhp)) match = false;
        }
        if (!matchStr(d.kapling, item.kapling)) match = false;
        if (!matchStr(d.blok, item.blok)) match = false;
        if (!matchStr(d.sortimen, item.sortimen) && !matchStr(d.jenis, item.jenis)) match = false;
        if (item.batang > 0 && d.batang > 0 && d.batang !== item.batang) match = false;
        if (!matchStr(d.nopol, item.nopol)) match = false;
        return match;
    });
    if (isDuplicate) {
        alert('Gagal: Data ganda terdeteksi (DKHP/Kapling/Blok/Sortimen/Nopol sama).');
        return;
    }

    const newItem: DataAngkut = { ...item, id: 'ang-' + Date.now() };
    const updated = [newItem, ...dataAngkut];
    setDataAngkut(updated);
    saveDataAngkut(updated);
  };

  const handleUpdateAngkut = (id: string, item: Omit<DataAngkut, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataAngkut.some(d => {
        if (d.id === id) return false;
        let match = true;
        if (d.no_dkhp !== '-' && item.no_dkhp !== '-') {
            if (!matchStr(d.no_dkhp, item.no_dkhp)) match = false;
        }
        if (!matchStr(d.kapling, item.kapling)) match = false;
        if (!matchStr(d.blok, item.blok)) match = false;
        if (!matchStr(d.sortimen, item.sortimen) && !matchStr(d.jenis, item.jenis)) match = false;
        if (item.batang > 0 && d.batang > 0 && d.batang !== item.batang) match = false;
        if (!matchStr(d.nopol, item.nopol)) match = false;
        return match;
    });
    if (isDuplicate) {
        alert('Gagal: Data ganda terdeteksi (DKHP/Kapling/Blok/Sortimen/Nopol sama).');
        return;
    }

    const updated = dataAngkut.map(d => (d.id === id ? { ...item, id } : d));
    setDataAngkut(updated);
    saveDataAngkut(updated);
  };

  const handleDeleteAngkut = (id: string) => {
    const updated = dataAngkut.filter(d => d.id !== id);
    setDataAngkut(updated);
    saveDataAngkut(updated);
  };

  const handleConfirmDeleteAllAngkut = () => {
    setDataAngkut([]);
    saveDataAngkut([]);
    setIsConfirmDeleteAllOpen(false);
  };

  // CRUD Handlers for DataKetiga
  const handleAddKetiga = (item: Omit<DataKetiga, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataKetiga.some(d => matchStr(d.kapling, item.kapling) && matchStr(d.blok, item.blok) && matchStr(d.pembeli, item.pembeli) && matchStr(d.jenis, item.jenis) && d.batang === item.batang && d.volume === item.volume);
    if (isDuplicate) {
        alert('Gagal: Data Sisa Pihak Ketiga ganda terdeteksi.');
        return;
    }

    const newItem: DataKetiga = { ...item, id: 'ktg-' + Date.now() };
    const updated = [newItem, ...dataKetiga];
    setDataKetiga(updated);
    saveDataKetiga(updated);
  };

  const handleUpdateKetiga = (id: string, item: Omit<DataKetiga, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataKetiga.some(d => d.id !== id && matchStr(d.kapling, item.kapling) && matchStr(d.blok, item.blok) && matchStr(d.pembeli, item.pembeli) && matchStr(d.jenis, item.jenis) && d.batang === item.batang && d.volume === item.volume);
    if (isDuplicate) {
        alert('Gagal: Data Sisa Pihak Ketiga ganda terdeteksi.');
        return;
    }

    const updated = dataKetiga.map(d => (d.id === id ? { ...item, id } : d));
    setDataKetiga(updated);
    saveDataKetiga(updated);
  };

  const handleDeleteKetiga = (id: string) => {
    const updated = dataKetiga.filter(d => d.id !== id);
    setDataKetiga(updated);
    saveDataKetiga(updated);
  };

  // CRUD Handlers for DataPerhutani
  const handleAddPerhutani = (item: Omit<DataPerhutani, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataPerhutani.some(d => matchStr(d.kapling, item.kapling) && matchStr(d.blok, item.blok) && matchStr(d.tgl_kapling, item.tgl_kapling) && d.batang === item.batang && d.volume === item.volume);
    if (isDuplicate) {
        alert('Gagal: Data Sisa Perhutani ganda terdeteksi.');
        return;
    }

    const newItem: DataPerhutani = { ...item, id: 'pht-' + Date.now() };
    const updated = [newItem, ...dataPerhutani];
    setDataPerhutani(updated);
    saveDataPerhutani(updated);
  };

  const handleUpdatePerhutani = (id: string, item: Omit<DataPerhutani, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataPerhutani.some(d => d.id !== id && matchStr(d.kapling, item.kapling) && matchStr(d.blok, item.blok) && matchStr(d.tgl_kapling, item.tgl_kapling) && d.batang === item.batang && d.volume === item.volume);
    if (isDuplicate) {
        alert('Gagal: Data Sisa Perhutani ganda terdeteksi.');
        return;
    }

    const updated = dataPerhutani.map(d => (d.id === id ? { ...item, id } : d));
    setDataPerhutani(updated);
    saveDataPerhutani(updated);
  };

  const handleDeletePerhutani = (id: string) => {
    const updated = dataPerhutani.filter(d => d.id !== id);
    setDataPerhutani(updated);
    saveDataPerhutani(updated);
  };

  // CRUD Handlers for DataDKP
  const handleAddDKP = (item: Omit<DataDKP, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataDKP.some(d => {
        if (item.no_dkp !== '-' && d.no_dkp !== '-') {
            if (matchStr(d.no_dkp, item.no_dkp)) return true;
        }
        return matchStr(d.kapling, item.kapling) && matchStr(d.tanggal, item.tanggal) && d.batang === item.batang && d.volume === item.volume;
    });
    if (isDuplicate) {
        alert('Gagal: Data DKP ganda terdeteksi.');
        return;
    }

    const newItem: DataDKP = { ...item, id: 'dkp-' + Date.now() };
    const updated = [newItem, ...dataDKP];
    setDataDKP(updated);
    saveDataDKP(updated);
  };

  const handleUpdateDKP = (id: string, item: Omit<DataDKP, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataDKP.some(d => {
        if (d.id === id) return false;
        if (item.no_dkp !== '-' && d.no_dkp !== '-') {
            if (matchStr(d.no_dkp, item.no_dkp)) return true;
        }
        return matchStr(d.kapling, item.kapling) && matchStr(d.tanggal, item.tanggal) && d.batang === item.batang && d.volume === item.volume;
    });
    if (isDuplicate) {
        alert('Gagal: Data DKP ganda terdeteksi.');
        return;
    }

    const updated = dataDKP.map(d => (d.id === id ? { ...item, id } : d));
    setDataDKP(updated);
    saveDataDKP(updated);
  };

  const handleDeleteDKP = (id: string) => {
    const updated = dataDKP.filter(d => d.id !== id);
    setDataDKP(updated);
    saveDataDKP(updated);
  };

  // CRUD Handlers for DataInvoice
  const handleAddInvoice = (item: Omit<DataInvoice, 'id'>) => {
    const newItem: DataInvoice = { ...item, id: 'inv-' + Date.now() };
    const updated = [newItem, ...dataInvoice];
    setDataInvoice(updated);
    saveDataInvoice(updated);
  };

  const handleUpdateInvoice = (id: string, item: Omit<DataInvoice, 'id'>) => {
    const updated = dataInvoice.map(d => (d.id === id ? { ...item, id } : d));
    setDataInvoice(updated);
    saveDataInvoice(updated);
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = dataInvoice.filter(d => d.id !== id);
    setDataInvoice(updated);
    saveDataInvoice(updated);
  };

  const handleDeleteAllInvoice = () => {
    setDataInvoice([]);
    saveDataInvoice([]);
  };

  if (!isLoggedIn) {
    return (
      <LoginModal
        onLoginSuccess={email => {
          setIsLoggedIn(true);
          if (email) setUserEmail(email);
        }}
      />
    );
  }

  return (
    <div
      className="bg-slate-100 text-slate-800 flex h-screen overflow-hidden font-sans antialiased"
      onMouseMove={resetInvoiceTimer}
      onKeyDown={resetInvoiceTimer}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSwitchTab={handleSwitchTab}
        isOpen={isSidebarOpen}
        onToggleExpand={() => setIsSidebarOpen(prev => !prev)}
        onClose={() => setIsSidebarOpen(false)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onLogout={() => setIsLoggedIn(false)}
        isInvoiceUnlocked={isInvoiceUnlocked}
      />

      {/* Main App Content View */}
      <main className="flex-1 flex flex-col h-full overflow-hidden print-container relative z-10 bg-slate-50/70 w-full">
        <Header
          currentTab={currentTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          userEmail={userEmail}
          onLogout={() => setIsLoggedIn(false)}
          isInvoiceUnlocked={isInvoiceUnlocked}
          onLockInvoice={handleLockInvoice}
        />

        {/* Dynamic Main Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 print-container pb-24 w-full max-w-7xl mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardTab
              dataAngkut={dataAngkut}
              dataKetiga={dataKetiga}
              dataPerhutani={dataPerhutani}
              onNavigateTab={handleSwitchTab}
            />
          )}

          {currentTab === 'dkp' && (
            <DKPTab
              data={dataDKP}
              onAddData={handleAddDKP}
              onUpdateData={handleUpdateDKP}
              onDeleteData={handleDeleteDKP}
              onExportCSV={() => exportToCSV('dkp')}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {currentTab === 'angkut' && (
            <AngkutTab
              dataKetiga={dataKetiga}
              data={dataAngkut}
              onAddData={handleAddAngkut}
              onUpdateData={handleUpdateAngkut}
              onDeleteData={handleDeleteAngkut}
              onConfirmDeleteAll={() => setIsConfirmDeleteAllOpen(true)}
              onExportCSV={() => exportToCSV('angkut')}
            />
          )}

          {currentTab === 'ketiga' && (
            <KetigaTab
              dataAngkut={dataAngkut}
              data={dataKetiga}
              onAddData={handleAddKetiga}
              onUpdateData={handleUpdateKetiga}
              onDeleteData={handleDeleteKetiga}
              onExportCSV={() => exportToCSV('ketiga')}
            />
          )}

          {currentTab === 'perhutani' && (
            <PerhutaniTab
              data={dataPerhutani}
              onAddData={handleAddPerhutani}
              onUpdateData={handleUpdatePerhutani}
              onDeleteData={handleDeletePerhutani}
              onExportCSV={() => exportToCSV('perhutani')}
            />
          )}

          {currentTab === 'laporan' && (
            <LaporanTab
              dataAngkut={dataAngkut}
              dataKetiga={dataKetiga}
              dataPerhutani={dataPerhutani}
              onExportCSV={m => exportToCSV('laporan', m)}
            />
          )}

          {currentTab === 'invoice' && (
            <InvoiceTab
              data={dataInvoice}
              isUnlocked={isInvoiceUnlocked}
              onUnlock={handleUnlockInvoice}
              onLock={handleLockInvoice}
              onAddData={handleAddInvoice}
              onUpdateData={handleUpdateInvoice}
              onDeleteData={handleDeleteInvoice}
              onDeleteAllData={handleDeleteAllInvoice}
              onExportCSV={() => exportToCSV('invoice')}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Global Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          refreshAllData();
          setIsImportModalOpen(false);
        }}
      />

      {/* Global Confirm Clear All Angkut Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteAllOpen}
        title="Kosongkan Catatan Angkut Harian?"
        message="Semua catatan angkutan kayu harian akan terhapus secara permanen. Apakah Anda yakin?"
        onConfirm={handleConfirmDeleteAllAngkut}
        onCancel={() => setIsConfirmDeleteAllOpen(false)}
      />
    </div>
  );
}
