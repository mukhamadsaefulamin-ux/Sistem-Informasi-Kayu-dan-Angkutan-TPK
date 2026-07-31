const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('DriveBackupModal')) {
    code = code.replace("import { ImportModal } from './components/ImportModal';", "import { ImportModal } from './components/ImportModal';\nimport { DriveBackupModal } from './components/DriveBackupModal';");
    code = code.replace("const [isImportModalOpen, setIsImportModalOpen] = useState(false);", "const [isImportModalOpen, setIsImportModalOpen] = useState(false);\n  const [isDriveBackupModalOpen, setIsDriveBackupModalOpen] = useState(false);");
    code = code.replace("onOpenImportModal={() => setIsImportModalOpen(true)}", "onOpenImportModal={() => setIsImportModalOpen(true)}\n        onOpenDriveBackupModal={() => setIsDriveBackupModalOpen(true)}");
    code = code.replace("<ImportModal", "<DriveBackupModal isOpen={isDriveBackupModalOpen} onClose={() => setIsDriveBackupModalOpen(false)} />\n      <ImportModal");
    fs.writeFileSync('src/App.tsx', code);
    console.log('App.tsx patched successfully.');
} else {
    console.log('DriveBackupModal already included.');
}
