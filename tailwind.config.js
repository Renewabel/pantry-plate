/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f3f5f0',
          100: '#e8ebe1',
          200: '#d0d7c3',
          300: '#b8c3a5',
          400: '#9aaa7f',
          500: '#6B8E23',
          600: '#5a7a1b',
          700: '#496615',
          800: '#38520f',
          900: '#2d420c',
        },
        mustard: {
          50: '#fffaf0',
          100: '#fff5e6',
          200: '#ffeacc',
          300: '#ffd966',
          400: '#daa520',
          500: '#DAA520',
          600: '#b8851a',
          700: '#9a6d15',
          800: '#7a550f',
          900: '#634409',
        },
        tomato: {
          50: '#ffe8e6',
          100: '#ffd0cc',
          200: '#ff9999',
          300: '#ff6666',
          400: '#e63946',
          500: '#DC143C',
          600: '#b8102e',
          700: '#940c2a',
          800: '#700a20',
          900: '#580816',
        },
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        body: ['Work Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
