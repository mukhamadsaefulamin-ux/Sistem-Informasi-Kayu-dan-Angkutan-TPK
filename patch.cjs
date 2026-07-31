const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');
const startTag = '{/* Recent Activity / Daily Haul Records Snapshot */}';
const startIdx = content.indexOf(startTag);

if (startIdx !== -1) {
  const endIdx = content.lastIndexOf('    </div>\n  );\n};\n');
  if (endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + content.substring(endIdx);
    fs.writeFileSync('src/components/DashboardTab.tsx', newContent);
    console.log('Successfully patched!');
  } else {
    // Let's print out the last 50 chars to see what it actually is
    console.log('Could not find end index. Last 50 chars:', content.slice(-50));
  }
} else {
  console.log('Could not find start index.');
}
