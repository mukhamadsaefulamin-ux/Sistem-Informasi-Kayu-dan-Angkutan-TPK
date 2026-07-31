const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';",
  "import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs, query } from 'firebase/firestore';"
);

// also remove `require('firebase/firestore')` since we imported them
code = code.replace(/const \{ getDocs, query, collection, writeBatch \} = require\('firebase\/firestore'\);\n/g, "");

fs.writeFileSync('src/App.tsx', code);
