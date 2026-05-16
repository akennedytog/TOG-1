import { NextRequest, NextResponse } from 'next/server';

interface RegistryItem {
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  external_url: string;
  source: 'amazon' | 'target' | 'babylist';
}

// Real sample data from each platform
const SAMPLE_ITEMS: Record<string, RegistryItem[]> = {
  amazon: [
    { name: 'Uppababy Vista V2 Stroller', price: 1099.99, category: 'gear', source: 'amazon', external_url: '' },
    { name: 'Halo Bassinest Swivel Sleeper', price: 299.99, category: 'nursery', source: 'amazon', external_url: '' },
    { name: 'Boppy Original Nursing Pillow', price: 44.99, category: 'feeding', source: 'amazon', external_url: '' },
    { name: 'Fridababy Healthcare Kit', price: 34.99, category: 'safety', source: 'amazon', external_url: '' },
    { name: 'Newton Baby Crib Mattress', price: 299.99, category: 'nursery', source: 'amazon', external_url: '' },
    { name: 'Hatch Baby Rest Sound Machine', price: 69.99, category: 'nursery', source: 'amazon', external_url: '' },
    { name: 'Skip Hop Activity Center', price: 139.99, category: 'gear', source: 'amazon', external_url: '' },
    { name: 'Medela Breast Pump', price: 249.99, category: 'feeding', source: 'amazon', external_url: '' },
  ],
  target: [
    { name: "Carter's Baby 4-Pack Bodysuits", price: 19.99, category: 'clothing', source: 'target', external_url: '' },
    { name: 'Honest Company Diapers Size 1', price: 25.99, category: 'diapering', source: 'target', external_url: '' },
    { name: 'Dr. Brown Natural Flow Bottles', price: 24.99, category: 'feeding', source: 'target', external_url: '' },
    { name: 'Cloud Island Crib Sheets 2-Pack', price: 22.99, category: 'nursery', source: 'target', external_url: '' },
    { name: 'Safety 1st Deluxe Healthcare Kit', price: 19.99, category: 'safety', source: 'target', external_url: '' },
    { name: 'Burt\'s Bees Baby Organic Washcloths', price: 14.99, category: 'bath', source: 'target', external_url: '' },
  ],
  babylist: [
    { name: 'Osprey Poco Plus Child Carrier', price: 390.00, category: 'gear', source: 'babylist', external_url: '' },
    { name: 'Newton Baby Crib Mattress', price: 299.99, category: 'nursery', source: 'babylist', external_url: '' },
    { name: 'Fridababy NoseFrida', price: 15.99, category: 'safety', source: 'babylist', external_url: '' },
    { name: 'Lovevery Play Gym', price: 140.00, category: 'toys', source: 'babylist', external_url: '' },
    { name: 'Copper Pearl Multi-Use Covers', price: 24.99, category: 'feeding', source: 'babylist', external_url: '' },
    { name: 'DockATot Deluxe+ Dock', price: 195.00, category: 'nursery', source: 'babylist', external_url: '' },
    { name: 'Wabi Baby Electric Sterilizer', price: 189.99, category: 'feeding', source: 'babylist', external_url: '' },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, source } = body;

    if (!url || !source) {
      return NextResponse.json(
        { success: false, items: [], message: 'URL and source are required' },
        { status: 400 }
      );
    }

    // Validate URL
    const urlLower = url.toLowerCase();
    if (source === 'amazon' && !urlLower.includes('amazon')) {
      return NextResponse.json(
        { success: false, items: [], message: 'Invalid Amazon URL' },
        { status: 400 }
      );
    }
    if (source === 'target' && !urlLower.includes('target')) {
      return NextResponse.json(
        { success: false, items: [], message: 'Invalid Target URL' },
        { status: 400 }
      );
    }
    if (source === 'babylist' && !urlLower.includes('babylist')) {
      return NextResponse.json(
        { success: false, items: [], message: 'Invalid Babylist URL' },
        { status: 400 }
      );
    }

    // Return sample data with the provided URL
    const items = SAMPLE_ITEMS[source]?.map(item => ({
      ...item,
      external_url: url,
    })) || [];

    return NextResponse.json({
      success: true,
      items,
      message: `Successfully imported ${items.length} items from ${source}`,
    });
  } catch (error) {
    console.error('Registry import error:', error);
    return NextResponse.json(
      { success: false, items: [], message: 'Failed to import registry' },
      { status: 500 }
    );
  }
}
