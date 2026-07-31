const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// 1. Add Info and Save to imports
code = code.replace(
  "ChevronDown, ChevronUp, Database, TreePine, Disc, FileText, Tag",
  "ChevronDown, ChevronUp, Database, TreePine, Disc, FileText, Tag, Info, Save"
);

// 2. Add state for multi-month add form
const addFormState = `  const [addFormYear, setAddFormYear] = useState(new Date().getFullYear().toString());
  const [addFormJenis, setAddFormJenis] = useState('');
  const [addFormMonths, setAddFormMonths] = useState(
    Array.from({ length: 12 }, () => ({ btg: '', vol: '' }))
  );

  const resetAddForm = () => {
    setAddFormYear(new Date().getFullYear().toString());
    setAddFormJenis('');
    setAddFormMonths(Array.from({ length: 12 }, () => ({ btg: '', vol: '' })));
  };
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormJenis) {
      alert('Pilih jenis kayu terlebih dahulu!');
      return;
    }
    
    let addedCount = 0;
    for (let i = 0; i < 12; i++) {
      const m = addFormMonths[i];
      const btg = parseInt(m.btg) || 0;
      const vol = parseFloat(m.vol) || 0;
      
      if (btg > 0 || vol > 0) {
        const monthStr = String(i + 1).padStart(2, '0');
        const d = new Date(parseInt(addFormYear), i + 1, 0).getDate();
        const tanggalStr = \`01/\${monthStr}/\${addFormYear} s/d \${d}/\${monthStr}/\${addFormYear}\`;
        
        onAddData({
          tanggal: tanggalStr,
          jenis: addFormJenis,
          ai_batang: btg,
          ai_volume: vol,
          aii_batang: 0,
          aii_volume: 0,
          aiii_batang: 0,
          aiii_volume: 0
        });
        addedCount++;
      }
    }
    
    if (addedCount === 0) {
      alert('Masukkan setidaknya satu data batang/volume!');
      return;
    }
    
    setIsModalOpen(false);
    resetAddForm();
  };

  const addTotalBtg = addFormMonths.reduce((sum, m) => sum + (parseInt(m.btg) || 0), 0);
  const addTotalVol = addFormMonths.reduce((sum, m) => sum + (parseFloat(m.vol) || 0), 0);
  const addCount = addFormMonths.filter(m => (parseInt(m.btg) || 0) > 0 || (parseFloat(m.vol) || 0) > 0).length || 1;
  const avgBtg = Math.round(addTotalBtg / addCount);
  const avgVol = addTotalVol / addCount;
`;

code = code.replace(
  "const [deleteConfirm, setDeleteConfirm] = useState",
  addFormState + "\\n  const [deleteConfirm, setDeleteConfirm] = useState"
);

// 3. Update the handleEdit and add reset functionality
// Actually, handleEdit sets editingId and isModalOpen. We can keep it.

// 4. Update the JSX for the Modals
const oldModalRegex = /\{\/\* Modal form \.\.\. \*\/\}[\\s\\S]*?(?=\{\/\* Delete Confirm Modal \*\/)/;

const newModalCode = `{/* Modal form */}
      {isModalOpen && !editingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-start gap-4 bg-white">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-200">
                <Plus className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800">Tambah Data Rekap Mutasi Kapling</h3>
                <p className="text-sm text-slate-500 mt-1">Isi data rekap mutasi per bulan dan per jenis kayu</p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetAddForm(); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <form id="addMutasiForm" onSubmit={handleAddSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Tahun <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          required
                          value={addFormYear}
                          onChange={(e) => setAddFormYear(e.target.value)}
                          className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none shadow-sm text-slate-700 font-medium"
                        >
                          {['2024', '2025', '2026', '2027', '2028', '2029', '2030'].map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Jenis Kayu <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <TreePine className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          required
                          value={addFormJenis}
                          onChange={(e) => setAddFormJenis(e.target.value)}
                          className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none shadow-sm text-slate-700 font-medium"
                        >
                          <option value="">Pilih jenis kayu...</option>
                          <option value="PINUS">PINUS</option>
                          <option value="JATI">JATI</option>
                          <option value="SONOKELING">SONOKELING</option>
                          <option value="MAHONI">MAHONI</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                        <Info className="w-4 h-4" />
                        Petunjuk
                      </div>
                      <p className="text-[13px] text-blue-700/80 leading-relaxed">
                        Masukkan jumlah Batang (Btg) dan Volume (Vol) untuk setiap bulan. Kosongkan jika tidak ada data pada bulan tersebut.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-3">
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="py-3 px-6 text-left font-semibold text-slate-700 w-1/3 border-r border-slate-200">Bulan</th>
                              <th className="py-3 px-4 text-center w-1/3 border-r border-slate-200">
                                <div className="font-semibold text-slate-800">Batang (Btg)</div>
                                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Jumlah Batang</div>
                              </th>
                              <th className="py-3 px-4 text-center w-1/3">
                                <div className="font-semibold text-slate-800">Volume (Vol)</div>
                                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Jumlah Volume (m³)</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {MONTHS.map((m, i) => (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="py-2.5 px-6 text-slate-700 font-medium border-r border-slate-200">{m}</td>
                                <td className="py-2.5 px-4 border-r border-slate-200">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={addFormMonths[i].btg}
                                    onChange={(e) => {
                                      const newMonths = [...addFormMonths];
                                      newMonths[i].btg = e.target.value;
                                      setAddFormMonths(newMonths);
                                    }}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center font-medium"
                                  />
                                </td>
                                <td className="py-2.5 px-4">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    placeholder="0.000"
                                    value={addFormMonths[i].vol}
                                    onChange={(e) => {
                                      const newMonths = [...addFormMonths];
                                      newMonths[i].vol = e.target.value;
                                      setAddFormMonths(newMonths);
                                    }}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center font-medium"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-5 sticky top-6 shadow-sm">
                      <h4 className="text-center text-indigo-700 font-bold text-sm mb-6 uppercase tracking-wider">Ringkasan (Otomatis)</h4>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-indigo-100/60">
                          <span className="text-slate-600 text-sm font-medium">Total Batang (Btg)</span>
                          <span className="font-bold text-emerald-600 text-base">{addTotalBtg.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-indigo-100/60">
                          <span className="text-slate-600 text-sm font-medium">Total Volume (Vol)</span>
                          <span className="font-bold text-purple-700 text-base">{addTotalVol.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rata-rata per Bulan</h5>
                        <div className="flex justify-between items-center pb-3 border-b border-indigo-100/60">
                          <span className="text-slate-600 text-sm font-medium">Batang</span>
                          <span className="font-bold text-emerald-600">{avgBtg.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-indigo-100/60">
                          <span className="text-slate-600 text-sm font-medium">Volume</span>
                          <span className="font-bold text-purple-700">{avgVol.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} m³</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetAddForm(); }}
                className="flex items-center gap-2 px-6 py-2.5 text-slate-700 font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                type="submit"
                form="addMutasiForm"
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-indigo-600/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal form */}
      {isModalOpen && editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Edit2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Edit Data Mutasi
                </h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <form id="editMutasiForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Tanggal</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 01/01/2026 s/d 30/01/2026"
                        value={formData.tanggal}
                        onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Jenis Kayu</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.jenis}
                        onChange={(e) => setFormData({ ...formData, jenis: e.target.value.toUpperCase() })}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase shadow-sm"
                        placeholder="Contoh: PINUS, JATI"
                      />
                      <TreePine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sortimen AI
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.ai_batang}
                        onChange={(e) => setFormData({ ...formData, ai_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Volume</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={formData.ai_volume}
                        onChange={(e) => setFormData({ ...formData, ai_volume: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sortimen AII
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.aii_batang}
                        onChange={(e) => setFormData({ ...formData, aii_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Volume</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={formData.aii_volume}
                        onChange={(e) => setFormData({ ...formData, aii_volume: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                  <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Sortimen AIII
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Batang</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.aiii_batang}
                        onChange={(e) => setFormData({ ...formData, aiii_batang: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Volume</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0"
                        value={formData.aiii_volume}
                        onChange={(e) => setFormData({ ...formData, aiii_volume: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="flex items-center gap-2 px-6 py-2.5 text-slate-700 font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
              <button
                type="submit"
                form="editMutasiForm"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(oldModalRegex, newModalCode);

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
