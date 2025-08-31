import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'

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
  }, [/^important-(.*)$/, ([_, c]) => `!${c}`]],
  rules: [
    [/^slide-enter-(\d+)$/, ([_, n]) => ({
      '--enter-stage': n,
    })],
  ],
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
        sans: 'Inter',
        serif: 'Newsreader',
        mono: 'Fira Code',
      },
      processors: createLocalFontProcessor(),
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
})
