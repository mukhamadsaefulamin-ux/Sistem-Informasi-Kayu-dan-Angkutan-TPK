export type TabType = 'dashboard' | 'angkut' | 'ketiga' | 'perhutani' | 'dkp' | 'laporan' | 'invoice' | 'rekap_mutasi';

export interface DataAngkut {
  id: string;
  no_dkhp: string; // No. DKHP
  tanggal: string; // YYYY-MM-DD
  supir: string;   // Nama Supir
  nopol: string;   // Nomor Polisi / Kendaraan
  kapling: string; // No. Kapling
  blok: string;    // No. Blok
  sortimen: string;// Sortimen
  jenis?: string;  // Jenis Kayu (optional, default Jati)
  tujuan: string;  // Tujuan
  alamat: string;  // Alamat Tujuan
  batang: number;  // Total Batang
  volume: number;  // Total Volume (m3)
  status: string;  // Status pengiriman (e.g. Terkirim, Dalam Perjalanan, Selesai)
}

export interface DataKetiga {
  id: string;
  kapling: string;
  blok: string;
  jenis: string;
  sortimen: string; // AI, AII, AIII, KB, etc.
  panjang: number;  // meters
  diameter: number; // cm
  mutu: string;
  batang: number;
  volume: number;   // m3
  pembeli: string;
}

export interface DataPerhutani {
  id: string;
  tgl_kapling: string; // YYYY-MM-DD
  kapling: string;
  blok: string;
  jenis: string;
  sortimen: string;
  panjang: number;  // meters
  diameter: number; // cm
  mutu: string;
  batang: number;
  volume: number;   // m3
}

export interface DataDKP {
  id: string;
  no_dkp: string;     // Nomor DKP Produksi
  tanggal: string;    // Tanggal Terbit/Produksi YYYY-MM-DD
  kapling: string;    // Nomor Kapling / Petak
  blok: string;       // Nomor Blok
  jenis: string;      // Jenis Kayu (Jati, Mahoni, Rimba, dll)
  sortimen: string;   // Sortimen (AI, AII, AIII, KB, dll)
  panjang: number;    // Panjang (meter)
  diameter: number;   // Diameter (cm)
  mutu: string;       // Mutu / Kelas Kayu
  batang: number;     // Total Batang Kayu
  volume: number;     // Total Volume (m3)
  petugas?: string;   // Petugas Penguji / Pembuat DKP
  status?: string;    // Status Produksi (Tersedia, Terkapling, Terjual)
  foto_dkp?: string;  // Base64 URL atau Foto Scan Dokumen DKP Fisik
}

export interface DataMutasi {
  id: string;
  tanggal: string;
  jenis: string;
  ai_batang: number;
  ai_volume: number;
  aii_batang: number;
  aii_volume: number;
  aiii_batang: number;
  aiii_volume: number;
}

export interface DataInvoice {
  id: string;
  tanggal: string;
  no_invoice: string;
  batang?: number;  // BTG
  volume?: number;  // M3
  pembeli: string;
  nominal: number;
  status: 'Lunas' | 'Belum Lunas';
}

export type StorageTarget = 'angkut' | 'ketiga' | 'perhutani' | 'invoice' | 'dkp' | 'mutasi';

