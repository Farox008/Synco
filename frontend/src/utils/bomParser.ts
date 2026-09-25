export const parseMockBOM = async (file: File): Promise<any> => {
  try {
    // [FRONTEND SECURITY CHECK] 1. Check File Size (< 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert('Security Check Failed: File is too large. Maximum size is 5MB.');
      throw new Error('File too large');
    }

    // [FRONTEND SECURITY CHECK] 2. Check MIME Type
    if (file.type !== 'application/pdf') {
      alert('Security Check Failed: Invalid file type. Only PDFs are allowed.');
      throw new Error('Invalid file type');
    }

    console.log(`[BOM Parser Client] Sending ${file.name} to secure backend API...`);

    // Create FormData payload
    const formData = new FormData();
    formData.append('file', file);

    // Send to Secure Server API
    const response = await fetch('/api/parse-bom', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[BOM Parser Client] Backend rejected the file:', data.error);
      alert(data.error || 'Server error during extraction.');
      throw new Error(data.error);
    }

    console.log('[BOM Parser Client] Successfully extracted data from secure server.');
    return data;

  } catch (error) {
    console.error("[BOM Parser Client] Process failed:", error);
    throw error;
  }
};
