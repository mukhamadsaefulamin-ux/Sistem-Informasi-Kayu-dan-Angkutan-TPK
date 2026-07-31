const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

if (!code.includes('writeBatch')) {
    code = code.replace(
        "import { doc, setDoc } from 'firebase/firestore';",
        "import { doc, setDoc, writeBatch } from 'firebase/firestore';"
    );
}

const oldCommit = `export const commitImportCSV = async (previewRows: PreviewRow[], target: StorageTarget) => {
      const validRows = previewRows.filter(r => r.status === 'valid').map(r => r.data);
  let importedCount = validRows.length;
  if (importedCount === 0) return { importedCount: 0 };
  const time = Date.now();
  for (let idx = 0; idx < validRows.length; idx++) {
    const r = validRows[idx];
    let prefix = 'imp';
    if (target === 'angkut') prefix = 'ang';
    else if (target === 'ketiga') prefix = 'ktg';
    else if (target === 'perhutani') prefix = 'pht';
    else if (target === 'dkp') prefix = 'dkp';
    else if (target === 'invoice') prefix = 'inv';
    else if (target === 'mutasi') prefix = 'mut';
    r.id = \`\${prefix}-imp-\${time}-\${idx}\`;
    await setDoc(doc(db, target, r.id), r);
  }
  return { importedCount };
};`;

const newCommit = `export const commitImportCSV = async (previewRows: PreviewRow[], target: StorageTarget) => {
  const validRows = previewRows.filter(r => r.status === 'valid').map(r => r.data);
  let importedCount = validRows.length;
  if (importedCount === 0) return { importedCount: 0 };
  const time = Date.now();
  
  // Create batch (max 500 operations per batch in Firestore)
  let batch = writeBatch(db);
  let batchCount = 0;
  
  for (let idx = 0; idx < validRows.length; idx++) {
    const r = validRows[idx];
    let prefix = 'imp';
    if (target === 'angkut') prefix = 'ang';
    else if (target === 'ketiga') prefix = 'ktg';
    else if (target === 'perhutani') prefix = 'pht';
    else if (target === 'dkp') prefix = 'dkp';
    else if (target === 'invoice') prefix = 'inv';
    else if (target === 'mutasi') prefix = 'mut';
    r.id = \`\${prefix}-imp-\${time}-\${idx}\`;
    
    batch.set(doc(db, target, r.id), r);
    batchCount++;
    
    // If batch is full, commit and create a new one
    if (batchCount === 490) {
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
    }
  }
  
  // Commit any remaining
  if (batchCount > 0) {
    await batch.commit();
  }
  
  return { importedCount };
};`;

if (code.includes('export const commitImportCSV = async (previewRows: PreviewRow[], target: StorageTarget) => {')) {
  // It's tricky to exactly replace since indentation might differ. We will use a regex to replace the function.
  code = code.replace(/export const commitImportCSV = async \([^]*?return { importedCount };\n};/, newCommit);
  fs.writeFileSync('src/lib/storage.ts', code);
}
