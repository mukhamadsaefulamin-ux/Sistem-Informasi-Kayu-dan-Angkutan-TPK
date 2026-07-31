const fs = require('fs');
let code = fs.readFileSync('src/components/RekapMutasiTab.tsx', 'utf8');

// The file has a duplicate `const RekapMutasiTab: React.FC<RekapMutasiTabProps> = ({ ... }) => {`
// Let's find all occurrences of it.
const matches = [...code.matchAll(/const RekapMutasiTab: React\.FC<RekapMutasiTabProps> =/g)];
console.log(`Found ${matches.length} declarations of RekapMutasiTab`);

// I will write a completely fresh file and just extract the JSX and state manually to be safe.
