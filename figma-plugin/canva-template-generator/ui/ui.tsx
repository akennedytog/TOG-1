/**
 * Figma Plugin UI - React-like component structure
 * Compiles to a single HTML file
 */

import { TemplateType, Theme } from '../src/types';

// UI State
interface UIState {
  selectedTemplate: TemplateType | '';
  selectedTheme: Theme | '';
  customColors: string[];
  customTitle: string;
  isLoading: boolean;
}

const state: UIState = {
  selectedTemplate: '',
  selectedTheme: '',
  customColors: [],
  customTitle: '',
  isLoading: false
};

// Template names for display
const templateNames: Record<TemplateType, string> = {
  instagram: 'Instagram Post',
  instagramStory: 'Instagram Story',
  linkedin: 'LinkedIn Post',
  twitter: 'Twitter/X Post',
  facebook: 'Facebook Post',
  pinterest: 'Pinterest Pin',
  youtubeThumbnail: 'YouTube Thumbnail',
  presentation: 'Presentation Slide',
  flyer: 'Print Flyer',
  poster: 'Poster'
};

const themeNames: Record<Theme, string> = {
  modern: 'Modern',
  minimal: 'Minimal',
  bold: 'Bold',
  corporate: 'Corporate',
  creative: 'Creative',
  elegant: 'Elegant',
  playful: 'Playful'
};

// Initialize UI when DOM is ready
function initUI(): void {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <div class="container">
      <header class="header">
        <h1>🎨 Canva Template Generator</h1>
        <p>Create social media templates instantly</p>
      </header>

      <section class="section">
        <h2>1. Choose Template Type</h2>
        <div class="template-grid" id="template-grid"></div>
      </section>

      <section class="section">
        <h2>2. Select Theme</h2>
        <div class="theme-grid" id="theme-grid"></div>
      </section>

      <section class="section">
        <h2>3. Custom Title (Optional)</h2>
        <input type="text" id="custom-title" placeholder="Enter your title..." class="text-input" />
      </section>

      <section class="section">
        <h2>4. Export Options</h2>
        <div class="export-buttons">
          <button id="create-btn" class="btn btn-primary">
            ✨ Create Template
          </button>
          <button id="export-png-btn" class="btn btn-secondary">
            📥 Export PNG
          </button>
          <button id="export-svg-btn" class="btn btn-secondary">
            📥 Export SVG
          </button>
        </div>
      </section>

      <div id="status" class="status"></div>

      <footer class="footer">
        <p>Ready to export to Canva</p>
      </footer>
    </div>
  `;

  renderTemplateGrid();
  renderThemeGrid();
  attachEventListeners();
}

function renderTemplateGrid(): void {
  const grid = document.getElementById('template-grid');
  if (!grid) return;

  grid.innerHTML = (Object.keys(templateNames) as TemplateType[])
    .map(key => `
      <div class="card ${state.selectedTemplate === key ? 'selected' : ''}" data-template="${key}">
        <div class="card-icon">${getTemplateIcon(key)}</div>
        <div class="card-title">${templateNames[key]}</div>
        <div class="card-dims">${getTemplateDimensions(key)}</div>
      </div>
    `).join('');

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      state.selectedTemplate = (card as HTMLElement).dataset.template as TemplateType;
      renderTemplateGrid();
      showStatus(`Selected: ${templateNames[state.selectedTemplate]}`, 'info');
    });
  });
}

function renderThemeGrid(): void {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;

  grid.innerHTML = (Object.keys(themeNames) as Theme[])
    .map(key => `
      <div class="card ${state.selectedTheme === key ? 'selected' : ''}" data-theme="${key}">
        <div class="color-preview ${key}">${getThemeColors(key)}</div>
        <div class="card-title">${themeNames[key]}</div>
      </div>
    `).join('');

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      state.selectedTheme = (card as HTMLElement).dataset.theme as Theme;
      renderThemeGrid();
      showStatus(`Theme: ${themeNames[state.selectedTheme]}`, 'info');
    });
  });
}

function attachEventListeners(): void {
  // Custom title input
  const titleInput = document.getElementById('custom-title') as HTMLInputElement;
  if (titleInput) {
    titleInput.addEventListener('input', (e) => {
      state.customTitle = (e.target as HTMLInputElement).value;
    });
  }

  // Create button
  const createBtn = document.getElementById('create-btn');
  createBtn?.addEventListener('click', () => {
    if (!state.selectedTemplate) {
      showStatus('Please select a template type', 'error');
      return;
    }
    if (!state.selectedTheme) {
      showStatus('Please select a theme', 'error');
      return;
    }

    setLoading(true);
    parent.postMessage({
      pluginMessage: {
        type: 'create-template',
        templateType: state.selectedTemplate,
        theme: state.selectedTheme,
        title: state.customTitle
      }
    }, '*');
  });

  // Export buttons
  document.getElementById('export-png-btn')?.addEventListener('click', () => {
    parent.postMessage({
      pluginMessage: {
        type: 'export-png',
        filename: state.customTitle || 'template'
      }
    }, '*');
  });

  document.getElementById('export-svg-btn')?.addEventListener('click', () => {
    parent.postMessage({
      pluginMessage: {
        type: 'export-svg',
        filename: state.customTitle || 'template'
      }
    }, '*');
  });
}

// Handle messages from plugin code
window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  switch (msg.type) {
    case 'template-created':
      setLoading(false);
      showStatus(msg.message, 'success');
      break;
    case 'export-complete':
      showStatus(`Exported: ${msg.filename}`, 'success');
      break;
    case 'error':
      setLoading(false);
      showStatus(msg.message, 'error');
      break;
  }
};

// Helper functions
function getTemplateIcon(type: TemplateType): string {
  const icons: Record<TemplateType, string> = {
    instagram: '📷',
    instagramStory: '📱',
    linkedin: '💼',
    twitter: '🐦',
    facebook: '👥',
    pinterest: '📌',
    youtubeThumbnail: '▶️',
    presentation: '📊',
    flyer: '📄',
    poster: '🖼️'
  };
  return icons[type] || '📄';
}

function getTemplateDimensions(type: TemplateType): string {
  const dims: Record<TemplateType, string> = {
    instagram: '1080×1080',
    instagramStory: '1080×1920',
    linkedin: '1200×627',
    twitter: '1200×675',
    facebook: '1200×630',
    pinterest: '1000×1500',
    youtubeThumbnail: '1280×720',
    presentation: '1920×1080',
    flyer: '612×792',
    poster: '1584×2448'
  };
  return dims[type] || '';
}

function getThemeColors(theme: Theme): string {
  const colorCount = 4;
  return Array(colorCount).fill(0).map((_, i) => 
    `<div class="color-swatch" style="background: var(--${theme}-${i})"></div>`
  ).join('');
}

function showStatus(message: string, type: 'info' | 'success' | 'error'): void {
  const status = document.getElementById('status');
  if (!status) return;
  
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

function setLoading(isLoading: boolean): void {
  state.isLoading = isLoading;
  const createBtn = document.getElementById('create-btn');
  if (createBtn) {
    createBtn.textContent = isLoading ? '⏳ Creating...' : '✨ Create Template';
    createBtn.disabled = isLoading;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUI);
} else {
  initUI();
}
