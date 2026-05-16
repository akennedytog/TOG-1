import { NextRequest, NextResponse } from 'next/server';
import { analyzeInsuranceText } from '@/lib/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    const { text, docType } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Analyze the pasted text using Claude
    const analysis = await analyzeInsuranceText(text, docType || 'medical');

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Insurance text analysis error:', error);
    return NextResponse.json(
      { 
        summary: 'Analysis failed. Please try again with different text.',
        keyBenefits: [],
        pregnancyCoverage: [],
        newbornCoverage: [],
        deductibles: [],
        copays: [],
        limitations: [],
        actionItems: ['Try pasting different sections of the document'],
        deadlines: [],
        estimatedSavings: 'Unable to estimate',
        hiddenGems: [],
        warnings: ['Analysis failed']
      },
      { status: 200 }
    );
  }
}

export const runtime = 'edge';
export const maxDuration = 60;
