import OpenAI from 'openai';

// Lazy initialization - only create client when needed
let openaiClient: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// Backwards compatibility - lazy getter
export const openai = new Proxy({} as OpenAI, {
  get(_, prop) {
    const client = getOpenAI();
    return (client as any)[prop];
  },
});
