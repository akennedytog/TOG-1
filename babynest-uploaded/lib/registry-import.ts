export type RegistrySource = 'amazon' | 'target' | 'babylist';

export interface ImportedRegistryItem {
  name: string;
  price?: number;
  category?: string;
  image_url?: string;
  external_url?: string;
  quantity?: number;
  priority?: 'essential' | 'nice-to-have' | 'optional';
}

export interface ImportResult {
  success: boolean;
  items: ImportedRegistryItem[];
  source: RegistrySource;
  itemsFound: number;
  itemsAdded: number;
  errors: string[];
}

export interface RegistryImportProgress {
  status: 'idle' | 'fetching' | 'parsing' | 'saving' | 'complete' | 'error';
  message: string;
  progress: number;
  itemsFound?: number;
  itemsAdded?: number;
  errors?: string[];
}

// Registry URL patterns for validation
export const REGISTRY_PATTERNS: Record<RegistrySource, RegExp[]> = {
  amazon: [
    /amazon\.com\/.*registry\/wishlist/i,
    /amazon\.com\/.*baby-reg/i,
    /amazon\.com\/gp\/registry/i,
    /amzn\.to\//i,
  ],
  target: [
    /target\.com\/.*registry/i,
    /target\.com\/gift-registry/i,
    /tgt\.biz\//i,
  ],
  babylist: [
    /babylist\.com\/.*registry/i,
    /babyli\.st\//i,
    /blist\.co\//i,
  ],
};

/**
 * Detect registry source from URL
 */
export function detectRegistrySource(url: string): RegistrySource | null {
  const lowerUrl = url.toLowerCase();

  for (const [source, patterns] of Object.entries(REGISTRY_PATTERNS)) {
    if (patterns.some((pattern: RegExp) => pattern.test(lowerUrl))) {
      return source as RegistrySource;
    }
  }

  // Fallback: check domain
  if (lowerUrl.includes('amazon')) return 'amazon';
  if (lowerUrl.includes('target')) return 'target';
  if (lowerUrl.includes('babylist')) return 'babylist';

  return null;
}

/**
 * Validate registry URL
 */
export function validateRegistryUrl(url: string, expectedSource?: RegistrySource): { valid: boolean; error?: string } {
  try {
    new URL(url);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  const detectedSource = detectRegistrySource(url);

  if (!detectedSource) {
    return { valid: false, error: 'Unsupported registry URL. Please use Amazon, Target, or Babylist.' };
  }

  if (expectedSource && detectedSource !== expectedSource) {
    return {
      valid: false,
      error: `URL doesn't match selected source. Detected: ${detectedSource}`,
    };
  }

  return { valid: true };
}

/**
 * Parse Amazon wishlist/registry URL
 * Extracts items from Amazon registry HTML
 */
export async function parseAmazonRegistry(url: string): Promise<ImportedRegistryItem[]> {
  const items: ImportedRegistryItem[] = [];

  try {
    // Amazon registry items typically have these patterns:
    // - Item names in elements with specific data attributes
    // - Prices in elements with class containing 'price'
    // - Images in data-src or src attributes

    // Since we can't directly scrape due to CORS,
    // this function will be called server-side via API route

    // Placeholder for actual parsing logic
    // Real implementation would use cheerio or similar to parse HTML

    return items;
  } catch (error) {
    console.error('Error parsing Amazon registry:', error);
    throw error;
  }
}

/**
 * Parse Target registry URL
 */
export async function parseTargetRegistry(url: string): Promise<ImportedRegistryItem[]> {
  const items: ImportedRegistryItem[] = [];

  try {
    // Target registry parsing logic
    // Would be implemented server-side

    return items;
  } catch (error) {
    console.error('Error parsing Target registry:', error);
    throw error;
  }
}

/**
 * Parse Babylist registry URL
 */
export async function parseBabylistRegistry(url: string): Promise<ImportedRegistryItem[]> {
  const items: ImportedRegistryItem[] = [];

  try {
    // Babylist registry parsing logic
    // Would be implemented server-side

    return items;
  } catch (error) {
    console.error('Error parsing Babylist registry:', error);
    throw error;
  }
}

/**
 * Categorize item based on name and description
 */
export function categorizeItem(name: string): string {
  const lowerName = name.toLowerCase();

  const categories: Record<string, string[]> = {
    gear: ['stroller', 'car seat', 'carrier', 'playard', 'bassinet', 'swing', 'bouncer'],
    clothing: ['onesie', 'sleeper', 'outfit', 'clothes', 'bodysuit', 'romper'],
    feeding: ['bottle', 'breast pump', 'nursing', 'bib', 'high chair', 'formula', 'pacifier'],
    nursery: ['crib', 'mattress', 'dresser', 'changing table', 'monitor', 'mobile', 'sound machine'],
    bath: ['tub', 'shampoo', 'soap', 'towel', 'washcloth', 'thermometer'],
    health: ['thermometer', 'medicine', 'first aid', 'nasal aspirator', 'grooming'],
    toys: ['toy', 'rattle', 'teether', 'play mat', 'activity center', 'book'],
    books: ['book', 'storybook', 'board book'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword: string) => lowerName.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

/**
 * Determine priority based on item characteristics
 */
export function determinePriority(name: string, price?: number): 'essential' | 'nice-to-have' | 'optional' {
  const lowerName = name.toLowerCase();

  // Essential items
  const essentials = [
    'car seat', 'crib', 'mattress', 'stroller', 'diaper', 'wipes',
    'onesie', 'bodysuit', 'bottle', 'breast pump', 'thermometer',
  ];

  if (essentials.some((e: string) => lowerName.includes(e))) {
    return 'essential';
  }

  // Optional items (typically higher priced non-essentials)
  if (price && price > 200) {
    const optionalHighPrice = ['rocking chair', 'glider', 'nursery', 'decor'];
    if (optionalHighPrice.some((o: string) => lowerName.includes(o))) {
      return 'optional';
    }
  }

  return 'nice-to-have';
}

/**
 * Clean and normalize item name
 */
export function cleanItemName(name: string): string {
  return name
    .replace(/\s+/g, ' ')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\$[\d,.]+/g, '')
    .trim();
}

/**
 * Extract price from various formats
 */
export function extractPrice(priceText: string): number | undefined {
  if (!priceText) return undefined;

  // Remove currency symbols and commas
  const cleaned = priceText.replace(/[$,£€]/g, '').trim();
  const match = cleaned.match(/(\d+\.?\d*)/);

  if (match) {
    const price = parseFloat(match[1]);
    return isNaN(price) ? undefined : price;
  }

  return undefined;
}

// Registry source metadata for UI
export const REGISTRY_SOURCES: { id: RegistrySource; name: string; icon: string; color: string; placeholder: string }[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    icon: '📦',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    placeholder: 'https://www.amazon.com/baby-registry/...',
  },
  {
    id: 'target',
    name: 'Target',
    icon: '🎯',
    color: 'bg-red-100 text-red-700 border-red-200',
    placeholder: 'https://www.target.com/gift-registry/...',
  },
  {
    id: 'babylist',
    name: 'Babylist',
    icon: '👶',
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    placeholder: 'https://www.babylist.com/...',
  },
];
