/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                arabic: ['Amiri', 'serif'],
            },
            colors: {
                sacred: {
                    cream: '#FDF8F5',
                    espresso: '#3E3128',
                    terracotta: '#8C624A',
                    obsidian: '#09090b',
                    gold: '#C8A97E',
                }
            }
        },
    },
    plugins: [],
}
