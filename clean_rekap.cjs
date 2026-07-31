const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// 1. Remove duplicate isAdmin
code = code.replace("  const isAdmin = userRole === 'admin';\n  return (", "  return (");

// 2. Remove the summary table accordion and table completely
const summaryStart = code.indexOf("{/* Ringkasan Data Accordion */}");
const detailStart = code.indexOf("{/* Detail Data Accordion for Edit/Delete */}");
if (summaryStart !== -1 && detailStart !== -1) {
  code = code.substring(0, summaryStart) + code.substring(detailStart);
}

// 3. Remove the Detail Data Accordion wrapper and just show the div
code = code.replace("{/* Detail Data Accordion for Edit/Delete */}", "{/* Detail Data */}");
code = code.replace(/<button\s+onClick=\{\(\) => setShowDetail\(!showDetail\)\}[\s\S]*?<\/button>/, "");
code = code.replace(/\{showDetail && \(/, "");

// We need to also remove the closing `)}` of the showDetail.
// It's located right before `{/* Modal form */}`
const modalStart = code.indexOf("{/* Modal form */}");
const beforeModal = code.substring(0, modalStart);
const lastClosingIdx = beforeModal.lastIndexOf(")}");
if (lastClosingIdx !== -1) {
  code = code.substring(0, lastClosingIdx) + beforeModal.substring(lastClosingIdx + 2) + code.substring(modalStart);
}

// Also remove `showSummary` wrapper if it exists? I already removed the whole section in step 2.

// Also clean up any lingering setShowSummary/showSummary in the top part
code = code.replace(/const \[showSummary, setShowSummary\] = useState\(true\);\n/g, "");
code = code.replace(/const \[showDetail, setShowDetail\] = useState\(false\);\n/g, "");

fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
