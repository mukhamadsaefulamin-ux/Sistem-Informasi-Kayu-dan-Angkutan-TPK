const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

// Add imports to the top
code = "import { doc, setDoc } from 'firebase/firestore';\nimport { db } from './firebase';\n" + code;

// Remove require
code = code.replace(/const \{ doc, setDoc \} = require\('firebase\/firestore'\);\n/g, "");
code = code.replace(/const \{ db \} = require\('\.\/firebase'\);\n/g, "");

fs.writeFileSync('src/lib/storage.ts', code);
