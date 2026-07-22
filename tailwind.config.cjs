/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        namma: {
          pinkBg: '#FFF0F0',
          pinkBorder: '#FFE3E3',
          pinkText: '#C53030',
        }
      }
    },
  },
  plugins: [],
};
