const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add DatabaseBackup to lucide-react import
if (!code.includes('DatabaseBackup')) {
    code = code.replace(/import\s*\{([^}]*)\}\s*from\s*'lucide-react';/m, (match, p1) => {
        return `import {${p1}, DatabaseBackup} from 'lucide-react';`;
    });
}

// Add onOpenDriveBackupModal to destructured props
if (!code.includes('onOpenDriveBackupModal,')) {
    code = code.replace("onOpenImportModal,", "onOpenImportModal,\n  onOpenDriveBackupModal,");
}

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log('Sidebar successfully fixed.');
