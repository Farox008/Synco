const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        filelist = walkSync(filepath, filelist);
      }
    } else {
      if (filepath.endsWith('.tsx') || filepath.endsWith('.ts') || filepath.endsWith('.css')) {
        filelist.push(filepath);
      }
    }
  }
  return filelist;
};

const frontendSrc = path.join(__dirname, 'src');
const files = walkSync(frontendSrc);

const dictionary = [
  { regex: /tool-orders/g, replacement: "job-orders" },
  { regex: /ToolOrder/g, replacement: "JobOrder" },
  { regex: /toolOrder/g, replacement: "jobOrder" },
  { regex: /Tool Order/g, replacement: "Job Order" },
  { regex: /JobModules/g, replacement: "ToolModules" },
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const { regex, replacement } of dictionary) {
    newContent = newContent.replace(regex, replacement);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file}`);
  }
}
