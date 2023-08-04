/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      animation: {
        'card-animation': 'card 0.4s',
      },
      keyframes: {
        card: {
          '0%': { transform: 'translateY(-10px)', opacity: '0', backgroundColor: '#0f83f8' },
          '100%': { transform: 'translateY(0%)', opacity: '100', backgroundColor: '#0f83f8' },
        },
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
}
