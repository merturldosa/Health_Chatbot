/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D9488', // Teal 600
          dark: '#0F766E',    // Teal 700
          light: '#CCFBF1',   // Teal 100
        },
        accent: {
          DEFAULT: '#84CC16', // Lime 500
          dark: '#65A30D',    // Lime 600
        },
        surface: {
          DEFAULT: '#F8FAFC', // Slate 50
          card: '#FFFFFF',
          border: '#E2E8F0',  // Slate 200
        },
        content: {
          main: '#0F172A',    // Slate 900
          muted: '#64748B',   // Slate 500
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(13, 148, 136, 0.1)',
      }
    },
  },
  plugins: [],
}
