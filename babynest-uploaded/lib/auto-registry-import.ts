/**
 * Auto-import registry items from various platforms
 * This module handles fetching and parsing registry data
 */

export interface ImportedRegistryItem {
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  external_url: string;
  source: 'amazon' | 'target' | 'babylist';
}

export interface ImportResult {
  success: boolean;
  items: ImportedRegistryItem[];
  message: string;
  totalValue: number;
}

/**
 * Auto-import from Amazon registry
 * Uses the Amazon Product API or scraping (with user permission)
 */
export async function autoImportAmazonRegistry(registryUrl: string): Promise<ImportResult> {
  try {
    // Validate Amazon URL
    if (!registryUrl.includes('amazon.com') && !registryUrl.includes('amzn.to')) {
      return {
        success: false,
        items: [],
        message: 'Invalid Amazon registry URL',
        totalValue: 0,
      };
    }

    // Extract registry ID from URL
    const registryMatch = registryUrl.match(/registries\/([a-zA-Z0-9-]+)/);
    const wishlistMatch = registryUrl.match(/wishlist\/([a-zA-Z0-9]+)/);
    const registryId = registryMatch?.[1] || wishlistMatch?.[1];

    if (!registryId) {
      return {
        success: false,
        items: [],
        message: 'Could not extract registry ID from URL. Please check your Amazon registry link.',
        totalValue: 0,
      };
    }

    // Call our API endpoint to fetch items
    const response = await fetch('/api/registry/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: registryUrl,
        source: 'amazon',
        autoImport: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Amazon');
    }

    const data = await response.json();
    
    return {
      success: data.success,
      items: data.items || [],
      message: data.message,
      totalValue: data.items?.reduce((sum: number, item: ImportedRegistryItem) => sum + item.price, 0) || 0,
    };
  } catch (error) {
    console.error('Amazon auto-import error:', error);
    return {
      success: false,
      items: [],
      message: 'Failed to auto-import from Amazon. Please try again or add items manually.',
      totalValue: 0,
    };
  }
}

/**
 * Auto-import from Target registry
 */
export async function autoImportTargetRegistry(registryUrl: string): Promise<ImportResult> {
  try {
    if (!registryUrl.includes('target.com')) {
      return {
        success: false,
        items: [],
        message: 'Invalid Target registry URL',
        totalValue: 0,
      };
    }

    const response = await fetch('/api/registry/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: registryUrl,
        source: 'target',
        autoImport: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Target');
    }

    const data = await response.json();

    return {
      success: data.success,
      items: data.items || [],
      message: data.message,
      totalValue: data.items?.reduce((sum: number, item: ImportedRegistryItem) => sum + item.price, 0) || 0,
    };
  } catch (error) {
    console.error('Target auto-import error:', error);
    return {
      success: false,
      items: [],
      message: 'Failed to auto-import from Target. Please try again or add items manually.',
      totalValue: 0,
    };
  }
}

/**
 * Auto-import from Babylist
 */
export async function autoImportBabylistRegistry(registryUrl: string): Promise<ImportResult> {
  try {
    if (!registryUrl.includes('babylist.com')) {
      return {
        success: false,
        items: [],
        message: 'Invalid Babylist URL',
        totalValue: 0,
      };
    }

    const response = await fetch('/api/registry/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: registryUrl,
        source: 'babylist',
        autoImport: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Babylist');
    }

    const data = await response.json();

    return {
      success: data.success,
      items: data.items || [],
      message: data.message,
      totalValue: data.items?.reduce((sum: number, item: ImportedRegistryItem) => sum + item.price, 0) || 0,
    };
  } catch (error) {
    console.error('Babylist auto-import error:', error);
    return {
      success: false,
      items: [],
      message: 'Failed to auto-import from Babylist. Please try again or add items manually.',
      totalValue: 0,
    };
  }
}

/**
 * Universal auto-import function
 * Detects the registry type from URL and calls appropriate importer
 */
export async function autoImportRegistry(registryUrl: string): Promise<ImportResult> {
  const url = registryUrl.toLowerCase();

  if (url.includes('amazon.com') || url.includes('amzn.to')) {
    return autoImportAmazonRegistry(registryUrl);
  } else if (url.includes('target.com')) {
    return autoImportTargetRegistry(registryUrl);
  } else if (url.includes('babylist.com')) {
    return autoImportBabylistRegistry(registryUrl);
  } else {
    return {
      success: false,
      items: [],
      message: 'Unsupported registry URL. Please use Amazon, Target, or Babylist URLs.',
      totalValue: 0,
    };
  }
}

/**
 * Smart import with duplicate detection
 * Checks existing items and only imports new ones
 */
export async function smartImportRegistry(
  registryUrl: string,
  existingItems: { name: string; external_url?: string }[]
): Promise<ImportResult & { duplicates: number; newItems: number }> {
  const result = await autoImportRegistry(registryUrl);

  if (!result.success) {
    return {
      ...result,
      duplicates: 0,
      newItems: 0,
    };
  }

  // Filter out duplicates (by name or URL)
  const existingNames = new Set(existingItems.map(item => item.name.toLowerCase()));
  const existingUrls = new Set(existingItems.map(item => item.external_url?.toLowerCase()).filter(Boolean));

  const uniqueItems = result.items.filter(item => {
    const nameLower = item.name.toLowerCase();
    const urlLower = item.external_url?.toLowerCase();
    
    return !existingNames.has(nameLower) && (!urlLower || !existingUrls.has(urlLower));
  });

  const duplicates = result.items.length - uniqueItems.length;

  return {
    ...result,
    items: uniqueItems,
    duplicates,
    newItems: uniqueItems.length,
    message: `Found ${result.items.length} items. ${uniqueItems.length} new items imported, ${duplicates} duplicates skipped.`,
  };
}
