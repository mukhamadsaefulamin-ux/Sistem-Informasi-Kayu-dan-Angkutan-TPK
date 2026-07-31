const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// Remove accordion for Ringkasan Total
code = code.replace(/<button\s+onClick=\{\(\) => setShowSummary\(!showSummary\)\}[\s\S]*?<\/button>/, "");
code = code.replace(/\{showSummary && \(/, "");

// find the closing `)}` for showSummary
const targetText = '{/* Detail Data */}';
const targetIndex = code.indexOf(targetText);
if (targetIndex !== -1) {
  const beforeTarget = code.substring(0, targetIndex);
  const closingIdx = beforeTarget.lastIndexOf(')}');
  if (closingIdx !== -1) {
    code = code.substring(0, closingIdx) + beforeTarget.substring(closingIdx + 2) + code.substring(targetIndex);
  }
}

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
