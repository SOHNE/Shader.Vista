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
    'icon-btn': 'op75 hover:op-100 transition-opacity cursor-pointer',
    'flex-center': 'flex items-center justify-center',

    'badge': 'px-1.5 py-0.5 rounded text-sm font-bold',
    'p-item': 'px-3 py-1',
    'p-btn': 'px-3 py-1.5',
    'p-btn-sm': 'px-1.5 py-0.5',
  },
  theme: {
    colors: {
      'primary': 'var(--primary)',
      'muted': 'var(--muted)',
      'dim': 'var(--dim)',
      'canvas': 'var(--canvas)',
      'surface-1': 'var(--surface-1)',
      'surface-2': 'var(--surface-2)',
      'surface-3': 'var(--surface-3)',
      'border': 'var(--border)',
      'accent': 'var(--accent)',
      'accent-subtle': 'var(--accent-subtle)',
      'success': 'var(--success)',
      'scrollbar-thumb': 'var(--scrollbar-thumb)',
      'scrollbar-track': 'var(--scrollbar-track)',

      'tab-active': 'var(--tab-active)',
      'tab-inactive': 'var(--tab-inactive)',
      'tab-hover': 'var(--tab-hover)',
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
