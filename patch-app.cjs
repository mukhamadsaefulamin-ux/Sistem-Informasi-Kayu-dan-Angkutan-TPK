const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const handleDeleteKetiga = \(id: string\) => \{\n\s*const updated = dataKetiga\.filter\(d => d\.id !== id\);\n\s*setDataKetiga\(updated\);\n\s*saveDataKetiga\(updated\);\n\s*\};/,
  `const handleDeleteKetiga = (id: string) => {
    const updated = dataKetiga.filter(d => d.id !== id);
    setDataKetiga(updated);
    saveDataKetiga(updated);
  };

  const handleDeleteAllKetiga = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA data sisa pihak ketiga? Tindakan ini tidak dapat dibatalkan.')) {
      setDataKetiga([]);
      saveDataKetiga([]);
    }
  };`
);

code = code.replace(
  /onDeleteData=\{handleDeleteKetiga\}/,
  `onDeleteData={handleDeleteKetiga}
              onDeleteAllData={handleDeleteAllKetiga}`
);

fs.writeFileSync('src/App.tsx', code);
