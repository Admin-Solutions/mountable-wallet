/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  // Prefix all classes to avoid conflicts with host app
  prefix: 'mw-',
  theme: {
    extend: {
      colors: {
        // Use CSS variables for theming - allows host customization
        'wallet-bg': {
          DEFAULT: 'var(--mw-bg-primary, #0a0a0f)',
          secondary: 'var(--mw-bg-secondary, #12121a)',
          tertiary: 'var(--mw-bg-tertiary, #1a1a24)',
        },
        'wallet-surface': {
          DEFAULT: 'var(--mw-surface, rgba(255, 255, 255, 0.03))',
          hover: 'var(--mw-surface-hover, rgba(255, 255, 255, 0.06))',
          border: 'var(--mw-surface-border, rgba(255, 255, 255, 0.08))',
        },
        'wallet-accent': {
          DEFAULT: 'var(--mw-accent, #6366f1)',
          light: 'var(--mw-accent-light, #818cf8)',
          dark: 'var(--mw-accent-dark, #4f46e5)',
        },
        'wallet-text': {
          DEFAULT: 'var(--mw-text-primary, #f8fafc)',
          secondary: 'var(--mw-text-secondary, #94a3b8)',
          muted: 'var(--mw-text-muted, #64748b)',
        },
        'wallet-success': 'var(--mw-success, #22c55e)',
        'wallet-error': 'var(--mw-error, #ef4444)',
        'wallet-warning': 'var(--mw-warning, #f59e0b)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
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
      },
    },
  },
  plugins: [],
}
