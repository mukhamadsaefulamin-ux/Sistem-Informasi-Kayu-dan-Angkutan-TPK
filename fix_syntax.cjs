const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  "    }\n  }\n\n  } else if (target === 'mutasi') {",
  "    }\n  } else if (target === 'mutasi') {"
);

fs.writeFileSync('src/lib/storage.ts', code);
