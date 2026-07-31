const fs = require('fs');
let code = fs.readFileSync('src/components/ImportModal.tsx', 'utf8');

code = code.replace(
  "  const handleConfirmImport = () => {",
  "  const handleConfirmImport = async () => {"
);
code = code.replace(
  "const { importedCount } = commitImportCSV(previewResult.rows, target);",
  "const { importedCount } = await commitImportCSV(previewResult.rows, target);"
);

fs.writeFileSync('src/components/ImportModal.tsx', code);
