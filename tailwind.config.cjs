/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nammaPink: '#FCA5A5',
        crimsonRed: '#DC2626',
        maroon: '#7A1C1C',
        darkNavy: '#0D1527',
        namma: {
          pinkBg: '#FFF0F0',
          pinkBorder: '#FCA5A5',
          pinkText: '#991B1B',
        }
      },
      animation: {
        'spin-slow': 'spin 30s linear infinite',
        'pulse-glow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
