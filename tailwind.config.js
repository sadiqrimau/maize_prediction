/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1a5c2a',
          dark: '#0f3d1a',
          light: '#2a7a3e',
          muted: '#5a7a5e',
          50: '#f0f7f2',
          100: '#d4ead9',
          200: '#a8d4b2',
          300: '#7cbe8c',
          400: '#50a866',
          500: '#2a7a3e',
          600: '#1a5c2a',
          700: '#0f3d1a',
          800: '#071f0d',
          border: '#e2ede4',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c97a',
          dark: '#a88930',
          50: '#fdf8ec',
          100: '#f7e9c0',
        },
        cream: '#f5f4f0',
        surface: '#ffffff',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(26, 92, 42, 0.07), 0 4px 16px rgba(26, 92, 42, 0.05)',
        'card-hover': '0 4px 12px rgba(26, 92, 42, 0.14), 0 8px 32px rgba(26, 92, 42, 0.08)',
        gold: '0 2px 12px rgba(201, 168, 76, 0.28)',
        nav: '0 1px 0 rgba(26, 92, 42, 0.08)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f3d1a 0%, #1a5c2a 50%, #1f6e32 100%)',
        'gold-shimmer': 'linear-gradient(135deg, #c9a84c, #e8c97a, #c9a84c)',
      },
    },
  },
  plugins: [],
};
