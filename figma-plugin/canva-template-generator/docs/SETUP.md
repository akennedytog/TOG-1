# Setup Instructions

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [Figma Desktop App](https://www.figma.com/downloads/) installed
- Figma account (free tier works)

## Installation

### Step 1: Clone/Navigate to Project

```bash
cd ~/.openclaw/workspace/figma-plugin/canva-template-generator
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `esbuild` - Fast bundler
- `typescript` - Type checking
- `@figma/plugin-typings` - Figma API types
- `commander` - CLI framework

### Step 3: Build the Plugin

```bash
# Production build
npm run build

# Or development mode with watching
npm run dev
```

## Loading the Plugin in Figma

### Method 1: Development Mode (Recommended for testing)

1. Open **Figma Desktop App**
2. Open any Figma file (or create a new one)
3. Click **Plugins** in the top menu
4. Select **Development** → **Import plugin from manifest...**
5. Navigate to and select `manifest.json` in this folder
6. The plugin will now appear in **Plugins** → **Development**

### Method 2: Publishing (For sharing)

1. In Figma, go to **Plugins** → **Development** → **Canva Template Generator**
2. Click the **...** menu → **Publish**
3. Follow Figma's publishing workflow
4. Share with team or publish to community

## Verifying Installation

### Test Plugin UI

1. Run the plugin from **Plugins** → **Development** → **Canva Template Generator**
2. You should see the plugin panel with template options
3. Select "Instagram Post" and "Modern" theme
4. Click "Create Template"
5. A new frame should appear in your Figma file

### Test CLI Tool

```bash
# List available options
npm run cli -- list

# Should output templates, themes, fonts, and colors
```

## Troubleshooting

### Build Errors

If you see TypeScript errors:

```bash
# Check TypeScript version
npx tsc --version

# Clean and rebuild
npm run clean
npm install
npm run build
```

### Plugin Not Loading

1. Ensure `dist/code.js` and `dist/ui.js` exist after building
2. Check manifest.json points to correct paths
3. Try reloading the plugin in Figma
4. Check Figma console (Plugins → Development → Open console)

### Font Loading Issues

Some fonts may not be available in Figma. The plugin will:
- Fall back to Inter if specified font isn't available
- Show a notification about font substitution

To use custom fonts:
1. Install fonts in Figma via **Font** menu
2. Update `config/fonts.ts` with font names
3. Rebuild the plugin

## Environment Variables (Optional)

For CLI Figma API access, create `.env`:

```bash
FIGMA_API_TOKEN=your_personal_access_token
FIGMA_FILE_KEY=your_file_key
```

Get your token from: https://www.figma.com/developers/api#access-tokens

## Next Steps

1. Read [USAGE.md](USAGE.md) for detailed usage instructions
2. Try creating different template types
3. Customize colors and fonts in `config/`
4. Export and import to Canva!
