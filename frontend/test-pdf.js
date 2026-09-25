const pdfParse = require('pdf-parse');
console.log('pdfParse type:', typeof pdfParse);
if (typeof pdfParse !== 'function') {
  console.log('Keys:', Object.keys(pdfParse));
}
