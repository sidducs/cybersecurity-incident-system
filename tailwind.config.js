/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0e17',
          card: '#111827',
          border: '#1f2937',
          accent: '#06b6d4', // cyan-500
          danger: '#ef4444', // red-500
          warning: '#f59e0b', // amber-500
          success: '#10b981', // emerald-500
        }
      }
    },
  },
  plugins: [],
};

