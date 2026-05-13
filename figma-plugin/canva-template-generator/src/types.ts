/**
 * Type definitions for Canva Template Generator Figma Plugin
 */

export type TemplateType = 
  | 'instagram' 
  | 'instagramStory' 
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'pinterest'
  | 'youtubeThumbnail'
  | 'presentation'
  | 'flyer'
  | 'poster';

export type Theme = 
  | 'modern' 
  | 'minimal' 
  | 'bold' 
  | 'corporate'
  | 'creative'
  | 'elegant'
  | 'playful';

export interface TemplateConfig {
  name: string;
  width: number;
  height: number;
  description: string;
  backgroundStyle: 'solid' | 'gradient' | 'pattern';
  elements: TemplateElement[];
  recommendedFonts: string[];
}

export interface TemplateElement {
  type: 'text' | 'shape' | 'image';
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  content?: string;
  font?: { family: string; style: string };
  fontSize?: number;
  color?: string;
  shapeType?: 'RECTANGLE' | 'ELLIPSE' | 'POLYGON' | 'STAR' | 'VECTOR';
  zIndex?: number;
}

export interface TextLayerConfig {
  text: string;
  font: { family: string; style: string };
  size: number;
  position: { x: number; y: number };
  color?: string;
  alignment?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  lineHeight?: number;
  letterSpacing?: number;
}

export interface ShapeConfig {
  type: 'RECTANGLE' | 'ELLIPSE' | 'POLYGON' | 'STAR' | 'VECTOR';
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity?: number;
  cornerRadius?: number;
  rotation?: number;
}

export interface ColorPalette {
  name: string;
  colors: string[];
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface FontPairing {
  heading: { family: string; style: string };
  body: { family: string; style: string };
  accent?: { family: string; style: string };
}

export interface ExportOptions {
  format: 'PNG' | 'SVG' | 'PDF';
  scale?: number;
  suffix?: string;
  includeLayers?: boolean;
}

export interface PluginMessage {
  type: string;
  [key: string]: any;
}

export interface CLIOptions {
  template: TemplateType;
  theme: Theme;
  output: string;
  format: 'png' | 'svg' | 'both';
  colors?: string[];
  title?: string;
  apiToken?: string;
  fileKey?: string;
}

export interface LayoutPreset {
  name: string;
  description: string;
  grid: {
    columns: number;
    rows: number;
    gap: number;
    margin: number;
  };
  zones: LayoutZone[];
}

export interface LayoutZone {
  id: string;
  type: 'header' | 'content' | 'footer' | 'sidebar' | 'image' | 'text';
  position: { x: number; y: number };
  size: { width: number; height: number };
  constraints?: {
    horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'SCALE';
    vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'SCALE';
  };
}
