import type { Plugin } from 'vite'
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

// 随想数据在 static 仓库里，开发时直接读本地目录：
// 不用先把 JSON 推到远端，也能看到跟前端联调一模一样的结果
const THINKING_DATA_DIR = path.resolve(__dirname, '../static/data/thinking')
const THINKING_SAMPLE_DIR = path.resolve(THINKING_DATA_DIR, 'sample')

function readThinkingEntries(file: string): any[] {
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return Array.isArray(raw) ? raw : raw?.entries ?? []
  }
  catch {
    return []
  }
}

// 目录里除了 JSON 还有抓下来的封面图，按后缀给对的 Content-Type
const CONTENT_TYPES: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
}

function thinkingLocalData(): Plugin {
  return {
    name: 'thinking-local-data',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__thinking', (req, res) => {
        const relative = decodeURIComponent((req.url ?? '/').split('?')[0]).replace(/^\/+/, '') || 'index.json'
        const file = path.resolve(THINKING_DATA_DIR, relative)
        const sampleFile = path.resolve(THINKING_SAMPLE_DIR, relative)

        // 只允许读 data/thinking 下的文件，别把整个磁盘暴露出去
        if (!file.startsWith(THINKING_DATA_DIR) || !sampleFile.startsWith(THINKING_SAMPLE_DIR)) {
          res.statusCode = 403
          res.end('forbidden')
          return
        }

        // 演示数据只在这里出现：真实条目 + 演示条目合在一起，
        // 卡片的各种形态才都能看到；生产构建永远只读 index.json
        if (relative === 'index.json') {
          const devIndex = path.resolve(THINKING_DATA_DIR, 'index.dev.json')
          if (fs.existsSync(devIndex)) {
            const real = readThinkingEntries(file)
            const seen = new Set(real.map(entry => entry.timestamp))
            const entries = [...real, ...readThinkingEntries(devIndex).filter(entry => !seen.has(entry.timestamp))]
              .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))
            res.setHeader('Content-Type', CONTENT_TYPES['.json'])
            res.setHeader('Cache-Control', 'no-store')
            res.end(JSON.stringify({ version: 1, count: entries.length, entries }))
            return
          }
        }

        let target = file
        if (!fs.existsSync(target) && fs.existsSync(sampleFile))
          target = sampleFile

        if (!fs.existsSync(target)) {
          res.statusCode = 404
          res.end(`not found: ${relative}`)
          return
        }
        res.setHeader('Content-Type', CONTENT_TYPES[path.extname(target).toLowerCase()] ?? 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-store')
        res.end(fs.readFileSync(target))
      })
    },
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  server: {
    // 开发时先把这些文件转换一遍：UnoCSS 的类是随模块转换逐个收集、再生成 CSS 的，
    // 不预热的话首屏会先按「还没有这些类」画一帧，CSS 补上后再跳一下。
    // 构建产物里 CSS 在 head 里一次性链入，所以这个问题只在 dev 出现。
    warmup: {
      clientFiles: [
        './src/main.ts',
        './src/App.vue',
        './src/components/**/*.vue',
        './pages/**/*.vue',
      ],
    },
  },
  optimizeDeps: {
    // 依赖扫描器不解析 .vue，只从 SFC 里 import 的包要在这里显式声明，
    // 否则首次访问时才会被发现，触发「重新预构建 + 整页 reload」
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
      '@unhead/vue',
      '@tonejs/midi',
      'tone',
      'overlayscrollbars',
      'overlayscrollbars-vue',
      '@unpic/placeholder',
      'markdown-it-copy-code',
      'dayjs',
      'dayjs/plugin/localizedFormat.js',
      'nprogress',
      'pixi.js',
      'simplex-noise',
      'vite-ssg',
      'vue-router-better-scroller',
    ],
  },
  plugins: [
    thinkingLocalData(),

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
        if (id.endsWith('/pages/index.md'))
          return 'IndexLayout'
        // posts 下的非 index.md 才是文章，列表页和独立页都走 PageLayout
        if (id.includes('/pages/posts/') && !id.endsWith('/index.md'))
          return 'PostLayout'
        return 'PageLayout'
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
      dirs: ['src/components', 'src/wrappers'],
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
