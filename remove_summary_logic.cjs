const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// summaryData is declared as: const summaryData = useMemo(() => { ... }, [filteredData]);
// grandTotals is declared as: const grandTotals = useMemo(() => { ... }, [summaryData]);

const summaryDataStart = code.indexOf("const summaryData = useMemo(() => {");
const grandTotalsStart = code.indexOf("const grandTotals = useMemo(() => {");
const nextBlockStart = code.indexOf("const formatBtg =");

if (summaryDataStart !== -1 && nextBlockStart !== -1) {
  code = code.substring(0, summaryDataStart) + code.substring(nextBlockStart);
  fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
  console.log("Removed summary data logic");
} else {
  console.log("Could not find blocks");
}
