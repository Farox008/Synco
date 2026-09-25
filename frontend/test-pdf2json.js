const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(this, 1);
pdfParser.on('pdfParser_dataReady', (pdfData) => {
  console.log(pdfParser.getRawTextContent());
});
console.log(typeof pdfParser.parseBuffer);
