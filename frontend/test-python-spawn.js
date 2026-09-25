const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(__dirname, '../backend/scripts/parse_bom.py');

const pythonProcess = spawn('python', [scriptPath, 'test/data/some-fake-file.pdf']);

pythonProcess.stdout.on('data', (data) => {
  console.log('STDOUT:', data.toString());
});

pythonProcess.stderr.on('data', (data) => {
  console.error('STDERR:', data.toString());
});

pythonProcess.on('close', (code) => {
  console.log('Exited with code:', code);
});
