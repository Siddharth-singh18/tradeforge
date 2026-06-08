/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0B0F',
        surface: '#111318',
        border: '#1E2028',
        gain: '#00D09C',
        loss: '#F45531',
        primary: '#E8EAF0',
        muted: '#6B7280',
        active: '#1877F2',
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
