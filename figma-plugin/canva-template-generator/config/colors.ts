/**
 * Color palette presets for different themes
 */

import { ColorPalette } from '../src/types';

export const colorPalettes: Record<string, ColorPalette> = {
  modern: {
    name: 'Modern',
    colors: ['#FFFFFF', '#F5F5F5', '#333333', '#007BFF', '#28A745', '#FFC107', '#DC3545'],
    primary: '#007BFF',
    secondary: '#28A745',
    accent: '#FFC107',
    background: '#FFFFFF',
    text: '#333333'
  },

  minimal: {
    name: 'Minimal',
    colors: ['#FFFFFF', '#FAFAFA', '#E0E0E0', '#9E9E9E', '#616161', '#212121', '#000000'],
    primary: '#212121',
    secondary: '#616161',
    accent: '#9E9E9E',
    background: '#FFFFFF',
    text: '#212121'
  },

  bold: {
    name: 'Bold',
    colors: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#F39422', '#FFFFFF', '#000000'],
    primary: '#E94560',
    secondary: '#F39422',
    accent: '#0F3460',
    background: '#1A1A2E',
    text: '#FFFFFF'
  },

  corporate: {
    name: 'Corporate',
    colors: ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#495057', '#212529', '#0066CC', '#0056B3'],
    primary: '#0066CC',
    secondary: '#495057',
    accent: '#0056B3',
    background: '#F8F9FA',
    text: '#212529'
  },

  creative: {
    name: 'Creative',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8B94'],
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFEAA7',
    background: '#FF8B94',
    text: '#2D3436'
  },

  elegant: {
    name: 'Elegant',
    colors: ['#FAF9F6', '#E8E4E1', '#D4AF37', '#C0C0C0', '#4A4A4A', '#2C2C2C', '#000000'],
    primary: '#D4AF37',
    secondary: '#C0C0C0',
    accent: '#E8E4E1',
    background: '#FAF9F6',
    text: '#2C2C2C'
  },

  playful: {
    name: 'Playful',
    colors: ['#FF9FF3', '#FECA57', '#FF6B6B', '#48DBFB', '#1DD1A1', '#5F27CD', '#FFFFFF'],
    primary: '#FF6B6B',
    secondary: '#48DBFB',
    accent: '#FECA57',
    background: '#FF9FF3',
    text: '#5F27CD'
  },

  nature: {
    name: 'Nature',
    colors: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#66BB6A', '#43A047', '#2E7D32', '#1B5E20'],
    primary: '#43A047',
    secondary: '#66BB6A',
    accent: '#A5D6A7',
    background: '#E8F5E9',
    text: '#1B5E20'
  },

  sunset: {
    name: 'Sunset',
    colors: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FB8C00', '#F57C00'],
    primary: '#FB8C00',
    secondary: '#FFA726',
    accent: '#FFB74D',
    background: '#FFF3E0',
    text: '#E65100'
  },

  ocean: {
    name: 'Ocean',
    colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1976D2'],
    primary: '#2196F3',
    secondary: '#64B5F6',
    accent: '#BBDEFB',
    background: '#E3F2FD',
    text: '#0D47A1'
  }
};

export default colorPalettes;
