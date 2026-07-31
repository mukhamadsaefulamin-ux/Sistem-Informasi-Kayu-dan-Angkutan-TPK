const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const oldCommit = `export const commitImportCSV = async (previewRows: PreviewRow[], target: StorageTarget) => {
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

const newCommit = `export const commitImportCSV = async (previewRows: PreviewRow[], target: StorageTarget) => {
  const validRows = previewRows.filter(r => r.status === 'valid').map(r => r.data);
  let importedCount = validRows.length;
  if (importedCount === 0) return { importedCount: 0 };
  const time = Date.now();
  
  // Create batch (max 500 operations per batch in Firestore)
  let batch = writeBatch(db);
  let batchCount = 0;
  const promises: Promise<void>[] = [];
  
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
      promises.push(batch.commit());
      batch = writeBatch(db);
      batchCount = 0;
    }
  }
  
  // Commit any remaining
  if (batchCount > 0) {
    promises.push(batch.commit());
  }
  
  // Fire and forget: We do not await promises here so the UI returns instantly.
  // Firestore's latency compensation will immediately update local snapshot listeners.
  Promise.all(promises).catch(err => console.error('Batch commit error:', err));
  
  return { importedCount };
};`;

code = code.replace(oldCommit, newCommit);
fs.writeFileSync('src/lib/storage.ts', code);
