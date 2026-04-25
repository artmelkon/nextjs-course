/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base: {
          0: '#ffffff',
          50: '#eef1f8',
          100: '#dce4f1',
          200: '#bac9e2',
          300: '#97add4',
          400: '#7592c5',
          500: '#043891',
          600: '#03307c',
          700: '#032867',
          800: '#022053',
          900: '#02183e',
          950: '#011434',
        },
        accent: {
          0: '#ffffff',
          50: '#fbedef',
          100: '#f8dcdf',
          200: '#f1b9be',
          300: '#ea959e',
          400: '#e3727e',
          500: '#c50014',
          600: '#a90011',
          700: '#8d000e',
          800: '#71000c',
          900: '#540009',
          950: '#460007',
        },
        success: {
          500: '#34ad7a',
          600: '#2d9468',
          700: '#257b57',
        },
        warning: {
          500: '#f6a500',
          600: '#d38e00',
        },
        error: {
          500: '#f6532e',
          600: '#d34728',
        },
      },
      fontFamily: {
        body: ['Suisse Intl', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['monospace'],
      },
      borderRadius: {
        s: '4px',
        m: '8px',
        l: '16px',
      },
    },
  },
  plugins: [],
};
