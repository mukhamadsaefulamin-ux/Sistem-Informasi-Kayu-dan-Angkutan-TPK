const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace("const dummyCommit =  = (previewRows", "const dummyCommit = (previewRows");

fs.writeFileSync('src/lib/storage.ts', code);
