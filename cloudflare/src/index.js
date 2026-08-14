// BrandVault API - Cloudflare Workers + R2 + KV
// Free tier: 100k req/day, 1GB R2, unlimited KV reads

const BRANDS_KV_KEY = 'brands_index';

// In-memory brand data (seeded)
const SEED_BRANDS = [
  {
    id: 'acme-corp',
    name: 'Acme Corp',
    domain: 'acme-corp.com',
    verified: true,
    logos: [
      { type: 'primary', url: 'https://cdn.brandvault.io/acme/logo-primary.svg', format: 'svg' },
      { type: 'white', url: 'https://cdn.brandvault.io/acme/logo-white.svg', format: 'svg' },
      { type: 'icon', url: 'https://cdn.brandvault.io/acme/logo-icon.svg', format: 'svg' },
    ],
    colors: [
      { label: 'Primary', hex: '#FF6600', rgb: '255,102,0' },
      { label: 'Secondary', hex: '#003366', rgb: '0,51,102' },
      { label: 'Accent', hex: '#00CC99', rgb: '0,204,153' },
    ]
  },
  {
    id: 'technova',
    name: 'TechNova',
    domain: 'technova.io',
    verified: true,
    logos: [
      { type: 'primary', url: 'https://cdn.brandvault.io/technova/logo-primary.svg', format: 'svg' },
      { type: 'white', url: 'https://cdn.brandvault.io/technova/logo-white.svg', format: 'svg' },
    ],
    colors: [
      { label: 'Primary', hex: '#4A90D9', rgb: '74,144,217' },
      { label: 'Dark', hex: '#1A1A2E', rgb: '26,26,46' },
    ]
  },
  {
    id: 'greenleaf',
    name: 'GreenLeaf Organics',
    domain: 'greenleaforganics.com',
    verified: true,
    logos: [
      { type: 'primary', url: 'https://cdn.brandvault.io/greenleaf/logo-primary.svg', format: 'svg' },
      { type: 'white', url: 'https://cdn.brandvault.io/greenleaf/logo-white.svg', format: 'svg' },
    ],
    colors: [
      { label: 'Primary Green', hex: '#2ECC71', rgb: '46,204,113' },
      { label: 'Earth Brown', hex: '#8B4513', rgb: '139,69,19' },
    ]
  }
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Health check
    if (path === '/' || path === '/api') {
      return new Response(JSON.stringify({
        service: 'BrandVault API',
        version: '0.1.0',
        status: 'operational',
        platform: 'Cloudflare Workers',
        docs: '/docs'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // Get brand by domain
    const brandMatch = path.match(/^\/api\/v1\/brands\/([^/]+)$/);
    if (brandMatch) {
      const domain = brandMatch[1];
      const brand = SEED_BRANDS.find(b => b.domain === domain);
      if (!brand) {
        return new Response(JSON.stringify({ error: 'Brand not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify(brand), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get logo
    const logoMatch = path.match(/^\/api\/v1\/brands\/([^/]+)\/logo$/);
    if (logoMatch) {
      const domain = logoMatch[1];
      const variant = url.searchParams.get('variant') || 'primary';
      const brand = SEED_BRANDS.find(b => b.domain === domain);
      if (!brand) {
        return new Response(JSON.stringify({ error: 'Brand not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const logo = brand.logos.find(l => l.type === variant) || brand.logos[0];
      return new Response(JSON.stringify({ brand: brand.name, domain, logo }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get colors
    const colorsMatch = path.match(/^\/api\/v1\/brands\/([^/]+)\/colors$/);
    if (colorsMatch) {
      const domain = colorsMatch[1];
      const brand = SEED_BRANDS.find(b => b.domain === domain);
      if (!brand) {
        return new Response(JSON.stringify({ error: 'Brand not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ brand: brand.name, domain, colors: brand.colors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Search
    if (path === '/api/v1/search') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const results = SEED_BRANDS
        .filter(b => b.domain.includes(q) || b.name.toLowerCase().includes(q))
        .map(b => ({ id: b.id, name: b.name, domain: b.domain, verified: b.verified ? 1 : 0 }));
      return new Response(JSON.stringify({ query: q, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Docs
    if (path === '/docs' || path === '/api/docs') {
      return new Response(JSON.stringify({
        api: 'BrandVault API v0.1.0',
        endpoints: {
          public: [
            'GET /api - Health check',
            'GET /api/v1/brands/:domain - Full brand profile',
            'GET /api/v1/brands/:domain/logo - Approved logo (?variant=primary)',
            'GET /api/v1/brands/:domain/colors - Brand colors',
            'GET /api/v1/search?q= - Search brands',
          ]
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // 404
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};
