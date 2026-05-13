# Usage Guide

## Using the Plugin in Figma

### Creating a Template

1. **Open the Plugin**
   - In Figma: **Plugins** → **Development** → **Canva Template Generator**
   - The plugin panel appears on the right

2. **Select Template Type**
   - Click on a template card (Instagram, LinkedIn, etc.)
   - Each shows dimensions and icon

3. **Choose Theme**
   - Select from color themes (Modern, Bold, Elegant, etc.)
   - Color preview shows primary palette

4. **Add Custom Title (Optional)**
   - Enter text in the title field
   - This becomes the headline in your template

5. **Create**
   - Click **"✨ Create Template"**
   - Template appears as a new frame in your Figma file

### Customizing Templates

After creation, you can:

- **Edit text**: Double-click text layers
- **Change colors**: Select shapes, update fill in right panel
- **Resize**: Drag frame edges (maintains aspect ratio)
- **Add elements**: Use Figma tools to add shapes, images, etc.

### Exporting for Canva

1. **Select the frame** you want to export
2. In plugin panel, click:
   - **📥 Export PNG** - High-res raster image
   - **📥 Export SVG** - Editable vector format
3. File downloads automatically

### Export Settings

| Format | Best For | Notes |
|--------|----------|-------|
| PNG | Photos, complex designs | 2x scale for retina |
| SVG | Logos, icons, text | Fully editable in Canva |

## Using the CLI

### Basic Commands

```bash
# List all available templates, themes, colors
npm run cli -- list

# List specific category
npm run cli -- list --type templates
npm run cli -- list --type themes
npm run cli -- list --type fonts
```

### Generating Config Files

```bash
# Create a config for Instagram + Modern theme
npm run cli -- generate -t instagram -m modern -o ./my-templates

# With custom colors
npm run cli -- generate -t linkedin -m bold \
  -c "#FF0000" "#00FF00" "#0000FF" \
  --title "My LinkedIn Post" \
  -o ./exports
```

### Exporting via API

Requires Figma Personal Access Token from [here](https://www.figma.com/developers/api#access-tokens).

```bash
# Export a specific node as PNG
npm run cli -- export \
  -f abc123def456 \
  -n 123:456 \
  -t YOUR_API_TOKEN \
  -F png \
  -s 2 \
  -o ./export.png

# Export as SVG
npm run cli -- export \
  -f abc123def456 \
  -n 123:456 \
  -t YOUR_API_TOKEN \
  -F svg \
  -o ./export.svg
```

**Parameters:**
- `-f, --file`: Figma file key (from URL: `figma.com/file/FILE_KEY/...`)
- `-n, --node`: Node ID (right-click → Copy link → extract ID after `node-id=`)
- `-t, --token`: Your Figma API token
- `-F, --format`: png, svg, or pdf
- `-s, --scale`: Export scale (1, 2, 4, etc.)
- `-o, --output`: Output file path

### Creating Full Config

```bash
# Generate complete configuration file
npm run cli -- config \
  -o ./template-config.json \
  -t instagram \
  -m modern

# This creates a JSON with all templates, themes, and settings
```

## Importing to Canva

### From PNG

1. Go to [canva.com](https://canva.com)
2. Click **Create a design** → **Custom size**
3. Enter your template dimensions
4. Click **Uploads** → **Upload files**
5. Select your PNG
6. Drag onto canvas
7. **Right-click** → **Set as background** (optional)

### From SVG

1. In Canva: **Uploads** → **Upload files**
2. Select your SVG file
3. Uploads as editable elements
4. Each layer becomes a separate Canva element
5. Edit text, colors, positions directly in Canva

### Canva Tips

- **Magic Resize**: After importing, use Canva's resize for other formats
- **Brand Kit**: Save colors/fonts for consistent branding
- **Templates**: Save your imported design as a Canva template
- **Elements**: Ungroup SVG elements for individual editing

## Template Types Reference

### Social Media

| Platform | Dimensions | Safe Zone |
|----------|------------|-----------|
| Instagram Post | 1080×1080 | Center 1000×1000 |
| Instagram Story | 1080×1920 | Center 1080×1420 |
| LinkedIn | 1200×627 | Top 100px for text |
| Twitter/X | 1200×675 | Center |
| Facebook | 1200×630 | Center |
| Pinterest | 1000×1500 | Center |

### Video

| Type | Dimensions | Notes |
|------|------------|-------|
| YouTube Thumbnail | 1280×720 | Min 640px width |

### Print

| Type | Dimensions | DPI |
|------|------------|-----|
| Flyer (US Letter) | 612×792 | 72 |
| Poster | 1584×2448 | 72 |

### Digital

| Type | Dimensions | Use Case |
|------|------------|----------|
| Presentation | 1920×1080 | Slides |

## Theme Reference

### Modern
- Clean, professional
- Blue/green accents
- Best for: Tech, corporate

### Bold
- High contrast
- Vibrant reds/oranges
- Best for: Sales, promotions

### Elegant
- Gold/silver touches
- Serif fonts
- Best for: Luxury, events

### Minimal
- Black/white/gray
- Lots of whitespace
- Best for: Photography, portfolios

### Creative
- Multi-color
- Playful fonts
- Best for: Arts, youth brands

## Tips for Best Results

### In Figma

1. **Use auto-layout** for responsive designs
2. **Name layers clearly** for easier export
3. **Group related elements** with Ctrl+G
4. **Use constraints** for responsive resizing

### For Canva

1. **Export SVG** when possible for full editability
2. **Keep text as text**, not outlines (if using SVG)
3. **Use web-safe fonts** for best compatibility
4. **Test import** with a simple design first

### Workflow

```
Figma Design → Export PNG/SVG → Canva Import → Customize → Download Final
```

## Keyboard Shortcuts

In Figma while using plugin:

| Shortcut | Action |
|----------|--------|
| `Esc` | Close plugin |
| `Ctrl/Cmd + E` | Export selected frame |
| `Ctrl/Cmd + D` | Duplicate template |

## Getting Help

- **Figma Plugin Issues**: Check Figma console (Plugins → Development → Open console)
- **CLI Issues**: Run with `--verbose` flag for debug output
- **Export Issues**: Verify API token has correct permissions

## Customization

### Adding New Templates

Edit `config/templates.ts`:

```typescript
myTemplate: {
  name: 'My Custom Template',
  width: 1200,
  height: 1200,
  description: 'Description here',
  backgroundStyle: 'solid',
  elements: [
    { type: 'text', position: { x: 100, y: 100 }, content: 'Hello' }
  ],
  recommendedFonts: ['Inter', 'Arial']
}
```

### Adding New Themes

Edit `config/colors.ts`:

```typescript
myTheme: {
  name: 'My Theme',
  colors: ['#FFF', '#000', '#F00'],
  primary: '#F00',
  secondary: '#000',
  accent: '#FFF',
  background: '#FFF',
  text: '#000'
}
```

Then rebuild: `npm run build`
