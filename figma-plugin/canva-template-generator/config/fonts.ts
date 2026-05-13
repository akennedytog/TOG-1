/**
 * Font pairing presets for different themes
 */

import { FontPairing } from '../src/types';

export const fontPairings: Record<string, FontPairing> = {
  modern: {
    heading: { family: 'Inter', style: 'Bold' },
    body: { family: 'Inter', style: 'Regular' },
    accent: { family: 'Poppins', style: 'SemiBold' }
  },

  minimal: {
    heading: { family: 'Helvetica Neue', style: 'Light' },
    body: { family: 'Helvetica Neue', style: 'UltraLight' },
    accent: { family: 'Helvetica Neue', style: 'Medium' }
  },

  bold: {
    heading: { family: 'Oswald', style: 'Bold' },
    body: { family: 'Roboto', style: 'Regular' },
    accent: { family: 'Bebas Neue', style: 'Regular' }
  },

  corporate: {
    heading: { family: 'Segoe UI', style: 'SemiBold' },
    body: { family: 'Segoe UI', style: 'Regular' },
    accent: { family: 'Arial', style: 'Bold' }
  },

  creative: {
    heading: { family: 'Poppins', style: 'ExtraBold' },
    body: { family: 'Open Sans', style: 'Regular' },
    accent: { family: 'Pacifico', style: 'Regular' }
  },

  elegant: {
    heading: { family: 'Playfair Display', style: 'Bold' },
    body: { family: 'Lato', style: 'Regular' },
    accent: { family: 'Cormorant Garamond', style: 'Italic' }
  },

  playful: {
    heading: { family: 'Fredoka One', style: 'Regular' },
    body: { family: 'Nunito', style: 'Regular' },
    accent: { family: 'Lobster', style: 'Regular' }
  },

  nature: {
    heading: { family: 'Montserrat', style: 'SemiBold' },
    body: { family: 'Source Sans Pro', style: 'Regular' },
    accent: { family: 'Crimson Text', style: 'Regular' }
  },

  sunset: {
    heading: { family: 'Raleway', style: 'Bold' },
    body: { family: 'Lato', style: 'Regular' },
    accent: { family: 'Dancing Script', style: 'Regular' }
  },

  ocean: {
    heading: { family: 'Roboto Slab', style: 'Bold' },
    body: { family: 'Roboto', style: 'Regular' },
    accent: { family: 'Merriweather', style: 'Italic' }
  }
};

export default fontPairings;
