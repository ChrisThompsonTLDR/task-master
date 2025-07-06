/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': {
          50: 'var(--color-primary-50, rgb(255 247 237))',
          100: 'var(--color-primary-100, rgb(255 237 213))',
          200: 'var(--color-primary-200, rgb(254 215 170))',
          300: 'var(--color-primary-300, rgb(253 186 116))',
          400: 'var(--color-primary-400, rgb(251 146 60))',
          500: 'var(--color-primary-500, rgb(249 115 22))',
          600: 'var(--color-primary-600, rgb(234 88 12))',
          700: 'var(--color-primary-700, rgb(194 65 12))',
          800: 'var(--color-primary-800, rgb(154 52 18))',
          900: 'var(--color-primary-900, rgb(124 45 18))',
          950: 'var(--color-primary-950, rgb(67 20 7))',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
