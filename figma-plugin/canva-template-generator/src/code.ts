import {
  TemplateConfig,
  TemplateType,
  Theme,
  TextLayerConfig,
  ShapeConfig,
  ColorPalette,
  FontPairing,
  ExportOptions
} from './types';
import { templates } from '../config/templates';
import { colorPalettes } from '../config/colors';
import { fontPairings } from '../config/fonts';

// Main plugin entry point
figma.showUI(__html__, { width: 400, height: 600 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'create-template':
      await createTemplate(msg.templateType, msg.theme, msg.colors);
      break;
    case 'add-text':
      await addTextLayer(msg.text, msg.font, msg.size, msg.position);
      break;
    case 'add-shape':
      await addShape(msg.shapeType, msg.color, msg.position, msg.size);
      break;
    case 'export-png':
      await exportToPNG(msg.frame, msg.filename);
      break;
    case 'export-svg':
      await exportToSVG(msg.frame, msg.filename);
      break;
    case 'get-config':
      sendConfigToUI();
      break;
    case 'close':
      figma.closePlugin();
      break;
  }
};

/**
 * Creates a new template with specified type, theme, and colors
 */
export async function createTemplate(
  type: TemplateType,
  theme: Theme = 'modern',
  customColors?: string[]
): Promise<FrameNode> {
  const templateConfig = templates[type];
  if (!templateConfig) {
    throw new Error(`Template type '${type}' not found`);
  }

  // Create main frame
  const frame = figma.createFrame();
  frame.name = `${type.charAt(0).toUpperCase() + type.slice(1)} Template - ${theme}`;
  frame.resize(templateConfig.width, templateConfig.height);
  
  // Apply color palette
  const palette = customColors ? { colors: customColors } : colorPalettes[theme] || colorPalettes.modern;
  frame.fills = [{ type: 'SOLID', color: hexToRGB(palette.colors[0]) }];

  // Add background elements
  await addBackgroundElements(frame, templateConfig, palette);

  // Add predefined content areas
  for (const element of templateConfig.elements) {
    switch (element.type) {
      case 'text':
        await addTextLayer(
          element.content || 'Sample Text',
          element.font || fontPairings[theme]?.heading || { family: 'Inter', style: 'Bold' },
          element.fontSize || 48,
          element.position || { x: 50, y: 50 }
        );
        break;
      case 'shape':
        await addShape(
          element.shapeType || 'RECTANGLE',
          element.color || palette.colors[1],
          element.position || { x: 0, y: 0 },
          element.size || { width: 100, height: 100 }
        );
        break;
    }
  }

  // Select and notify
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);
  
  figma.ui.postMessage({
    type: 'template-created',
    message: `Created ${type} template with ${theme} theme`,
    nodeId: frame.id
  });

  return frame;
}

/**
 * Adds a text layer to the current page or specified parent
 */
export async function addTextLayer(
  text: string,
  font: { family: string; style: string },
  size: number,
  position: { x: number; y: number },
  parent?: FrameNode
): Promise<TextNode> {
  // Load font
  await figma.loadFontAsync({ family: font.family, style: font.style });

  // Create text node
  const textNode = figma.createText();
  textNode.fontName = { family: font.family, style: font.style };
  textNode.fontSize = size;
  textNode.characters = text;
  textNode.x = position.x;
  textNode.y = position.y;
  textNode.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

  // Add to parent or current page
  if (parent) {
    parent.appendChild(textNode);
  } else {
    figma.currentPage.appendChild(textNode);
  }

  return textNode;
}

/**
 * Adds a shape to the current page or specified parent
 */
export async function addShape(
  shapeType: 'RECTANGLE' | 'ELLIPSE' | 'POLYGON' | 'STAR' | 'VECTOR',
  color: string,
  position: { x: number; y: number },
  size: { width: number; height: number },
  parent?: FrameNode
): Promise<RectangleNode | EllipseNode | PolygonNode | StarNode | VectorNode> {
  let shape: RectangleNode | EllipseNode | PolygonNode | StarNode | VectorNode;

  switch (shapeType) {
    case 'RECTANGLE':
      shape = figma.createRectangle();
      break;
    case 'ELLIPSE':
      shape = figma.createEllipse();
      break;
    case 'POLYGON':
      shape = figma.createPolygon();
      break;
    case 'STAR':
      shape = figma.createStar();
      break;
    case 'VECTOR':
      shape = figma.createVector();
      break;
    default:
      shape = figma.createRectangle();
  }

  shape.x = position.x;
  shape.y = position.y;
  shape.resize(size.width, size.height);
  shape.fills = [{ type: 'SOLID', color: hexToRGB(color) }];

  if (parent) {
    parent.appendChild(shape);
  } else {
    figma.currentPage.appendChild(shape);
  }

  return shape;
}

/**
 * Exports a frame as PNG
 */
export async function exportToPNG(
  frame: FrameNode | string,
  filename: string = 'template'
): Promise<Uint8Array> {
  const targetFrame = typeof frame === 'string' 
    ? (await figma.getNodeByIdAsync(frame)) as FrameNode 
    : frame;

  if (!targetFrame) {
    throw new Error('Frame not found');
  }

  const exportSettings: ExportSettingsImage = {
    format: 'PNG',
    suffix: '',
    constraint: { type: 'SCALE', value: 2 }
  };

  const bytes = await targetFrame.exportAsync(exportSettings);
  
  figma.ui.postMessage({
    type: 'export-complete',
    format: 'PNG',
    filename: `${filename}.png`,
    bytes: bytes
  });

  return bytes;
}

/**
 * Exports a frame as SVG
 */
export async function exportToSVG(
  frame: FrameNode | string,
  filename: string = 'template'
): Promise<string> {
  const targetFrame = typeof frame === 'string' 
    ? (await figma.getNodeByIdAsync(frame)) as FrameNode 
    : frame;

  if (!targetFrame) {
    throw new Error('Frame not found');
  }

  const exportSettings: ExportSettingsSVG = {
    format: 'SVG',
    suffix: '',
    svgOutlineText: true,
    svgIdAttribute: false,
    svgSimplifyStroke: true
  };

  const bytes = await targetFrame.exportAsync(exportSettings);
  const svgString = new TextDecoder().decode(bytes);
  
  figma.ui.postMessage({
    type: 'export-complete',
    format: 'SVG',
    filename: `${filename}.svg`,
    content: svgString
  });

  return svgString;
}

// Helper functions
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return { r, g, b };
}

async function addBackgroundElements(
  frame: FrameNode,
  config: TemplateConfig,
  palette: ColorPalette
): Promise<void> {
  // Add subtle background pattern or gradient
  if (config.backgroundStyle === 'gradient') {
    const gradient: GradientPaint = {
      type: 'GRADIENT_LINEAR',
      gradientTransform: [[1, 0, 0], [0, 1, 0]],
      gradientStops: [
        { position: 0, color: { ...hexToRGB(palette.colors[0]), a: 1 } },
        { position: 1, color: { ...hexToRGB(palette.colors[1]), a: 1 } }
      ]
    };
    frame.fills = [gradient];
  }
}

function sendConfigToUI(): void {
  figma.ui.postMessage({
    type: 'config-data',
    templates: Object.keys(templates),
    themes: Object.keys(colorPalettes),
    colors: colorPalettes,
    fonts: fontPairings
  });
}

// Plugin initialization
sendConfigToUI();
