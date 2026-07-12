/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f97316',
      },
      fontFamily: {
        body: ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
