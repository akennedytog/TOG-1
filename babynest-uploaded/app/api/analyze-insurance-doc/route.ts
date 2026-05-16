import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeInsuranceDocument,
  analyzeInsuranceCard,
  analyzeInsuranceText,
} from '@/lib/ai-analysis';

export const runtime = 'nodejs';
export const maxDuration = 120; // Increase timeout for large docs

const FALLBACK_RESPONSE = {
  summary:
    'Analysis failed. Please try uploading a clearer document or contact support.',
  keyBenefits: [],
  pregnancyCoverage: [],
  newbornCoverage: [],
  deductibles: [],
  copays: [],
  limitations: [],
  actionItems: ['Try uploading a clearer image', 'Contact HR for assistance'],
  deadlines: [],
  estimatedSavings: 'Unable to estimate',
  hiddenGems: [],
  warnings: ['Analysis failed - please try again'],
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const docType = (formData.get('docType') as string) || 'medical';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const isPDF =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let analysis;

    if (isPDF) {
      // Extract text from PDF first, then analyze the text with Claude/GPT.
      // This is much more reliable than sending base64-PDF to a vision model.
      let extractedText = '';
      try {
        // Dynamic import — pdf-parse pulls in Node-only deps and shouldn't run
        // on the edge runtime. We force nodejs runtime above.
        const { PDFParse } = await import('pdf-parse');
        // Pass a Uint8Array view of the buffer (pdf-parse v2 prefers TypedArrays)
        const data = new Uint8Array(buffer);
        const parser = new PDFParse({ data });
        const result = await parser.getText();
        extractedText = (result.text || '').trim();
        await parser.destroy();
      } catch (parseError) {
        console.error('PDF text extraction failed:', parseError);
      }

      if (extractedText.length > 50) {
        analysis = await analyzeInsuranceText(extractedText, docType);
      } else {
        // Fallback: couldn't extract usable text (scanned PDF, etc.).
        // Try the legacy base64 path as a last resort.
        const base64Data = buffer.toString('base64');
        analysis = await analyzeInsuranceDocument(
          base64Data,
          'pdf',
          docType,
          file.name
        );
        if (!analysis?.summary || analysis.summary === FALLBACK_RESPONSE.summary) {
          analysis = {
            ...FALLBACK_RESPONSE,
            summary:
              'Could not extract text from this PDF (it may be a scanned image). Try uploading clearer page images, or paste the text directly.',
            warnings: [
              'PDF text extraction returned no readable content',
              'If this is a scanned PDF, OCR is required before analysis',
            ],
            actionItems: [
              'Re-export the PDF with selectable text',
              'Or upload individual page screenshots',
              'Or paste the text directly using the Paste Text option',
            ],
          };
        }
      }
    } else {
      // For images, use Vision API (GPT-4o)
      const base64Data = buffer.toString('base64');
      analysis = await analyzeInsuranceCard(
        base64Data,
        file.type,
        docType
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Insurance document analysis error:', error);
    return NextResponse.json(FALLBACK_RESPONSE, { status: 200 });
  }
}
