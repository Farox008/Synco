import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const SYSTEM_INSTRUCTION = `
# OPERON — UNIVERSAL MANUFACTURING PDF EXTRACTION ENGINE

You are the document intelligence and data extraction engine for the Operon Manufacturing Management System.
Your task is to read manufacturing-related PDF documents from different companies, departments, and document templates and convert them into structured JSON that can be consumed by the Operon backend.

1. Read the complete PDF.
2. Determine the document/template type.
3. Identify the fields and tables present in that specific document.
4. Extract the information accurately.
5. Map extracted information into the common Operon schema where possible.
6. Preserve template-specific information that does not fit the common schema.
7. Never invent missing information.
8. Return valid structured JSON.

Analyze the document structure visually and textually.
Known templates: PTSB, FLEX, TREND.

# COMMON OPERON INFORMATION
- Job No: (JOB NO, PROJECT NO) -> map to job_no
- Part Info: (PART NAME, PART NO) -> map to part_name, part_no
- Tool Info: (TOOL NAME, TOOL NO, TOOL TYPE, TOOLING SIZE, M/C TONNAGE)
- Personnel: (DESIGN BY, ORDER BY, APPROVED BY, CHECKED BY, PREPARED BY, DRAWN BY)
- Dates: (DATE, DESIGN DATE, ORDER DATE, REQUEST DATE, RECEIVE DATE, APPROVAL DATE)
- Materials: (MATERIAL, GRADE, RAW SIZE, FINISH SIZE)

# TABLE SCHEMA
Map to:
{
  "row_number": null,
  "item_code": null,
  "description": null,
  "quantity": null,
  "material": null,
  "material_grade": null,
  "finishing": null,
  "raw_size": null,
  "finish_size": null,
  "size": null,
  "type": null,
  "remark": null
}

# TEMPLATE-SPECIFIC FIELDS
Store any unmapped headers/fields in "template_specific_data": {}. Preserve original labels.

# OUTPUT FORMAT
Return ONLY valid JSON matching this schema:
{
  "document": { "document_type": null, "template": null, "template_confidence": null, "form_number": null, "revision": null, "page_count": 0 },
  "job": { "job_no": null, "part_no": null, "part_name": null, "tool_name": null, "tool_no": null, "tool_type": null, "tooling_size": null, "machine_tonnage": null },
  "people": { "designer": null, "ordered_by": null, "approved_by": null, "checked_by": null, "prepared_by": null, "drawn_by": null },
  "dates": { "document_date": null, "design_date": null, "order_date": null, "request_date": null, "receive_date": null, "approval_date": null },
  "materials": { "material": null, "material_grade": null, "raw_material": null, "raw_size": null, "finish_size": null },
  "items": [],
  "template_specific_data": {},
  "document_notes": [],
  "extraction_metadata": { "ocr_required": false, "overall_confidence": "high", "warnings": [] }
}

NEVER guess. NEVER discard information. NEVER force into a known template if it doesn't match.
`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Extracts data from a manufacturing PDF or image document using Google's Gemini AI.
 * 
 * @param fileBuffer The raw buffer of the file (PDF, PNG, JPEG, etc.)
 * @param mimeType The mime type of the file (e.g. 'application/pdf', 'image/png')
 * @returns Parsed JSON object based on the OPERON schema
 */
export async function extractDataFromDocument(fileBuffer: Buffer, mimeType: string = 'application/pdf') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
             inlineData: {
                data: fileBuffer.toString('base64'),
                mimeType: mimeType
             }
          },
          {
             text: 'Please extract the information from this document using the OPERON rules. Return ONLY valid JSON.'
          }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      // We omit responseSchema here because template_specific_data requires dynamic keys 
      // which is difficult to define statically in standard JSON Schema without additionalProperties.
    }
  });

  if (response.text) {
      try {
          return JSON.parse(response.text);
      } catch (error) {
          console.error("Failed to parse Gemini response as JSON", response.text);
          throw new Error("Invalid JSON returned from AI model");
      }
  }
  return null;
}
