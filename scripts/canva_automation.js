#!/usr/bin/env node
/**
 * Canva Template Automation Pipeline
 * Generates templates, manages exports, and creates shop listings
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  templatesDir: path.join(process.env.HOME, '.openclaw/workspace/outputs/templates'),
  dataDir: path.join(process.env.HOME, '.openclaw/workspace/data/canva_templates'),
  logsDir: path.join(process.env.HOME, '.openclaw/workspace/logs'),
  dailyLimit: 3,
  platforms: ['etsy', 'creative_market', 'designcuts'],
  canvaApiEndpoint: 'https://api.canva.com/v1', // Placeholder for actual Canva API
};

// Ensure directories exist
[CONFIG.templatesDir, CONFIG.dataDir, CONFIG.logsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Logger
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, level, message, ...meta };
  const logFile = path.join(CONFIG.logsDir, `canva_automation_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  console.log(`[${level.toUpperCase()}] ${message}`, meta);
};

// Template Configuration Database
const TEMPLATE_CONFIGS = [
  {
    id: 'instagram_carousel',
    name: 'Instagram Carousel Post',
    category: 'social_media',
    sizes: [{ width: 1080, height: 1080, pages: 5 }],
    style: 'modern_minimal',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    elements: ['text_boxes', 'image_placeholders', 'icons'],
    price: { etsy: 5.99, creative_market: 7.00, designcuts: 6.50 },
    tags: ['instagram', 'carousel', 'social media', 'engagement', 'posts'],
  },
  {
    id: 'youtube_thumbnail',
    name: 'YouTube Thumbnail Pack',
    category: 'youtube',
    sizes: [{ width: 1280, height: 720, pages: 10 }],
    style: 'bold_trendy',
    colors: ['#FF0000', '#FFFFFF', '#000000'],
    elements: ['text_layers', 'emoji', 'arrows', 'gradients'],
    price: { etsy: 8.99, creative_market: 12.00, designcuts: 10.00 },
    tags: ['youtube', 'thumbnail', 'video', 'clickbait', 'views'],
  },
  {
    id: 'business_card',
    name: 'Professional Business Card',
    category: 'print',
    sizes: [{ width: 1050, height: 600, pages: 2 }], // 3.5" x 2" at 300dpi
    style: 'corporate_elegant',
    colors: ['#1a1a1a', '#f5f5f5', '#c9a227'],
    elements: ['logo_placeholder', 'contact_info', 'qr_code'],
    price: { etsy: 4.99, creative_market: 6.00, designcuts: 5.50 },
    tags: ['business card', 'professional', 'networking', 'print', 'corporate'],
  },
  {
    id: 'resume_cv',
    name: 'Modern Resume/CV Template',
    category: 'document',
    sizes: [{ width: 794, height: 1123, pages: 3 }], // A4 at 96dpi
    style: 'clean_professional',
    colors: ['#2c3e50', '#ecf0f1', '#3498db'],
    elements: ['sections', 'progress_bars', 'icons', 'timeline'],
    price: { etsy: 6.99, creative_market: 9.00, designcuts: 8.00 },
    tags: ['resume', 'cv', 'job', 'professional', 'career', ' ATS-friendly'],
  },
  {
    id: 'presentation_deck',
    name: 'Pitch Deck Presentation',
    category: 'presentation',
    sizes: [{ width: 1920, height: 1080, pages: 20 }],
    style: 'startup_modern',
    colors: ['#667eea', '#764ba2', '#f093fb'],
    elements: ['slides', 'charts', 'infographics', 'icons'],
    price: { etsy: 12.99, creative_market: 18.00, designcuts: 15.00 },
    tags: ['presentation', 'pitch deck', 'startup', 'business', 'slides'],
  },
  {
    id: 'story_templates',
    name: 'Instagram Stories Pack',
    category: 'social_media',
    sizes: [{ width: 1080, height: 1920, pages: 15 }],
    style: 'trendy_aesthetic',
    colors: ['#FF6B9D', '#C44569', '#F8B500'],
    elements: ['stickers', 'text_animations', 'masks', 'filters'],
    price: { etsy: 7.99, creative_market: 10.00, designcuts: 9.00 },
    tags: ['instagram stories', 'social media', 'vertical', 'engagement', 'aesthetic'],
  },
  {
    id: 'flyer_poster',
    name: 'Event Flyer / Poster',
    category: 'print',
    sizes: [
      { width: 2550, height: 3300, pages: 1 }, // 8.5x11 at 300dpi
      { width: 1800, height: 2400, pages: 1 }, // 6x8 at 300dpi
    ],
    style: 'eye_catching',
    colors: ['#FF416C', '#FF4B2B', '#2B32B2'],
    elements: ['headline', 'date_location', 'call_to_action', 'graphics'],
    price: { etsy: 5.99, creative_market: 8.00, designcuts: 7.00 },
    tags: ['flyer', 'poster', 'event', 'print', 'promotion'],
  },
  {
    id: 'ebook_cover',
    name: 'eBook Cover Bundle',
    category: 'digital',
    sizes: [
      { width: 1563, height: 2500, pages: 1 }, // Standard ebook
      { width: 1800, height: 2700, pages: 1 }, // Alternative
    ],
    style: 'literary_artistic',
    colors: ['#0f2027', '#203a43', '#2c5364'],
    elements: ['typography', 'illustration', 'spine', 'mockup'],
    price: { etsy: 9.99, creative_market: 14.00, designcuts: 12.00 },
    tags: ['ebook', 'book cover', 'publishing', 'kindle', 'author'],
  },
];

// Queue System
class TemplateQueue {
  constructor() {
    this.queueFile = path.join(CONFIG.dataDir, 'template_queue.json');
    this.stateFile = path.join(CONFIG.dataDir, 'generation_state.json');
    this.load();
  }

  load() {
    try {
      this.queue = JSON.parse(fs.readFileSync(this.queueFile, 'utf8'));
    } catch {
      this.queue = { pending: [], inProgress: [], completed: [], failed: [] };
    }
    try {
      this.state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    } catch {
      this.state = { lastRun: null, dailyCount: 0, totalGenerated: 0 };
    }
  }

  save() {
    fs.writeFileSync(this.queueFile, JSON.stringify(this.queue, null, 2));
    fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
  }

  addToQueue(templateId, priority = 'normal') {
    const existing = this.queue.pending.find(t => t.templateId === templateId);
    if (!existing) {
      this.queue.pending.push({
        templateId,
        priority,
        addedAt: new Date().toISOString(),
        id: crypto.randomUUID(),
      });
      this.save();
      log('info', `Added ${templateId} to queue`, { priority });
    }
  }

  getNext(count = 1) {
    // Sort by priority and date
    const sorted = this.queue.pending.sort((a, b) => {
      const priorityMap = { high: 0, normal: 1, low: 2 };
      if (priorityMap[a.priority] !== priorityMap[b.priority]) {
        return priorityMap[a.priority] - priorityMap[b.priority];
      }
      return new Date(a.addedAt) - new Date(b.addedAt);
    });
    return sorted.slice(0, count);
  }

  markInProgress(item) {
    this.queue.pending = this.queue.pending.filter(t => t.id !== item.id);
    item.startedAt = new Date().toISOString();
    this.queue.inProgress.push(item);
    this.save();
  }

  markComplete(item, outputPath) {
    this.queue.inProgress = this.queue.inProgress.filter(t => t.id !== item.id);
    item.completedAt = new Date().toISOString();
    item.outputPath = outputPath;
    this.queue.completed.push(item);
    this.state.dailyCount++;
    this.state.totalGenerated++;
    this.save();
    log('info', `Completed template generation`, { templateId: item.templateId, outputPath });
  }

  markFailed(item, error) {
    this.queue.inProgress = this.queue.inProgress.filter(t => t.id !== item.id);
    item.failedAt = new Date().toISOString();
    item.error = error.message;
    this.queue.failed.push(item);
    this.save();
    log('error', `Template generation failed`, { templateId: item.templateId, error: error.message });
  }

  resetDailyCount() {
    const today = new Date().toISOString().split('T')[0];
    const lastRun = this.state.lastRun?.split('T')[0];
    if (lastRun !== today) {
      this.state.dailyCount = 0;
      this.state.lastRun = new Date().toISOString();
      this.save();
      log('info', 'Daily count reset for new day');
    }
  }

  canGenerateToday() {
    this.resetDailyCount();
    return this.state.dailyCount < CONFIG.dailyLimit;
  }
}

// Template Generator
class TemplateGenerator {
  constructor() {
    this.queue = new TemplateQueue();
  }

  async generateFigmaCommands(config) {
    // Generate Figma plugin-compatible commands
    const commands = {
      createFile: {
        name: `${config.name} - ${new Date().toISOString().split('T')[0]}`,
        type: 'figma_file',
      },
      createPages: config.sizes.map((size, idx) => ({
        name: `Page ${idx + 1} - ${size.width}x${size.height}`,
        width: size.width,
        height: size.height,
        background: config.colors[0],
      })),
      addElements: config.elements.map(el => ({
        type: el,
        style: config.style,
        colors: config.colors,
      })),
      exportSettings: {
        format: 'PDF',
        svg: true,
        png: true,
        canva_compatible: true,
      },
    };

    return commands;
  }

  async generateTemplate(templateConfig) {
    const outputDir = path.join(CONFIG.templatesDir, templateConfig.id);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const timestamp = Date.now();
    const baseFilename = `${templateConfig.id}_${timestamp}`;

    // Generate Figma commands file
    const figmaCommands = await this.generateFigmaCommands(templateConfig);
    const figmaPath = path.join(outputDir, `${baseFilename}_figma_commands.json`);
    fs.writeFileSync(figmaPath, JSON.stringify(figmaCommands, null, 2));

    // Generate Canva import instructions
    const canvaInstructions = this.generateCanvaInstructions(templateConfig);
    const canvaPath = path.join(outputDir, `${baseFilename}_canva_import.md`);
    fs.writeFileSync(canvaPath, canvaInstructions);

    // Generate metadata file
    const metadata = {
      id: templateConfig.id,
      name: templateConfig.name,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
      files: {
        figma: figmaPath,
        canva: canvaPath,
      },
      config: templateConfig,
      status: 'ready_for_export',
    };
    const metaPath = path.join(outputDir, `${baseFilename}_metadata.json`);
    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

    // Generate preview HTML
    const previewPath = path.join(outputDir, `${baseFilename}_preview.html`);
    fs.writeFileSync(previewPath, this.generatePreviewHTML(templateConfig));

    log('info', `Generated template files`, { templateId: templateConfig.id, outputDir });

    return {
      metadata,
      outputDir,
      files: [figmaPath, canvaPath, metaPath, previewPath],
    };
  }

  generateCanvaInstructions(config) {
    return `# Canva Import Instructions: ${config.name}

## Template Details
- **Name:** ${config.name}
- **Category:** ${config.category}
- **Style:** ${config.style}
- **Colors:** ${config.colors.join(', ')}

## Sizes to Create
${config.sizes.map(s => `- ${s.width}x${s.height}px (${s.pages} page${s.pages > 1 ? 's' : ''})`).join('\n')}

## Steps to Import to Canva

1. **Create New Design**
   - Go to canva.com
   - Click "Create a design"
   - Select "Custom size" and enter: ${config.sizes[0].width}x${config.sizes[0].height}px

2. **Set Up Color Palette**
   ${config.colors.map((c, i) => `${i + 1}. Add color: ${c}`).join('\n   ')}

3. **Add Required Elements**
${config.elements.map(el => `   - ${el.replace(/_/g, ' ')}`).join('\n')}

4. **Style Guidelines**
   - Use ${config.style.replace(/_/g, ' ')} style
   - Maintain consistent spacing
   - Use brand-appropriate fonts

5. **Export for Selling**
   - File > Download > PDF Print
   - Also export as: PNG (for previews)
   - Save to: ${CONFIG.templatesDir}/${config.id}/

## Platform-Specific Notes

### Etsy
- Upload PDF as main file
- Include Canva link in description
- Set price: $${config.price.etsy}

### Creative Market
- Upload full PDF package
- Include editable Canva template link
- Set price: $${config.price.creative_market}

### DesignCuts
- Bundle multiple sizes
- Include quick-start guide
- Set price: $${config.price.designcuts}
`;
  }

  generatePreviewHTML(config) {
    const colors = config.colors.map(c => 
      `<div style="background:${c};width:60px;height:60px;border-radius:8px;margin:5px;display:inline-block;box-shadow:0 2px 4px rgba(0,0,0,0.1);"></div>`
    ).join('');

    const sizes = config.sizes.map(s => 
      `<div style="background:#f0f0f0;padding:10px;margin:5px;border-radius:4px;font-family:monospace;">${s.width} × ${s.height}px</div>`
    ).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <title>${config.name} - Preview</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { margin: 0; font-size: 32px; }
    .section { margin: 30px 0; }
    .section h2 { font-size: 20px; color: #333; margin-bottom: 15px; }
    .tag { display: inline-block; background: #e0e0e0; padding: 5px 12px; border-radius: 15px; margin: 3px; font-size: 14px; }
    .price { font-size: 24px; font-weight: bold; color: #2ecc71; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${config.name}</h1>
    <p style="color:#666;">${config.category.replace(/_/g, ' ').toUpperCase()} | ${config.style.replace(/_/g, ' ').toUpperCase()}</p>
  </div>
  
  <div class="section">
    <h2>🎨 Color Palette</h2>
    ${colors}
  </div>
  
  <div class="section">
    <h2>📐 Sizes</h2>
    ${sizes}
  </div>
  
  <div class="section">
    <h2>🏷️ Tags</h2>
    ${config.tags.map(t => `<span class="tag">${t}</span>`).join('')}
  </div>
  
  <div class="section">
    <h2>💰 Pricing</h2>
    <p class="price">Etsy: $${config.price.etsy}</p>
    <p>Creative Market: $${config.price.creative_market}</p>
    <p>DesignCuts: $${config.price.designcuts}</p>
  </div>
  
  <div class="section">
    <h2>📁 Files Generated</h2>
    <ul>
      <li>✅ Figma Commands (JSON)</li>
      <li>✅ Canva Import Instructions (Markdown)</li>
      <li>✅ Metadata (JSON)</li>
      <li>✅ Preview (HTML)</li>
    </ul>
  </div>
  
  <div class="section">
    <h2>⚡ Next Steps</h2>
    <ol>
      <li>Open the _canva_import.md file</li>
      <li>Follow the step-by-step instructions</li>
      <li>Create the template in Canva</li>
      <li>Export and upload to platforms</li>
    </ol>
  </div>
  
  <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 14px;">
    Generated: ${new Date().toLocaleString()}
  </footer>
</body>
</html>`;
  }

  async runDailyGeneration() {
    if (!this.queue.canGenerateToday()) {
      log('info', 'Daily limit reached', { limit: CONFIG.dailyLimit, current: this.queue.state.dailyCount });
      return { status: 'LIMIT_REACHED', generated: [] };
    }

    const remaining = CONFIG.dailyLimit - this.queue.state.dailyCount;
    const toGenerate = Math.min(remaining, CONFIG.dailyLimit);
    
    // Auto-populate queue if empty
    if (this.queue.queue.pending.length === 0) {
      TEMPLATE_CONFIGS.forEach(config => {
        this.queue.addToQueue(config.id, 'normal');
      });
      log('info', 'Auto-populated queue with all template types');
    }

    const nextBatch = this.queue.getNext(toGenerate);
    const results = [];

    for (const item of nextBatch) {
      this.queue.markInProgress(item);
      
      try {
        const config = TEMPLATE_CONFIGS.find(c => c.id === item.templateId);
        if (!config) throw new Error(`Unknown template: ${item.templateId}`);
        
        const result = await this.generateTemplate(config);
        this.queue.markComplete(item, result.outputDir);
        results.push({ success: true, templateId: item.templateId, path: result.outputDir });
      } catch (error) {
        this.queue.markFailed(item, error);
        results.push({ success: false, templateId: item.templateId, error: error.message });
      }
    }

    return {
      status: 'COMPLETED',
      generated: results,
      remaining: CONFIG.dailyLimit - this.queue.state.dailyCount,
    };
  }
}

// Quality Control
class QualityControl {
  async validateExport(filePath) {
    const checks = {
      exists: fs.existsSync(filePath),
      size: 0,
      readable: false,
      validFormat: false,
    };

    if (checks.exists) {
      const stats = fs.statSync(filePath);
      checks.size = stats.size;
      checks.readable = stats.size > 0;
      
      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      checks.validFormat = ['.pdf', '.png', '.svg', '.json', '.md', '.html'].includes(ext);
    }

    const passed = checks.exists && checks.readable && checks.validFormat;
    
    log(passed ? 'info' : 'warn', 'Quality check', { file: filePath, checks, passed });
    
    return { passed, checks };
  }

  async verifyCanvaCompatibility(metadataPath) {
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const required = ['id', 'name', 'sizes', 'colors', 'elements'];
      const missing = required.filter(field => !metadata.config[field]);
      
      const compatible = missing.length === 0;
      
      log(compatible ? 'info' : 'warn', 'Canva compatibility check', { 
        template: metadata.id, 
        compatible,
        missing 
      });
      
      return { compatible, missing };
    } catch (error) {
      log('error', 'Failed to verify Canva compatibility', { error: error.message });
      return { compatible: false, error: error.message };
    }
  }
}

// Auto Listing Generator
class ListingGenerator {
  generateSEOContent(config) {
    const titles = {
      etsy: this.generateEtsyTitle(config),
      creative_market: this.generateCreativeMarketTitle(config),
      designcuts: this.generateDesignCutsTitle(config),
    };

    const descriptions = {
      etsy: this.generateEtsyDescription(config),
      creative_market: this.generateCreativeMarketDescription(config),
      designcuts: this.generateDesignCutsDescription(config),
    };

    return { titles, descriptions, tags: config.tags, prices: config.price };
  }

  generateEtsyTitle(config) {
    const adjectives = ['Professional', 'Editable', 'Modern', 'Creative', 'Stunning'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    return `${adj} ${config.name} | Canva Template | Instant Download | ${config.category.replace(/_/g, ' ').toUpperCase()}`;
  }

  generateCreativeMarketTitle(config) {
    return `${config.name} - Canva Compatible Design Template`;
  }

  generateDesignCutsTitle(config) {
    return `${config.name} Pack - Ready for Canva`;
  }

  generateEtsyDescription(config) {
    return `🎨 ${config.name}

✨ WHAT YOU GET:
• Fully editable Canva template
• ${config.sizes.length} size variation${config.sizes.length > 1 ? 's' : ''}
• High-quality ${config.style.replace(/_/g, ' ')} design
• Instant download after purchase
• Commercial use license included

🎯 PERFECT FOR:
${config.tags.slice(0, 5).map(t => `• ${t.charAt(0).toUpperCase() + t.slice(1)}`).join('\n')}

📦 INCLUDES:
${config.elements.map(e => `• ${e.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n')}

💡 HOW TO USE:
1. Purchase and download
2. Click the Canva link provided
3. Customize with your content
4. Download in your preferred format

📝 NOTE:
This is a digital product. No physical items will be shipped. You will need a free Canva account to use this template.

🛒 Buy now and start creating amazing designs in minutes!`;
  }

  generateCreativeMarketDescription(config) {
    return `${config.name}

A professionally designed ${config.category.replace(/_/g, ' ')} template that's fully compatible with Canva. Perfect for freelancers, small business owners, and creative professionals who want stunning designs without the learning curve.

Features:
• ${config.sizes.length} ready-to-use size variation${config.sizes.length > 1 ? 's' : ''}
• Fully editable in Canva (free account required)
• ${config.colors.length}-color cohesive palette included
• ${config.style.replace(/_/g, ' ')} aesthetic
• Commercial license included

What's Included:
- PDF with Canva template links
- Instructions guide
- Color palette reference
- Font recommendations

Get instant access and elevate your brand today!`;
  }

  generateDesignCutsDescription(config) {
    return `Introducing the ${config.name} - your new go-to design asset!

This Canva-compatible template pack gives you everything you need to create professional ${config.category.replace(/_/g, ' ')} materials in minutes, not hours.

Template Specs:
• Style: ${config.style.replace(/_/g, ' ')}
• Sizes: ${config.sizes.map(s => `${s.width}x${s.height}`).join(', ')}
• Color Palette: ${config.colors.join(', ')}
• Elements: ${config.elements.join(', ')}

Perfect for:
${config.tags.slice(0, 4).join(', ')}

Grab yours today and start creating!`;
  }

  createListingFiles(templateOutputPath, config) {
    const content = this.generateSEOContent(config);
    const listingDir = path.join(templateOutputPath, 'listings');
    
    if (!fs.existsSync(listingDir)) fs.mkdirSync(listingDir, { recursive: true });

    // Save platform-specific listings
    for (const platform of CONFIG.platforms) {
      const listingData = {
        platform,
        title: content.titles[platform],
        description: content.descriptions[platform],
        tags: content.tags,
        price: content.prices[platform],
        category: this.mapCategoryToPlatform(config.category, platform),
        generatedAt: new Date().toISOString(),
      };

      fs.writeFileSync(
        path.join(listingDir, `${platform}_listing.json`),
        JSON.stringify(listingData, null, 2)
      );
    }

    // Create master listing file
    fs.writeFileSync(
      path.join(listingDir, 'master_listing.json'),
      JSON.stringify(content, null, 2)
    );

    // Create text file for easy copy-paste
    const copyText = `=== ETSY ===
Title: ${content.titles.etsy}

Price: $${content.prices.etsy}

Tags: ${content.tags.slice(0, 13).join(', ')}

Description:
${content.descriptions.etsy}

=== CREATIVE MARKET ===
Title: ${content.titles.creative_market}

Price: $${content.prices.creative_market}

Description:
${content.descriptions.creative_market}

=== DESIGNCUTS ===
Title: ${content.titles.designcuts}

Price: $${content.prices.designcuts}

Description:
${content.descriptions.designcuts}
`;

    fs.writeFileSync(path.join(listingDir, 'copy_paste.txt'), copyText);

    log('info', 'Generated listing files', { outputDir: listingDir, platforms: CONFIG.platforms });
    return listingDir;
  }

  mapCategoryToPlatform(category, platform) {
    const mappings = {
      etsy: {
        social_media: 'Graphic Design > Social Media',
        youtube: 'Graphic Design > Social Media',
        print: 'Graphic Design > Templates',
        document: 'Graphic Design > Templates',
        presentation: 'Graphic Design > Presentations',
        digital: 'Graphic Design > Templates',
      },
      creative_market: {
        social_media: 'Graphics / Social Media',
        youtube: 'Graphics / Social Media',
        print: 'Templates / Print',
        document: 'Templates / Documents',
        presentation: 'Templates / Presentations',
        digital: 'Templates / Web Elements',
      },
      designcuts: {
        social_media: 'Social Media Templates',
        youtube: 'Social Media Templates',
        print: 'Print Templates',
        document: 'Document Templates',
        presentation: 'Presentation Templates',
        digital: 'Digital Templates',
      },
    };
    return mappings[platform]?.[category] || 'Templates / Graphics';
  }
}

// Notification System
class NotificationSystem {
  constructor() {
    this.logFile = path.join(CONFIG.logsDir, 'notifications.json');
  }

  notify(templateId, status, details = {}) {
    const notification = {
      id: crypto.randomUUID(),
      templateId,
      status,
      timestamp: new Date().toISOString(),
      details,
    };

    let notifications = [];
    try {
      notifications = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
    } catch {}
    
    notifications.push(notification);
    fs.writeFileSync(this.logFile, JSON.stringify(notifications, null, 2));
    
    log('info', `Notification: ${status}`, { templateId, ...details });
    
    // In a real implementation, this would send to Slack, email, etc.
    return notification;
  }

  generateWeeklySummary() {
    const queue = new TemplateQueue();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const thisWeeksCompleted = queue.queue.completed.filter(
      t => new Date(t.completedAt) >= weekAgo
    );

    const summary = {
      period: `${weekAgo.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`,
      generated: thisWeeksCompleted.length,
      byCategory: {},
      failed: queue.queue.failed.filter(t => new Date(t.failedAt) >= weekAgo).length,
      pending: queue.queue.pending.length,
      inProgress: queue.queue.inProgress.length,
      totalAllTime: queue.state.totalGenerated,
    };

    // Categorize by template type
    thisWeeksCompleted.forEach(item => {
      const config = TEMPLATE_CONFIGS.find(c => c.id === item.templateId);
      if (config) {
        summary.byCategory[config.category] = (summary.byCategory[config.category] || 0) + 1;
      }
    });

    // Save weekly report
    const reportPath = path.join(CONFIG.logsDir, `weekly_summary_${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2));

    log('info', 'Weekly summary generated', summary);
    return summary;
  }

  estimateRevenue(templateIds) {
    const estimates = {};
    
    for (const platform of CONFIG.platforms) {
      let platformTotal = 0;
      const breakdown = [];
      
      for (const id of templateIds) {
        const config = TEMPLATE_CONFIGS.find(c => c.id === id);
        if (config) {
          const price = config.price[platform];
          platformTotal += price;
          breakdown.push({ template: config.name, price });
        }
      }
      
      // Assume 5% conversion rate
      const potentialRevenue = platformTotal * 0.05;
      
      estimates[platform] = {
        totalListings: templateIds.length,
        totalValue: platformTotal,
        estimatedRevenue: potentialRevenue,
        conversionRate: '5%',
        breakdown,
      };
    }

    return estimates;
  }
}

// Main Pipeline Controller
class CanvaAutomationPipeline {
  constructor() {
    this.generator = new TemplateGenerator();
    this.quality = new QualityControl();
    this.lister = new ListingGenerator();
    this.notifier = new NotificationSystem();
  }

  async run(options = {}) {
    const { fullPipeline = false, specificTemplate = null } = options;
    
    log('info', 'Starting Canva Automation Pipeline', options);

    try {
      // Step 1: Generate templates
      let generationResult;
      if (specificTemplate) {
        const config = TEMPLATE_CONFIGS.find(c => c.id === specificTemplate);
        if (!config) throw new Error(`Template not found: ${specificTemplate}`);
        generationResult = { 
          status: 'SINGLE',
          generated: [{ success: true, templateId: specificTemplate, path: await this.generator.generateTemplate(config) }]
        };
      } else {
        generationResult = await this.generator.runDailyGeneration();
      }

      // Step 2: Quality control
      for (const result of generationResult.generated) {
        if (!result.success) continue;
        
        const outputDir = result.path.outputDir || result.path;
        let metaFile = null;
        
        try {
          const files = fs.readdirSync(outputDir);
          metaFile = files.find(f => f.endsWith('_metadata.json'));
          if (metaFile) metaFile = path.join(outputDir, metaFile);
        } catch (err) {
          log('warn', 'Could not read output directory', { path: outputDir, error: err.message });
        }
        
        if (metaFile) {
          const qcResult = await this.quality.verifyCanvaCompatibility(metaFile);
          
          if (!qcResult.compatible) {
            log('warn', 'Quality check failed', { templateId: result.templateId, issues: qcResult.missing });
          }
        }
      }

      // Step 3: Generate listings (if full pipeline)
      if (fullPipeline) {
        for (const result of generationResult.generated) {
          if (!result.success) continue;
          
          const config = TEMPLATE_CONFIGS.find(c => c.id === result.templateId);
          if (config) {
            this.lister.createListingFiles(result.path.outputDir || result.path, config);
          }
        }
      }

      // Step 4: Notifications
      for (const result of generationResult.generated) {
        this.notifier.notify(
          result.templateId,
          result.success ? 'TEMPLATE_READY' : 'TEMPLATE_FAILED',
          { path: result.path, error: result.error }
        );
      }

      log('info', 'Pipeline completed', generationResult);
      return generationResult;

    } catch (error) {
      log('error', 'Pipeline failed', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async generateWeeklyReport() {
    return this.notifier.generateWeeklySummary();
  }

  async getQueueStatus() {
    const queue = new TemplateQueue();
    return {
      pending: queue.queue.pending.length,
      inProgress: queue.queue.inProgress.length,
      completed: queue.queue.completed.length,
      failed: queue.queue.failed.length,
      dailyCount: queue.state.dailyCount,
      dailyLimit: CONFIG.dailyLimit,
      canGenerateToday: queue.canGenerateToday(),
    };
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const pipeline = new CanvaAutomationPipeline();

  switch (command) {
    case 'generate':
    case 'daily':
      const result = await pipeline.run({ fullPipeline: true });
      console.log('\n=== Generation Results ===');
      console.log(JSON.stringify(result, null, 2));
      break;

    case 'single':
      const templateId = process.argv[3];
      if (!templateId) {
        console.error('Usage: canva_automation.js single <template-id>');
        console.log('Available:', TEMPLATE_CONFIGS.map(c => c.id).join(', '));
        process.exit(1);
      }
      const single = await pipeline.run({ specificTemplate: templateId, fullPipeline: true });
      console.log('\n=== Single Template Result ===');
      console.log(JSON.stringify(single, null, 2));
      break;

    case 'status':
      const status = await pipeline.getQueueStatus();
      console.log('\n=== Queue Status ===');
      console.log(JSON.stringify(status, null, 2));
      break;

    case 'report':
    case 'weekly':
      const report = await pipeline.generateWeeklyReport();
      console.log('\n=== Weekly Report ===');
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'revenue':
      const templateIds = process.argv.slice(3).length > 0 
        ? process.argv.slice(3)
        : TEMPLATE_CONFIGS.map(c => c.id);
      const notifier = new NotificationSystem();
      const revenue = notifier.estimateRevenue(templateIds);
      console.log('\n=== Revenue Estimates ===');
      console.log(JSON.stringify(revenue, null, 2));
      break;

    case 'list':
      console.log('\n=== Available Templates ===');
      TEMPLATE_CONFIGS.forEach(c => {
        console.log(`${c.id}: ${c.name} [$${c.price.etsy} - $${c.price.creative_market}]`);
      });
      break;

    default:
      console.log(`
Canva Template Automation Pipeline

Commands:
  generate, daily    Run daily generation (up to ${CONFIG.dailyLimit} templates)
  single <id>        Generate specific template
  status             Show queue status
  report, weekly     Generate weekly summary
  revenue [ids...]     Estimate revenue potential
  list               List all available templates

Examples:
  node canva_automation.js daily
  node canva_automation.js single instagram_carousel
  node canva_automation.js revenue instagram_carousel youtube_thumbnail
`);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  CanvaAutomationPipeline,
  TemplateGenerator,
  TemplateQueue,
  QualityControl,
  ListingGenerator,
  NotificationSystem,
  TEMPLATE_CONFIGS,
  CONFIG,
};
