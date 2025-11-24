/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",  // ← scans all your React files
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }