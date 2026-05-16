import { openai } from './ai-providers';

export async function analyzeInsuranceDocument(
  base64Data: string,
  fileType: 'pdf' | 'image',
  docType: string,
  fileName: string
): Promise<{
  summary: string;
  keyBenefits: string[];
  pregnancyCoverage: string[];
  newbornCoverage: string[];
  deductibles: string[];
  copays: string[];
  limitations: string[];
  actionItems: string[];
  deadlines: string[];
  estimatedSavings: string;
  hiddenGems: string[];
  warnings: string[];
}> {
  const docTypeLabels: Record<string, string> = {
    medical: 'Medical Insurance',
    hospital_indemnity: 'Hospital Indemnity Insurance',
    life: 'Life Insurance',
    disability: 'Disability Insurance',
    dental: 'Dental Insurance',
    vision: 'Vision Insurance',
    fsa: 'Health Care FSA',
    hsa: 'Health Savings Account',
    dependent_care: 'Dependent Care FSA',
    other: 'Benefit Document'
  };

  const docLabel = docTypeLabels[docType] || 'Insurance Document';

  const systemPrompt = `You are an expert benefits analyst specializing in employee benefits for new parents. 

Your job is to analyze ${docLabel} documents and extract key information that would help a pregnant person or new parent understand their benefits and take action.

Focus on:
1. Pregnancy and maternity coverage
2. Newborn/infant coverage
3. Costs (deductibles, copays, premiums)
4. Action items they need to take
5. Deadlines and time-sensitive information
6. Benefits that are easy to miss
7. Gotchas or limitations

Be specific with dollar amounts and dates when found. Note page numbers if relevant for large documents.`;

  const userPrompt = `Analyze this ${docLabel} document (${fileName}).

Document type: ${docLabel}
File type: ${fileType === 'pdf' ? 'PDF Document' : 'Image'}

Extract and summarize the following:

1. SUMMARY (2-3 sentences): What is this document and what does it cover?

2. KEY BENEFITS: List the main benefits and what they provide

3. PREGNANCY COVERAGE: Specific coverage for pregnancy, labor, delivery, prenatal care, maternity leave

4. NEWBORN COVERAGE: Coverage for baby after birth (hospital stay, well-baby visits, vaccinations, adding to plan)

5. COSTS: Deductibles, copays, coinsurance, premiums, out-of-pocket maximums - with specific dollar amounts

6. ACTION ITEMS: What does the parent need to DO? (enroll, add baby, submit claims, etc.)

7. DEADLINES: Important dates (enrollment windows, claim deadlines, when to add baby)

8. HIDDEN GEMS: Benefits most people miss that are valuable for new parents

9. WARNINGS: Limitations, exclusions, pre-existing condition clauses, things that cost money

10. ESTIMATED VALUE: Rough estimate of total value/savings

Return as a JSON object with these exact keys:
- summary
- keyBenefits (array)
- pregnancyCoverage (array)
- newbornCoverage (array)
- deductibles (array)
- copays (array)
- limitations (array)
- actionItems (array)
- deadlines (array)
- estimatedSavings (string)
- hiddenGems (array)
- warnings (array)`;

  try {
    // Use Claude for PDFs, GPT-4 Vision for images
    if (fileType === 'pdf') {
      // For PDFs, we'd ideally extract text first
      // For now, using Claude with a note that in production
      // you'd use a PDF text extraction library
      
      // Since we can't easily send PDF binary to Claude via API,
      // we'll use GPT-4 with a note about the limitation
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt + '\n\nNote: This is a PDF document. If you cannot fully analyze it, please indicate what information might be missing and recommend the user review the full document.' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${base64Data}`,
                  detail: 'high'
                }
              }
            ] as any
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
      });

      const content = response.choices[0]?.message?.content || '';
      return parseAnalysisResponse(content);
    } else {
      // For images, use GPT-4 Vision
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                  detail: 'high'
                }
              }
            ] as any
          }
        ],
        temperature: 0.2,
        max_tokens: 2500,
      });

      const content = response.choices[0]?.message?.content || '';
      return parseAnalysisResponse(content);
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    return getFallbackResponse();
  }
}

export async function analyzeInsuranceCard(
  base64Image: string,
  mimeType: string,
  state: string
): Promise<{
  explanation: string;
  keyDetails: string[];
  actionItems: string[];
}> {
  const prompt = `Analyze this insurance card image and provide a clear explanation for a new parent in ${state}.

Extract:
1. Insurance company name
2. Member ID
3. Group number
4. Plan type (PPO, HMO, etc.)
5. Customer service number

Then explain what this means for newborn coverage, key details, and action items.

Return JSON with: explanation, keyDetails (array), actionItems (array)`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an insurance expert helping new parents understand their coverage.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high'
              }
            }
          ] as any
        }
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        explanation: parsed.explanation || 'Analysis complete.',
        keyDetails: Array.isArray(parsed.keyDetails) ? parsed.keyDetails : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      };
    }
    
    return {
      explanation: content,
      keyDetails: [],
      actionItems: ['Contact your insurance provider for details'],
    };
  } catch (error) {
    console.error('Card analysis error:', error);
    return {
      explanation: 'Unable to analyze card. Please contact your insurance provider.',
      keyDetails: [],
      actionItems: ['Call the number on your card'],
    };
  }
}

function parseAnalysisResponse(content: string): any {
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      return {
        summary: parsed.summary || 'Document analyzed.',
        keyBenefits: Array.isArray(parsed.keyBenefits) ? parsed.keyBenefits : [],
        pregnancyCoverage: Array.isArray(parsed.pregnancyCoverage) ? parsed.pregnancyCoverage : [],
        newbornCoverage: Array.isArray(parsed.newbornCoverage) ? parsed.newbornCoverage : [],
        deductibles: Array.isArray(parsed.deductibles) ? parsed.deductibles : [],
        copays: Array.isArray(parsed.copays) ? parsed.copays : [],
        limitations: Array.isArray(parsed.limitations) ? parsed.limitations : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
        estimatedSavings: parsed.estimatedSavings || 'Value depends on usage',
        hiddenGems: Array.isArray(parsed.hiddenGems) ? parsed.hiddenGems : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      };
    } catch (e) {
      console.error('JSON parse error:', e);
    }
  }
  
  return getFallbackResponse();
}

function getFallbackResponse(): any {
  return {
    summary: 'We analyzed your document but could not extract all details. Please review the full document carefully.',
    keyBenefits: [],
    pregnancyCoverage: [],
    newbornCoverage: [],
    deductibles: [],
    copays: [],
    limitations: [],
    actionItems: ['Review the full document', 'Contact HR with questions'],
    deadlines: [],
    estimatedSavings: 'Unknown',
    hiddenGems: [],
    warnings: ['Document analysis incomplete'],
  };
}

export async function analyzeInsuranceText(
  text: string,
  docType: string
): Promise<{
  summary: string;
  keyBenefits: string[];
  pregnancyCoverage: string[];
  newbornCoverage: string[];
  deductibles: string[];
  copays: string[];
  limitations: string[];
  actionItems: string[];
  deadlines: string[];
  estimatedSavings: string;
  hiddenGems: string[];
  warnings: string[];
}> {
  const docTypeLabels: Record<string, string> = {
    medical: 'Medical Insurance',
    hospital_indemnity: 'Hospital Indemnity Insurance',
    life: 'Life Insurance',
    disability: 'Disability Insurance',
    dental: 'Dental Insurance',
    vision: 'Vision Insurance',
    fsa: 'Health Care FSA',
    hsa: 'Health Savings Account',
    dependent_care: 'Dependent Care FSA',
    other: 'Benefit Document'
  };

  const docLabel = docTypeLabels[docType] || 'Insurance Document';

  const prompt = `You are analyzing pasted text from a ${docLabel} document for a new parent.

Here is the text to analyze:
---
${text.substring(0, 120000)} ${text.length > 120000 ? '\n\n[Text truncated due to length]' : ''}
---

Extract and summarize the following information:

1. SUMMARY (2-3 sentences): What is this document and what does it cover?

2. KEY BENEFITS: List the main benefits

3. PREGNANCY COVERAGE: Coverage for pregnancy, labor, delivery, prenatal care, maternity leave

4. NEWBORN COVERAGE: Coverage for baby after birth (hospital stay, well-baby visits, vaccinations, adding to plan)

5. COSTS: Deductibles, copays, coinsurance, premiums, out-of-pocket maximums - with dollar amounts

6. ACTION ITEMS: What does the parent need to DO?

7. DEADLINES: Important dates (enrollment windows, claim deadlines)

8. HIDDEN GEMS: Benefits most people miss

9. WARNINGS: Limitations, exclusions, things that cost money

10. ESTIMATED VALUE: Rough estimate of savings

Return as JSON with these exact keys:
summary, keyBenefits (array), pregnancyCoverage (array), newbornCoverage (array), deductibles (array), copays (array), limitations (array), actionItems (array), deadlines (array), estimatedSavings (string), hiddenGems (array), warnings (array)`;

  try {
    // Use GPT-4 for text analysis (supports up to 128k tokens now)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',  // Use gpt-4o which has 128k context window
      messages: [
        { role: 'system', content: 'You are an expert benefits analyst specializing in employee benefits for new parents. You excel at finding important details in insurance documents that are often overlooked. Be thorough and specific with dollar amounts.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '';
    return parseAnalysisResponse(content);
  } catch (error) {
    console.error('GPT text analysis error:', error);
    return getFallbackResponse();
  }
}
