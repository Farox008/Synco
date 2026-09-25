const fs = require('fs');
const path = require('path');
const indexContent = fs.readFileSync(path.join(__dirname, 'node_modules', 'pdf-parse', 'index.js'), 'utf8');
console.log(indexContent.substring(0, 500));
