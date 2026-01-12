import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        // Warmer terracotta/coral palette
        coral: {
          50: '#fdf6f4',
          100: '#fbe9e4',
          200: '#f7d5cc',
          300: '#f0b9a8',
          400: '#e5957b',
          500: '#c4785f', // Main warm terracotta
          600: '#b06c55',
          700: '#935847',
          800: '#7a4a3d',
          900: '#664035',
        },
        // Olive/sage green to match website
        sage: {
          50: '#f7f8f5',
          100: '#ebeee6',
          200: '#d7dccf',
          300: '#bcc4ab',
          400: '#9da885',
          500: '#808d68',
          600: '#5c6b4d', // Main olive green (matches website nav)
          700: '#4a5640',
          800: '#3d4636',
          900: '#343b2f',
        },
        // Warm ivory/cream
        cream: {
          50: '#fdfcfa',
          100: '#faf6f1',
          200: '#f5ede3',
          300: '#ede1d1',
          400: '#e2cfb8',
          500: '#d4bc9c',
          600: '#c2a37d',
          700: '#a68760',
          800: '#896d4e',
          900: '#715a42',
        },
        // Warm neutral browns
        warm: {
          50: '#faf9f7',
          100: '#f3f1ed',
          200: '#e5e0d8',
          300: '#d4cfc5',
          400: '#bfb8ab',
          500: '#a89f8f',
          600: '#8b7d6b',
          700: '#6b5e4f',
          800: '#4a4539',
          900: '#2d2a25',
        },
        // Blush pink (from logo heart)
        pink: {
          50: '#fdf5f6',
          100: '#fbeced',
          200: '#f5d5d8',
          300: '#e8b4b8',
          400: '#dfa5aa',
          500: '#d18e94',
          600: '#b87078',
          700: '#9a5660',
          800: '#7d454d',
          900: '#5f3640',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'warm': '0 2px 20px rgba(139, 115, 85, 0.08)',
        'warm-lg': '0 4px 30px rgba(139, 115, 85, 0.12)',
      }
    },
  },
  plugins: [],
};
export default config;
