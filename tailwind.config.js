/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",  // ← scans all your React files
      './components/**/*.{js,ts,jsx,tsx}', // ← scans all your components
      "services/**/*.{js,ts,jsx,tsx}", // ← scans all your services
      "App.tsx", // ← scans all your utils
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }