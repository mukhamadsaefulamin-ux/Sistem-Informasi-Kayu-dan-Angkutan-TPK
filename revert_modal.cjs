const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

const startMarker = "{/* Modal form */}";
const endMarker = "{/* Delete Confirm Modal */}";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Markers not found");
  process.exit(1);
}

const newModalCode = `{/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  {editingId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Edit Data Mutasi' : 'Tambah Data Mutasi'}
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
              <form id="mutasiForm" onSubmit={handleSubmit} className="space-y-6">
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
                    <p className="text-[11px] text-red-500 mt-1">Contoh: 1 s/d 30 Januari 2026 atau 01/01/2026 s/d 30/01/2026</p>
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
                form="mutasiForm"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Simpan Perubahan' : 'Simpan Data'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      `;

const newCode = code.substring(0, startIndex) + newModalCode + code.substring(endIndex);
fs.writeFileSync('src/components/RekapMutasiTab.tsx', newCode);
console.log("Successfully replaced modal form");
