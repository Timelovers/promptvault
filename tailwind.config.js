/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Noto Sans SC', 'WenQuanYi Micro Hei', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'WenQuanYi Micro Hei Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /^(from|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(200|300|400|500|600|700)$/,
    },
  ],
};
