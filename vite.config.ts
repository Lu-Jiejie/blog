import path from 'node:path'
import MDMagicLink from '@lu-jiejie/markdown-it-magic-link'
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
import UnoCSS from 'unocss/vite'
import TurboConsole from 'unplugin-turbo-console/vite'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import { defineConfig } from 'vite'
import VueRouter from 'vue-router/vite'
import extractToc from './scripts/extractToc'
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
          const content = fs.readFileSync(path, 'utf-8')
          const { data } = matter(content)
          // Get the table of contents and add it to route meta
          const { toc } = extractToc(path)

          route.addToMeta({
            frontmatter: data,
            toc,
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
      wrapperComponent: (id) => {
        console.log(id)
        if (id.endsWith('projects/index.md'))
          return 'WrapperPage'
        return 'WrapperPost'
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
        }) as any)

        // 标题锚点
        md.use(MDAnchor as any, {
          slugify,
          permalink: MDAnchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({
              'aria-hidden': 'true',
            }),
          }),
        })

        // 链接属性
        md.use(MDLinkAttributes as any, {
          matcher: (link: string) => link.startsWith('http'),
          attrs: {
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        })

        // 魔法链接
        md.use(MDMagicLink as any, {
          // platformUsers: {
          //   bili: {
          //     'lu-jiejie': {
          //       link: '',
          //       avatarUrl: '//wsrv.nl/?url=https://i0.hdslb.com/bfs/face/9eeb889c3a709a94f3893ceda8e1f0d3c222f698.jpg',
          //       displayName: 'Lu Jiejie',
          //     },
          //   },
          // },
        })

        // GitHub 提示块
        md.use(MDGithubAlerts as any)

        // 代码复制
        md.use(MDCopyCode as any, {})
      },
    }),

    Components({
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
    }),
    TurboConsole({
    }),
  ],

  ssgOptions: {
    formatting: 'minify',
  },
})
