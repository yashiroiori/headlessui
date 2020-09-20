const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: [],
  future: 'all',
  experimental: {
    extendedSpacingScale: true,
    extendedFontSizeScale: true,
    defaultLineHeights: true,
  },
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/ui')],
}
