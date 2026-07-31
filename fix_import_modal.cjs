const fs = require('fs');
let code = fs.readFileSync('src/components/ImportModal.tsx', 'utf8');

code = code.replace(
  "  const handleCommitImport = () => {",
  "  const handleCommitImport = async () => {"
);

fs.writeFileSync('src/components/ImportModal.tsx', code);
