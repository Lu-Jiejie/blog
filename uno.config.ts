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

import { projectsData } from './pages/projects/data'

const projectIcons = projectsData
  .map(item => item.icon)
  .filter(icon => icon.startsWith('i-'))

const projectIconStyles = projectsData
  .filter(item => item.icon_css)
  .flatMap(item => item.icon_css!.split(' '))

// 提取所有 icon_hover 中的类名（包括 group-hover: 前缀版本）
const projectIconHoverStyles = projectsData
  .filter(item => item.icon_hover_css)
  .flatMap((item) => {
    const classes = item.icon_hover_css!.split(' ')
    // 同时添加原始类名和 group-hover: 前缀版本
    return classes.flatMap(cls => [cls, `group-hover:${cls}!`])
  })

export default defineConfig({
  safelist: [
    ...projectIcons,
    ...projectIconStyles,
    ...projectIconHoverStyles,
  ],
  shortcuts: [
    {
      'border-base': 'border-[#8884]',
      'bg-card-item-link': 'bg-hex-8882 hover:bg-hex-8883 dark:bg-hex-8883 dark:hover:bg-hex-8884',
      'nav-divider': 'w-0.25 h-[80%] b-t-0 bg-[#ddd] dark:bg-[#333]',
      'item-link': 'no-underline border-b-none',
    },
    [/^important-(.*)$/, ([_, c]) => `!${c}`],
  ],
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
        sans: ['Inter:400,600,800', 'Noto Sans SC:400,600,800'],
        mono: ['Fira Code:400,600,800', 'Noto Sans SC:400,600,800'],
        serif: ['Noto Serif SC:400,600,800'],
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
