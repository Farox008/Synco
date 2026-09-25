async function run() {
  const pdfjsLib = await import('pdfjs-dist');
  console.log(pdfjsLib.getDocument);
}
run();
