/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#1E1E1E',
        sidebar: '#282C34',
        logo: '#61DAFB',
      }
    }
  },
  plugins: [],
}

