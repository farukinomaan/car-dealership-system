/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FEE500',      // DriveMatch primary yellow accent
          'yellow-hover': '#F5DC00',
          dark: '#111315',
          card: '#FFFFFF',
          bg: '#F4F5F7',
          muted: '#6F767E',
          border: '#EFEFEF',
        }
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
