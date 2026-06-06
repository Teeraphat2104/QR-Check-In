/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'slate-950': '#020617',
        'indigo-600': '#4f46e5',
        'emerald-400': '#34d399',
      },
    },
  },
  plugins: [],
}
