const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

code = code.replace(
  "import { Menu, HardDrive, UserCheck, Lock, Unlock, LogOut } from 'lucide-react';",
  "import { Menu, Cloud, UserCheck, Lock, Unlock, LogOut } from 'lucide-react';"
);

const oldBadge = `{/* Local Storage Indicator */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200/80 shadow-xs"
          title="Data tersimpan otomatis di browser lokal & mendukung sync Google Sheets"
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Local Storage & Sync Mode</span>
        </div>`;

const newBadge = `{/* Cloud Storage Indicator */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200/80 shadow-xs"
          title="Data tersimpan otomatis dan aman di Cloud Database (Real-time)"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud Storage Aktif</span>
        </div>`;

code = code.replace(oldBadge, newBadge);

fs.writeFileSync('src/components/Header.tsx', code);
