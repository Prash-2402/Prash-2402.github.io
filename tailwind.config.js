/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#00ff9c',
          glow: 'rgba(0, 255, 156, 0.6)',
        },
        pathCyan: '#00D4FF',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
