const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "  const handleConfirmDeleteAllPerhutani = () => {\n    setDataPerhutani([]);\n  };\n",
  "  const handleConfirmDeleteAllPerhutani = async () => {\n    const { getDocs, query, collection, writeBatch } = require('firebase/firestore');\n    const q = query(collection(db, 'perhutani'));\n    const snap = await getDocs(q);\n    const batch = writeBatch(db);\n    snap.docs.forEach(d => batch.delete(d.ref));\n    await batch.commit();\n  };\n"
);
code = code.replace(
  "  const handleConfirmDeleteAllKetiga = () => {\n    setDataKetiga([]);\n  };\n",
  "  const handleConfirmDeleteAllKetiga = async () => {\n    const { getDocs, query, collection, writeBatch } = require('firebase/firestore');\n    const q = query(collection(db, 'ketiga'));\n    const snap = await getDocs(q);\n    const batch = writeBatch(db);\n    snap.docs.forEach(d => batch.delete(d.ref));\n    await batch.commit();\n  };\n"
);
code = code.replace(
  "  const handleDeleteAllInvoice = () => {\n    setDataInvoice([]);\n  };\n",
  "  const handleDeleteAllInvoice = async () => {\n    const { getDocs, query, collection, writeBatch } = require('firebase/firestore');\n    const q = query(collection(db, 'invoice'));\n    const snap = await getDocs(q);\n    const batch = writeBatch(db);\n    snap.docs.forEach(d => batch.delete(d.ref));\n    await batch.commit();\n  };\n"
);

// We need to add 'writeBatch' to imports if not there. Wait, I used require(), which works in webpack but Vite is ESM.
// It's better to just add `writeBatch`, `getDocs`, `query` to the top level import.
