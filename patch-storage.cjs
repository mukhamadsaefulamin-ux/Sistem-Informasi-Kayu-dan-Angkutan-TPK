const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// We will add firestore hooks. 
// Wait, I can just implement a custom React hook!
