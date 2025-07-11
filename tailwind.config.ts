// tailwind.config.ts

/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // REINTRODUZINDO NOSSA PALETA DE CORES
      colors: {
        background: 'var(--color-background)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
        },
        border: 'var(--color-border)',
        'input-bg': 'var(--color-input-bg)',
      },
    },
  },
  plugins: [],
};

export default config;