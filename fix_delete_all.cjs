const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const deleteAllTemplate = (target, coll) => {
  return `  const handleConfirmDeleteAll${target} = async () => {\n    const q = query(collection(db, '${coll}'));\n    const snap = await getDocs(q);\n    const batch = writeBatch(db);\n    snap.docs.forEach(d => batch.delete(d.ref));\n    await batch.commit();\n    setIsConfirmDeleteAll${target === 'Angkut' ? '' : target}Open(false);\n  };`;
};

// Angkut
code = code.replace(
  /  const handleConfirmDeleteAllAngkut = \(\) => \{\n    setDataAngkut\(\[\]\);\n    \n    setIsConfirmDeleteAllOpen\(false\);\n  \};/m,
  deleteAllTemplate('Angkut', 'angkut')
);

// Ketiga
code = code.replace(
  /  const handleConfirmDeleteAllKetiga = \(\) => \{\n    setDataKetiga\(\[\]\);\n    \n    setIsConfirmDeleteAllKetigaOpen\(false\);\n  \};/m,
  deleteAllTemplate('Ketiga', 'ketiga')
);

// Perhutani
code = code.replace(
  /  const handleConfirmDeleteAllPerhutani = \(\) => \{\n    setDataPerhutani\(\[\]\);\n    \n    setIsConfirmDeleteAllPerhutaniOpen\(false\);\n  \};/m,
  deleteAllTemplate('Perhutani', 'perhutani')
);

// Invoice
code = code.replace(
  /  const handleDeleteAllInvoice = \(\) => \{\n    setDataInvoice\(\[\]\);\n    \n  \};/m,
  `  const handleDeleteAllInvoice = async () => {\n    const q = query(collection(db, 'invoice'));\n    const snap = await getDocs(q);\n    const batch = writeBatch(db);\n    snap.docs.forEach(d => batch.delete(d.ref));\n    await batch.commit();\n  };`
);

fs.writeFileSync('src/App.tsx', code);
