const fs = require('fs');

const header = `import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, Plus, Download, Search, X, Edit2, Trash2, Calendar, 
  ChevronDown, ChevronUp, Database, TreePine, Disc, FileText, Tag, Info, Save
} from 'lucide-react';
import { DataMutasi } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface RekapMutasiTabProps {
  userRole?: 'admin' | 'anggota' | null;
  data: DataMutasi[];
  onAddData: (item: Omit<DataMutasi, 'id'>) => void;
  onUpdateData: (id: string, item: Omit<DataMutasi, 'id'>) => void;
  onDeleteData: (id: string) => void;
  onExportCSV: () => void;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const RekapMutasiTab: React.FC<RekapMutasiTabProps> = ({ 
  userRole, data, onAddData, onUpdateData, onDeleteData, onExportCSV 
}) => {
  const isAdmin = userRole === 'admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const defaultTanggal = \`01/01/\${new Date().getFullYear()} s/d 30/01/\${new Date().getFullYear()}\`;
  
  const [formData, setFormData] = useState<any>({
    tanggal: defaultTanggal,
    jenis: 'PINUS',
    ai_batang: '',
    ai_volume: '',
    aii_batang: '',
    aii_volume: '',
    aiii_batang: '',
    aiii_volume: '',
  });

`;

let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');
fs.writeFileSync('src/components/RekapMutasiTab.tsx', header + "\n" + code);
