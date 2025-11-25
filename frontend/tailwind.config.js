/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0f4ff',
                    100: '#e0e8ff',
                    200: '#c7d6fe',
                    300: '#a4bbfd',
                    400: '#819bfb',
                    500: '#607af8',
                    600: '#455bf2',
                    700: '#3546e0',
                    800: '#2d3ab4',
                    900: '#28338e',
                    950: '#1a2055',
                },
                dark: {
                    900: '#0f172a',
                    800: '#1e293b',
                    700: '#334155',
                },
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
        },
    },
    plugins: [],
}
