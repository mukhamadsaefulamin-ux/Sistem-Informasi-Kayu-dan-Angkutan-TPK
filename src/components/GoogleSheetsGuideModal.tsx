import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Key,
  Globe,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface GoogleSheetsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsGuideModal: React.FC<GoogleSheetsGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'apikey'>('quick');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const sampleUrl = 'https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit#gid=0';

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        {/* Header Modal */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">
                Panduan Koneksi Google Sheets
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Langkah mudah menghubungkan data spreadsheet ke aplikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation inside Modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-white text-emerald-700 border-t-2 border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>1. Metode Langsung (URL Publik)</span>
          </button>
          <button
            onClick={() => setActiveTab('apikey')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'apikey'
                ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4 text-blue-600" />
            <span>2. Dapatkan Google API Key</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 text-slate-700">
          {activeTab === 'quick' ? (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold text-sm mb-0.5">Metode Paling Praktis (Tanpa Coding / API Key)</p>
                  Aplikasi TPK Talok telah dilengkapi fitur konversi otomatis URL Google Sheets menjadi format data real-time. Anda cukup membagikan sheet menjadi publik.
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Buka File Google Sheets Anda</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Buka dokumen spreadsheet data kayu Anda di Google Sheets. Pastikan baris pertama (Row 1) berisi nama-nama header kolom yang sesuai (contoh: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">Tanggal, Jenis, No BPT, Jumlah Pcs, Volume m3</code>).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Ubah Pengaturan Berbagi (Sharing) ke Publik</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Klik tombol hijau <span className="font-bold text-emerald-700">"Bagikan / Share"</span> di pojok kanan atas Google Sheets.
                    </p>
                    <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1.5 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">Akses Umum:</span>
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-300">
                          Siapa saja yang memiliki link (Anyone with the link)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">Peran / Role:</span>
                        <span className="bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px]">
                          Pengakses lihat saja (Viewer)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Salin Link URL Google Sheets</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Salin seluruh alamat URL yang ada di address bar browser Anda.
                    </p>

                    {/* Example Box */}
                    <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs font-mono flex items-center justify-between gap-2 border border-slate-800 mt-2">
                      <span className="truncate text-emerald-400">{sampleUrl}</span>
                      <button
                        onClick={handleCopySample}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all text-[11px] font-sans flex items-center gap-1 cursor-pointer flex-shrink-0"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Tersalin' : 'Contoh'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Tempel & Impor di Aplikasi TPK Talok</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Buka modal <span className="font-bold text-slate-800">Import CSV / Sheets</span> di aplikasi, pilih modul penyimpanan tujuan (misal: Angkut Harian), lalu tempelkan link URL dan tekan <span className="font-bold text-emerald-700">"Tarik & Simpan Data"</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 items-start">
                <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold text-sm mb-0.5">Mendapatkan Google Sheets API Key Resmi</p>
                  Jika Anda mengembangkan integrasi backend kustom atau membutuhkan autentikasi resmi dari Google Cloud Console, ikuti langkah berikut.
                </div>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Buka Google Cloud Console</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Kunjungi dasbor resmi Developer Google Cloud di{' '}
                      <a
                        href="https://console.cloud.google.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline font-bold inline-flex items-center gap-1 hover:text-blue-800"
                      >
                        console.cloud.google.com <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Buat / Pilih Proyek Baru</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Klik dropdown proyek di bilah paling atas dan pilih <span className="font-bold text-slate-800">"New Project" (Proyek Baru)</span>. Beri nama proyek, misalnya <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">TPK-Talok-Integration</code>.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Aktifkan "Google Sheets API"</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Masuk ke menu samping kiri: <span className="font-semibold text-slate-800">APIs & Services &gt; Library</span>. Cari <span className="font-bold text-slate-900">"Google Sheets API"</span> di kotak pencarian, lalu klik tombol <span className="font-bold text-blue-700">Enable (Aktifkan)</span>.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Buat Kredensial (API Key)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Masuk ke <span className="font-semibold text-slate-800">APIs & Services &gt; Credentials</span>, klik <span className="font-bold text-slate-900">"+ Create Credentials"</span> di bagian atas, lalu pilih <span className="font-bold text-blue-700">API Key</span>.
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 space-y-1 mt-2">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Tips Keamanan:
                      </p>
                      <p className="text-slate-600">
                        Sangat disarankan untuk membatasi (Restrict) API Key hanya untuk service Google Sheets API dan domain aplikasi Anda agar tidak disalahgunakan orang lain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Butuh bantuan lebih lanjut? Hubungi Admin TPK Talok.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
