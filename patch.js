const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardTab.tsx', 'utf8');
const startTag = '{/* Recent Activity / Daily Haul Records Snapshot */}';
const startIdx = content.indexOf(startTag);

if (startIdx !== -1) {
  // Let's find the closing div of this section.
  // The section is enclosed in a div right below the tag.
  // There are two closing divs at the very end of the file.
  // We can just keep the last `    </div>\n  );\n};\n`
  const endIdx = content.lastIndexOf('    </div>\n  );\n};\n');
  if (endIdx !== -1) {
    const newContent = content.substring(0, startIdx) + content.substring(endIdx);
    fs.writeFileSync('src/components/DashboardTab.tsx', newContent);
    console.log('Successfully patched!');
  } else {
    console.log('Could not find end index.');
  }
} else {
  console.log('Could not find start index.');
}
