const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const scopesToInject = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts'
];

let injectedScopesStr = scopesToInject.map(scope => `provider.addScope('${scope}');`).join('\n');

code = code.replace("provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');", "provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');\n" + injectedScopesStr);

fs.writeFileSync('src/lib/firebase.ts', code);
