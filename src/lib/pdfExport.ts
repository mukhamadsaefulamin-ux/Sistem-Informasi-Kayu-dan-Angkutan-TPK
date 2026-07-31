import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataDKP } from '../types';

// Format numbers for PDF display (e.g. 12,34)
const formatNum = (num: number, decimals = 2) => {
  if (isNaN(num)) return '0,00';
  return num.toFixed(decimals).replace('.', ',');
};

// Format date string YYYY-MM-DD to DD/MM/YYYY
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};

/**
 * Export complete DKP Produksi table to official PDF Document
 */
export const exportDKPToPDF = (
  data: DataDKP[],
  filterPeriodStr: string = 'Semua Periode',
  searchQuery: string = ''
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate Summary
  const totalBatang = data.reduce((sum, item) => sum + Number(item.batang || 0), 0);
  const totalVolume = data.reduce((sum, item) => sum + Number(item.volume || 0), 0);

  // --- KOP SURAT HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('PERUM PERHUTANI - DIVISI REGIONAL JAWA TENGAH', 14, 15);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text('TEMPAT PENIMBUNAN KAYU (TPK) TALOK', 14, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('Jl. Raya TPK Talok, Kabupaten Tegal - Jawa Tengah | Dokumen Resmi Hasil Hutan', 14, 26);

  // Divider Line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(14, 29, 283, 29);
  doc.setLineWidth(0.2);
  doc.line(14, 30.2, 283, 30.2);

  // --- TITLE & METADATA ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN DOKUMEN KAYU PRODUKSI (DKP)', 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${filterPeriodStr} ${searchQuery ? `| Pencarian: "${searchQuery}"` : ''}`, 14, 43);
  doc.text(`Tanggal Cetak: ${todayStr}`, 283, 43, { align: 'right' });

  // --- TABLE DATA ---
  const tableHead = [
    [
      'No.',
      'No. DKP',
      'Tanggal',
      'No. Kapling',
      'No. Blok',
      'Jenis Kayu',
      'Sortimen',
      'P (m)',
      'D (cm)',
      'Mutu',
      'Batang',
      'Volume (m³)',
      'Status',
      'Petugas Penguji'
    ]
  ];

  const tableBody = data.map((item, idx) => [
    idx + 1,
    item.no_dkp || '-',
    formatDate(item.tanggal),
    item.kapling || '-',
    item.blok || '-',
    item.jenis || '-',
    item.sortimen || '-',
    item.panjang || 0,
    item.diameter || 0,
    item.mutu || '-',
    item.batang || 0,
    `${formatNum(Number(item.volume || 0), 2)} m³`,
    item.status || 'Tersedia',
    item.petugas || 'Penguji TPK'
  ]);

  // Append Total Row
  tableBody.push([
    '',
    'TOTAL REKAPITULASI PRODUKSI DKP',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `${totalBatang} Batang`,
    `${formatNum(totalVolume, 2)} m³`,
    `${data.length} Record`,
    ''
  ]);

  autoTable(doc, {
    startY: 47,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // Slate 900
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { fontStyle: 'bold', textColor: [6, 95, 70], cellWidth: 28 }, // emerald
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'center', cellWidth: 18 },
      5: { fontStyle: 'bold', cellWidth: 22 },
      6: { halign: 'center', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 15 },
      8: { halign: 'center', cellWidth: 15 },
      9: { halign: 'center', cellWidth: 16 },
      10: { halign: 'center', fontStyle: 'bold', cellWidth: 18 },
      11: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42], cellWidth: 24 },
      12: { halign: 'center', cellWidth: 22 },
      13: { cellWidth: 23 }
    },
    didParseCell: (dataCell) => {
      // Highlight last row (Totals)
      if (dataCell.row.index === tableBody.length - 1) {
        dataCell.cell.styles.fontStyle = 'bold';
        dataCell.cell.styles.fillColor = [209, 250, 229]; // light emerald
        dataCell.cell.styles.textColor = [6, 78, 59];
      }
    }
  });

  // Get Y after table for signatures
  const finalY = (doc as any).lastAutoTable.finalY || 140;

  // Signatures section
  const sigY = finalY + 12 > 165 ? 165 : finalY + 12;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  // Left Sign: Penguji Kayu
  doc.text('Mengetahui / Menguji,', 25, sigY);
  doc.text('Penguji Kayu TPK Talok', 25, sigY + 5);
  doc.text('......................................................', 25, sigY + 22);

  // Right Sign: Kepala TPK Talok
  doc.text(`Talok, ${todayStr}`, 220, sigY);
  doc.text('Kepala TPK Talok', 220, sigY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text('SUTRISNO, S.Hut', 220, sigY + 22);
  doc.setFont('helvetica', 'normal');
  doc.text('NIP. 19780512 200501 1 003', 220, sigY + 26);

  // Download PDF
  const filename = `Dokumen_DKP_Produksi_TPK_Talok_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

/**
 * Export single item DKP Sertifikat/Slip to PDF
 */
export const exportSingleDKPSlipToPDF = (item: DataDKP) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5'
  });

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Border frame
  doc.setDrawColor(6, 95, 70); // emerald-800
  doc.setLineWidth(1);
  doc.rect(5, 5, 138, 200);
  doc.setLineWidth(0.3);
  doc.rect(7, 7, 134, 196);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 95, 70);
  doc.text('PERUM PERHUTANI - TPK TALOK', 74, 16, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('SLIP DOKUMEN KAYU PRODUKSI (DKP)', 74, 22, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.line(15, 26, 133, 26);

  // DKP Number Badge
  doc.setFontSize(12);
  doc.setTextColor(6, 95, 70);
  doc.text(`No. DKP: ${item.no_dkp}`, 74, 33, { align: 'center' });

  // Key-Value Details
  const details = [
    ['Tanggal Terbit / Produksi', formatDate(item.tanggal)],
    ['Nomor Kapling', item.kapling || '-'],
    ['Nomor Blok', item.blok || '-'],
    ['Jenis Kayu', item.jenis || '-'],
    ['Sortimen', item.sortimen || '-'],
    ['Ukuran Panjang', `${item.panjang || 0} meter`],
    ['Ukuran Diameter', `${item.diameter || 0} cm`],
    ['Kelas Mutu', item.mutu || '-'],
    ['Jumlah Batang', `${item.batang || 0} Batang`],
    ['Total Volume', `${formatNum(Number(item.volume || 0), 2)} m³`],
    ['Status Kayu', item.status || 'Tersedia'],
    ['Petugas Penguji', item.petugas || 'Penguji TPK']
  ];

  autoTable(doc, {
    startY: 38,
    margin: { left: 12, right: 12 },
    body: details,
    theme: 'plain',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [15, 23, 42] },
      1: { cellWidth: 60 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 130;

  // Barcode Placeholder / QR Seal Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, finalY + 5, 124, 18, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('AUTHENTICITY & VERIFICATION CODE', 74, finalY + 11, { align: 'center' });
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(`*TPK-TALOK-${item.no_dkp.replace(/[^A-Z0-9]/gi, '')}*`, 74, finalY + 17, { align: 'center' });

  // Signature
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Talok, ${todayStr}`, 90, finalY + 30);
  doc.text('Petugas Penguji / Kepala TPK,', 90, finalY + 34);

  doc.setFont('helvetica', 'bold');
  doc.text(item.petugas || 'SUTRISNO, S.Hut', 90, finalY + 50);

  doc.save(`Slip_DKP_${item.no_dkp.replace(/[\/]/g, '-')}.pdf`);
};
