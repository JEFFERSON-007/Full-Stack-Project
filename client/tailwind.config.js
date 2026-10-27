/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FAF9F6',
          100: '#F7F6F2', // Main background
          200: '#EFEEE8', // Sidebar & secondary surfaces
          300: '#E2DFD7', // Subtle warm borders
          400: '#C8C4B7',
          500: '#A49F90',
        },
        charcoal: {
          900: '#1B1C17',
          800: '#252720', // Primary text
          700: '#3D3F37',
          600: '#52544B',
          500: '#6E6D66', // Secondary text
          400: '#8E8D86',
          300: '#B0AFA9',
        },
        olive: {
          50: '#F3F6F1',
          100: '#E5EDE2',
          200: '#C7D9C1',
          500: '#596A50', // Primary accent
          600: '#485641',
          700: '#374232',
          800: '#262E23',
        },
        terracotta: {
          50: '#FDF7F5',
          100: '#F9EFEB',
          200: '#F0D4CB',
          500: '#BF765C', // Secondary accent
          600: '#AA654D',
          700: '#8A503C',
        },
        amberGold: {
          500: '#D99B26',
          100: '#FBF2DE',
        },
        sageTeal: {
          500: '#4E7271',
          100: '#E5EEED',
        }
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(37, 39, 32, 0.04), 0 1px 2px -1px rgba(37, 39, 32, 0.04)',
        'card-hover': '0 8px 20px -4px rgba(37, 39, 32, 0.08), 0 4px 8px -2px rgba(37, 39, 32, 0.04)',
        'dropdown': '0 10px 25px -5px rgba(37, 39, 32, 0.12), 0 8px 10px -6px rgba(37, 39, 32, 0.06)',
      },
      borderRadius: {
        'folio': '10px',
      }
    },
  },
  plugins: [],
}
