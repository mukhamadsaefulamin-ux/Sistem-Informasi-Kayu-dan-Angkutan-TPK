const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// The block to remove:
// const [addFormYear ... to ... const avgVol = addTotalVol / addCount;

const startString = "const [addFormYear, setAddFormYear] = useState(new Date().getFullYear().toString());";
const endString = "const avgVol = addTotalVol / addCount;";

const startIndex = code.indexOf(startString);
const endIndex = code.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
  // also find the '    ' before startString
  const actualStartIndex = code.lastIndexOf('\\n', startIndex) + 1;
  const actualEndIndex = endIndex + endString.length;
  code = code.substring(0, actualStartIndex) + code.substring(actualEndIndex);
  fs.writeFileSync('src/components/RekapMutasiTab.tsx', code);
  console.log("Removed unused state variables.");
} else {
  console.log("Could not find start or end string.");
}
