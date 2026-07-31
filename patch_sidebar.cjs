const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Insert Drive icon
if (!code.includes('DatabaseBackup')) {
    code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1, DatabaseBackup } from 'lucide-react';");
}

// Add DriveBackup button in Laporan & Integrasi section, only for admin
const importButtonCode = `                  {userRole === 'admin' && (
      <button
        onClick={() => {
          onOpenImportModal();
          onClose();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/10 transition-colors text-slate-300 font-medium text-sm cursor-pointer"
      >
        <FileSpreadsheet className="w-5 h-5 text-teal-400" />
        <span>Import CSV / Sheets</span>
      </button>
  )}`;

const newButtonCode = `                  {userRole === 'admin' && (
      <>
        <button
          onClick={() => {
            onOpenImportModal();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/10 transition-colors text-slate-300 font-medium text-sm cursor-pointer"
        >
          <FileSpreadsheet className="w-5 h-5 text-teal-400" />
          <span>Import CSV / Sheets</span>
        </button>
        <button
          onClick={() => {
            if (onOpenDriveBackupModal) onOpenDriveBackupModal();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/10 transition-colors text-slate-300 font-medium text-sm cursor-pointer"
        >
          <DatabaseBackup className="w-5 h-5 text-blue-400" />
          <span>Google Drive Backup</span>
        </button>
      </>
  )}`;

if (code.includes(importButtonCode)) {
  code = code.replace(importButtonCode, newButtonCode);
  
  // Add onOpenDriveBackupModal prop
  code = code.replace("onOpenImportModal: () => void;", "onOpenImportModal: () => void;\n  onOpenDriveBackupModal?: () => void;");
  code = code.replace("onOpenImportModal\n}) => {", "onOpenImportModal,\n  onOpenDriveBackupModal\n}) => {");
  
  fs.writeFileSync('src/components/Sidebar.tsx', code);
  console.log('Sidebar patched successfully.');
} else {
  console.log('Could not find import button code in Sidebar.');
}
