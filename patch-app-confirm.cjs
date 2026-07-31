const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen\] = useState\(false\);/,
  `const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [isConfirmDeleteAllKetigaOpen, setIsConfirmDeleteAllKetigaOpen] = useState(false);`
);

code = code.replace(
  /const handleDeleteAllKetiga = \(\) => \{\n\s*if \(window\.confirm\([^)]+\)\) \{\n\s*setDataKetiga\(\[\]\);\n\s*saveDataKetiga\(\[\]\);\n\s*\}\n\s*\};/,
  `const handleDeleteAllKetiga = () => {
    setIsConfirmDeleteAllKetigaOpen(true);
  };
  const handleConfirmDeleteAllKetiga = () => {
    setDataKetiga([]);
    saveDataKetiga([]);
    setIsConfirmDeleteAllKetigaOpen(false);
  };`
);

code = code.replace(
  /\{\/\* Global Confirm Clear All Angkut Modal \*\/\}/,
  `{/* Global Confirm Clear All Ketiga Modal */}
      <ConfirmModal
        isOpen={isConfirmDeleteAllKetigaOpen}
        title="Hapus Semua Sisa Pihak Ketiga?"
        message="Semua data sisa kayu pihak ketiga akan terhapus secara permanen. Apakah Anda yakin?"
        onConfirm={handleConfirmDeleteAllKetiga}
        onCancel={() => setIsConfirmDeleteAllKetigaOpen(false)}
      />

      {/* Global Confirm Clear All Angkut Modal */}`
);

fs.writeFileSync('src/App.tsx', code);
