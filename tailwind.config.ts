import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.06)',
          medium: 'rgba(255, 255, 255, 0.10)',
          heavy: 'rgba(255, 255, 255, 0.15)',
          border: 'rgba(255, 255, 255, 0.12)',
          'border-light': 'rgba(255, 255, 255, 0.06)',
        },
        accent: {
          // Complementary colors for dark green theme
          primary: '#4ade80', // Bright green
          secondary: '#34d399', // Emerald
          cyan: '#22d3d1', // Teal cyan
          gold: '#fbbf24', // Warm gold accent
          coral: '#fb7185', // Soft coral for highlights
          purple: '#a78bfa', // Soft purple
          emerald: '#10b981', // Deep emerald
        },
        dark: {
          // Dark green palette based on RGB(28, 71, 59) = #1C473B
          primary: '#0a1f18', // Darkest - almost black green
          secondary: '#1C473B', // Your specified color
          tertiary: '#153129', // Mid dark green
          surface: '#1a3d32', // Card surfaces
          lighter: '#245748', // Lighter variant
        },
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
        '3xl': '64px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', boxShadow: '0 0 20px rgba(74, 222, 128, 0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(74, 222, 128, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-hover': '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'glow-green': '0 0 30px rgba(74, 222, 128, 0.4)',
        'glow-emerald': '0 0 30px rgba(52, 211, 153, 0.4)',
        'glow-gold': '0 0 30px rgba(251, 191, 36, 0.4)',
        'glow-cyan': '0 0 30px rgba(34, 211, 209, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.03)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':
          'radial-gradient(at 40% 20%, hsla(160, 100%, 40%, 0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(170, 80%, 45%, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(140, 100%, 35%, 0.2) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(45, 100%, 60%, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(150, 80%, 40%, 0.15) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};

export default config;
