/**
 * Template configurations for various social media and design formats
 * All dimensions in pixels
 */

import { TemplateConfig, TemplateType } from '../src/types';

export const templates: Record<TemplateType, TemplateConfig> = {
  instagram: {
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    description: 'Square format - perfect for Instagram feed posts',
    backgroundStyle: 'solid',
    elements: [
      {
        type: 'text',
        position: { x: 100, y: 400 },
        content: 'Your Headline',
        fontSize: 72,
        zIndex: 2
      },
      {
        type: 'text',
        position: { x: 100, y: 500 },
        content: 'Add your subtitle here',
        fontSize: 36,
        zIndex: 2
      },
      {
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 1080, height: 300 },
        shapeType: 'RECTANGLE',
        zIndex: 1
      }
    ],
    recommendedFonts: ['Inter', 'Poppins', 'Montserrat']
  },

  instagramStory: {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    description: 'Vertical format for Instagram Stories and Reels',
    backgroundStyle: 'gradient',
    elements: [
      {
        type: 'text',
        position: { x: 100, y: 800 },
        content: 'Swipe Up',
        fontSize: 96,
        zIndex: 2
      },
      {
        type: 'shape',
        position: { x: 440, y: 1600 },
        size: { width: 200, height: 200 },
        shapeType: 'ELLIPSE',
        zIndex: 3
      }
    ],
    recommendedFonts: ['SF Pro Display', 'Poppins', 'Bebas Neue']
  },

  linkedin: {
    name: 'LinkedIn Post',
    width: 1200,
    height: 627,
    description: 'LinkedIn article and post image format',
    backgroundStyle: 'solid',
    elements: [
      {
        type: 'text',
        position: { x: 80, y: 200 },
        content: 'Article Title',
        fontSize: 56,
        zIndex: 2
      },
      {
        type: 'text',
        position: { x: 80, y: 300 },
        content: 'Your name • Professional title',
        fontSize: 24,
        zIndex: 2
      },
      {
        type: 'shape',
        position: { x: 800, y: 100 },
        size: { width: 400, height: 427 },
        shapeType: 'RECTANGLE',
        zIndex: 1
      }
    ],
    recommendedFonts: ['Inter', 'Roboto', 'Source Sans Pro']
  },

  twitter: {
    name: 'Twitter/X Post',
    width: 1200,
    height: 675,
    description: '16:9 format for Twitter/X posts',
    backgroundStyle: 'solid',
    elements: [
      {
        type: 'text',
        position: { x: 60, y: 250 },
        content: 'Your Tweet Text',
        fontSize: 48,
        zIndex: 2
      },
      {
        type: 'shape',
        position: { x: 1000, y: 0 },
        size: { width: 200, height: 675 },
        shapeType: 'RECTANGLE',
        zIndex: 1
      }
    ],
    recommendedFonts: ['Inter', 'Helvetica Neue', 'Segoe UI']
  },

  facebook: {
    name: 'Facebook Post',
    width: 1200,
    height: 630,
    description: 'Optimized for Facebook feed visibility',
    backgroundStyle: 'solid',
    elements: [
      {
        type: 'text',
        position: { x: 100, y: 220 },
        content: 'Post Title',
        fontSize: 60,
        zIndex: 2
      },
      {
        type: 'text',
        position: { x: 100, y: 320 },
        content: 'Description text here',
        fontSize: 28,
        zIndex: 2
      }
    ],
    recommendedFonts: ['Helvetica', 'Arial', 'Georgia']
  },

  pinterest: {
    name: 'Pinterest Pin',
    width: 1000,
    height: 1500,
    description: '2:3 ratio - optimal for Pinterest engagement',
    backgroundStyle: 'gradient',
    elements: [
      {
        type: 'text',
        position: { x: 50, y: 1300 },
        content: 'Pin Title Here',
        fontSize: 64,
        zIndex: 2
      },
      {
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 1000, height: 1200 },
        shapeType: 'RECTANGLE',
        zIndex: 1
      }
    ],
    recommendedFonts: ['Playfair Display', 'Montserrat', 'Lato']
  },

  youtubeThumbnail: {
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    description: '16:9 format optimized for YouTube thumbnails',
    backgroundStyle: 'gradient',
    elements: [
      {
        type: 'text',
        position: { x: 60, y: 500 },
        content: 'VIDEO TITLE',
        fontSize: 90,
        zIndex: 3
      },
      {
        type: 'shape',
        position: { x: 0, y: 0 },
        size: { width: 1280, height: 720 },
        shapeType: 'RECTANGLE',
        zIndex: 1
      },
      {
        type: 'shape',
        position: { x: 60, y: 620 },
        size: { width: 200, height: 10 },
        shapeType: 'RECTANGLE',
        zIndex: 2
      }
    ],
    recommendedFonts: ['Oswald', 'Bebas Neue', 'Impact']
  },

  presentation: {
    name: 'Presentation Slide',
    width: 1920,
    height: 1080,
    description: '16:9 HD presentation slide format',
    backgroundStyle: 'solid',
    elements: [
      {
        type: 'text',
        position: { x: 100, y: 400 },
        content: 'Slide Title',
        fontSize: 96,
        zIndex: 2
      },
      {
        type: 'text',
        position: { x: 100, y: 540 },
        content: 'Subtitle or bullet points go here',
        fontSize: 40,
        zIndex: 2
      },
      {
        type: 'shape',
        position: { x: 1500, y: 200 },
        size: { width: 300, height: 600 },
        shapeType: 'RECTANGLE',
        zIndex: 1
      }
    ],
    recommendedFonts: ['Arial', 'Calibri', 'Segoe UI']
  },

  flyer: {
    name: 'Print Flyer',
    width: 612,
    height: 792,
    description: 'US Letter size flyer (8.5" x 11") at 72 DPI',
    backgroundStyle: 'solid',
    elements: [
      {
        type: 'text',
        position: { x: 60, y: 120 },
        content: 'EVENT TITLE',
        fontSize: 48,
        zIndex: 2
      },
      {
        type: 'text',
        position: { x: 60, y: 200 },
        content: 'Date & Time\nLocation\nDetails',
        fontSize: 24,
        zIndex: 2
      },
      {
        type: 'shape',
        position: { x: 0, y: 600 },
        size: { width: 612, height: 192 },
        shapeType: 'RECTANGLE',
        zIndex: 1
      }
    ],
    recommendedFonts: ['Helvetica', 'Futura', 'Gotham']
  },

  poster: {
    name: 'Poster',
    width: 1584,
    height: 2448,
    description: 'Standard poster size (22" x 34") at 72 DPI',
    backgroundStyle: 'gradient',
    elements: [
      {
        type: 'text',
        position: { x: 100, y: 300 },
        content: 'POSTER\nHEADLINE',
        fontSize: 120,
        zIndex: 2
      },
      {
        type: 'text',
        position: { x: 100, y: 600 },
        content: 'Supporting text and details',
        fontSize: 48,
        zIndex: 2
      },
      {
        type: 'shape',
        position: { x: 0, y: 2000 },
        size: { width: 1584, height: 448 },
        shapeType: 'RECTANGLE',
        zIndex: 1
      }
    ],
    recommendedFonts: ['Impact', 'Bebas Neue', 'Avenir']
  }
};

export default templates;
