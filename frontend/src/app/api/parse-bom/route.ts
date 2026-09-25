import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Basic virus/malware heuristic scanning
const isMalicious = (buffer: Buffer, text: string): boolean => {
  const magicNumber = buffer.toString('utf-8', 0, 5);
  if (magicNumber !== '%PDF-') {
    console.error('[SECURITY] File rejected: Invalid magic number:', magicNumber);
    return true;
  }

  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /\/JS\b/g,
    /\/JavaScript\b/g,
    /\/OpenAction\b/g
  ];

  const rawString = buffer.toString('utf-8');
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text) || pattern.test(rawString)) {
      console.error(`[SECURITY] File rejected: Detected malicious pattern: ${pattern}`);
      return true;
    }
  }
  return false;
};

export async function POST(req: NextRequest) {
  try {
    console.log('\n==============================================');
    console.log('[BOM API] Received POST request to /api/parse-bom');
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      console.error('[BOM API] Error: No file provided in request.');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`[BOM API] File received: ${file.name} (${file.size} bytes)`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('[SECURITY] Running malware/virus heuristics...');
    if (isMalicious(buffer, "")) {
      return NextResponse.json({ error: 'Security Check Failed: File rejected due to malicious content or invalid format.' }, { status: 403 });
    }
    console.log('[SECURITY] File passed basic security checks.');

    // Create a temporary file to feed to the python script
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `bom-upload-${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, buffer);
    console.log(`[BOM API] Saved temp file to ${tempFilePath}`);

    console.log('[BOM API] Spawning Python extraction engine...');
    
    // Assume backend/scripts/parse_bom.py relative to the project root
    const scriptPath = path.resolve(process.cwd(), '../backend/scripts/parse_bom.py');
    
    const pythonProcess = spawn('python', [scriptPath, tempFilePath]);

    let jsonOutput = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      jsonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      // Stream python logs directly to Next.js terminal
      process.stdout.write(data.toString());
      errorOutput += data.toString();
    });

    return new Promise<NextResponse>((resolve) => {
      pythonProcess.on('close', (code) => {
        // Cleanup temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        if (code !== 0) {
          console.error(`[BOM API] Python process exited with code ${code}`);
          try {
            const parsedErr = JSON.parse(jsonOutput);
            resolve(NextResponse.json({ error: parsedErr.error || 'Python extraction engine failed.' }, { status: 500 }));
          } catch (e) {
            console.error(`[BOM API] Python Error Output: ${errorOutput}`);
            resolve(NextResponse.json({ error: `Python extraction engine failed. ${errorOutput}` }, { status: 500 }));
          }
          return;
        }

        try {
          const extractedData = JSON.parse(jsonOutput);
          console.log('[BOM API] Parsing completed successfully. Returning payload to frontend.');
          console.log('==============================================\n');
          resolve(NextResponse.json(extractedData));
        } catch (e) {
          console.error('[BOM API] Failed to parse JSON output from python script:', e);
          resolve(NextResponse.json({ error: 'Invalid output from extraction engine.' }, { status: 500 }));
        }
      });
    });

  } catch (error) {
    console.error("[BOM API] CRITICAL ERROR during PDF parsing:", error);
    return NextResponse.json({ error: 'Internal Server Error during PDF parsing.' }, { status: 500 });
  }
}
