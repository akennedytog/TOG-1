# Figma Plugin API Research Report

## Executive Summary

**Bottom Line:** The Figma Plugin API is fully capable of programmatic design creation, and a custom plugin to create Canva-compatible templates is **absolutely viable**. The realistic timeline is **1-2 weeks for an MVP**, with **4-6 weeks for a polished solution**.

---

## 1. What is the Figma Plugin API?

The Figma Plugin API is a JavaScript-based interface that allows developers to create interactive programs that extend Figma's functionality. Plugins run inside Figma's editors (Figma Design, FigJam, Figma Slides) and interact with files in real-time.

### Key Capabilities:
- **Create, read, update, and delete** design elements
- Access and modify nodes (layers, shapes, text, etc.)
- Build custom user interfaces with HTML/CSS
- Communicate with external APIs and services
- Run code triggered by user actions

### Architecture:
- Plugins are web-based applications that run in an iframe
- Core functionality is accessed via the `figma` global object
- Can use browser APIs (fetch, canvas, WebGL, etc.)
- Must be initiated by user action (can't run in background)

---

## 2. Can It Create Designs From Scratch?

**YES.** The Plugin API provides comprehensive methods to create:

### Shape Creation:
```typescript
// Create basic shapes
const rect = figma.createRectangle()
const ellipse = figma.createEllipse()
const polygon = figma.createPolygon()
const star = figma.createStar()
const line = figma.createLine()
const vector = figma.createVector()

// Configure shapes
rect.x = 50
rect.y = 50
rect.resize(200, 100)
rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
```

### Text Creation:
```typescript
(async () => {
  const text = figma.createText()
  text.x = 50
  text.y = 50
  
  // Must load font before setting text
  await figma.loadFontAsync(text.fontName)
  text.characters = 'Hello world!'
  
  // Style text
  text.fontSize = 18
  text.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
})()
```

### Frame & Component Creation:
```typescript
// Create frames (artboards)
const frame = figma.createFrame()
frame.resize(1920, 1080)
frame.name = "Social Media Template"

// Create reusable components
const component = figma.createComponent()
component.name = "Button Primary"
```

### Color & Styling:
- Solid colors, gradients, and images
- Stroke/border settings
- Effects (shadows, blurs)
- Text styling (font, size, weight, spacing)

---

## 3. Requirements to Use the Figma Plugin API

### Technical Requirements:
1. **Figma desktop app** (for plugin development)
2. **Node.js and npm** (for TypeScript and dependencies)
3. **TypeScript** (recommended, strongly typed)
4. **Visual Studio Code** (or any code editor)

### Knowledge Requirements:
- JavaScript fundamentals
- HTML/CSS (for plugin UI)
- Basic understanding of async programming

### Account Requirements:
- **Figma account** (free tier works for development)
- No special API key needed for plugin development
- Plugin must be published through Figma's review process to be publicly available

### Setup Steps:
1. Install Figma desktop app
2. Install Node.js
3. Install TypeScript: `npm install -g typescript`
4. Create plugin via Figma: Plugins > Development > New plugin

---

## 4. Exporting Designs to Canva-Compatible Formats

### Export Formats Supported:
| Format | Canva Compatible | Notes |
|--------|-----------------|-------|
| **PNG** | ✅ Yes | Best for raster graphics, supports transparency |
| **JPG** | ✅ Yes | Compressed, no transparency |
| **SVG** | ✅ Yes | Best for vectors, scalable |
| **PDF** | ✅ Yes | Good for multi-page documents |

### Figma to Canva Workflow:

#### Option 1: Plugin Export (Programmatic)
```typescript
// Export as PNG
const settings: ExportSettingsImage = {
  format: 'PNG',
  constraint: { type: 'SCALE', value: 2 }
}
const bytes = await node.exportAsync(settings)
figma.showUI(__html__)
figma.ui.postMessage({ type: 'export-png', bytes })
```

#### Option 2: REST API Export (External Automation)
```
GET /v1/images/:key?ids=1:2&format=png&scale=2
```
Supported formats: `jpg`, `png`, `svg`, `pdf`

#### Option 3: Native Figma Export (Manual)
- Select elements → Right-click → Export
- Choose format, scale, and settings

### Canva Import Methods:
According to Canva's documentation:
- **PNG/SVG assets**: Upload directly as design elements
- **PDF**: Import via PDF editor/converter (100MB max)
- **Individual frames**: Export from Figma as PNG/SVG and upload to Canva

### Recommended Canva-Compatible Export Strategy:
1. Create designs in Figma with standard dimensions (1080x1080, 1920x1080, etc.)
2. Export frames as **PNG** for social media content
3. Export logos/icons as **SVG** for scalability
4. Export multi-page templates as **PDF** for document workflows

---

## 5. Existing Plugins & Tools for Template Creation

### Template Generation Plugins:
| Plugin | Purpose | Link |
|--------|---------|------|
| **Batch Generator** | Generate multiple design variations | figma.com/community/plugin/1447234670398672977 |
| **BatchGen** | Batch creation of frames with content | figma.com/community/plugin/1420191536936575915 |
| **Batch Frame Creator** | Create multiple frames automatically | figma.com/community/plugin/1371988247505855596 |
| **Generator** | Content generation and templating | figma.com/community/plugin/1080463959503253221 |
| **Batch Content Filler** | Populate designs with images/text | figma.com/community/plugin/1581113248755511286 |

### Sample Plugin Repositories (GitHub):
- **figma/plugin-samples** - Official examples (35+ samples)
  - `create-rects-shapes` - Basic shape creation
  - `barchart/piechart` - Data visualization
  - `svg-inserter` - Import SVG programmatically
  - `metacards` - Dynamic content generation

---

## 6. Building a Custom Plugin for Canva Templates

### Feasibility: ✅ HIGH

The Plugin API supports all operations needed:

#### ✅ Can Do:
- Create shapes, text, frames programmatically
- Set colors, fonts, spacing, and styling
- Export to PNG/SVG/PDF
- Build UI for parameter input
- Save/load configuration
- Generate multiple template variations

#### ⚠️ Limitations:
- Can only access current file (not multiple files simultaneously)
- Cannot run in background (requires user trigger)
- Limited access to external fonts (must be loaded via Figma)

### Plugin Architecture for Canva Templates:
```
┌─────────────────────────────────────┐
│         Plugin UI (HTML/JS)         │
│  ┌─────────────────────────────┐   │
│  │ Template Configuration Form │   │
│  │ - Dimensions                │   │
│  │ - Colors                    │   │
│  │ - Content placeholders      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│     Plugin Code (TypeScript)        │
│  ┌─────────────────────────────┐   │
│  │ Template Generator Engine   │   │
│  │ - Create frames             │   │
│  │ - Add shapes                │   │
│  │ - Insert text               │   │
│  │ - Style elements            │   │
│  │ - Export logic              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 7. Programming Language

### Primary: TypeScript (Recommended)

**Why TypeScript:**
- Full type definitions via `@figma/plugin-typings`
- IntelliSense/autocomplete in VS Code
- ESLint rules for plugin best practices
- Compiles to JavaScript for browser execution

### File Structure:
```
my-canva-template-plugin/
├── manifest.json          # Plugin configuration
├── code.ts               # Main plugin logic
├── ui.html               # Plugin UI
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── node_modules/         # Installed packages
```

### Key Dependencies:
```json
{
  "devDependencies": {
    "typescript": "^5.x",
    "@figma/plugin-typings": "^1.x"
  }
}
```

---

## 8. Development Workflow

### Step-by-Step Setup:

#### 1. Initial Setup (5 min)
```bash
# In Figma desktop app
Plugins > Development > New Plugin
# Choose: Custom UI > Figma design
# Save to local folder
```

#### 2. Install Dependencies (2 min)
```bash
cd my-canva-template-plugin
npm install
```

#### 3. Configure TypeScript (1 min)
- VS Code: `Cmd/Ctrl + Shift + B`
- Select: `watch-tsconfig.json`
- Enables auto-compilation on save

#### 4. Build Template Generator (1-2 weeks)
```typescript
// code.ts - Core logic structure
figma.showUI(__html__, { width: 400, height: 500 })

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-template') {
    // Create frame with specified dimensions
    const frame = figma.createFrame()
    frame.resize(msg.width, msg.height)
    
    // Add background
    const bg = figma.createRectangle()
    bg.resize(msg.width, msg.height)
    bg.fills = [{ type: 'SOLID', color: hexToRGB(msg.bgColor) }]
    frame.appendChild(bg)
    
    // Add title text
    const title = figma.createText()
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' })
    title.characters = msg.title
    title.fontSize = msg.titleSize
    title.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]
    frame.appendChild(title)
    
    // Export options
    figma.ui.postMessage({ type: 'template-created', frameId: frame.id })
  }
}
```

#### 5. Test Plugin
```
In Figma:
Plugins > Development > [Your Plugin Name]
```

#### 6. Publish (Optional)
- Figma reviews plugins before publication
- Process takes 1-2 business days
- Can use locally without publishing

---

## 9. Plugin API vs REST API Comparison

| Feature | Plugin API | REST API |
|---------|-----------|----------|
| **Access Mode** | Real-time, user-triggered | Automated, programmatic |
| **Create Designs** | ✅ Full read/write | ❌ Read-only (mostly) |
| **Export Images** | ✅ Via exportAsync | ✅ Via GET /v1/images |
| **Requires Figma Open** | Yes | No |
| **Multi-file Operations** | ❌ Current file only | ✅ All accessible files |
| **Use Case** | Interactive tools | Automated pipelines |

### For Canva Template Creation:
- **Plugin API** is REQUIRED for creating designs
- **REST API** can complement for export/download
- Combined approach: Plugin creates → REST API exports → External service processes

---

## 10. Timeline Estimate

### MVP Plugin (1-2 weeks):
- [ ] Basic plugin structure (1 day)
- [ ] Create simple template with shapes/text (2 days)
- [ ] Add UI for parameter input (2 days)
- [ ] Export to PNG/SVG (1 day)
- [ ] Testing & refinement (2-3 days)

### Polished Solution (4-6 weeks):
- [ ] Multiple template types (1 week)
- [ ] Advanced styling options (1 week)
- [ ] Component library integration (1 week)
- [ ] Batch generation features (1 week)
- [ ] Export workflow optimization (1 week)

---

## 11. Code Example: Simple Template Generator

```typescript
// code.ts
interface TemplateConfig {
  width: number
  height: number
  title: string
  subtitle: string
  bgColor: { r: number, g: number, b: number }
  textColor: { r: number, g: number, b: number }
}

// Show plugin UI
figma.showUI(__html__, { width: 400, height: 600 })

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate') {
    const config: TemplateConfig = msg.config
    
    // Create main frame
    const frame = figma.createFrame()
    frame.name = "Canva Template"
    frame.resize(config.width, config.height)
    
    // Add background rectangle
    const bg = figma.createRectangle()
    bg.name = "Background"
    bg.resize(config.width, config.height)
    bg.fills = [{ 
      type: 'SOLID', 
      color: config.bgColor 
    }]
    frame.appendChild(bg)
    
    // Add title text
    const titleText = figma.createText()
    titleText.name = "Title"
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' })
    titleText.characters = config.title
    titleText.fontSize = config.width / 15
    titleText.fills = [{ type: 'SOLID', color: config.textColor }]
    titleText.x = config.width / 2 - titleText.width / 2
    titleText.y = config.height / 3
    frame.appendChild(titleText)
    
    // Add subtitle
    const subText = figma.createText()
    subText.name = "Subtitle"
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
    subText.characters = config.subtitle
    subText.fontSize = config.width / 30
    subText.fills = [{ type: 'SOLID', color: config.textColor }]
    subText.opacity = 0.8
    subText.x = config.width / 2 - subText.width / 2
    subText.y = titleText.y + titleText.height + 24
    frame.appendChild(subText)
    
    // Center frame in viewport
    figma.viewport.scrollAndZoomIntoView([frame])
    
    // Notify completion
    figma.notify('Template created successfully!')
    
    // Send export-ready data to UI
    figma.ui.postMessage({
      type: 'template-ready',
      frameId: frame.id,
      frameName: frame.name
    })
  }
  
  if (msg.type === 'export-png') {
    const node = await figma.getNodeByIdAsync(msg.frameId)
    if (node) {
      const bytes = await node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 2 }
      })
      // Send bytes to UI for download
      figma.ui.postMessage({
        type: 'export-complete',
        bytes: bytes,
        format: 'png'
      })
    }
  }
}
```

```html
<!-- ui.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Inter, sans-serif;
      padding: 20px;
      margin: 0;
    }
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      font-size: 14px;
    }
    input, select {
      width: 100%;
      padding: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 14px;
    }
    button {
      background: #000;
      color: #fff;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      width: 100%;
    }
    button:hover {
      background: #333;
    }
  </style>
</head>
<body>
  <h2>Canva Template Generator</h2>
  
  <div class="form-group">
    <label>Template Type</label>
    <select id="templateType">
      <option value="instagram-post">Instagram Post (1080x1080)</option>
      <option value="instagram-story">Instagram Story (1080x1920)</option>
      <option value="facebook-cover">Facebook Cover (820x312)</option>
      <option value="custom">Custom</option>
    </select>
  </div>
  
  <div class="form-group">
    <label>Title</label>
    <input type="text" id="title" value="Your Title Here">
  </div>
  
  <div class="form-group">
    <label>Subtitle</label>
    <input type="text" id="subtitle" value="Your subtitle here">
  </div>
  
  <div class="form-group">
    <label>Background Color (hex)</label>
    <input type="text" id="bgColor" value="#ffffff">
  </div>
  
  <div class="form-group">
    <label>Text Color (hex)</label>
    <input type="text" id="textColor" value="#000000">
  </div>
  
  <button id="generate">Generate Template</button>
  <button id="export" style="margin-top: 8px; background: #0066cc; display: none;">
    Export as PNG
  </button>

  <script>
    let currentFrameId = null
    
    // Convert hex to RGB
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
      } : { r: 1, g: 1, b: 1 }
    }
    
    // Get dimensions based on template type
    function getDimensions(type) {
      const sizes = {
        'instagram-post': [1080, 1080],
        'instagram-story': [1080, 1920],
        'facebook-cover': [820, 312]
      }
      return sizes[type] || [1080, 1080]
    }
    
    document.getElementById('generate').onclick = () => {
      const templateType = document.getElementById('templateType').value
      const [width, height] = getDimensions(templateType)
      
      const config = {
        width: width,
        height: height,
        title: document.getElementById('title').value,
        subtitle: document.getElementById('subtitle').value,
        bgColor: hexToRgb(document.getElementById('bgColor').value),
        textColor: hexToRgb(document.getElementById('textColor').value)
      }
      
      parent.postMessage({ 
        pluginMessage: { 
          type: 'generate', 
          config: config 
        } 
      }, '*')
    }
    
    document.getElementById('export').onclick = () => {
      if (currentFrameId) {
        parent.postMessage({
          pluginMessage: {
            type: 'export-png',
            frameId: currentFrameId
          }
        }, '*')
      }
    }
    
    // Listen for messages from plugin code
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage
      if (!msg) return
      
      if (msg.type === 'template-ready') {
        currentFrameId = msg.frameId
        document.getElementById('export').style.display = 'block'
        document.getElementById('generate').textContent = 'Regenerate Template'
      }
      
      if (msg.type === 'export-complete') {
        // Handle exported bytes (trigger download, etc.)
        const blob = new Blob([new Uint8Array(msg.bytes)], { type: 'image/png' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'template.png'
        a.click()
      }
    }
  </script>
</body>
</html>
```

---

## Conclusion

### Realistic Assessment:
- ✅ **Figma Plugin API fully supports** programmatic design creation
- ✅ **Can export to Canva-compatible formats** (PNG, SVG, PDF)
- ✅ **Custom plugin is the right approach** for template generation
- ✅ **1-2 weeks is realistic** for MVP functionality
- ✅ **TypeScript is the recommended language**

### Recommended First Steps:
1. Set up development environment (Figma desktop app + Node.js)
2. Create a basic "Hello World" plugin
3. Implement simple shape/text creation
4. Add export functionality
5. Iterate with template variations
6. Test export workflow to Canva

### Key Success Factors:
- Use Plugin API (not REST API) for creation
- Plan export format strategy based on Canva use cases
- Start with simple templates, expand iteratively
- Consider existing plugins for inspiration

---

## Resources

### Documentation:
- [Figma Plugin API Docs](https://developers.figma.com/docs/plugins/)
- [REST API Docs](https://developers.figma.com/docs/rest-api/)
- [Plugin Samples GitHub](https://github.com/figma/plugin-samples)

### Community:
- [Figma Developers Discord](https://discord.gg/xzQhe2Vcvx)
- [Figma Plugin Forum](https://forum.figma.com/c/plugin-api/20)

### Canva Import:
- [Canva Figma Import Help](https://www.canva.com/help/importing-figma-files/)

---

*Research compiled: March 2026*
*For questions or clarifications, refer to official Figma documentation*
