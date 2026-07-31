const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const cacheSetup = `
import { collection, onSnapshot } from 'firebase/firestore';

let cachedAngkut: any[] = [];
let cachedKetiga: any[] = [];
let cachedPerhutani: any[] = [];
let cachedDKP: any[] = [];
let cachedInvoice: any[] = [];

// Initialize subscriptions immediately so cache is populated
if (typeof window !== 'undefined') {
  onSnapshot(collection(db, 'angkut'), snap => {
    cachedAngkut = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'ketiga'), snap => {
    cachedKetiga = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'perhutani'), snap => {
    cachedPerhutani = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'dkp'), snap => {
    cachedDKP = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
  onSnapshot(collection(db, 'invoice'), snap => {
    cachedInvoice = snap.docs.map(d => ({id: d.id, ...d.data()}));
  });
}
`;

// Insert after imports
code = code.replace("const KEY_ANGKUT = 'tpk_angkut';", cacheSetup + "\nconst KEY_ANGKUT = 'tpk_angkut';");

// Replace loadData to use cache
code = code.replace(/export const loadDataAngkut = \(\): DataAngkut\[\] => \{[\s\S]*?return \[\];\n  \}\n\};/m, "export const loadDataAngkut = (): DataAngkut[] => cachedAngkut;");
code = code.replace(/export const loadDataKetiga = \(\): DataKetiga\[\] => \{[\s\S]*?return \[\];\n  \}\n\};/m, "export const loadDataKetiga = (): DataKetiga[] => cachedKetiga;");
code = code.replace(/export const loadDataPerhutani = \(\): DataPerhutani\[\] => \{[\s\S]*?return \[\];\n  \}\n\};/m, "export const loadDataPerhutani = (): DataPerhutani[] => cachedPerhutani;");
code = code.replace(/export const loadDataDKP = \(\): DataDKP\[\] => \{[\s\S]*?return \[\];\n  \}\n\};/m, "export const loadDataDKP = (): DataDKP[] => cachedDKP;");
code = code.replace(/export const loadDataInvoice = \(\): DataInvoice\[\] => \{[\s\S]*?return \[\];\n  \}\n\};/m, "export const loadDataInvoice = (): DataInvoice[] => cachedInvoice;");

fs.writeFileSync('src/lib/storage.ts', code);
