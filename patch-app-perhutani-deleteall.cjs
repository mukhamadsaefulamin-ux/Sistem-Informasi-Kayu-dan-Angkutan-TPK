const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[isConfirmDeleteAllKetigaOpen, setIsConfirmDeleteAllKetigaOpen\] = useState\(false\);/,
  `const [isConfirmDeleteAllKetigaOpen, setIsConfirmDeleteAllKetigaOpen] = useState(false);
  const [isConfirmDeleteAllPerhutaniOpen, setIsConfirmDeleteAllPerhutaniOpen] = useState(false);`
);

code = code.replace(
  /const handleDeletePerhutani = \(id: string\) => \{\n\s*const updated = dataPerhutani\.filter\(d => d\.id !== id\);\n\s*setDataPerhutani\(updated\);\n\s*saveDataPerhutani\(updated\);\n\s*\};/,
  `const handleDeletePerhutani = (id: string) => {
    const updated = dataPerhutani.filter(d => d.id !== id);
    setDataPerhutani(updated);
    saveDataPerhutani(updated);
  };

  const handleDeleteAllPerhutani = () => {
    setIsConfirmDeleteAllPerhutaniOpen(true);
  };
  const handleConfirmDeleteAllPerhutani = () => {
    setDataPerhutani([]);
    saveDataPerhutani([]);
    setIsConfirmDeleteAllPerhutaniOpen(false);
  };`
);

code = code.replace(
  /\{\/\* Global Confirm Clear All Ketiga Modal \*\/\}/,
  `{/* Global Confirm Clear All Perhutani Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteAllPerhutaniOpen}
        title="Hapus Semua Sisa Perhutani?"
        message="Semua data sisa kayu Perhutani akan terhapus secara permanen. Apakah Anda yakin?"
        onConfirm={handleConfirmDeleteAllPerhutani}
        onCancel={() => setIsConfirmDeleteAllPerhutaniOpen(false)}
      />

      {/* Global Confirm Clear All Ketiga Modal */}`
);

code = code.replace(
  /onDeleteData=\{handleDeletePerhutani\}\n\s*onExportCSV=\{\(\) => exportToCSV\('perhutani'\)\}/,
  `onDeleteData={handleDeletePerhutani}
              onDeleteAllData={handleDeleteAllPerhutani}
              onExportCSV={() => exportToCSV('perhutani')}`
);

fs.writeFileSync('src/App.tsx', code);
