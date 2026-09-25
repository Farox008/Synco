const { spawn } = require('child_process');
const pythonProcess = spawn('python', ['-c', 'import pdfplumber; print("pdfplumber is installed")']);

pythonProcess.stdout.on('data', (data) => console.log('STDOUT:', data.toString()));
pythonProcess.stderr.on('data', (data) => console.error('STDERR:', data.toString()));
pythonProcess.on('close', (code) => console.log('Exited with code:', code));
