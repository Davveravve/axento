 /** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary': '#0066cc',
        'secondary': '#4a5568'
      },
      borderColor: theme => ({
        DEFAULT: theme('colors.gray.200', 'currentColor')
      }),
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}