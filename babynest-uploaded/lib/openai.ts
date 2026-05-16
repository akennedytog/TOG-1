import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout
  maxRetries: 2,
});

// Helper function with timeout
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
}

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export async function chatWithAI(
  messages: ChatMessage[],
  userContext?: {
    state?: string;
    dueDate?: string;
    incomeBracket?: string;
  }
): Promise<string> {
  const systemPrompt = `You are BabyNest, an AI assistant helping new parents navigate financial planning, insurance, and legal tasks for their baby.

Guidelines:
- Be helpful, clear, and actionable
- Always provide specific steps when possible
- If you don't know something specific about a state, say so and suggest they verify with local authorities
- Never give specific investment advice or legal counsel - provide general information only
- Include disclaimers when discussing financial or legal matters

${userContext?.state ? `The user is in ${userContext.state}.` : ''}
${userContext?.dueDate ? `Their due date is ${userContext.dueDate}.` : ''}
${userContext?.incomeBracket ? `Their income bracket is ${userContext.incomeBracket}.` : ''}

Remember: This is not professional financial or legal advice. Users should consult qualified professionals for their specific situation.`;

  try {
    const response = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
      30000
    );

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('OpenAI chat error:', error);
    if (error instanceof Error && error.message === 'Request timeout') {
      return 'I apologize, but the request timed out. Please try again in a moment.';
    }
    throw new Error('Failed to get AI response');
  }
}

export async function explainInsuranceCard(
  imageBase64: string,
  mimeType: string,
  state: string
): Promise<{
  explanation: string;
  keyDetails: string[];
  actionItems: string[];
}> {
  const prompt = `Analyze this insurance card image and provide a clear explanation for a new parent in ${state}.

Look for and extract:
1. Insurance company name
2. Member ID number
3. Group number (if visible)
4. Plan type (PPO, HMO, EPO, etc.)
5. Customer service phone number
6. Any other relevant information

Then provide:
1. A clear, friendly explanation of what this card means for their newborn coverage
2. Key details they should know (deductibles, copays, important deadlines specific to ${state})
3. Action items they need to take for their baby
4. Important deadlines for adding baby to plan

Return your response as a JSON object with these exact keys:
- explanation: (string) friendly explanation for new parents
- keyDetails: (array of strings) important details from the card
- actionItems: (array of strings) what they need to do

Be encouraging and helpful. If any information is unclear, say so and advise them to call the number on the card.`;

  try {
    const response = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an insurance expert helping new parents understand their coverage. Be thorough and accurate.' },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:${mimeType};base64,${imageBase64}`,
                  detail: 'high'
                } 
              }
            ] as any
          },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      30000
    );

    const content = response.choices[0]?.message?.content || '';
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                      content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        return {
          explanation: parsed.explanation || 'Analysis of your insurance card is complete.',
          keyDetails: Array.isArray(parsed.keyDetails) ? parsed.keyDetails : [],
          actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : ['Contact your insurance provider to verify coverage details'],
        };
      } catch {
        // Fall through to structured format
      }
    }
    
    // Return structured format if JSON parsing fails
    return {
      explanation: content,
      keyDetails: [],
      actionItems: ['Contact your insurance provider to verify newborn coverage details'],
    };
  } catch (error) {
    console.error('OpenAI insurance explanation error:', error);
    return {
      explanation: 'Unable to analyze insurance card. Please contact your insurance provider directly.',
      keyDetails: [],
      actionItems: ['Contact insurance provider to verify coverage', 'Call the number on your card for assistance'],
    };
  }
}

export async function generateTaskRecommendations(
  state: string,
  dueDate: string,
  incomeBracket?: string
): Promise<Array<{
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDate: string;
}>> {
  const prompt = `Generate a list of important financial and insurance tasks for a new parent in ${state} with a due date of ${dueDate}${incomeBracket ? ` and income bracket ${incomeBracket}` : ''}.

Include tasks related to:
- Health insurance enrollment
- 529 college savings plans
- Tax benefits and credits
- Legal documents (will, guardianship)
- Life insurance
- General financial planning

For each task, provide:
- Title
- Description
- Category (insurance, 529, tax, legal, general)
- Priority (urgent, high, medium, low)
- Suggested due date (relative to birth date)

Return as JSON array.`;

  try {
    const response = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a financial planning expert specializing in new parent finances.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
      30000
    );

    const content = response.choices[0]?.message?.content || '[]';
    
    try {
      return JSON.parse(content);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('OpenAI task generation error:', error);
    return [];
  }
}

export async function summarizeConversation(messages: ChatMessage[]): Promise<string> {
  const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  
  const prompt = `Summarize this conversation between a user and BabyNest AI assistant:

${conversationText}

Provide a brief summary (2-3 sentences) of what was discussed and any key takeaways.`;

  try {
    const response = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 150,
      }),
      30000
    );

    return response.choices[0]?.message?.content || 'Conversation summary unavailable';
  } catch (error) {
    console.error('OpenAI summary error:', error);
    return 'Conversation summary unavailable';
  }
}

export async function analyzeInsuranceDocument(
  imageBase64: string,
  mimeType: string,
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

  const prompt = `Analyze this ${docLabel} document for a new parent who is pregnant or recently had a baby.

Extract and summarize the following information:

1. SUMMARY: A 2-3 sentence summary of what this document covers and its key purpose

2. KEY BENEFITS: List the main benefits (what does this insurance/program provide?)

3. PREGNANCY COVERAGE: Specific coverage related to pregnancy, labor, delivery, prenatal care, etc.

4. NEWBORN COVERAGE: Coverage for the baby after birth (hospital stay, well-baby visits, vaccinations, etc.)

5. COSTS: Deductibles, copays, coinsurance amounts, out-of-pocket maximums

6. ACTION ITEMS: What does the parent need to DO? (enroll, submit claims, add baby, etc.)

7. DEADLINES: Any important dates mentioned (enrollment deadlines, claim filing deadlines, etc.)

8. HIDDEN GEMS: Benefits that are easy to miss or not well-known but valuable for parents

9. WARNINGS: Important limitations, exclusions, or things that could cost money if not understood

10. ESTIMATED VALUE: Rough estimate of how much money this could save the parent

Return ONLY a JSON object with these exact keys:
- summary: string
- keyBenefits: array of strings
- pregnancyCoverage: array of strings  
- newbornCoverage: array of strings
- deductibles: array of strings
- copays: array of strings
- limitations: array of strings
- actionItems: array of strings
- deadlines: array of strings
- estimatedSavings: string
- hiddenGems: array of strings
- warnings: array of strings

Be specific about dollar amounts where found. Note any "callouts" or highlighted important information.`;

  try {
    const response = await withTimeout(
      openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert benefits analyst specializing in employee benefits for new parents. You excel at finding important details in insurance documents that are often overlooked.' },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { 
                  url: `data:${mimeType};base64,${imageBase64}`,
                  detail: 'high'
                } 
              }
            ] as any
          },
        ],
        temperature: 0.2,
        max_tokens: 2500,
      }),
      30000
    );

    const content = response.choices[0]?.message?.content || '';
    
    // Try to extract JSON
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                      content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        return {
          summary: parsed.summary || 'Document analyzed successfully.',
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
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
      }
    }
    
    // Fallback if JSON parsing fails
    return {
      summary: 'We analyzed your document but could not extract structured data. Please review the original document carefully.',
      keyBenefits: [],
      pregnancyCoverage: [],
      newbornCoverage: [],
      deductibles: [],
      copays: [],
      limitations: [],
      actionItems: ['Review the full document carefully', 'Contact HR or your benefits administrator with questions'],
      deadlines: [],
      estimatedSavings: 'Unknown - please review document',
      hiddenGems: [],
      warnings: ['Document could not be fully parsed - manual review recommended'],
    };
  } catch (error) {
    console.error('OpenAI document analysis error:', error);
    return {
      summary: 'Unable to analyze document due to an error.',
      keyBenefits: [],
      pregnancyCoverage: [],
      newbornCoverage: [],
      deductibles: [],
      copays: [],
      limitations: [],
      actionItems: ['Try uploading a clearer image or PDF', 'Contact your HR department for assistance'],
      deadlines: [],
      estimatedSavings: 'Unable to estimate',
      hiddenGems: [],
      warnings: ['Analysis failed - please try again with a clearer document'],
    };
  }
}
