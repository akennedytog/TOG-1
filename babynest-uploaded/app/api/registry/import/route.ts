import { NextRequest, NextResponse } from 'next/server';

interface RegistryItem {
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  external_url: string;
  source: 'amazon' | 'target' | 'babylist';
}

interface ImportRequest {
  url: string;
  source: 'amazon' | 'target' | 'babylist';
}

interface ImportResponse {
  success: boolean;
  items: RegistryItem[];
  message: string;
}

// Helper to fetch and scrape URL content
async function scrapeUrl(url: string): Promise<string> {
  try {
    // Set proper headers to mimic a browser
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Fetch error:', error);
    return '';
  }
}

// Parse Amazon registry HTML
function parseAmazonRegistry(html: string, originalUrl: string): RegistryItem[] {
  const items: RegistryItem[] = [];
  
  // Amazon registry items are typically in specific JSON or HTML structures
  // Look for product data in various patterns
  
  // Pattern 1: JSON data embedded in script tags
  const scriptPattern = new RegExp('<script[^>]*>.*?"registryItems"\\s*:\\s*(\\[.*?\\]).*?<\\/script>', 's');
  const scriptMatch = html.match(scriptPattern);
  
  if (scriptMatch) {
    try {
      const jsonStr = scriptMatch[1].replace(/&quot;/g, '"');
      const registryData = JSON.parse(jsonStr);
      
      for (const item of registryData) {
        if (item.productTitle || item.title) {
          items.push({
            name: item.productTitle || item.title,
            price: parseFloat(item.price?.amount || item.price || 0),
            category: detectCategory(item.productTitle || item.title),
            image_url: item.imageUrl || item.image,
            external_url: item.productUrl || item.externalUrl || originalUrl,
            source: 'amazon',
          });
        }
      }
    } catch (e) {
      console.log('Failed to parse Amazon JSON data');
    }
  }
  
  // Pattern 2: HTML parsing for item containers
  if (items.length === 0) {
    // Look for item containers with data attributes
    const itemPattern = new RegExp('data-item-id="[^"]*"[^>]*>[\\s\\S]*?<h[23][^>]*>([^<]+)<\\/h[23]>[\\s\\S]*?(?:\\$|price.*?)([\\d,]+\\.?\\d*)', 'gi');
    const matches = [...html.matchAll(itemPattern)];
    
    for (const match of matches) {
      const name = match[1].trim();
      const priceStr = match[2].replace(/,/g, '');
      const price = parseFloat(priceStr) || 0;
      
      if (name.length > 3 && !items.find(i => i.name === name)) {
        items.push({
          name,
          price,
          category: detectCategory(name),
          external_url: originalUrl,
          source: 'amazon',
        });
      }
    }
  }
  
  // Pattern 3: Look for product links with prices
  if (items.length === 0) {
    const productPattern = new RegExp('<a[^>]*href="([^"]*amazon\\.com/[^"]*)"[^>]*>([^<]{10,150})<\\/a>[\\s\\S]*?(?:\\$|price|a-price)[^\\d]*([\\d,]+\\.?\\d*)', 'gi');
    const matches = [...html.matchAll(productPattern)];
    
    for (const match of matches.slice(0, 25)) {
      const name = match[2].trim().replace(/\s+/g, ' ');
      const priceStr = match[3].replace(/,/g, '');
      const price = parseFloat(priceStr) || 0;
      
      if (name.length > 5 && !items.find(i => i.name === name)) {
        items.push({
          name,
          price,
          category: detectCategory(name),
          external_url: match[1].startsWith('http') ? match[1] : `https://amazon.com${match[1]}`,
          source: 'amazon',
        });
      }
    }
  }
  
  return items.slice(0, 20);
}

// Parse Target registry HTML
function parseTargetRegistry(html: string, originalUrl: string): RegistryItem[] {
  const items: RegistryItem[] = [];
  
  // Target often embeds data in JSON
  const jsonPattern = new RegExp('window\\.__TGT__\\s*=\\s*({.*?});', 's');
  const jsonMatch = html.match(jsonPattern);
  
  if (jsonMatch) {
    try {
      const tgtData = JSON.parse(jsonMatch[1]);
      const registryItems = tgtData?.registry?.items || tgtData?.registryData?.items || [];
      
      for (const item of registryItems) {
        if (item.title || item.productName) {
          items.push({
            name: item.title || item.productName,
            price: parseFloat(item.price?.currentRetail || item.price || 0),
            category: item.category || detectCategory(item.title || item.productName),
            image_url: item.image?.url || item.imageUrl,
            external_url: item.url || `https://target.com${item.links?.web || ''}`,
            source: 'target',
          });
        }
      }
    } catch (e) {
      console.log('Failed to parse Target JSON data');
    }
  }
  
  // Fallback HTML parsing
  if (items.length === 0) {
    // Target product cards
    const productPattern = new RegExp('h3[^>]*>([^<]{5,100})<\\/h3>[\\s\\S]*?\\$([\\d,]+\\.?\\d*)', 'gi');
    const matches = [...html.matchAll(productPattern)];
    
    for (const match of matches.slice(0, 20)) {
      const name = match[1].trim();
      const price = parseFloat(match[2].replace(/,/g, '')) || 0;
      
      if (!items.find(i => i.name === name)) {
        items.push({
          name,
          price,
          category: detectCategory(name),
          external_url: originalUrl,
          source: 'target',
        });
      }
    }
  }
  
  return items.slice(0, 20);
}

// Parse Babylist registry HTML
function parseBabylistRegistry(html: string, originalUrl: string): RegistryItem[] {
  const items: RegistryItem[] = [];
  
  // Babylist often has JSON data
  const jsonPattern = new RegExp('window\\.__INITIAL_STATE__\\s*=\\s*({.*?});', 's');
  const jsonMatch = html.match(jsonPattern);
  
  if (jsonMatch) {
    try {
      const initialState = JSON.parse(jsonMatch[1]);
      const registryItems = initialState?.registry?.items || initialState?.items || [];
      
      for (const item of registryItems) {
        if (item.name || item.product?.name) {
          const productName = item.name || item.product?.name;
          const price = item.price || item.product?.price || item.salePrice || 0;
          
          items.push({
            name: productName,
            price: typeof price === 'string' ? parseFloat(price.replace(/[^\d.]/g, '')) : price,
            category: item.category || item.product?.category || detectCategory(productName),
            image_url: item.imageUrl || item.product?.imageUrl,
            external_url: item.url || item.productUrl || originalUrl,
            source: 'babylist',
          });
        }
      }
    } catch (e) {
      console.log('Failed to parse Babylist JSON data');
    }
  }
  
  // Alternative: Look for registry items in script tags
  if (items.length === 0) {
    const scriptPattern = new RegExp('<script[^>]*>.*?"registryItems"\\s*:\\s*(\\[.*?\\]).*?<\\/script>', 's');
    const scriptMatch = html.match(scriptPattern);
    
    if (scriptMatch) {
      try {
        const itemsData = JSON.parse(scriptMatch[1]);
        for (const item of itemsData) {
          if (item.name) {
            items.push({
              name: item.name,
              price: parseFloat(item.price || 0),
              category: item.category || detectCategory(item.name),
              image_url: item.imageUrl,
              external_url: item.url || originalUrl,
              source: 'babylist',
            });
          }
        }
      } catch (e) {
        console.log('Failed to parse Babylist registry items JSON');
      }
    }
  }
  
  // Fallback HTML parsing
  if (items.length === 0) {
    // Babylist item patterns
    const itemPattern = new RegExp('class="[^"]*registry-item[^"]*"[\\s\\S]*?<h[34][^>]*>([^<]+)<\\/h[34]>[\\s\\S]*?\\$([\\d,]+\\.?\\d*)', 'gi');
    const matches = [...html.matchAll(itemPattern)];
    
    for (const match of matches.slice(0, 20)) {
      const name = match[1].trim();
      const price = parseFloat(match[2].replace(/,/g, '')) || 0;
      
      if (!items.find(i => i.name === name)) {
        items.push({
          name,
          price,
          category: detectCategory(name),
          external_url: originalUrl,
          source: 'babylist',
        });
      }
    }
  }
  
  return items.slice(0, 20);
}

// Detect category based on item name
function detectCategory(name: string): string {
  const lower = name.toLowerCase();
  
  if (lower.includes('stroller') || lower.includes('car seat') || lower.includes('carrier') || lower.includes('monitor') || lower.includes('bag') || lower.includes('travel')) {
    return 'gear';
  }
  if (lower.includes('crib') || lower.includes('mattress') || lower.includes('dresser') || lower.includes('rocker') || lower.includes('glider') || lower.includes('chair') || lower.includes('nursery') || lower.includes('bassinet')) {
    return 'nursery';
  }
  if (lower.includes('bottle') || lower.includes('pump') || lower.includes('feeding') || lower.includes('high chair') || lower.includes('bib') || lower.includes('burp') || lower.includes('nursing') || lower.includes('breast')) {
    return 'feeding';
  }
  if (lower.includes('clothes') || lower.includes('bodysuit') || lower.includes('sleeper') || lower.includes('outfit') || lower.includes('shirt') || lower.includes('pants') || lower.includes('onesie')) {
    return 'clothing';
  }
  if (lower.includes('diaper') || lower.includes('wipe') || lower.includes('changing')) {
    return 'diapering';
  }
  if (lower.includes('gate') || lower.includes('lock') || lower.includes('monitor') || lower.includes('first aid')) {
    return 'safety';
  }
  if (lower.includes('toy') || lower.includes('book') || lower.includes('play') || lower.includes('gym') || lower.includes('mat')) {
    return 'toys';
  }
  if (lower.includes('bath') || lower.includes('tub') || lower.includes('towel') || lower.includes('shampoo') || lower.includes('lotion') || lower.includes('soap')) {
    return 'bath';
  }
  
  return 'other';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ImportRequest = await request.json();
    const { url, source } = body;

    if (!url || !source) {
      return NextResponse.json(
        { success: false, items: [], message: 'URL and source are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let items: RegistryItem[] = [];

    switch (source) {
      case 'amazon':
        if (!url.includes('amazon.com') && !url.includes('amzn.to')) {
          return NextResponse.json(
            { success: false, items: [], message: 'Invalid Amazon URL. Expected amazon.com or amzn.to URL' },
            { status: 400 }
          );
        }
        const amazonHtml = await scrapeUrl(url);
        if (amazonHtml) {
          items = parseAmazonRegistry(amazonHtml, url);
        }
        break;

      case 'target':
        if (!url.includes('target.com')) {
          return NextResponse.json(
            { success: false, items: [], message: 'Invalid Target URL. Expected target.com URL' },
            { status: 400 }
          );
        }
        const targetHtml = await scrapeUrl(url);
        if (targetHtml) {
          items = parseTargetRegistry(targetHtml, url);
        }
        break;

      case 'babylist':
        if (!url.includes('babylist.com')) {
          return NextResponse.json(
            { success: false, items: [], message: 'Invalid Babylist URL. Expected babylist.com URL' },
            { status: 400 }
          );
        }
        const babylistHtml = await scrapeUrl(url);
        if (babylistHtml) {
          items = parseBabylistRegistry(babylistHtml, url);
        }
        break;

      default:
        return NextResponse.json(
          { success: false, items: [], message: 'Unsupported registry source. Use amazon, target, or babylist' },
          { status: 400 }
        );
    }

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        items: [],
        message: `No items found in the ${source} registry. This could be because:\n1. The registry is private or requires login\n2. The registry URL format is not supported\n3. The registry is empty\n4. The page has bot protection\n\nTry adding items manually or copying them from the registry page.`,
      });
    }

    return NextResponse.json({
      success: true,
      items,
      message: `Successfully found ${items.length} items from ${source}`,
    });
  } catch (error) {
    console.error('Registry import error:', error);
    return NextResponse.json(
      { success: false, items: [], message: error instanceof Error ? error.message : 'Failed to import registry' },
      { status: 500 }
    );
  }
}
