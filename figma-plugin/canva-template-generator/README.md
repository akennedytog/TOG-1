# Canva Template Generator

A Figma plugin that generates social media templates optimized for Canva import.

## Features

- 🎨 **10+ Template Types**: Instagram, LinkedIn, Twitter/X, Facebook, Pinterest, YouTube, Presentations, and more
- 🖌️ **10 Color Themes**: Modern, Minimal, Bold, Corporate, Creative, Elegant, Playful, Nature, Sunset, Ocean
- 🔤 **Font Pairings**: Curated font combinations for each theme
- 📤 **Export Options**: PNG and SVG formats ready for Canva
- ⚡ **CLI Tool**: Generate templates via command line

## Project Structure

```
figma-plugin/canva-template-generator/
├── manifest.json          # Figma plugin manifest
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── src/
│   ├── code.ts           # Main plugin code
│   └── types.ts          # TypeScript definitions
├── ui/
│   └── ui.tsx            # Plugin UI (compiles to HTML)
├── config/
│   ├── templates.ts      # Template configurations
│   ├── colors.ts         # Color palette presets
│   └── fonts.ts          # Font pairings
├── cli/
│   └── index.ts          # CLI tool
└── docs/
    ├── SETUP.md          # Setup instructions
    └── USAGE.md          # Usage guide
```

## Quick Start

### 1. Install Dependencies

```bash
cd figma-plugin/canva-template-generator
npm install
```

### 2. Build the Plugin

```bash
npm run build
```

This creates:
- `dist/code.js` - Plugin code
- `dist/ui.js` - UI bundle

### 3. Load in Figma

1. Open Figma desktop app
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select `manifest.json` from this folder

### 4. Use the Plugin

1. Run **Canva Template Generator** from Plugins menu
2. Select template type and theme
3. Click "Create Template"
4. Export as PNG/SVG for Canva

## CLI Usage

```bash
# List available options
npm run cli -- list

# Generate a template config
npm run cli -- generate -t instagram -m modern -o ./exports

# Export from Figma (requires API token)
npm run cli -- export -f <file-key> -n <node-id> -t <token> -F png

# Create full config file
npm run cli -- config -o ./config.json -t linkedin -m corporate
```

## Canva Import

After exporting from Figma:

1. Go to [Canva](https://canva.com)
2. Click **Create a design**
3. Choose **Import** → Upload your PNG/SVG
4. Canva will convert it to editable elements
5. Customize and download!

## Development

```bash
# Watch mode for development
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Available Templates

| Template | Dimensions | Best For |
|----------|------------|----------|
| Instagram Post | 1080×1080 | Feed posts |
| Instagram Story | 1080×1920 | Stories, Reels |
| LinkedIn Post | 1200×627 | Article images |
| Twitter/X Post | 1200×675 | Tweet images |
| Facebook Post | 1200×630 | FB feed |
| Pinterest Pin | 1000×1500 | Pins |
| YouTube Thumbnail | 1280×720 | Video thumbnails |
| Presentation | 1920×1080 | Slides |
| Flyer | 612×792 | Print flyers |
| Poster | 1584×2448 | Posters |

## License

MIT
