import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: '#F7CBCA',
        taupe: '#DDD3D3',
        offwhite: '#F1F7F7',
        aquamist: '#D5E5E5',
        seafoam: '#BDD7D8',
        slateteal: '#5D6B6B',
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1e40af',
          700: '#1e3a8a',
          800: '#1e3370',
          900: '#172554',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  daisyui: {
    themes: [
      {
        medinexa: {
          primary: '#5D6B6B',
          'primary-content': '#F1F7F7',
          secondary: '#BDD7D8',
          'secondary-content': '#5D6B6B',
          accent: '#F7CBCA',
          'accent-content': '#5D6B6B',
          neutral: '#5D6B6B',
          'neutral-content': '#F1F7F7',
          'base-100': '#F1F7F7',
          'base-200': '#D5E5E5',
          'base-300': '#DDD3D3',
          'base-content': '#5D6B6B',
          info: '#BDD7D8',
          success: '#BDD7D8',
          warning: '#F7CBCA',
          error: '#F7CBCA',
        },
      },
    ],
  },
  plugins: [daisyui],
}
