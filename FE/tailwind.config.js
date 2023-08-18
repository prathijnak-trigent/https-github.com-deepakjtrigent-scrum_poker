/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "primary-color": "#0064fe",
        "primary-shade-color": "#00388f",
        "primary-pale-color": "#e5effe",
        "primary-highlight-color": "#5c9bff",
        "text-pale-color": "#e5effe",
        "scrum-background-color": "#ffffff",
        "scrum-text-color": "#848b99",
      },
      animation: {
        "card-animation": "card 0.4s",
        "popin-animation" : "popin 0.3s",
      },
      keyframes: {
        card: {
          "0%": {
            transform: "translateY(-10px)",
            opacity: "0",
            backgroundColor: "#0f83f8",
          },
          "100%": {
            transform: "translateY(0%)",
            opacity: "100",
            backgroundColor: "#0f83f8",
          },
        },
        popin: {
          "0%": {
            transform: "scale(0)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
      },
      screens: {
        'xs': { 'raw': "(min-width: 375px)", 'raw': "(max-width:639px)" },
        'xxs': { 'raw': "(max-width: 376px)" },
      },
      fontFamily: {
        "card-points": ["Roboto Mono"],
        "card-font": ["Space Mono"],
      },
    },
  },
  plugins: [],
};
