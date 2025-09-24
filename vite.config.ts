/// <reference types="vitest" />

import path from 'node:path'
import MDShiki from '@shikijs/markdown-it'
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationWordHighlight } from '@shikijs/transformers'
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash'
import Vue from '@vitejs/plugin-vue'
import fs from 'fs-extra'
import matter from 'gray-matter'
import MDAnchor from 'markdown-it-anchor'
import MDCopyCode from 'markdown-it-copy-code'
import MDGithubAlerts from 'markdown-it-github-alerts'
import MDLinkAttributes from 'markdown-it-link-attributes'
import MDMagicLink from 'markdown-it-magic-link'
import MDTableOfContents from 'markdown-it-toc-done-right'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import { slugify } from './scripts/slugify'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
    ],
  },
  plugins: [
    UnoCSS(),

    VueRouter({
      extensions: ['.vue', '.md'],
      routesFolder: 'pages',
      extendRoute(route) {
        const path = route.components.get('default')

        if (path && path.endsWith('.md')) {
          const { data } = matter(fs.readFileSync(path, 'utf-8'))
          route.addToMeta({
            frontmatter: data,
          })
        }
      },
    }),

    Vue({
      include: [/\.vue$/, /\.md$/],
      features: {
        propsDestructure: true,
      },
    }),

    Markdown({
      wrapperComponent: 'WrapperPost',
      wrapperClasses: (_, code) => {
        if (code.includes('@layout-full-width')) {
          return ''
        }
        return 'prose m-auto slide-enter-content'
      },
      headEnabled: true,
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      markdownItOptions: {
        quotes: '""\'\'',

      },
      async markdownItSetup(md) {
        // shiki markdown it
        md.use(await MDShiki({
          themes: {
            light: 'vitesse-light',
            dark: 'vitesse-dark',
          },
          defaultColor: false,
          cssVariablePrefix: '--s-',
          transformers: [
            transformerTwoslash({
              explicitTrigger: true,
              renderer: rendererRich(),
            }),
            transformerNotationDiff(),
            transformerNotationHighlight(),
            transformerNotationWordHighlight(),
          ],
        }))

        // 标题锚点
        md.use(MDAnchor, {
          slugify,
          permalink: MDAnchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({
              'aria-hidden': 'true',
            }),
          }),
        })

        // 链接属性
        md.use(MDLinkAttributes, {
          matcher: (link: string) => link.startsWith('http'),
          attrs: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        })

        // 目录生成
        md.use(MDTableOfContents, {
          slugify,
          listType: 'ul',
          level: [1, 2, 3, 4],
        })

        // 魔法链接
        md.use(MDMagicLink, {})

        // GitHub 提示块
        md.use(MDGithubAlerts)

        // 代码复制
        md.use(MDCopyCode, {})
      },
    }),

    Components({
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),
  ],

  ssgOptions: {
    formatting: 'minify',
  },
})
