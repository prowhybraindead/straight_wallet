/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#f0f0ff',
                    100: '#e0e0ff',
                    200: '#c4b5fd',
                    300: '#a78bfa',
                    400: '#8b5cf6',
                    500: '#7c3aed',
                    600: '#6d28d9',
                    700: '#5b21b6',
                    800: '#4c1d95',
                    900: '#3b0764',
                },
                accent: {
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    200: '#fbcfe8',
                    300: '#f9a8d4',
                    400: '#f472b6',
                    500: '#ec4899',
                    600: '#db2777',
                    700: '#be185d',
                    800: '#9d174d',
                    900: '#831843',
                },
                neon: {
                    cyan: '#00f5ff',
                    pink: '#ff2d95',
                    purple: '#b829dd',
                    green: '#39ff14',
                    orange: '#ff6b35',
                },
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'fade-in': 'fadeIn 0.5s ease-out',
                'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'scan-line': 'scanLine 2s ease-in-out infinite',
                'sparkle': 'sparkle 1.5s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.5), 0 0 20px rgba(124, 58, 237, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.8), 0 0 60px rgba(124, 58, 237, 0.4)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                bounceIn: {
                    '0%': { transform: 'scale(0.3)', opacity: '0' },
                    '50%': { transform: 'scale(1.05)' },
                    '70%': { transform: 'scale(0.9)' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                scanLine: {
                    '0%, 100%': { top: '0%' },
                    '50%': { top: '100%' },
                },
                sparkle: {
                    '0%, 100%': { opacity: '0', transform: 'scale(0)' },
                    '50%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'anime-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'sunset-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                'ocean-gradient': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                'neon-gradient': 'linear-gradient(135deg, #b829dd 0%, #00f5ff 100%)',
            },
        },
    },
    plugins: [],
}
