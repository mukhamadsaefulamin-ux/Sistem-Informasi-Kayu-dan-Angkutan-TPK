const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

if (!code.includes('DatabaseBackup')) {
    code = code.replace("} from 'lucide-react';", "  DatabaseBackup,\n} from 'lucide-react';");
    fs.writeFileSync('src/components/Sidebar.tsx', code);
    console.log('Sidebar import patched successfully.');
} else {
    console.log('DatabaseBackup already in Sidebar.');
}
