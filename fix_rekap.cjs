const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// 1. Fix date parsing functions
const oldDateFuncs = `  const getYearFromTanggal = (t: string) => {
    if (/^\\d{4}-\\d{2}-\\d{2}$/.test(t)) return t.substring(0, 4);
    const match = t.match(/(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
    if (match) return match[3];
    const strMatch = t.match(/\\d+\\s+s\\/d\\s+\\d+\\s+([a-zA-Z]+)\\s+(\\d{4})/i);
    if (strMatch) return strMatch[2];
    return '';
  };

  const getMonthIndexFromTanggal = (t: string) => {
    const parts = (t || '').split(' ');
    let monthStr = '';
    if (parts.length > 2) {
      monthStr = parts[parts.length - 2];
    } else {
      const d = t?.split('/');
      if (d && d.length >= 2) {
        return parseInt(d[1], 10) - 1;
      }
    }
    if (monthStr) {
      const idx = MONTHS.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  };`;

const newDateFuncs = `  const getYearFromTanggal = (t: string) => {
    if (!t) return '';
    const matchSlash = t.match(/(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
    if (matchSlash) return matchSlash[3];
    const parts = t.split(' ');
    if (parts.length >= 1) {
      const yearStr = parts[parts.length - 1];
      if (/^\\d{4}$/.test(yearStr)) return yearStr;
    }
    const matchDash = t.match(/^(\\d{4})-(\\d{2})-(\\d{2})/);
    if (matchDash) return matchDash[1];
    return '';
  };

  const getMonthIndexFromTanggal = (t: string) => {
    if (!t) return -1;
    const matchSlash = t.match(/(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})/);
    if (matchSlash) {
      return parseInt(matchSlash[2], 10) - 1;
    }
    const parts = t.split(' ');
    if (parts.length >= 2) {
      const monthStr = parts[parts.length - 2];
      const idx = MONTHS.findIndex(m => m.toLowerCase() === monthStr.toLowerCase());
      if (idx !== -1) return idx;
    }
    const matchDash = t.match(/^(\\d{4})-(\\d{2})-(\\d{2})/);
    if (matchDash) {
      return parseInt(matchDash[2], 10) - 1;
    }
    return -1;
  };`;

code = code.replace(oldDateFuncs, newDateFuncs);

// 2. Remove top Tambah button
const topTambah = `                {isAdmin && (
                  <button
                    onClick={() => { resetForm(); setFormData(prev => ({...prev, jenis: activeTab})); setIsModalOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                )}`;
code = code.replace(topTambah, "");


// 3. Update the Action cell
const oldActionCell = `{isAdmin && (
                        <td className="px-2 py-3.5 text-center">
                          {row.entries.length > 0 ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(row.entries[0])}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shadow-sm bg-blue-50"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm({ isOpen: true, id: row.entries[0].id, type: 'single' })}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors shadow-sm bg-red-50"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                resetForm();
                                // Try to determine the month index (row.monthIdx) to construct a default date
                                const year = filterYear || new Date().getFullYear().toString();
                                const monthNum = String(row.monthIdx + 1).padStart(2, '0');
                                const lastDay = new Date(parseInt(year), row.monthIdx + 1, 0).getDate();
                                setFormData(prev => ({
                                  ...prev, 
                                  jenis: activeTab,
                                  tanggal: \`01/\${monthNum}/\${year} s/d \${lastDay}/\${monthNum}/\${year}\`
                                }));
                                setIsModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              + Tambah
                            </button>
                          )}
                        </td>
                      )}`;

const newActionCell = `{isAdmin && (
                        <td className="px-2 py-3.5 text-center">
                          {row.entries.length > 0 ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEdit(row.entries[0]); }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-sm flex items-center justify-center gap-1.5 mx-auto"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                resetForm();
                                const year = filterYear || new Date().getFullYear().toString();
                                const monthNum = String(row.monthIdx + 1).padStart(2, '0');
                                const lastDay = new Date(parseInt(year), row.monthIdx + 1, 0).getDate();
                                setFormData(prev => ({
                                  ...prev, 
                                  jenis: activeTab,
                                  tanggal: \`01/\${monthNum}/\${year} s/d \${lastDay}/\${monthNum}/\${year}\`
                                }));
                                setIsModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm flex items-center justify-center gap-1 mx-auto whitespace-nowrap"
                            >
                              <Plus className="w-3.5 h-3.5" /> Tambah
                            </button>
                          )}
                        </td>
                      )}`;
code = code.replace(oldActionCell, newActionCell);

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
