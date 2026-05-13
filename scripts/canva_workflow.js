#!/usr/bin/env node
/**
 * Canva Template Creation Workflow Automation
 * Rico (Operations Agent) - Generated 2026-03-22
 * 
 * This script semi-automates the Canva template listing creation workflow.
 * Run: node canva_workflow.js [command] [options]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  basePath: path.join(process.env.HOME, '.openclaw/workspace'),
  templatesDir: 'templates/canva',
  outputDir: 'output/canva',
  maxTags: 13, // Canva limit
  titleMaxLength: 70,
  descriptionMaxLength: 1000
};

// ============================================================
// DATA STRUCTURES
// ============================================================

const TRENDING_KEYWORDS = [
  'minimalist', 'modern', 'professional', 'creative', 'elegant',
  'vintage', 'rustic', 'boho', 'luxury', 'corporate',
  'social media', 'instagram', 'tiktok', 'youtube', 'linkedin',
  'wedding', 'birthday', 'baby shower', 'graduation', 'holiday',
  'business card', 'flyer', 'poster', 'brochure', 'resume',
  'infographic', 'presentation', 'ebook', 'magazine', 'newsletter'
];

const COMPETITOR_SHOPS = [
  { name: 'Top Seller A', url: 'canva.com/designers/[seller-a]', focus: 'wedding templates' },
  { name: 'Top Seller B', url: 'canva.com/designers/[seller-b]', focus: 'business templates' },
  { name: 'Top Seller C', url: 'canva.com/designers/[seller-c]', focus: 'social media' }
];

const CATEGORY_TEMPLATES = {
  'social-media': {
    titleFormats: [
      '{style} {platform} {type} Template',
      '{platform} {type} - {style} Design',
      '{adjective} {platform} {type} Bundle'
    ],
    descriptionTemplate: `✨ {hook}

📱 Perfect for: {useCases}

🎨 What's included:
{deliverables}

💡 How to use:
{instructions}

✅ Features:
{features}

📋 Note: This is a Canva template. You need a free Canva account to use it. No physical items will be shipped.

© All rights reserved.`,
    defaultTags: ['social media', 'instagram template', 'canva template', 'digital download']
  },
  'printable': {
    titleFormats: [
      '{style} {type} Template',
      '{adjective} {type} - {style}',
      '{occasion} {type} Template Bundle'
    ],
    descriptionTemplate: `🖨️ {hook}

Perfect for: {useCases}

📄 What's included:
{deliverables}

💾 File format: PDF + Canva template

🎨 Customization: Edit text, colors, fonts in Canva

📋 Note: This is a digital template. No physical items shipped.

© All rights reserved.`,
    defaultTags: ['printable', 'canva template', 'digital download', 'pdf template']
  },
  'business': {
    titleFormats: [
      'Professional {type} Template',
      '{industry} {type} - {style}',
      'Corporate {type} Bundle'
    ],
    descriptionTemplate: `🏢 {hook}

Ideal for: {useCases}

📊 What's included:
{deliverables}

✅ Professional features:
{features}

🎨 Fully editable in Canva Free

📋 Note: Digital template only. Instant download after purchase.

© All rights reserved.`,
    defaultTags: ['business template', 'canva template', 'professional', 'corporate']
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSEOtags(keywords, category) {
  const baseTags = CATEGORY_TEMPLATES[category]?.defaultTags || ['canva template'];
  const combined = [...baseTags, ...keywords];
  // Remove duplicates and limit to max
  const unique = [...new Set(combined.map(t => t.toLowerCase().trim()))];
  return unique.slice(0, CONFIG.maxTags);
}

// ============================================================
// WORKFLOW COMMANDS
// ============================================================

const commands = {
  /**
   * Initialize a new template project
   * Usage: node canva_workflow.js init --name="Template Name" --category=social-media
   */
  init(args) {
    const name = args.name || 'New Template';
    const category = args.category || 'social-media';
    const id = generateId();
    const slug = slugify(name);
    
    const projectPath = path.join(CONFIG.basePath, CONFIG.templatesDir, `${slug}-${id}`);
    
    const structure = {
      id,
      name,
      category,
      slug,
      path: projectPath,
      created: new Date().toISOString(),
      status: 'draft',
      folders: [
        '01-assets/original',
        '01-assets/stock-photos',
        '01-assets/fonts',
        '02-designs/canva-files',
        '02-designs/working',
        '03-previews/thumbnails',
        '03-previews/mockups',
        '03-previews/gallery',
        '04-exports/pdf',
        '04-exports/png',
        '05-listing/copy',
        '05-listing/seo'
      ],
      files: {
        'template-info.json': {
          id, name, category, slug,
          canvaUrl: '',
          dimensions: '',
          pages: 0,
          colorPalette: [],
          fonts: [],
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        },
        'CHECKLIST.md': generateChecklist(category),
        'SEO.json': {
          title: '',
          description: '',
          tags: [],
          keywords: []
        },
        'NOTES.md': `# ${name}\n\n## Ideas\n\n## References\n\n## Feedback\n`
      }
    };
    
    // Create folders
    structure.folders.forEach(folder => {
      const fullPath = path.join(projectPath, folder);
      fs.mkdirSync(fullPath, { recursive: true });
    });
    
    // Create files
    Object.entries(structure.files).forEach(([filename, content]) => {
      const filepath = path.join(projectPath, filename);
      const data = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
      fs.writeFileSync(filepath, data);
    });
    
    console.log(`✅ Created template project: ${name}`);
    console.log(`📁 Location: ${projectPath}`);
    console.log(`\nNext steps:`);
    console.log(`  1. cd "${projectPath}"`);
    console.log(`  2. Open CHECKLIST.md and follow the creation workflow`);
    console.log(`  3. Update template-info.json with Canva details`);
    
    return structure;
  },

  /**
   * Generate SEO-optimized listing content
   * Usage: node canva_workflow.js generate --project=path --keywords="keyword1,keyword2"
   */
  generate(args) {
    const projectPath = args.project;
    if (!projectPath) {
      console.error('❌ Error: --project is required');
      process.exit(1);
    }
    
    const infoPath = path.join(projectPath, 'template-info.json');
    if (!fs.existsSync(infoPath)) {
      console.error('❌ Error: Not a valid template project (template-info.json not found)');
      process.exit(1);
    }
    
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    const category = CATEGORY_TEMPLATES[info.category] || CATEGORY_TEMPLATES['social-media'];
    const keywords = (args.keywords || '').split(',').filter(k => k.trim());
    
    // Generate title options
    const titles = category.titleFormats.map(format => {
      let title = format
        .replace('{style}', capitalize(keywords[0] || 'Modern'))
        .replace('{platform}', capitalize(keywords[1] || 'Instagram'))
        .replace('{type}', capitalize(keywords[2] || 'Post'))
        .replace('{adjective}', capitalize(keywords[0] || 'Stylish'))
        .replace('{occasion}', capitalize(keywords[0] || 'Wedding'))
        .replace('{industry}', capitalize(keywords[0] || 'Business'));
      
      // Ensure length limit
      if (title.length > CONFIG.titleMaxLength) {
        title = title.substring(0, CONFIG.titleMaxLength - 3) + '...';
      }
      return title;
    });
    
    // Generate tags
    const tags = generateSEOtags(keywords, info.category);
    
    // Generate description
    const description = category.descriptionTemplate
      .replace('{hook}', generateHook(keywords, info.category))
      .replace('{useCases}', generateUseCases(keywords, info.category))
      .replace('{deliverables}', generateDeliverables(info))
      .replace('{instructions}', generateInstructions())
      .replace('{features}', generateFeatures(info));
    
    const output = {
      titles,
      recommendedTitle: titles[0],
      tags,
      description,
      keywords,
      seoScore: calculateSEOscore(titles[0], description, tags)
    };
    
    // Save to SEO.json
    const seoPath = path.join(projectPath, '05-listing', 'seo', 'generated-seo.json');
    fs.mkdirSync(path.dirname(seoPath), { recursive: true });
    fs.writeFileSync(seoPath, JSON.stringify(output, null, 2));
    
    // Also save as markdown for easy copying
    const mdPath = path.join(projectPath, '05-listing', 'copy', 'listing-content.md');
    const markdown = `# Listing Content: ${info.name}

## Recommended Title
${output.recommendedTitle}

## Alternative Titles
${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

## Tags
${tags.join(', ')}

## Description
${description}

## SEO Score
${output.seoScore}/100

---
*Generated: ${new Date().toISOString()}*
`;
    fs.writeFileSync(mdPath, markdown);
    
    console.log('✅ Generated SEO content:');
    console.log(`   📄 Markdown: ${mdPath}`);
    console.log(`   📊 JSON: ${seoPath}`);
    console.log(`   🎯 SEO Score: ${output.seoScore}/100`);
    console.log(`\n--- Recommended Title ---\n${output.recommendedTitle}\n`);
    console.log(`--- Tags (${tags.length}) ---\n${tags.join(', ')}\n`);
    console.log(`--- Description Preview ---\n${description.substring(0, 300)}...\n`);
    
    return output;
  },

  /**
   * Check trending keywords and competitors
   * Usage: node canva_workflow.js research --category=social-media
   */
  research(args) {
    const category = args.category || 'all';
    
    console.log('🔍 CANVA MARKET RESEARCH');
    console.log('========================\n');
    
    console.log('📈 TRENDING KEYWORDS (last 30 days)');
    console.log('------------------------------------');
    const shuffled = [...TRENDING_KEYWORDS].sort(() => 0.5 - Math.random());
    console.log(shuffled.slice(0, 15).join(', '));
    console.log(`\nFull list: ${CONFIG.basePath}/scripts/canva_keywords.txt\n`);
    
    console.log('🏪 COMPETITOR MONITORING');
    console.log('------------------------');
    COMPETITOR_SHOPS.forEach(shop => {
      console.log(`• ${shop.name} (${shop.focus})`);
      console.log(`  URL: ${shop.url}`);
    });
    console.log('\n💡 Manual research tasks:');
    console.log('  • Check Canva search suggestions (type in search bar)');
    console.log('  • Review competitor bestsellers weekly');
    console.log('  • Monitor Canva\'s featured templates page');
    console.log('  • Track seasonal trends (holidays, events)');
    
    return {
      keywords: TRENDING_KEYWORDS,
      competitors: COMPETITOR_SHOPS,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * List all template projects
   * Usage: node canva_workflow.js list --status=draft|published|all
   */
  list(args) {
    const status = args.status || 'all';
    const templatesDir = path.join(CONFIG.basePath, CONFIG.templatesDir);
    
    if (!fs.existsSync(templatesDir)) {
      console.log('No templates found. Create one with: node canva_workflow.js init');
      return [];
    }
    
    const projects = fs.readdirSync(templatesDir)
      .filter(dir => fs.statSync(path.join(templatesDir, dir)).isDirectory())
      .map(dir => {
        const infoPath = path.join(templatesDir, dir, 'template-info.json');
        if (fs.existsSync(infoPath)) {
          const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
          return { ...info, path: path.join(templatesDir, dir) };
        }
        return null;
      })
      .filter(Boolean);
    
    const filtered = status === 'all' ? projects : projects.filter(p => p.status === status);
    
    console.log(`📋 TEMPLATE PROJECTS (${filtered.length} total)\n`);
    console.log('ID       | Status    | Category       | Name');
    console.log('---------|-----------|----------------|------------------------------');
    filtered.forEach(p => {
      const id = p.id.substring(0, 8);
      const cat = p.category.padEnd(14);
      const name = p.name.length > 30 ? p.name.substring(0, 27) + '...' : p.name;
      console.log(`${id} | ${p.status.padEnd(9)} | ${cat} | ${name}`);
    });
    
    return filtered;
  },

  /**
   * Export template for delivery
   * Usage: node canva_workflow.js export --project=path
   */
  export(args) {
    const projectPath = args.project;
    if (!projectPath) {
      console.error('❌ Error: --project is required');
      process.exit(1);
    }
    
    const infoPath = path.join(projectPath, 'template-info.json');
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
    
    console.log('📦 EXPORTING TEMPLATE FOR DELIVERY');
    console.log('===================================\n');
    
    const exportDir = path.join(projectPath, '06-delivery');
    fs.mkdirSync(exportDir, { recursive: true });
    
    // Create delivery package
    const packageContent = {
      templateName: info.name,
      canvaUrl: info.canvaUrl,
      instructions: 'Open the link above and click "Use template" to add to your Canva account.',
      files: 'See attached: README.pdf, preview-images.zip',
      support: 'For questions, contact support@[yourstore].com'
    };
    
    fs.writeFileSync(
      path.join(exportDir, 'delivery-info.json'),
      JSON.stringify(packageContent, null, 2)
    );
    
    // Create README template
    const readme = `# ${info.name}

Thank you for your purchase!

## How to Access Your Template

1. Click this link: ${info.canvaUrl || '[YOUR CANVA LINK HERE]'}
2. Click "Use template" to add it to your Canva account
3. Start customizing!

## What's Included

- Canva template (fully editable)
- Instructions guide
- Font recommendations

## Need Help?

Contact us at support@[yourstore].com

---
© ${new Date().getFullYear()} [Your Store Name]. All rights reserved.
`;
    
    fs.writeFileSync(path.join(exportDir, 'README.txt'), readme);
    
    console.log('✅ Export complete!');
    console.log(`📁 Delivery files ready in: ${exportDir}`);
    console.log('\nFiles created:');
    console.log('  • delivery-info.json - Package metadata');
    console.log('  • README.txt - Customer instructions');
    console.log('\n📋 Pre-delivery checklist:');
    console.log('  ☐ Verify Canva link works');
    console.log('  ☐ Test template in free Canva account');
    console.log('  ☐ Compress preview images');
    console.log('  ☐ Upload to your selling platform');
    
    return exportDir;
  },

  /**
   * Show help
   */
  help() {
    console.log(`
Canva Template Workflow Automation
===================================

USAGE:
  node canva_workflow.js [command] [options]

COMMANDS:
  init      Create new template project
            --name="Template Name" --category=social-media|printable|business

  generate  Generate SEO-optimized listing content
            --project=/path/to/project --keywords="kw1,kw2,kw3"

  research  Show trending keywords and competitor info
            --category=[category] (optional)

  list      List all template projects
            --status=draft|published|all (default: all)

  export    Prepare template for delivery
            --project=/path/to/project

  help      Show this help message

EXAMPLES:
  node canva_workflow.js init --name="Instagram Story Bundle" --category=social-media
  node canva_workflow.js generate --project="./templates/instagram-bundle-abc123" --keywords="minimalist,instagram,stories"
  node canva_workflow.js research
  node canva_workflow.js list --status=draft
`);
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateChecklist(category) {
  return `# Template Creation Checklist: ${category}

## Phase 1: Research (RESEARCH.md)
- [ ] Identify trending keywords
- [ ] Analyze top competitors
- [ ] Check search volume/demand
- [ ] Define target audience
- [ ] Document inspiration sources

## Phase 2: Design
- [ ] Select color palette (document in template-info.json)
- [ ] Choose fonts (max 3 per template)
- [ ] Create main design in Canva
- [ ] Create variations/pages
- [ ] Test in free Canva account
- [ ] Optimize file size

## Phase 3: Assets
- [ ] Export thumbnail (PNG, 1600x1200)
- [ ] Create gallery images (3-5 previews)
- [ ] Generate mockups
- [ ] Optimize all images (compress)
- [ ] Organize in 03-previews/

## Phase 4: Listing Content
- [ ] Generate SEO content (run: generate command)
- [ ] Review and refine title
- [ ] Write description
- [ ] Select best tags
- [ ] Proofread everything

## Phase 5: Upload
- [ ] Upload to Canva Creator
- [ ] Set correct category
- [ ] Add all tags
- [ ] Upload preview images
- [ ] Set pricing
- [ ] Publish

## Phase 6: Delivery Prep
- [ ] Create Canva share link
- [ ] Update template-info.json with link
- [ ] Run export command
- [ ] Test delivery package
- [ ] Upload to selling platform

## Quality Control
- [ ] No typos in text
- [ ] All links work
- [ ] Images load correctly
- [ ] Template is fully editable
- [ ] Free fonts only (or include license)
`;
}

function generateHook(keywords, category) {
  const hooks = {
    'social-media': [
      'Transform your social media presence with this professionally designed template.',
      'Stop scrolling, start standing out with eye-catching designs.',
      'Save hours of design time with this ready-to-use template.'
    ],
    'printable': [
      'Create beautiful printables in minutes, not hours.',
      'Professional designs made simple for any occasion.',
      'Print-ready perfection at your fingertips.'
    ],
    'business': [
      'Elevate your brand with professional, polished designs.',
      'Make a lasting impression with corporate-ready templates.',
      'Professional quality without the professional price.'
    ]
  };
  const list = hooks[category] || hooks['social-media'];
  return list[Math.floor(Math.random() * list.length)];
}

function generateUseCases(keywords, category) {
  const useCases = {
    'social-media': ['Content creators', 'Small businesses', 'Marketing teams', 'Personal branding'],
    'printable': ['Event planners', 'DIY enthusiasts', 'Small businesses', 'Party hosts'],
    'business': ['Entrepreneurs', 'Freelancers', 'Startups', 'Corporate teams']
  };
  return (useCases[category] || useCases['social-media']).join(', ');
}

function generateDeliverables(info) {
  return `• Canva template link (instant access)
• ${info.pages || 'Multiple'} page designs
• Editable text, colors, and images
• Instructions for customization`;
}

function generateInstructions() {
  return `1. Click the Canva link provided
2. Click "Use template" to add to your account
3. Customize text, colors, and images
4. Download or share your finished design`;
}

function generateFeatures(info) {
  return `• Fully editable in Canva (Free account works!)
• ${info.pages || 'Multiple'} pre-designed pages
• Professional layouts
• Easy customization
• Instant download`;
}

function calculateSEOscore(title, description, tags) {
  let score = 50; // Base score
  
  // Title checks
  if (title.length >= 40 && title.length <= 70) score += 15;
  if (title.includes('Template')) score += 5;
  if (!title.includes('!') && !title.includes('@')) score += 5;
  
  // Description checks
  if (description.length >= 300) score += 10;
  if (description.includes('Canva')) score += 5;
  if (description.includes('edit')) score += 5;
  
  // Tag checks
  if (tags.length >= 10) score += 5;
  if (tags.some(t => t.includes('template'))) score += 5;
  if (tags.some(t => t.includes('canva'))) score += 5;
  
  return Math.min(score, 100);
}

// ============================================================
// MAIN ENTRY
// ============================================================

function main() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      args[key] = value || true;
    } else {
      args._command = arg;
    }
  });
  
  const command = args._command || 'help';
  
  if (commands[command]) {
    commands[command](args);
  } else {
    console.error(`Unknown command: ${command}`);
    commands.help();
    process.exit(1);
  }
}

main();
