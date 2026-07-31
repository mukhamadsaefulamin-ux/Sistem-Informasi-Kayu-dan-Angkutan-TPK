import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CloudDownload,
  Info,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { StorageTarget } from '../types';
import { previewImportCSV, commitImportCSV, PreviewResult } from '../lib/storage';
import { GoogleSheetsGuideModal } from './GoogleSheetsGuideModal';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}


export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [target, setTarget] = useState<StorageTarget>('angkut');
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [importLogs, setImportLogs] = useState<any[]>([]);

  useEffect(() => {
    setImportLogs(JSON.parse(localStorage.getItem('tpk_import_logs') || '[]'));
  }, [isOpen]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  if (!isOpen) return null;

  const handleReviewImport = async () => {
    setStatusMsg(null);
    if (!file && !urlInput) {
      setStatusMsg({ type: 'error', text: 'Silakan pilih file CSV atau masukkan link Google Sheets.' });
      return;
    }

    setLoading(true);
    try {
      let csvContent = '';
      if (file) {
        csvContent = await file.text();
      } else if (urlInput) {
        let fetchUrl = urlInput;
        if (urlInput.includes('docs.google.com/spreadsheets')) {
          const match = urlInput.match(/\/d\/([a-zA-Z0-9-_]+)/);
          const gidMatch = urlInput.match(/[#&]gid=([0-9]+)/);
          if (match && match[1]) {
            fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv${gidMatch ? '&gid=' + gidMatch[1] : ''}`;
          }
        }
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error('Gagal mengunduh data dari link. Pastikan link dapat diakses publik.');
        csvContent = await response.text();
      }

      if (!csvContent || csvContent.trim().length === 0) {
        throw new Error('Data CSV kosong.');
      }

      // Run synchronously, but wrap in a small timeout to allow UI spinner to paint
      setTimeout(() => {
        try {
          const result = previewImportCSV(csvContent, target);
          setPreviewResult(result);
        } catch (err: any) {
          console.error(err);
          setStatusMsg({
            type: 'error',
            text: err.message || 'Gagal memproses import data. Pastikan format CSV sesuai.'
          });
        } finally {
          setLoading(false);
        }
      }, 50);
      
    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: err.message || 'Gagal memproses import data. Pastikan format CSV sesuai.'
      });
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    if (!previewResult || loading) return;
    setLoading(true);
    try {
        const { importedCount } = await commitImportCSV(previewResult.rows, target);
        
        // Log Activity
        const now = new Date();
        const logsStr = localStorage.getItem('tpk_import_logs') || '[]';
        const logs = JSON.parse(logsStr);
        logs.unshift({
            date: now.toISOString(),
            target,
            fileName: file ? file.name : 'Link Google Sheets',
            successCount: importedCount,
            duplicateCount: previewResult.duplicate,
            errorCount: previewResult.error
        });
        localStorage.setItem('tpk_import_logs', JSON.stringify(logs.slice(0, 50)));
        setImportLogs(logs.slice(0, 50));

        setStatusMsg({
          type: 'success',
          text: `Berhasil mengimpor ${importedCount} data baru ke modul ${target.toUpperCase()}!`
        });
        setTimeout(() => {
          handleClose();
          onImportComplete();
        }, 1500);
    } catch (err: any) {
        setStatusMsg({ type: 'error', text: err.message || 'Gagal menyimpan data import.' });
    } finally {
        setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setUrlInput('');
    setStatusMsg(null);
    setPreviewResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-teal-600" />
        <h3 className="text-base font-bold text-slate-800">Import Data</h3>
      </div>
      {!previewResult && (
          <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
          >
              {showLogs ? 'Tutup Riwayat' : 'Riwayat Import'}
          </button>
      )}
  </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {showLogs ? (
              <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="max-h-64 overflow-y-auto bg-slate-50">
                          <table className="w-full text-left text-[11px] whitespace-nowrap">
                              <thead className="bg-slate-100 text-slate-500 sticky top-0 border-b border-slate-200">
                                  <tr>
                                      <th className="py-2 px-3">Tanggal & Waktu</th>
                                      <th className="py-2 px-3">Modul</th>
                                      <th className="py-2 px-3">Nama File</th>
                                      <th className="py-2 px-3 text-emerald-600">Berhasil</th>
                                      <th className="py-2 px-3 text-amber-600">Duplikat</th>
                                      <th className="py-2 px-3 text-rose-600">Gagal</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                  {importLogs.map((log: any, i: number) => (
                                      <tr key={i} className="bg-white">
                                          <td className="py-2 px-3 font-semibold text-slate-700">{new Date(log.date).toLocaleString('id-ID')}</td>
                                          <td className="py-2 px-3 uppercase">{log.target}</td>
                                          <td className="py-2 px-3 truncate max-w-[120px]">{log.fileName}</td>
                                          <td className="py-2 px-3 font-bold text-emerald-600">{log.successCount}</td>
                                          <td className="py-2 px-3 text-amber-600">{log.duplicateCount}</td>
                                          <td className="py-2 px-3 text-rose-600">{log.errorCount}</td>
                                      </tr>
                                  ))}
                                  {!importLogs.length && (
                                      <tr><td colSpan={6} className="py-6 text-center text-slate-400 italic">Belum ada riwayat import.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>
          ) : !previewResult ? (

              <>
                  {/* Instructions Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                        <Info className="w-4 h-4 text-blue-500" /> Cara Import Data:
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsGuideOpen(true)}
                        className="text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer border border-emerald-300 shadow-2xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Panduan Langkah demi Langkah</span>
                      </button>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                      <li>
                        Di Excel, simpan file dengan format <b>CSV (Comma delimited)</b>.
                      </li>
                      <li>Pastikan urutan kolom sesuai dengan struktur tabel aplikasi.</li>
                      <li>
                        Atau gunakan <b>Link Google Sheets</b> yang telah dipublikasikan ke Web.
                      </li>
                    </ol>
                  </div>

                  {/* Storage Target Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Modul Penyimpanan
                    </label>
                    <select
                      value={target}
                      onChange={e => setTarget(e.target.value as StorageTarget)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 bg-slate-50 text-sm font-semibold text-slate-800"
                    >
                      <option value="angkut">Data Angkut Harian Kayu</option>
                      <option value="dkp">Dokumen Kayu Produksi (DKP)</option>
                      <option value="ketiga">Sisa Pihak Ketiga</option>
                      <option value="perhutani">Sisa Perhutani</option>
                      <option value="invoice">Pendapatan Invoice (Rahasia)</option>
                      <option value="mutasi">Rekap Mutasi Kapling</option>
                    </select>
                  </div>

                  {/* Upload File Input */}
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>Upload File CSV Komputer</span>
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer transition-all"
                    />
                    {file && (
                      <p className="text-[11px] text-teal-600 font-semibold mt-2">
                        File terpilih: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center gap-3 my-2">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                      ATAU VIA LINK GOOGLE SHEETS
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Google Sheets Link Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Link CSV / Google Sheets
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsGuideOpen(true)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Panduan Link & API Key</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-teal-500 bg-slate-50 text-xs text-slate-800 font-mono"
                    />
                  </div>

                  {/* Status Message */}
                  {statusMsg && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        statusMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {statusMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      )}
                      <span>{statusMsg.text}</span>
                    </div>
                  )}

                  {/* Submit Import Button */}
                  <button
                    onClick={handleReviewImport}
                    disabled={loading}
                    className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <CloudDownload className="w-4 h-4" />
                    )}
                    <span>Review Data & Validasi</span>
                  </button>
              </>
          ) : (
              // PREVIEW SCREEN
              <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <p className="font-bold text-slate-800 text-xl">{previewResult.total}</p>
                          <p className="text-slate-500">Total Data</p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                          <p className="font-bold text-emerald-800 text-xl">{previewResult.valid}</p>
                          <p className="text-emerald-600">Valid</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                          <p className="font-bold text-amber-800 text-xl">{previewResult.duplicate}</p>
                          <p className="text-amber-600">Duplikat</p>
                      </div>
                      <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                          <p className="font-bold text-rose-800 text-xl">{previewResult.error}</p>
                          <p className="text-rose-600">Ditolak</p>
                      </div>
                  </div>
                  
                  {statusMsg && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        statusMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {statusMsg.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      )}
                      <span>{statusMsg.text}</span>
                    </div>
                  )}

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="max-h-64 overflow-y-auto bg-slate-50">
                          <table className="w-full text-left text-[11px] whitespace-nowrap">
                              <thead className="bg-slate-100 text-slate-500 sticky top-0 border-b border-slate-200">
                                  <tr>
                                      <th className="py-2 px-3">Status</th>
                                      <th className="py-2 px-3">Identitas Utama</th>
                                      <th className="py-2 px-3">Keterangan</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                  {previewResult.rows.map((row, i) => (
                                      <tr key={i} className={row.status === 'valid' ? '' : row.status === 'error' ? 'bg-rose-50' : 'bg-amber-50'}>
                                          <td className="py-2 px-3 font-semibold">
                                              {row.status === 'valid' && <span className="text-emerald-600">Valid</span>}
                                              {row.status === 'duplicate_db' && <span className="text-amber-600">Duplikat DB</span>}
                                              {row.status === 'duplicate_file' && <span className="text-amber-600">Ganda File</span>}
                                              {row.status === 'error' && <span className="text-rose-600">Error</span>}
                                          </td>
                                          <td className="py-2 px-3 text-slate-700 font-mono">
                                              {row.data.no_dkhp || row.data.kapling || '-'} | {row.data.blok || row.data.sortimen || '-'}
                                          </td>
                                          <td className="py-2 px-3 text-slate-500">
                                              {row.reason || 'Siap diimpor'}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setPreviewResult(null)}
                        className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all text-sm cursor-pointer"
                      >
                        Batalkan
                      </button>
                      <button
                        onClick={handleCommitImport}
                        disabled={previewResult.valid === 0 || !!statusMsg || loading}
                        className="flex-1 bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-all text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Menyimpan...
                          </>
                        ) : (
                          `Simpan ${previewResult.valid} Data Valid`
                        )}
                      </button>
                  </div>
              </div>
          )}
                  </div>
      </div>
      <GoogleSheetsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};
