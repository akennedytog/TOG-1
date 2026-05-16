/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm, nurturing primary - soft sage green
        primary: {
          50: '#f4f7f4',
          100: '#e3ebe3',
          200: '#c5d9c5',
          300: '#9bbf9b',
          400: '#729f72',
          500: '#528252',
          600: '#3d663d',
          700: '#325232',
          800: '#2a422a',
          900: '#243624',
        },
        // Warm accent - terracotta/coral
        accent: {
          50: '#fdf5f3',
          100: '#fbe8e3',
          200: '#f6d3c9',
          300: '#eeb5a5',
          400: '#e38b73',
          500: '#d6684e',
          600: '#c45038',
          700: '#a33f2b',
          800: '#863629',
          900: '#6f3126',
        },
        // Soft cream backgrounds
        cream: {
          50: '#fdfcfb',
          100: '#faf7f4',
          200: '#f5ede6',
          300: '#ecddd0',
        },
        // Warm neutrals (not cold grays)
        warm: {
          50: '#faf9f7',
          100: '#f2f0eb',
          200: '#e6e2da',
          300: '#d4cec2',
          400: '#b8ae9d',
          500: '#9c9180',
          600: '#827666',
          700: '#6b6154',
          800: '#595046',
          900: '#4a433b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 30px -4px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(61, 102, 61, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}