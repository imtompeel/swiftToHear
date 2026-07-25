/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cool ink scale — structure, shells, gradients
        primary: {
          50: '#f4f7fb',
          100: '#e8eef6',
          200: '#d0dceb',
          300: '#a9c0d9',
          400: '#7a9cbf',
          500: '#587ea6',
          600: '#446489',
          700: '#37506e',
          800: '#2f445c',
          900: '#0b1220',
          950: '#070d16',
        },
        // Neutral surfaces & body text
        secondary: {
          50: '#f7f8fa',
          100: '#eef1f5',
          200: '#dde3eb',
          300: '#c3ccd8',
          400: '#9aa8ba',
          500: '#7b8ca1',
          600: '#627287',
          700: '#4f5c6e',
          800: '#1a2332',
          900: '#111827',
        },
        // Sea-glass accent (actions, links, focus)
        accent: {
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
          950: '#042f2e',
        },
      },
      fontFamily: {
        sans: ['"Figtree"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'Georgia', 'serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px rgb(15 23 42 / 0.06)',
        glow: '0 0 0 1px rgb(20 184 166 / 0.25), 0 12px 40px rgb(15 23 42 / 0.12)',
        'glow-dark': '0 0 0 1px rgb(45 212 191 / 0.2), 0 16px 48px rgb(0 0 0 / 0.45)',
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(1200px 600px at 10% -10%, rgb(204 251 241 / 0.55), transparent 55%), radial-gradient(900px 500px at 90% 0%, rgb(208 220 235 / 0.7), transparent 50%), linear-gradient(180deg, #f4f7fb 0%, #eef1f5 100%)',
        'mesh-dark':
          'radial-gradient(1000px 500px at 15% -15%, rgb(15 118 110 / 0.35), transparent 55%), radial-gradient(800px 480px at 90% 0%, rgb(55 80 110 / 0.35), transparent 50%), linear-gradient(180deg, #070d16 0%, #0b1220 45%, #111827 100%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
