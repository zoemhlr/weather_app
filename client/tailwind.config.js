// tailwind.config.js
module.exports = {
  content: [
    // Example content paths...
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  media: false, 
  theme: {
    fontFamily: {
      primary: "Rubik",
      secondary: "Roboto",
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}