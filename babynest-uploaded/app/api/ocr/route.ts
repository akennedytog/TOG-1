import { NextRequest, NextResponse } from 'next/server';
import { explainInsuranceCard } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const state = formData.get('state') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Use OpenAI Vision API to analyze the insurance card
    const analysis = await explainInsuranceCard(base64Image, file.type, state || 'FL');

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'Failed to process insurance card. Please try again or contact your insurance provider directly.' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 30;
