import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs, query } from 'firebase/firestore';
import { db } from './lib/firebase';
import { TabType, DataAngkut, DataKetiga, DataPerhutani, DataDKP, DataInvoice, DataMutasi } from './types';
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
  loadDataMutasi,
  saveDataMutasi,
  exportToCSV,
  clearAllStoredData
} from './lib/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { DashboardTab } from './components/DashboardTab';
import { RekapMutasiTab } from './components/RekapMutasiTab';
import { AngkutTab } from './components/AngkutTab';
import { KetigaTab } from './components/KetigaTab';
import { PerhutaniTab } from './components/PerhutaniTab';
import { DKPTab } from './components/DKPTab';
import { LaporanTab } from './components/LaporanTab';
import { InvoiceTab } from './components/InvoiceTab';
import { ImportModal } from './components/ImportModal';
import { DriveBackupModal } from './components/DriveBackupModal';
import { ConfirmModal } from './components/ConfirmModal';

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'anggota' | null>(null);

  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [globalFilterDate, setGlobalFilterDate] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDriveBackupModalOpen, setIsDriveBackupModalOpen] = useState(false);
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [isConfirmDeleteAllKetigaOpen, setIsConfirmDeleteAllKetigaOpen] = useState(false);
  const [isConfirmDeleteAllPerhutaniOpen, setIsConfirmDeleteAllPerhutaniOpen] = useState(false);

  // Security Lock State for Restricted Invoice Tab
  const [isInvoiceUnlocked, setIsInvoiceUnlocked] = useState(false);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core Data Collections
  const [dataAngkut, setDataAngkut] = useState<DataAngkut[]>([]);
  const [dataKetiga, setDataKetiga] = useState<DataKetiga[]>([]);
  const [dataPerhutani, setDataPerhutani] = useState<DataPerhutani[]>([]);
  const [dataDKP, setDataDKP] = useState<DataDKP[]>([]);
  const [dataInvoice, setDataInvoice] = useState<DataInvoice[]>([]);
  const [dataMutasi, setDataMutasi] = useState<DataMutasi[]>([]);

  // Initial Data Load and Subscribe to Firestore
  useEffect(() => {
    const unsubAngkut = onSnapshot(collection(db, 'angkut'), snap => setDataAngkut(snap.docs.map(d => ({id: d.id, ...d.data()} as any))));
    const unsubKetiga = onSnapshot(collection(db, 'ketiga'), snap => setDataKetiga(snap.docs.map(d => ({id: d.id, ...d.data()} as any))));
    const unsubPerhutani = onSnapshot(collection(db, 'perhutani'), snap => setDataPerhutani(snap.docs.map(d => ({id: d.id, ...d.data()} as any))));
    const unsubDKP = onSnapshot(collection(db, 'dkp'), snap => setDataDKP(snap.docs.map(d => ({id: d.id, ...d.data()} as any))));
    const unsubInvoice = onSnapshot(collection(db, 'invoice'), snap => setDataInvoice(snap.docs.map(d => ({id: d.id, ...d.data()} as any))));
    const unsubMutasi = onSnapshot(collection(db, 'mutasi'), snap => setDataMutasi(snap.docs.map(d => ({id: d.id, ...d.data()} as any))));

    return () => {
      unsubAngkut();
      unsubKetiga();
      unsubPerhutani();
      unsubDKP();
      unsubInvoice();
      unsubMutasi();
    };
  }, []);

  const refreshAllData = () => {}; // No-op now since onSnapshot handles it


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
    setDoc(doc(db, 'angkut', newItem.id), newItem);
    
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

    setDoc(doc(db, 'angkut', id), { ...item, id });
    
  };

  const handleDeleteAngkut = (id: string) => {
    deleteDoc(doc(db, 'angkut', id));
    
  };

  const handleConfirmDeleteAllAngkut = async () => {
    const q = query(collection(db, 'angkut'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
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
    setDoc(doc(db, 'ketiga', newItem.id), newItem);
    
  };

  const handleUpdateKetiga = (id: string, item: Omit<DataKetiga, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataKetiga.some(d => d.id !== id && matchStr(d.kapling, item.kapling) && matchStr(d.blok, item.blok) && matchStr(d.pembeli, item.pembeli) && matchStr(d.jenis, item.jenis) && d.batang === item.batang && d.volume === item.volume);
    if (isDuplicate) {
        alert('Gagal: Data Sisa Pihak Ketiga ganda terdeteksi.');
        return;
    }

    setDoc(doc(db, 'ketiga', id), { ...item, id });
    
  };

  const handleDeleteKetiga = (id: string) => {
    deleteDoc(doc(db, 'ketiga', id));
    
  };

  const handleDeleteAllKetiga = () => {
    setIsConfirmDeleteAllKetigaOpen(true);
  };
  const handleConfirmDeleteAllKetiga = async () => {
    const q = query(collection(db, 'ketiga'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    setIsConfirmDeleteAllKetigaOpen(false);
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
    setDoc(doc(db, 'perhutani', newItem.id), newItem);
    
  };

  const handleUpdatePerhutani = (id: string, item: Omit<DataPerhutani, 'id'>) => {
    const matchStr = (a: string, b: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    const isDuplicate = dataPerhutani.some(d => d.id !== id && matchStr(d.kapling, item.kapling) && matchStr(d.blok, item.blok) && matchStr(d.tgl_kapling, item.tgl_kapling) && d.batang === item.batang && d.volume === item.volume);
    if (isDuplicate) {
        alert('Gagal: Data Sisa Perhutani ganda terdeteksi.');
        return;
    }

    setDoc(doc(db, 'perhutani', id), { ...item, id });
    
  };

  const handleDeletePerhutani = (id: string) => {
    deleteDoc(doc(db, 'perhutani', id));
    
  };

  const handleDeleteAllPerhutani = () => {
    setIsConfirmDeleteAllPerhutaniOpen(true);
  };
  const handleConfirmDeleteAllPerhutani = async () => {
    const q = query(collection(db, 'perhutani'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    setIsConfirmDeleteAllPerhutaniOpen(false);
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
    setDoc(doc(db, 'dkp', newItem.id), newItem);
    
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

    setDoc(doc(db, 'dkp', id), { ...item, id });
    
  };

  const handleDeleteDKP = (id: string) => {
    deleteDoc(doc(db, 'dkp', id));
    
  };

  // CRUD Handlers for DataInvoice

  const handleAddMutasi = async (item: Omit<DataMutasi, 'id'>) => {
    try {
      const docRef = doc(collection(db, 'mutasi'));
      const itemWithId = { ...item, id: docRef.id };
      await setDoc(docRef, itemWithId);
    } catch (error) {
      console.error('Error adding data mutasi:', error);
      alert('Gagal menambahkan data mutasi');
    }
  };

  const handleUpdateMutasi = async (id: string, updatedItem: Omit<DataMutasi, 'id'>) => {
    try {
      await setDoc(doc(db, 'mutasi', id), { ...updatedItem, id });
    } catch (error) {
      console.error('Error updating data mutasi:', error);
      alert('Gagal memperbarui data mutasi');
    }
  };

  const handleDeleteMutasi = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mutasi', id));
    } catch (error) {
      console.error('Error deleting data mutasi:', error);
      alert('Gagal menghapus data mutasi');
    }
  };

  const handleAddInvoice = (item: Omit<DataInvoice, 'id'>) => {
    const newItem: DataInvoice = { ...item, id: 'inv-' + Date.now() };
    setDoc(doc(db, 'invoice', newItem.id), newItem);
    
  };

  const handleUpdateInvoice = (id: string, item: Omit<DataInvoice, 'id'>) => {
    setDoc(doc(db, 'invoice', id), { ...item, id });
    
  };

  const handleDeleteInvoice = (id: string) => {
    deleteDoc(doc(db, 'invoice', id));
    
  };

  const handleDeleteAllInvoice = async () => {
    const q = query(collection(db, 'invoice'));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
  };

  if (!isLoggedIn) {
    return (
      <LoginModal
        onLoginSuccess={role => {
          setIsLoggedIn(true);
          setUserRole(role);
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
        onOpenDriveBackupModal={() => setIsDriveBackupModalOpen(true)}
        onLogout={() => setIsLoggedIn(false)}
        isInvoiceUnlocked={isInvoiceUnlocked}
          userRole={userRole}
      />

      {/* Main App Content View */}
      <main className="flex-1 flex flex-col h-full overflow-hidden print-container relative z-10 bg-slate-50/70 w-full">
        <Header
          currentTab={currentTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          userRole={userRole}
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
              filterDate={globalFilterDate}
              onFilterDateChange={setGlobalFilterDate}
            />
          )}

          {currentTab === 'rekap_mutasi' && (
            <RekapMutasiTab
              userRole={userRole}
              data={dataMutasi}
              onAddData={handleAddMutasi}
              onUpdateData={handleUpdateMutasi}
              onDeleteData={handleDeleteMutasi}
              onExportCSV={() => exportToCSV('mutasi')}
            />
          )}


          {currentTab === 'dkp' && (
            <DKPTab userRole={userRole}
              data={dataDKP}
              onAddData={handleAddDKP}
              onUpdateData={handleUpdateDKP}
              onDeleteData={handleDeleteDKP}
              onExportCSV={() => exportToCSV('dkp')}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {currentTab === 'angkut' && (
            <AngkutTab userRole={userRole}
              filterDate={globalFilterDate}
              onFilterDateChange={setGlobalFilterDate}
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
            <KetigaTab userRole={userRole}
              dataAngkut={dataAngkut}
              data={dataKetiga}
              onAddData={handleAddKetiga}
              onUpdateData={handleUpdateKetiga}
              onDeleteData={handleDeleteKetiga}
              onDeleteAllData={handleDeleteAllKetiga}
              onExportCSV={() => exportToCSV('ketiga')}
            />
          )}

          {currentTab === 'perhutani' && (
            <PerhutaniTab userRole={userRole}
              data={dataPerhutani}
              onAddData={handleAddPerhutani}
              onUpdateData={handleUpdatePerhutani}
              onDeleteData={handleDeletePerhutani}
              onDeleteAllData={handleDeleteAllPerhutani}
              onExportCSV={() => exportToCSV('perhutani')}
            />
          )}

          {currentTab === 'laporan' && (
            <LaporanTab 
              dataAngkut={dataAngkut}
              dataKetiga={dataKetiga}
              dataPerhutani={dataPerhutani}
              onExportCSV={m => exportToCSV('laporan', m)}
              filterDate={globalFilterDate}
              onFilterDateChange={setGlobalFilterDate}
            />
          )}

          {currentTab === 'invoice' && (
            <InvoiceTab userRole={userRole}
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
      <DriveBackupModal isOpen={isDriveBackupModalOpen} onClose={() => setIsDriveBackupModalOpen(false)} />
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => {
          refreshAllData();
          setIsImportModalOpen(false);
        }}
      />

      {/* Global Confirm Clear All Perhutani Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteAllPerhutaniOpen}
        title="Hapus Semua Sisa Perhutani?"
        message="Semua data sisa kayu Perhutani akan terhapus secara permanen. Apakah Anda yakin?"
        onConfirm={handleConfirmDeleteAllPerhutani}
        onCancel={() => setIsConfirmDeleteAllPerhutaniOpen(false)}
      />

      {/* Global Confirm Clear All Ketiga Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteAllKetigaOpen}
        title="Hapus Semua Sisa Pihak Ketiga?"
        message="Semua data sisa kayu pihak ketiga akan terhapus secara permanen. Apakah Anda yakin?"
        onConfirm={handleConfirmDeleteAllKetiga}
        onCancel={() => setIsConfirmDeleteAllKetigaOpen(false)}
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
