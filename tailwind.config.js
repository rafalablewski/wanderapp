/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SkyWrapped brand colors
        gold: {
          DEFAULT: '#d4af37',
          light: '#f4d03f',
          dark: '#b8942e',
        },
        luxury: {
          900: '#0a0a0f',
          800: '#1a1a2e',
          700: '#16213e',
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
