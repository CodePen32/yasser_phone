import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Tajawal', 'sans-serif'],
        tajawal: ['Tajawal', 'Cairo', 'sans-serif'],
        display: ['IBM Plex Sans Arabic', 'Plus Jakarta Sans', 'Cairo', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      colors: {
        brand: {
          primary: '#131921',
          secondary: '#232f3e',
          accent: '#f59e0b',
          accent2: '#d97706',
          price: '#b12704',
          whatsapp: '#25D366',
          'whatsapp-dark': '#128C7E',
        },
      },
    },
  },
  plugins: [],
};

export default config;
