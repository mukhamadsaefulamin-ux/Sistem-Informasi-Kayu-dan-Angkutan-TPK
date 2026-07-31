import React, { useState, useMemo, useRef } from 'react';
import {
  FileCheck,
  Upload,
  FileText,
  Trash2,
  Image as ImageIcon,
  Camera,
  ZoomIn,
  X,
  CheckCircle2,
  ShieldCheck,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { DataDKP } from '../types';
import { exportDKPToPDF, exportSingleDKPSlipToPDF } from '../lib/pdfExport';
import { ConfirmModal } from './ConfirmModal';

interface DKPTabProps {
  userRole?: 'admin' | 'anggota' | null;
  data: DataDKP[];
  onAddData: (item: Omit<DataDKP, 'id'>) => void;
  onUpdateData: (id: string, item: Omit<DataDKP, 'id'>) => void;
  onDeleteData: (id: string) => void;
  onExportCSV: () => void;
  onOpenImportModal: () => void;
}

// Generate an inline SVG sample DKP document image for instant testing
const createSampleDKPImage = (noDkp: string, kapling: string) => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" style="background:#f8fafc;font-family:sans-serif;">
    <rect width="600" height="400" fill="#f8fafc" rx="16"/>
    <rect x="20" y="20" width="560" height="360" fill="#ffffff" stroke="#059669" stroke-width="3" rx="12"/>
    <rect x="35" y="35" width="530" height="50" fill="#065f46" rx="8"/>
    <text x="300" y="65" fill="#ffffff" font-size="20" font-weight="bold" text-anchor="middle">PERUM PERHUTANI - TPK TALOK</text>
    <text x="300" y="115" fill="#0f172a" font-size="18" font-weight="bold" text-anchor="middle">DOKUMEN KAYU PRODUKSI (DKP)</text>
    <line x1="100" y1="130" x2="500" y2="130" stroke="#cbd5e1" stroke-width="2"/>
    <text x="60" y="170" fill="#334155" font-size="14" font-weight="bold">No. DKP:</text>
    <text x="180" y="170" fill="#065f46" font-size="16" font-weight="bold">${noDkp}</text>
    <text x="60" y="205" fill="#334155" font-size="14" font-weight="bold">No. Kapling:</text>
    <text x="180" y="205" fill="#0f172a" font-size="15" font-weight="bold">${kapling}</text>
    <text x="60" y="240" fill="#334155" font-size="14" font-weight="bold">Jenis Kayu:</text>
    <text x="180" y="240" fill="#0f172a" font-size="14">Jati (Tectona grandis)</text>
    <text x="60" y="275" fill="#334155" font-size="14" font-weight="bold">Ukuran (P x D):</text>
    <text x="180" y="275" fill="#0f172a" font-size="14">2.5 m x 28 cm (Volume: 0.154 m³)</text>
    <text x="60" y="310" fill="#334155" font-size="14" font-weight="bold">Petugas Penguji:</text>
    <text x="180" y="310" fill="#0f172a" font-size="14">Sutrisno, S.Hut (NIP 19780512)</text>
    <rect x="420" y="160" width="130" height="130" fill="#ecfdf5" stroke="#10b981" stroke-dasharray="4 4" rx="8"/>
    <text x="485" y="220" fill="#047857" font-size="11" font-weight="bold" text-anchor="middle">VERIFIED SCAN</text>
    <text x="485" y="240" fill="#059669" font-size="28" text-anchor="middle">✓</text>
    <text x="300" y="360" fill="#64748b" font-size="11" text-anchor="middle">Dokumen Fisik Hutan Negara - TPK Talok Tegal</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svgString);
};

export const DKPTab: React.FC<DKPTabProps> = ({
  userRole,
  data,
  onAddData,
  onDeleteData
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewLightbox, setPreviewLightbox] = useState<{ url: string; title: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState<DataDKP | null>(null);

  // Show auto notification
  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Upload handler from file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        saveUploadedDKP(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save DKP without any manual form filling
  const saveUploadedDKP = (imageSrc: string) => {
    const nextNum = (data.length + 1).toString().padStart(3, '0');
    const autoNoDKP = `DKP/${new Date().getFullYear()}/${nextNum}`;
    const autoKapling = 'KPL-' + (100 + data.length + 1);

    onAddData({
      no_dkp: autoNoDKP,
      tanggal: new Date().toISOString().split('T')[0],
      kapling: autoKapling,
      blok: 'BLK-01',
      jenis: 'Jati',
      sortimen: 'A II',
      panjang: 2.5,
      diameter: 28,
      mutu: 'Utama',
      batang: 1,
      volume: 0.154,
      petugas: 'Sutrisno (Penguji TPK)',
      status: 'Tersedia',
      foto_dkp: imageSrc
    });

    showNotif(`Berhasil upload dokumen ${autoNoDKP}`);
  };

  // Sample Upload
  const handleUploadSample = () => {
    const nextNum = (data.length + 1).toString().padStart(3, '0');
    const autoNoDKP = `DKP/${new Date().getFullYear()}/${nextNum}`;
    const autoKapling = 'KPL-' + (100 + data.length + 1);
    const sampleImage = createSampleDKPImage(autoNoDKP, autoKapling);

    saveUploadedDKP(sampleImage);
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans max-w-6xl mx-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Toast Notification */}
      {notification && (
        <div className="bg-emerald-800 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in duration-200 border border-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-200 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP BAR: ONLY UPLOAD BUTTON & EXPORT PDF BUTTON */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-emerald-100 flex items-center justify-center flex-shrink-0 shadow-md">
            <FileCheck className="w-7 h-7 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              DKP Produksi Kayu TPK Talok
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Resmi
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola dokumen DKP produksi kayu cukup dengan upload gambar & cetak PDF.
            </p>
          </div>
        </div>

        {/* PRIMARY ACTIONS: UPLOAD & EXPORT PDF */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-initial bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-300" /> Tombol Upload DKP
          </button>

          <button
            onClick={() => exportDKPToPDF(data, 'Semua Periode', '')}
            className="flex-1 md:flex-initial bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-red-200" /> Export PDF Report
          </button>
        </div>
      </div>

      {/* BIG DRAG & DROP UPLOAD BOX */}
      <div className="bg-emerald-50/50 rounded-3xl border-2 border-dashed border-emerald-300 p-8 text-center transition-all hover:border-emerald-500">
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">
            Upload Gambar / Scan Dokumen DKP
          </h3>
          <p className="text-xs text-slate-500">
            Klik tombol di bawah untuk memilih file foto DKP dari galeri HP atau komputer Anda.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-300" /> Upload File Gambar
            </button>

            <button
              onClick={handleUploadSample}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4 text-emerald-700" /> Upload Sample Gambar DKP
            </button>
          </div>
        </div>
      </div>

      {/* UPLOADED DOCUMENTS GALLERY / LIST WITH PDF EXPORT ACTIONS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-700" />
            Daftar Gambar Dokumen DKP ({data.length} Uploaded)
          </h3>

          <span className="text-xs font-bold text-slate-500">
            Siap Cetak PDF
          </span>
        </div>

        {data.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-xs text-slate-600">Belum ada gambar DKP yang diupload.</p>
            <p className="text-[11px] text-slate-400 mt-1">Silakan klik tombol Upload DKP di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item, idx) => (
              <div key={item.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between hover:border-emerald-300 transition-all">
                <div className="space-y-2">
                  {/* Image Preview Container */}
                  {item.foto_dkp ? (
                    <div
                      onClick={() => setPreviewLightbox({ url: item.foto_dkp!, title: `Dokumen ${item.no_dkp}` })}
                      className="relative h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 cursor-pointer group"
                    >
                      <img src={item.foto_dkp} alt="DKP" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs gap-1">
                        <ZoomIn className="w-4 h-4" /> Lihat Gambar Full
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                      Tanpa Gambar
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-900 block">{item.no_dkp}</span>
                      <span className="text-[11px] text-slate-500 font-medium">{item.kapling}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <button
                    onClick={() => exportSingleDKPSlipToPDF(item)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-600" /> Export PDF
                  </button>

                  {userRole === 'admin' && (
      <button
        onClick={() => setDeletingItem(item)}
        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
        title="Hapus Dokumen DKP"
      >
        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
      </button>
  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL FOR DELETING DKP */}
      <ConfirmModal
        isOpen={!!deletingItem}
        title="Hapus Dokumen DKP?"
        message={deletingItem ? `Dokumen ${deletingItem.no_dkp} (${deletingItem.kapling}) akan dihapus secara permanen. Apakah Anda yakin?` : ''}
        onConfirm={() => {
          if (deletingItem) {
            onDeleteData(deletingItem.id);
            showNotif(`Dokumen ${deletingItem.no_dkp} berhasil dihapus`);
            setDeletingItem(null);
          }
        }}
        onCancel={() => setDeletingItem(null)}
      />

      {/* IMAGE LIGHTBOX MODAL */}
      {previewLightbox && (
        <div className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 font-extrabold text-sm text-emerald-400">
                <ImageIcon className="w-4 h-4" />
                <span>{previewLightbox.title}</span>
              </div>
              <button
                onClick={() => setPreviewLightbox(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center overflow-auto bg-slate-950">
              <img
                src={previewLightbox.url}
                alt="Detail DKP"
                className="max-h-[75vh] w-auto rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
