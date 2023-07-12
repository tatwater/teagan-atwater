/** @type { import('tailwindcss').Config } */

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
    './src/fonts/**/*.{js,ts}',
    './src/hooks/**/*.{js,ts}',
    './src/lib/**/*.{js,ts}',
    './src/state/**/*.{js,ts}',
    './src/utils/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        mono: ['var(--font-mono)'],
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
};
