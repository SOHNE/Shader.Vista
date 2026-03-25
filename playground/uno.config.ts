import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'bg-main': 'bg-white dark:bg-[#121212]',
    'bg-hover': 'bg-gray-100 dark:bg-gray-800',
    'bg-popover': 'bg-white dark:bg-[#1a1a1a]',
    'border-main': 'border-gray-200 dark:border-gray-800',
    'text-main': 'text-gray-900 dark:text-gray-100',
    'text-muted': 'text-gray-500 dark:text-gray-400',
    'text-primary': 'text-teal-600 dark:text-teal-400',
    'icon-btn': 'op75 hover:op-100 transition-opacity cursor-pointer',
    'header-layout': 'flex items-center justify-between px-3 py-1 bg-main border-b border-main',
  },
  theme: {
    colors: {
      primary: {
        DEFAULT: '#0d9488', // teal-600
        dark: '#2dd4bf', // teal-400
      },
    },
  },
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetIcons({
      scale: 1.2,
      warn: true,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetAttributify(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'Fira Code',
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
