const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = "import { getFirestore } from 'firebase/firestore';\n" + code;
code = code.replace("export const auth = getAuth(app);", "export const auth = getAuth(app);\nexport const db = getFirestore(app);");

fs.writeFileSync('src/lib/firebase.ts', code);
