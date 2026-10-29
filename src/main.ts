import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat.js'
import NProgress from 'nprogress'
import { OverlayScrollbars } from 'overlayscrollbars'
import { ViteSSG } from 'vite-ssg'
import { setupRouterScroller } from 'vue-router-better-scroller'
import { routes } from 'vue-router/auto-routes'

import App from './App.vue'
import { globalScrollbarOptions } from './components/base/Scrollbar.vue'
import { vReveal } from './directives/reveal'
import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'

import 'markdown-it-github-alerts/styles/github-base.css'
import 'markdown-it-copy-code/styles/base.css'

import 'markdown-it-copy-code/styles/large.css'
import '@shikijs/twoslash/style-rich.css'
import 'overlayscrollbars/overlayscrollbars.css'
import './styles/theme.css'
import './styles/main.css'
import './styles/markdown.css'
import './styles/prose.css'

import 'uno.css'

export const createApp = ViteSSG(
  App,
  { routes },
  async ({ app, router }) => {
    // dayjs
    dayjs.extend(LocalizedFormat)

    // 全局指令：v-reveal（滚动进入视口才显示）
    app.directive('reveal', vReveal)

    if (!import.meta.env.SSR) {
      // OverlayScrollbars（在客户端且尽早）
      OverlayScrollbars(document.body, globalScrollbarOptions)

      // nprogress + better-scroller
      router.beforeEach(() => {
        NProgress.start()
      })
      router.afterEach(() => {
        NProgress.done()
      })

      const html = document.querySelector('html')!
      setupRouterScroller(router, {
        selectors: {
          html(ctx) {
            if (
              ctx.savedPosition?.top
              // || import.meta.hot
            ) {
              html.classList.add('no-sliding')
            }
            else {
              html.classList.remove('no-sliding')
            }
            return true
          },
        },
        behavior: 'auto',
      })
    }
  },
)
