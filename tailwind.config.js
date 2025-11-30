import { DEFAULT } from '@react-three/fiber/dist/declarations/src/core/utils';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px'
    },
    spacing: {
      '1': '8px',
      '2': '12px',
      '3': '16px',
      '4': '24px',
      '5': '32px',
      '6': '48px',
      '7': '56px',
      '12': '500px',
    },
    extend: {
      generalsans: ['General Sans', 'sans-serif'],
      publicsans: ['Public Sans', 'sans-serif'],
      fontFamily: {
        sans: ['verdana', ],
      },
    },
    colors: {
      
    },
  },
  plugins: [
    require('tailwindcss-border-image'),
  ],
}

