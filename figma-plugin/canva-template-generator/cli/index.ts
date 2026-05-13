#!/usr/bin/env node

/**
 * CLI Tool for Canva Template Generator
 * 
 * Usage:
 *   canva-template --template instagram --theme modern --output ./exports
 *   canva-template generate --type linkedin --theme corporate
 *   canva-template export --file <file-key> --format png
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {
  TemplateType,
  Theme,
  CLIOptions,
  LayoutPreset
} from '../src/types';
import { templates } from '../config/templates';
import { colorPalettes } from '../config/colors';
import { fontPairings } from '../config/fonts';

const program = new Command();

program
  .name('canva-template')
  .description('CLI for Canva Template Generator Figma Plugin')
  .version('1.0.0');

program
  .command('generate')
  .alias('gen')
  .description('Generate a template configuration')
  .requiredOption('-t, --template <type>', 'Template type (instagram, linkedin, etc.)')
  .requiredOption('-m, --theme <theme>', 'Theme name (modern, bold, etc.)')
  .option('-o, --output <dir>', 'Output directory', './templates')
  .option('-c, --colors <colors...>', 'Custom hex colors')
  .option('--title <title>', 'Template title')
  .action((options) => {
    generateTemplate(options);
  });

program
  .command('list')
  .alias('ls')
  .description('List available templates, themes, and colors')
  .option('-t, --type <type>', 'List specific type (templates|themes|colors|fonts)')
  .action((options) => {
    listConfigurations(options.type);
  });

program
  .command('config')
  .description('Generate a full template config file')
  .requiredOption('-o, --output <file>', 'Output JSON file path')
  .option('-t, --template <type>', 'Default template type', 'instagram')
  .option('-m, --theme <theme>', 'Default theme', 'modern')
  .action((options) => {
    generateConfigFile(options);
  });

program
  .command('layout')
  .description('Generate layout presets for a template type')
  .requiredOption('-t, --template <type>', 'Template type')
  .option('-o, --output <dir>', 'Output directory', './layouts')
  .action((options) => {
    generateLayoutPreset(options);
  });

program
  .command('export')
  .description('Export template to Canva-ready format (requires Figma API token)')
  .requiredOption('-f, --file <key>', 'Figma file key')
  .requiredOption('-n, --node <id>', 'Node ID to export')
  .requiredOption('-t, --token <token>', 'Figma API token')
  .option('-F, --format <format>', 'Export format (png|svg|pdf)', 'png')
  .option('-s, --scale <scale>', 'Export scale', '1')
  .option('-o, --output <file>', 'Output file path')
  .action((options) => {
    exportTemplate(options);
  });

program
  .command('api')
  .description('Trigger Figma plugin via API')
  .requiredOption('-k, --key <file-key>', 'Figma file key')
  .requiredOption('-t, --token <token>', 'Figma API token')
  .option('--template <type>', 'Template type')
  .option('--theme <theme>', 'Theme name')
  .action((options) => {
    triggerFigmaPlugin(options);
  });

// Parse CLI arguments
program.parse();

// Command implementations

function generateTemplate(options: CLIOptions): void {
  const template = templates[options.template as TemplateType];
  const theme = colorPalettes[options.theme as string];
  const fonts = fontPairings[options.theme as string];

  if (!template) {
    console.error(`❌ Template type '${options.template}' not found`);
    console.log(`Available types: ${Object.keys(templates).join(', ')}`);
    process.exit(1);
  }

  if (!theme) {
    console.error(`❌ Theme '${options.theme}' not found`);
    console.log(`Available themes: ${Object.keys(colorPalettes).join(', ')}`);
    process.exit(1);
  }

  // Create config
  const config = {
    name: options.title || `${template.name} - ${theme.name}`,
    template: options.template,
    theme: options.theme,
    dimensions: {
      width: template.width,
      height: template.height
    },
    colors: options.colors || theme.colors,
    fonts: fonts,
    createdAt: new Date().toISOString()
  };

  // Ensure output directory exists
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  // Write config
  const outputPath = path.join(
    options.output,
    `${options.template}-${options.theme}.json`
  );
  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2));

  console.log(`✅ Generated template config: ${outputPath}`);
  console.log(`   Dimensions: ${template.width}x${template.height}`);
  console.log(`   Colors: ${config.colors.slice(0, 3).join(', ')}...`);
  console.log(`   Fonts: ${fonts.heading.family}/${fonts.body.family}`);
}

function listConfigurations(type?: string): void {
  console.log('\n📋 Canva Template Generator - Available Configurations\n');

  if (!type || type === 'templates') {
    console.log('📐 TEMPLATES:');
    Object.entries(templates).forEach(([key, config]) => {
      console.log(`   ${key.padEnd(18)} ${config.width}x${config.height} - ${config.description}`);
    });
    console.log();
  }

  if (!type || type === 'themes') {
    console.log('🎨 THEMES:');
    Object.entries(colorPalettes).forEach(([key, palette]) => {
      const preview = palette.colors.slice(0, 4).join(' ');
      console.log(`   ${key.padEnd(12)} ${preview}`);
    });
    console.log();
  }

  if (!type || type === 'fonts') {
    console.log('🔤 FONT PAIRINGS:');
    Object.entries(fontPairings).forEach(([key, fonts]) => {
      console.log(`   ${key.padEnd(12)} ${fonts.heading.family} + ${fonts.body.family}`);
    });
    console.log();
  }

  if (!type || type === 'colors') {
    console.log('🎨 COLOR PRESETS (sample):');
    Object.entries(colorPalettes).slice(0, 3).forEach(([key, palette]) => {
      console.log(`   ${key.padEnd(12)} ${palette.colors.join(', ')}`);
    });
    console.log();
  }
}

function generateConfigFile(options: {
  output: string;
  template: string;
  theme: string;
}): void {
  const fullConfig = {
    project: {
      name: 'Canva Template Project',
      version: '1.0.0',
      description: 'Generated template configuration'
    },
    defaults: {
      template: options.template,
      theme: options.theme
    },
    templates,
    colors: colorPalettes,
    fonts: fontPairings,
    layouts: generateDefaultLayouts(),
    exportSettings: {
      defaultFormat: 'png',
      defaultScale: 2,
      includeMetadata: true
    },
    generatedAt: new Date().toISOString()
  };

  fs.writeFileSync(options.output, JSON.stringify(fullConfig, null, 2));
  console.log(`✅ Full config written to: ${options.output}`);
}

function generateLayoutPreset(options: { template: string; output: string }): void {
  const template = templates[options.template as TemplateType];
  if (!template) {
    console.error(`❌ Template type '${options.template}' not found`);
    process.exit(1);
  }

  const layoutPresets: LayoutPreset[] = [
    {
      name: 'Classic',
      description: 'Traditional centered layout',
      grid: { columns: 1, rows: 3, gap: 20, margin: 40 },
      zones: [
        { id: 'header', type: 'header', position: { x: 40, y: 40 }, size: { width: template.width - 80, height: template.height * 0.2 } },
        { id: 'content', type: 'content', position: { x: 40, y: template.height * 0.3 }, size: { width: template.width - 80, height: template.height * 0.5 } },
        { id: 'footer', type: 'footer', position: { x: 40, y: template.height * 0.85 }, size: { width: template.width - 80, height: template.height * 0.1 } }
      ]
    },
    {
      name: 'Split',
      description: 'Two-column split layout',
      grid: { columns: 2, rows: 2, gap: 20, margin: 40 },
      zones: [
        { id: 'text', type: 'text', position: { x: 40, y: 40 }, size: { width: template.width * 0.45, height: template.height - 80 } },
        { id: 'image', type: 'image', position: { x: template.width * 0.55, y: 40 }, size: { width: template.width * 0.4, height: template.height - 80 } }
      ]
    },
    {
      name: 'Hero',
      description: 'Full-bleed hero image with overlay text',
      grid: { columns: 1, rows: 1, gap: 0, margin: 0 },
      zones: [
        { id: 'image', type: 'image', position: { x: 0, y: 0 }, size: { width: template.width, height: template.height } },
        { id: 'text', type: 'text', position: { x: 40, y: template.height * 0.6 }, size: { width: template.width - 80, height: template.height * 0.3 } }
      ]
    }
  ];

  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  const outputPath = path.join(options.output, `${options.template}-layouts.json`);
  fs.writeFileSync(outputPath, JSON.stringify(layoutPresets, null, 2));
  console.log(`✅ Layout presets written to: ${outputPath}`);
}

async function exportTemplate(options: {
  file: string;
  node: string;
  token: string;
  format: string;
  scale: string;
  output?: string;
}): Promise<void> {
  console.log('📤 Exporting from Figma...');
  console.log(`   File: ${options.file}`);
  console.log(`   Node: ${options.node}`);
  console.log(`   Format: ${options.format}`);

  // Figma API export URL
  const format = options.format.toLowerCase() as 'png' | 'svg' | 'pdf';
  const scale = parseInt(options.scale) || 1;
  
  const apiUrl = `https://api.figma.com/v1/images/${options.file}?ids=${options.node}&format=${format}&scale=${scale}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'X-Figma-Token': options.token
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.err) {
      throw new Error(`Figma Error: ${data.err}`);
    }

    const imageUrl = data.images[options.node];
    if (!imageUrl) {
      throw new Error('No image URL returned from API');
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();

    // Save to file
    const outputPath = options.output || `export-${options.node}.${format}`;
    fs.writeFileSync(outputPath, Buffer.from(buffer));

    console.log(`✅ Exported to: ${outputPath}`);
    console.log(`   Size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error(`❌ Export failed: ${error.message}`);
    process.exit(1);
  }
}

async function triggerFigmaPlugin(options: {
  key: string;
  token: string;
  template?: string;
  theme?: string;
}): Promise<void> {
  console.log('🚀 Triggering Figma plugin...');
  console.log(`   File Key: ${options.key}`);
  if (options.template) console.log(`   Template: ${options.template}`);
  if (options.theme) console.log(`   Theme: ${options.theme}`);

  // Note: Figma API doesn't directly trigger plugins
  // This would typically be done via a custom REST endpoint or webhook
  // that your plugin polls, or via Figma's REST API to modify the file
  
  console.log('\n⚠️  Note: Direct plugin triggering requires a custom server.');
  console.log('   Set up a webhook endpoint that your plugin polls for commands.');
  console.log('   See docs/API-INTEGRATION.md for details.');
}

function generateDefaultLayouts(): LayoutPreset[] {
  return [
    {
      name: 'Standard Grid',
      description: '12-column grid system',
      grid: { columns: 12, rows: 8, gap: 16, margin: 48 },
      zones: []
    }
  ];
}
