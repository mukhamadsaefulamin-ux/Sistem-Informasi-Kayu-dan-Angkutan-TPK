import React, { useState, useEffect } from 'react';
import { X, Cloud, UploadCloud, DownloadCloud, Loader2, FileJson, AlertTriangle } from 'lucide-react';
import { backupToGoogleDrive, listGoogleDriveBackups, restoreFromGoogleDrive } from '../lib/drive';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveBackupModal: React.FC<DriveBackupModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [view, setView] = useState<'menu' | 'restore'>('menu');
  const [statusMsg, setStatusMsg] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      setView('menu');
      setStatusMsg(null);
    }
  }, [isOpen]);

  const handleBackup = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      await backupToGoogleDrive();
      setStatusMsg({ type: 'success', text: 'Data berhasil dibackup ke Google Drive.' });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal melakukan backup.' });
    } finally {
      setLoading(false);
    }
  };

  const loadBackups = async () => {
    setLoading(true);
    setStatusMsg(null);
    try {
      const list = await listGoogleDriveBackups();
      setBackups(list);
      setView('restore');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal mengambil daftar backup.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (fileId: string) => {
    const confirmed = window.confirm("Peringatan: Proses restore akan menimpa/menambah data yang ada. Apakah Anda yakin ingin melanjutkan?");
    if (!confirmed) return;

    setLoading(true);
    setStatusMsg(null);
    try {
      const data = await restoreFromGoogleDrive(fileId);
      
      // Simple loop to restore all data to Firebase (this may take a while depending on size)
      // Usually you would use batching here, but this is a simplified restore implementation.
      // We will loop through collections and push to firebase.
      
      let restoreCount = 0;
      
      for (const collectionName of ['angkut', 'ketiga', 'perhutani', 'dkp', 'mutasi', 'invoice']) {
        if (data[collectionName] && Array.isArray(data[collectionName])) {
          for (const item of data[collectionName]) {
            if (item && item.id) {
              await setDoc(doc(db, collectionName, item.id), item);
              restoreCount++;
            }
          }
        }
      }

      setStatusMsg({ type: 'success', text: `Berhasil merestore ${restoreCount} dokumen dari Google Drive.` });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Gagal merestore data.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Google Drive Backup</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {statusMsg && (
            <div className={`mb-4 p-3 text-sm font-medium rounded-xl border ${
              statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {statusMsg.text}
            </div>
          )}

          {view === 'menu' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-2">Pilih aksi yang ingin Anda lakukan dengan Google Drive.</p>
              
              <button
                onClick={handleBackup}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Backup ke Google Drive</h3>
                  <p className="text-xs text-slate-500">Simpan salinan data saat ini ke Google Drive</p>
                </div>
              </button>

              <button
                onClick={loadBackups}
                disabled={loading}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <DownloadCloud className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Restore dari Google Drive</h3>
                  <p className="text-xs text-slate-500">Kembalikan data dari backup sebelumnya</p>
                </div>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Daftar File Backup</h3>
                <button 
                  onClick={() => setView('menu')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Kembali
                </button>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm">Mencari backup...</p>
                </div>
              ) : backups.length === 0 ? (
                <div className="py-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
                  <p className="text-sm">Tidak ada file backup ditemukan di Google Drive.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {backups.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <FileJson className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                          <p className="text-xs text-slate-500">ID: {file.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestore(file.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
