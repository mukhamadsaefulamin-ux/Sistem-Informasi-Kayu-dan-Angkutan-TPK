const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// handleUpdateAngkut
code = code.replace(
    /const updated = dataAngkut\.map\(d => \(d\.id === id \? \{ \.\.\.item, id \} : d\)\);\n\s*setDataAngkut\(updated\);/,
    "setDoc(doc(db, 'angkut', id), { ...item, id });"
);

// handleUpdateKetiga
code = code.replace(
    /const updated = dataKetiga\.map\(d => \(d\.id === id \? \{ \.\.\.item, id \} : d\)\);\n\s*setDataKetiga\(updated\);/,
    "setDoc(doc(db, 'ketiga', id), { ...item, id });"
);

// handleUpdatePerhutani
code = code.replace(
    /const updated = dataPerhutani\.map\(d => \(d\.id === id \? \{ \.\.\.item, id \} : d\)\);\n\s*setDataPerhutani\(updated\);/,
    "setDoc(doc(db, 'perhutani', id), { ...item, id });"
);

// handleUpdateDKP
code = code.replace(
    /const updated = dataDKP\.map\(d => \(d\.id === id \? \{ \.\.\.item, id \} : d\)\);\n\s*setDataDKP\(updated\);/,
    "setDoc(doc(db, 'dkp', id), { ...item, id });"
);

// handleUpdateInvoice
code = code.replace(
    /const updated = dataInvoice\.map\(d => \(d\.id === id \? \{ \.\.\.item, id \} : d\)\);\n\s*setDataInvoice\(updated\);/,
    "setDoc(doc(db, 'invoice', id), { ...item, id });"
);

fs.writeFileSync('src/App.tsx', code);
