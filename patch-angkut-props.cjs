const fs = require('fs');
let code = fs.readFileSync('src/components/AngkutTab.tsx', 'utf8');

code = code.replace(/interface AngkutTabProps \{/,
`interface AngkutTabProps {
  filterDate: string;
  onFilterDateChange: (date: string) => void;`);

code = code.replace(/export const AngkutTab: React.FC<AngkutTabProps> = \(\{/,
`export const AngkutTab: React.FC<AngkutTabProps> = ({ filterDate, onFilterDateChange, `);

code = code.replace(/const \[filterDate, setFilterDate\] = useState\(''\);\n/, '');
code = code.replace(/setFilterDate\(/g, 'onFilterDateChange(');

fs.writeFileSync('src/components/AngkutTab.tsx', code);
