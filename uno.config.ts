import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import transformerVariantGroup from '@unocss/transformer-variant-group'

import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  shortcuts: [{
    'border-base': 'border-[#8884]',
    'bg-card-item-link': 'bg-hex-8882 hover:bg-hex-8883 dark:bg-hex-8883 dark:hover:bg-hex-8884',
    'nav-divider': 'w-0.25 h-[80%] b-t-0 bg-[#ddd] dark:bg-[#333]',
  }, [/^important-(.*)$/, ([_, c]) => `!${c}`]],
  rules: [
    [/^slide-enter-(\d+)$/, ([_, n]) => ({
      '--enter-stage': n,
    })],
  ],
  extendTheme: (theme) => {
    return {
      ...theme,
      breakpoint: {
        ...theme.breakpoint,
        toc: '1228px',
      },
    }
  },
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetWebFonts({
      fonts: {
        sans: ['Inter', 'Noto Sans SC'],
        mono: ['Fira Code', 'Noto Sans SC'],
        serif: ['DM Serif Display', 'Noto Serif SC'],
        condensed: 'Roboto Condensed',
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
