# Figma Plugin Setup Guide
## Complete Guide to Building Templates & Automating Canva Integration

**Version:** 1.0  
**Last Updated:** March 2026  
**Time to Complete:** 2 weeks  
**Difficulty:** Beginner-Friendly

---

# 📋 SECTION 1: PREREQUISITES CHECKLIST

## Account Requirements

### Figma Account
| Plan | Plugin Development | Cost |
|------|-------------------|------|
| **Free** | ✅ Can build and test plugins locally | $0 |
| **Professional** | ✅ Required to publish plugins | $12-15/mo |
| **Organization** | ✅ Team collaboration features | $45/mo/editor |

> **Recommendation:** Start with a Free account for development. Upgrade to Professional when ready to publish.

### Developer Account Setup
- [ ] Figma account created (free tier OK for development)
- [ ] Verified email address
- [ ] Access to Figma Desktop App (highly recommended over browser)
- [ ] Developer Mode enabled (Settings → Enable Developer Mode)

## Technical Requirements

### Node.js
```
Required: Node.js v18.0.0 or higher
Recommended: Node.js v20.x LTS
```

**Check your version:**
```bash
node --version
# Should output v18.0.0 or higher
```

**Install/Update Node.js:**
```bash
# Using Homebrew (macOS)
brew install node

# Using nvm (recommended for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### TypeScript Knowledge Level
**Minimum Required:**
- Basic JavaScript familiarity
- Understanding of types (string, number, boolean)
- Function syntax
- Basic async/await

**Helpful but Not Required:**
- Interface definitions
- Generic types
- Module imports/exports

> **Don't worry if you're new to TypeScript!** The Figma plugin API is well-documented and forgiving.

---

# 🚀 SECTION 2: STEP-BY-STEP SETUP (WEEK 1)

## 📅 DAYS 1-2: Figma Developer Account Setup

### Step 1: Apply for Figma Plugin API Access

**Good news:** No application needed! The Figma Plugin API is open to all users.

1. Log into your Figma account
2. Go to **Settings** (click your profile picture)
3. Navigate to **Developer Settings** → **Plugins**
4. Click **Create a new plugin**

**Screenshot Description:**
```
┌─────────────────────────────────────────┐
│  Figma Settings Page                    │
│                                         │
│  [Profile] [Account] [Developer]        │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ Developer Settings              │  │
│  │                                 │  │
│  │ Plugins                         │  │
│  │ Personal Access Tokens          │  │
│  │ Webhook                         │  │
│  │                                 │  │
│  │ [Create a new plugin]           │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Step 2: Create Your First Plugin

**Option A: Using Figma's Official Template (Recommended)**

```bash
# Create a new directory for your plugin
mkdir figma-canva-templates
cd figma-canva-templates

# Initialize using Figma's official template
npx create-figma-plugin
```

**During setup, you'll see:**
```
? What is the name of your plugin? figma-canva-templates
? Would you like to use TypeScript? Yes
? Which template would you like to use?
  ▸ Default
    UI with Preact
    UI with React
    UI with Svelte
    UI with Vanilla
```

**Select:** `UI with Preact` (lightweight, fast, perfect for template tools)

### Step 3: Get Your Personal Access Token

1. In Figma, go to **Settings** → **Personal Access Tokens**
2. Click **Create new token**
3. Name it: `Canva Template Automation`
4. Copy and save the token securely

**Screenshot Description:**
```
┌─────────────────────────────────────────┐
│  Personal Access Tokens               │
│                                         │
│  + Create new token                     │
│                                         │
│  Name: Canva Template Automation        │
│  [Create token]                         │
│                                         │
│  ⚠️  Copy this token now!              │
│  figd_xxxxx... (long string)            │
│  You won't be able to see it again.     │
└─────────────────────────────────────────┘
```

**Save token to environment:**
```bash
# Add to your shell profile (.zshrc, .bashrc, etc.)
echo 'export FIGMA_ACCESS_TOKEN="figd_xxxxx"' >> ~/.zshrc
source ~/.zshrc
```

---

## 📅 DAYS 3-4: Development Environment

### Step 1: Install Dependencies

```bash
# In your plugin directory
cd figma-canva-templates

# Install all dependencies
npm install

# Install additional packages for Canva integration
npm install axios node-html-parser
npm install -D @figma/plugin-typings
```

### Step 2: Project Structure Overview

```
figma-canva-templates/
├── manifest.json          # Plugin manifest (Figma reads this)
├── package.json           # Node dependencies
├── tsconfig.json          # TypeScript config
├── build-figma-plugin/    # Build configuration
├── src/
│   ├── main.ts           # Main plugin code (runs in Figma)
│   ├── ui.ts             # UI code (runs in iframe)
│   └── utils/
│       ├── export.ts     # Export to Canva utilities
│       └── templates.ts  # Template configurations
├── ui/
│   ├── ui.html           # HTML for plugin UI
│   └── ui.css            # Styles for plugin UI
└── assets/
    └── icons/            # Plugin icons
```

### Step 3: Configure Plugin Manifest

**Edit `manifest.json`:**

```json
{
  "api": "1.0.0",
  "editorType": ["figma"],
  "id": "figma-canva-templates",
  "name": "Canva Template Generator",
  "main": "build/main.js",
  "ui": "build/ui.js",
  "parameters": [
    {
      "name": "Template Type",
      "key": "templateType"
    }
  ],
  "parameterOnly": false,
  "networkAccess": {
    "allowedDomains": [
      "https://api.canva.com",
      "https://www.canva.com"
    ]
  }
}
```

### Step 4: Set Up Figma Desktop App

1. Download Figma Desktop from [figma.com/downloads](https://www.figma.com/downloads/)
2. Install and sign in with your Figma account
3. Open the Desktop App
4. Create a new test file: **File** → **New Design File**

**Screenshot Description:**
```
┌─────────────────────────────────────────┐
│  Figma Desktop App                      │
│                                         │
│  [New Design File] [Import] [Templates] │
│                                         │
│  Recent Files:                          │
│  • Untitled 1                          │
│  • Template Test                       │
│                                         │
│  [Open] to open existing files          │
└─────────────────────────────────────────┘
```

### Step 5: Load Plugin in Development Mode

1. Open any Figma file
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Navigate to your `figma-canva-templates` folder
4. Select `manifest.json`
5. The plugin will now appear in **Plugins** → **Development**

**Test your plugin:**
- Press `Cmd/Ctrl + /`
- Type "Canva Template Generator"
- Press Enter to run

---

## 📅 DAYS 5-7: Plugin Development

### Step 1: Build Your First Template

**Create `src/templates/instagram-post.ts`:**

```typescript
// Instagram Post Template (1080x1080)
export const instagramPostTemplate = {
  name: "Instagram Post",
  width: 1080,
  height: 1080,
  frames: [
    {
      name: "Background",
      type: "RECTANGLE",
      fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
      width: 1080,
      height: 1080
    },
    {
      name: "Image Placeholder",
      type: "RECTANGLE",
      width: 800,
      height: 600,
      x: 140,
      y: 200,
      fills: [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }]
    },
    {
      name: "Headline",
      type: "TEXT",
      characters: "Your Headline Here",
      fontSize: 48,
      fontName: { family: "Inter", style: "Bold" },
      x: 140,
      y: 100
    }
  ]
};

export const templates = [
  instagramPostTemplate,
  // Add more templates here
];
```

### Step 2: Main Plugin Code

**Edit `src/main.ts`:**

```typescript
import { templates } from './templates/instagram-post';

// Show UI when plugin runs
figma.showUI(__html__, { width: 400, height: 500 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-template') {
    const template = templates.find(t => t.name === msg.templateName);
    
    if (template) {
      // Create new page for template
      const page = figma.createPage();
      page.name = template.name;
      figma.currentPage = page;
      
      // Create frame
      const frame = figma.createFrame();
      frame.name = template.name;
      frame.resize(template.width, template.height);
      
      // Add template elements
      for (const element of template.frames) {
        await createElement(frame, element);
      }
      
      // Select and zoom
      figma.currentPage.selection = [frame];
      figma.viewport.scrollAndZoomIntoView([frame]);
      
      figma.ui.postMessage({ 
        type: 'template-created', 
        message: `${template.name} created successfully!` 
      });
    }
  }
  
  if (msg.type === 'export-to-canva') {
    await exportToCanva(msg.format);
  }
};

async function createElement(parent: FrameNode, config: any) {
  // Element creation logic based on type
  switch (config.type) {
    case 'RECTANGLE':
      const rect = figma.createRectangle();
      rect.resize(config.width, config.height);
      if (config.x) rect.x = config.x;
      if (config.y) rect.y = config.y;
      if (config.fills) rect.fills = config.fills;
      parent.appendChild(rect);
      break;
      
    case 'TEXT':
      const text = figma.createText();
      await figma.loadFontAsync(config.fontName);
      text.fontName = config.fontName;
      text.fontSize = config.fontSize;
      text.characters = config.characters;
      if (config.x) text.x = config.x;
      if (config.y) text.y = config.y;
      parent.appendChild(text);
      break;
  }
}

async function exportToCanva(format: 'PNG' | 'SVG' | 'PDF') {
  const nodes = figma.currentPage.selection;
  
  if (nodes.length === 0) {
    figma.ui.postMessage({ 
      type: 'error', 
      message: 'Please select a frame to export' 
    });
    return;
  }
  
  const exportSettings: ExportSettings = {
    format: format,
    constraint: { type: 'SCALE', value: 2 }
  };
  
  const bytes = await nodes[0].exportAsync(exportSettings);
  
  figma.ui.postMessage({
    type: 'export-ready',
    data: bytes,
    format: format
  });
}
```

### Step 3: Create Plugin UI

**Edit `ui/ui.html`:**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 16px;
      background: #f5f5f5;
    }
    .container { max-width: 100%; }
    h1 {
      font-size: 18px;
      margin-bottom: 16px;
      color: #333;
    }
    .template-card {
      background: white;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s;
    }
    .template-card:hover {
      border-color: #007AFF;
    }
    .template-card h3 {
      font-size: 14px;
      color: #333;
    }
    .template-card p {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    .button {
      width: 100%;
      padding: 12px;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      margin-top: 8px;
    }
    .button:hover { background: #0056b3; }
    .export-buttons {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    .export-buttons .button {
      flex: 1;
      background: #34C759;
    }
    .status {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      display: none;
    }
    .status.success {
      display: block;
      background: #d4edda;
      color: #155724;
    }
    .status.error {
      display: block;
      background: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 Template Generator</h1>
    
    <div class="template-card" onclick="createTemplate('Instagram Post')">
      <h3>📱 Instagram Post</h3>
      <p>1080×1080px square format</p>
    </div>
    
    <div class="template-card" onclick="createTemplate('Instagram Story')">
      <h3>📖 Instagram Story</h3>
      <p>1080×1920px vertical format</p>
    </div>
    
    <div class="template-card" onclick="createTemplate('Facebook Post')">
      <h3>👥 Facebook Post</h3>
      <p>1200×630px landscape format</p>
    </div>
    
    <h1 style="margin-top: 24px;">📤 Export to Canva</h1>
    <div class="export-buttons">
      <button class="button" onclick="exportToCanva('PNG')">PNG</button>
      <button class="button" onclick="exportToCanva('SVG')">SVG</button>
      <button class="button" onclick="exportToCanva('PDF')">PDF</button>
    </div>
    
    <div id="status" class="status"></div>
  </div>
  
  <script>
    function createTemplate(name) {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'create-template', 
          templateName: name 
        } 
      }, '*');
    }
    
    function exportToCanva(format) {
      parent.postMessage({ 
        pluginMessage: { 
          type: 'export-to-canva', 
          format: format 
        } 
      }, '*');
    }
    
    function showStatus(message, isError = false) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + (isError ? 'error' : 'success');
      setTimeout(() => {
        status.className = 'status';
      }, 3000);
    }
    
    onmessage = (event) => {
      const msg = event.data.pluginMessage;
      if (msg.type === 'template-created') {
        showStatus(msg.message);
      } else if (msg.type === 'export-ready') {
        showStatus(`Export ready! Downloading ${msg.format}...`);
        // Trigger download
        const blob = new Blob([new Uint8Array(msg.data)], { 
          type: msg.format === 'PNG' ? 'image/png' : 'application/pdf' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `template.${msg.format.toLowerCase()}`;
        a.click();
      } else if (msg.type === 'error') {
        showStatus(msg.message, true);
      }
    };
  </script>
</body>
</html>
```

### Step 4: Build and Test

```bash
# Build your plugin
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch
```

**Testing Steps:**
1. In Figma Desktop, go to **Plugins** → **Development** → **Canva Template Generator**
2. Click on a template card (e.g., "Instagram Post")
3. Watch the template generate on your Figma canvas
4. Select the generated frame
5. Click "PNG" to export

**Screenshot Description:**
```
┌─────────────────────────────────────────┐
│  Figma Canvas with Generated Template   │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Your Headline Here             │    │
│  │                                 │    │
│  │  ┌─────────────────────────┐   │    │
│  │  │                         │   │    │
│  │  │    [Image Placeholder]  │   │    │
│  │  │                         │   │    │
│  │  └─────────────────────────┘   │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│  (1080×1080 Instagram Post Template)    │
│                                         │
│  [✓ Template created successfully!]     │
└─────────────────────────────────────────┘
```

### Step 5: Export to Canva

**Format Comparison:**

| Format | Best For | Canva Import |
|--------|----------|--------------|
| **PNG** | Images, photos, final designs | ✅ Direct drag & drop |
| **SVG** | Logos, icons, scalable graphics | ✅ Import as vector |
| **PDF** | Multi-page documents, print | ✅ Import as editable |

**Export Process:**
1. Select your template frame in Figma
2. Choose export format in plugin
3. File downloads automatically
4. Open Canva in browser
5. Drag exported file into Canva

---

# 🤖 SECTION 3: WEEK 2 - AUTOMATION

## Day 8: Create Template Configs

### Template Configuration System

**Create `src/config/templates.config.ts`:**

```typescript
export interface TemplateConfig {
  id: string;
  name: string;
  category: 'social' | 'marketing' | 'presentation' | 'print';
  dimensions: { width: number; height: number };
  placeholders: PlaceholderConfig[];
  brandColors?: string[];
  fonts?: string[];
}

interface PlaceholderConfig {
  id: string;
  type: 'image' | 'text' | 'shape';
  position: { x: number; y: number };
  dimensions?: { width: number; height: number };
  defaultValue?: string;
}

export const templateConfigs: TemplateConfig[] = [
  {
    id: 'instagram-post-v1',
    name: 'Instagram Post - Promotional',
    category: 'social',
    dimensions: { width: 1080, height: 1080 },
    placeholders: [
      { id: 'background', type: 'shape', position: { x: 0, y: 0 } },
      { id: 'main-image', type: 'image', position: { x: 140, y: 200 }, 
        dimensions: { width: 800, height: 600 } },
      { id: 'headline', type: 'text', position: { x: 140, y: 100 }, 
        defaultValue: 'Special Offer!' },
      { id: 'cta', type: 'text', position: { x: 140, y: 850 }, 
        defaultValue: 'Shop Now' }
    ],
    brandColors: ['#007AFF', '#FFFFFF', '#333333'],
    fonts: ['Inter Bold', 'Inter Regular']
  },
  {
    id: 'instagram-story-v1',
    name: 'Instagram Story - Announcement',
    category: 'social',
    dimensions: { width: 1080, height: 1920 },
    placeholders: [
      { id: 'background', type: 'shape', position: { x: 0, y: 0 } },
      { id: 'title', type: 'text', position: { x: 540, y: 400 }, 
        defaultValue: 'New Product Launch' },
      { id: 'subtitle', type: 'text', position: { x: 540, y: 600 }, 
        defaultValue: 'Coming Soon' },
      { id: 'swipe-up', type: 'text', position: { x: 540, y: 1700 }, 
        defaultValue: 'Swipe Up' }
    ]
  }
  // Add more templates...
];

// Export function for batch generation
export function getTemplatesByCategory(category: string): TemplateConfig[] {
  return templateConfigs.filter(t => t.category === category);
}

export function getAllTemplateIds(): string[] {
  return templateConfigs.map(t => t.id);
}
```

## Day 9: Batch Generation Workflow

### Create Batch Generator

**Create `src/utils/batch-generator.ts`:**

```typescript
import { templateConfigs, TemplateConfig } from '../config/templates.config';

interface BatchJob {
  id: string;
  templateIds: string[];
  data: Record<string, any>[];
  outputFormat: 'PNG' | 'SVG' | 'PDF';
}

export class BatchGenerator {
  private jobs: BatchJob[] = [];
  
  async createBatch(templateIds: string[], data: any[]): Promise<string> {
    const jobId = `batch-${Date.now()}`;
    const job: BatchJob = {
      id: jobId,
      templateIds,
      data,
      outputFormat: 'PNG'
    };
    this.jobs.push(job);
    return jobId;
  }
  
  async processBatch(jobId: string, progressCallback?: (progress: number) => void) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) throw new Error('Batch job not found');
    
    const totalItems = job.templateIds.length * job.data.length;
    let processed = 0;
    const results: any[] = [];
    
    for (const templateId of job.templateIds) {
      const template = templateConfigs.find(t => t.id === templateId);
      if (!template) continue;
      
      for (const item of job.data) {
        const result = await this.generateFromTemplate(template, item);
        results.push(result);
        processed++;
        
        if (progressCallback) {
          progressCallback(Math.round((processed / totalItems) * 100));
        }
      }
    }
    
    return results;
  }
  
  private async generateFromTemplate(
    template: TemplateConfig, 
    data: any
  ): Promise<any> {
    // Create frame with template dimensions
    const frame = figma.createFrame();
    frame.resize(template.dimensions.width, template.dimensions.height);
    frame.name = `${template.name} - ${data.name || 'Untitled'}`;
    
    // Apply placeholders with data
    for (const placeholder of template.placeholders) {
      await this.applyPlaceholder(frame, placeholder, data[placeholder.id]);
    }
    
    return frame;
  }
  
  private async applyPlaceholder(
    frame: FrameNode,
    config: any,
    value: any
  ) {
    // Implementation for each placeholder type
    switch (config.type) {
      case 'text':
        const text = figma.createText();
        await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
        text.fontName = { family: 'Inter', style: 'Regular' };
        text.characters = value || config.defaultValue || '';
        text.x = config.position.x;
        text.y = config.position.y;
        frame.appendChild(text);
        break;
        
      case 'image':
        // Create image placeholder
        const rect = figma.createRectangle();
        rect.resize(config.dimensions.width, config.dimensions.height);
        rect.x = config.position.x;
        rect.y = config.position.y;
        rect.name = 'Image Placeholder';
        frame.appendChild(rect);
        break;
    }
  }
}

export const batchGenerator = new BatchGenerator();
```

## Day 10: Integration with Canva Workflow

### Automated Canva Upload Script

**Create `src/utils/canva-bridge.ts`:**

```typescript
/**
 * Canva Bridge - Automate upload to Canva
 * Note: Requires Canva API access (Enterprise/Teams)
 */

interface CanvaUploadConfig {
  apiKey: string;
  teamId?: string;
  folderId?: string;
}

export class CanvaBridge {
  private config: CanvaUploadConfig;
  
  constructor(config: CanvaUploadConfig) {
    this.config = config;
  }
  
  /**
   * Upload exported file to Canva
   * For personal use, use Canva's Import URL feature
   */
  async uploadToCanva(
    fileBuffer: Uint8Array, 
    filename: string
  ): Promise<{ success: boolean; url?: string }> {
    // For individual users:
    // 1. Save file locally
    // 2. Open Canva import dialog
    // 3. User drags file in
    
    // For Enterprise with API access:
    // Direct upload via Canva REST API
    
    return { success: true };
  }
  
  /**
   * Generate Canva Import URLs
   * Creates shareable links for Canva import
   */
  generateImportUrl(fileUrl: string): string {
    // Canva supports importing from URLs
    return `https://www.canva.com/import?url=${encodeURIComponent(fileUrl)}`;
  }
  
  /**
   * Prepare batch for Canva upload
   */
  prepareCanvaBatch(frames: FrameNode[]): Promise<any[]> {
    return Promise.all(
      frames.map(async (frame, index) => {
        const bytes = await frame.exportAsync({
          format: 'PNG',
          constraint: { type: 'SCALE', value: 2 }
        });
        
        return {
          name: frame.name,
          data: bytes,
          index
        };
      })
    );
  }
}

// Alternative: Export to Google Drive/Cloud for Canva import
export async function exportToCloudStorage(
  frames: FrameNode[],
  service: 'googledrive' | 'dropbox' | 'onedrive'
): Promise<string[]> {
  // Returns shareable URLs that Canva can import
  return frames.map(f => `https://placeholder/${f.name}`);
}
```

## Day 11-12: Quality Control Process

### Automated QA Checks

**Create `src/utils/quality-control.ts`:**

```typescript
interface QualityCheck {
  id: string;
  name: string;
  check: (frame: FrameNode) => Promise<boolean>;
  message: string;
}

export const qualityChecks: QualityCheck[] = [
  {
    id: 'dimensions',
    name: 'Dimensions Check',
    check: async (frame) => {
      const validDimensions = [
        { w: 1080, h: 1080 }, // Instagram Post
        { w: 1080, h: 1920 }, // Instagram Story
        { w: 1200, h: 630 },  // Facebook Post
        { w: 1200, h: 675 },  // Twitter/X
        { w: 1920, h: 1080 }, // YouTube Thumbnail
      ];
      return validDimensions.some(d => 
        frame.width === d.w && frame.height === d.h
      );
    },
    message: 'Frame dimensions should match standard social media sizes'
  },
  {
    id: 'text-legibility',
    name: 'Text Legibility',
    check: async (frame) => {
      const textNodes = frame.findAll(n => n.type === 'TEXT') as TextNode[];
      return textNodes.every(t => {
        const fontSize = t.fontSize as number;
        return fontSize >= 12; // Minimum readable size
      });
    },
    message: 'All text should be at least 12px for readability'
  },
  {
    id: 'contrast',
    name: 'Color Contrast',
    check: async (frame) => {
      // Simplified check - ensure text isn't white on light backgrounds
      return true; // Implement proper contrast calculation
    },
    message: 'Text should have sufficient contrast against background'
  },
  {
    id: 'placeholder-count',
    name: 'Placeholder Check',
    check: async (frame) => {
      const placeholders = frame.findAll(n => 
        n.name.toLowerCase().includes('placeholder')
      );
      return placeholders.length > 0;
    },
    message: 'Template should have at least one placeholder'
  }
];

export async function runQualityChecks(frame: FrameNode): Promise<{
  passed: boolean;
  results: { check: string; passed: boolean; message: string }[];
}> {
  const results = [];
  
  for (const check of qualityChecks) {
    const passed = await check.check(frame);
    results.push({
      check: check.name,
      passed,
      message: check.message
    });
  }
  
  return {
    passed: results.every(r => r.passed),
    results
  };
}

// Batch QA
export async function batchQualityCheck(frames: FrameNode[]): Promise<{
  total: number;
  passed: number;
  failed: number;
  details: any[];
}> {
  const details = [];
  let passed = 0;
  
  for (const frame of frames) {
    const result = await runQualityChecks(frame);
    if (result.passed) passed++;
    details.push({ frame: frame.name, ...result });
  }
  
  return {
    total: frames.length,
    passed,
    failed: frames.length - passed,
    details
  };
}
```

---

# 🔄 SECTION 4: CANVA INTEGRATION GUIDE

## Import Methods

### Method 1: Direct Drag & Drop (Easiest)

**Steps:**
1. Export from Figma as PNG/SVG
2. Open Canva (canva.com)
3. Create new design or open existing
4. Drag exported file directly onto canvas

**Screenshot Description:**
```
┌─────────────────────────────────────────┐
│  Canva Interface                        │
│                                         │
│  ┌───────────────────────────────┐     │
│  │                               │     │
│  │   [Drop files here]           │     │
│  │   ┌─────────┐                 │     │
│  │   │         │                 │     │
│  │   │  IMG    │  ← Drag here    │     │
│  │   │         │                 │     │
│  │   └─────────┘                 │     │
│  │                               │     │
│  └───────────────────────────────┘     │
│                                         │
│  [Uploads] [Elements] [Text] [Brand]   │
└─────────────────────────────────────────┘
```

### Method 2: Canva Import Dialog

1. In Canva, click **File** → **Import files**
2. Select your exported Figma file
3. Choose import options:
   - **As image** - Static import
   - **As editable** - If importing SVG/PDF with editable elements

### Method 3: Using Uploads Panel

1. Click **Uploads** in left sidebar
2. Click **Upload files**
3. Select exported Figma files
4. Drag uploaded items onto canvas

## Best File Formats

### For Different Use Cases

| Canva Feature | Best Format | Why |
|--------------|-------------|-----|
| **Background images** | PNG (high-res) | Preserves quality |
| **Logos/Icons** | SVG | Editable vectors |
| **Text with effects** | PNG | Keeps styling |
| **Multi-page templates** | PDF | Preserves pages |
| **Animated elements** | GIF | Motion preserved |
| **Transparent elements** | PNG-24 | Alpha channel |

### Figma Export Settings for Canva

**Recommended export settings:**
```typescript
const exportSettings = {
  // For social media posts
  social: {
    format: 'PNG',
    constraint: { type: 'SCALE', value: 2 } // 2x for retina
  },
  
  // For logos/icons
  vector: {
    format: 'SVG',
    svgOutlineText: true,
    svgIdAttribute: true
  },
  
  // For print materials
  print: {
    format: 'PDF',
    pdfAllowOverrides: true
  }
};
```

## Organizing Templates in Canva

### Folder Structure Recommendation

```
📁 Canva Templates/
├── 📁 Social Media/
│   ├── 📁 Instagram/
│   │   ├── 📁 Posts/
│   │   └── 📁 Stories/
│   ├── 📁 Facebook/
│   ├── 📁 Twitter-X/
│   └── 📁 LinkedIn/
├── 📁 Marketing/
│   ├── 📁 Flyers/
│   ├── 📁 Posters/
│   └── 📁 Banners/
├── 📁 Presentations/
├── 📁 Print/
│   ├── 📁 Business Cards/
│   └── 📁 Letterheads/
└── 📁 Brand Assets/
    ├── Logos/
    ├── Color Palette/
    └── Fonts/
```

### Setting Up Template Links

**Create quick-access links in Canva:**

1. **Star frequently used templates**
   - Hover over template → Click ⭐
   - Access from "Starred" section

2. **Create folders in Uploads**
   - Canva Pro feature
   - Organize by campaign or date

3. **Use Brand Kit (Pro)**
   - Save colors, fonts, logos
   - Consistent branding across templates

**Screenshot Description:**
```
┌─────────────────────────────────────────┐
│  Canva Brand Kit                        │
│                                         │
│  Brand Colors                           │
│  [█ #007AFF] [█ #FF9500] [█ #34C759]   │
│                                         │
│  Brand Fonts                            │
│  Heading: Inter Bold                    │
│  Body: Inter Regular                    │
│                                         │
│  Logos                                  │
│  [Logo Main] [Logo White] [Logo Icon]  │
└─────────────────────────────────────────┘
```

---

# 🔧 SECTION 5: TROUBLESHOOTING

## Common Errors & Fixes

### Plugin Won't Load

**Error:** "Plugin failed to load" or "Manifest not found"

**Fixes:**
```bash
# 1. Ensure you've built the project
npm run build

# 2. Check manifest.json exists and is valid
ls manifest.json
cat manifest.json | jq '.'  # Should show valid JSON

# 3. Verify paths in manifest
# main: "build/main.js" - must exist
# ui: "build/ui.js" - must exist

# 4. Rebuild with watch mode
npm run watch
```

### Build Errors

**Error:** "Cannot find module" or TypeScript errors

```bash
# Fix dependency issues
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version  # Should be 4.x or higher

# Run type check
npx tsc --noEmit
```

### API Rate Limits

**Figma Plugin API Limits:**
| Action | Limit |
|--------|-------|
| Plugin operations | 10,000/hour |
| File exports | 100/minute |
| Image exports | 50/minute |

**Best practices to avoid limits:**
```typescript
// Add delays between operations
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function batchExport(frames: FrameNode[]) {
  for (const frame of frames) {
    await frame.exportAsync({ format: 'PNG' });
    await delay(100); // 100ms delay
  }
}
```

### Export Issues

**Problem:** Exports are blurry/low quality

**Solution:**
```typescript
// Use 2x or 3x scale for high-res
const highResExport = {
  format: 'PNG',
  constraint: { type: 'SCALE', value: 3 }
};

// For print, use exact dimensions
const printExport = {
  format: 'PDF',
  constraint: { 
    type: 'WIDTH', 
    value: 300 * 8.5 // 300 DPI * 8.5 inches
  }
};
```

**Problem:** Colors look different in Canva

**Fix:**
1. Export in sRGB color space (default in Figma)
2. Ensure "Include id attributes" is checked for SVG
3. Use hex codes in both Figma and Canva

### Canva Import Problems

**Problem:** SVG imports as ungrouped elements

**Fix:**
```typescript
// Group elements before export in Figma
const group = figma.group(selection, figma.currentPage);
group.name = "Template Group";

// Export the group
await group.exportAsync({ format: 'SVG' });
```

**Problem:** Text is editable in Canva but font is wrong

**Fix:**
1. Convert text to outlines before export (if font not needed)
2. OR use Google Fonts available in both Figma and Canva
3. Inter, Roboto, Open Sans work well across platforms

**Problem:** Transparent backgrounds appear black

**Fix:**
```typescript
// Ensure frame has no fill
frame.fills = []; // Empty array = transparent

// Export as PNG-24
await frame.exportAsync({ 
  format: 'PNG',
  constraint: { type: 'SCALE', value: 2 }
});
```

## Debug Mode

**Enable plugin debugging:**

1. Open Figma Desktop
2. Go to **Plugins** → **Development** → **[Your Plugin]**
3. Right-click plugin UI → **Inspect Element**
4. Use Chrome DevTools to debug

**Screenshot Description:**
```
┌─────────────────────────────────────────┐
│  Chrome DevTools - Plugin Debug         │
│                                         │
│  Console | Elements | Network | Sources  │
│                                         │
│  > figma.ui.postMessage(...)            │
│  < {pluginMessage: {type: "success"}}     │
│                                         │
│  [Inspect element to debug UI]          │
└─────────────────────────────────────────┘
```

---

# 📅 SECTION 6: TIMELINE & MILESTONES

## 2-Week Daily Checklist

### Week 1: Foundation

| Day | Task | Status | Notes |
|-----|------|--------|-------|
| **1** | Create Figma account | ⬜ | Use free tier |
| | Enable Developer Mode | ⬜ | Settings → Developer |
| | Install Node.js v18+ | ⬜ | Verify with `node -v` |
| **2** | Create Personal Access Token | ⬜ | Save securely |
| | Apply for plugin development | ⬜ | Go to Plugins → Create |
| **3** | Run `npx create-figma-plugin` | ⬜ | Choose Preact template |
| | Install dependencies | ⬜ | `npm install` |
| | Set up Figma Desktop | ⬜ | Download from figma.com |
| **4** | Configure manifest.json | ⬜ | Add network access |
| | Import plugin in Figma | ⬜ | Plugins → Development |
| | Test basic plugin runs | ⬜ | Should show UI |
| **5** | Create first template file | ⬜ | Instagram Post |
| | Build template generator | ⬜ | src/templates/*.ts |
| | Test template creation | ⬜ | Click in plugin UI |
| **6** | Add export functionality | ⬜ | PNG export first |
| | Test export to downloads | ⬜ | Check Downloads folder |
| **7** | Add more templates (3-5) | ⬜ | Story, FB, Twitter |
| | Polish UI | ⬜ | Add styling |
| | **WEEK 1 COMPLETE** | 🎯 | Basic plugin working |

### Week 2: Automation

| Day | Task | Status | Notes |
|-----|------|--------|-------|
| **8** | Create template configs | ⬜ | JSON config system |
| | Add placeholder system | ⬜ | Configurable elements |
| **9** | Build batch generator | ⬜ | BatchJob class |
| | Add progress tracking | ⬜ | Progress bar UI |
| **10** | Create Canva bridge | ⬜ | Upload automation |
| | Test Canva import | ⬜ | Drag & drop PNG |
| **11** | Add quality checks | ✨ | Dimension validation |
| | Create QA report | ✨ | Pass/fail display |
| **12** | Build template library | ✨ | 10+ templates |
| | Add categories | ✨ | Social/Marketing/etc |
| **13** | Test batch workflow | ✨ | End-to-end test |
| | Fix any bugs | ✨ | Polish |
| **14** | Documentation | ✨ | README, comments |
| | Final testing | ✨ | All features work |
| | **WEEK 2 COMPLETE** | 🎯 | Automation ready |

## Milestone Expectations

### When to Expect First Automated Template

| Milestone | Expected Time | Actual | Notes |
|-----------|--------------|--------|-------|
| **First manual template** | Day 5 | _____ | Single template, click to generate |
| **First export to Canva** | Day 7 | _____ | PNG export, drag to Canva |
| **Batch generation (3+ templates)** | Day 10 | _____ | Select multiple, generate all |
| **Fully automated workflow** | Day 14 | _____ | Config → Generate → Export → Canva |

### When to Scale

**Ready to scale when:**
- ✅ Plugin runs without errors
- ✅ 10+ templates configured
- ✅ Batch generation works
- ✅ Export to Canva is smooth
- ✅ QA checks catch 95%+ of issues

**Scale indicators:**
| Metric | Ready to Scale |
|--------|----------------|
| Templates created | 10+ |
| Time per template | < 30 seconds |
| Export success rate | 95%+ |
| QA pass rate | 90%+ |
| Daily templates | 50+ possible |

## Production Checklist

Before going live:

```markdown
## Pre-Launch Verification

### Code Quality
- [ ] All TypeScript compiles without errors
- [ ] No console.log statements in production
- [ ] Error handling for all async operations
- [ ] Memory cleanup for large batches

### Testing
- [ ] Tested on macOS and Windows
- [ ] Tested in Figma Desktop and Browser
- [ ] Verified with 50+ templates in batch
- [ ] Stress test: 100 exports in sequence

### Documentation
- [ ] README with installation instructions
- [ ] Troubleshooting guide complete
- [ ] Template creation guide written
- [ ] Screenshots for key steps

### Performance
- [ ] Batch 10 templates < 2 minutes
- [ ] Export time < 5 seconds per template
- [ ] Memory usage < 500MB
- [ ] Plugin loads in < 3 seconds

### Canva Integration
- [ ] All templates import correctly
- [ ] Colors match between Figma and Canva
- [ ] Fonts available in Canva
- [ ] Transparent backgrounds work
```

---

# 📚 Additional Resources

## Figma Plugin Documentation
- [Figma Plugin API Reference](https://www.figma.com/plugin-docs/)
- [Plugin Manifest Format](https://www.figma.com/plugin-docs/manifest/)
- [TypeScript Types](https://www.figma.com/plugin-docs/api/)

## Canva Resources
- [Canva Design School](https://www.canva.com/designschool/)
- [Canva Brand Kit Guide](https://www.canva.com/help/brand-kit/)
- [Canva API (Enterprise)](https://www.canva.com/developers/)

## Template Dimensions Reference

| Platform | Post Type | Dimensions (px) | Aspect Ratio |
|----------|-----------|-----------------|--------------|
| Instagram | Feed Post | 1080 × 1080 | 1:1 |
| Instagram | Portrait | 1080 × 1350 | 4:5 |
| Instagram | Story | 1080 × 1920 | 9:16 |
| Instagram | Reel | 1080 × 1920 | 9:16 |
| Facebook | Feed Post | 1200 × 630 | 1.91:1 |
| Facebook | Story | 1080 × 1920 | 9:16 |
| Twitter/X | Tweet Image | 1200 × 675 | 16:9 |
| Twitter/X | Header | 1500 × 500 | 3:1 |
| LinkedIn | Feed Post | 1200 × 627 | 1.91:1 |
| Pinterest | Pin | 1000 × 1500 | 2:3 |
| YouTube | Thumbnail | 1280 × 720 | 16:9 |
| TikTok | Video | 1080 × 1920 | 9:16 |

---

**Document created by:** Opal (Organization Agent)  
**Last updated:** March 2026  
**Questions?** Check the troubleshooting section or consult Figma's official documentation.

---

*Ready to build? Start with Day 1 and check off each task as you complete it!* 🚀