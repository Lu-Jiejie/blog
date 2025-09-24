import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat.js'
import NProgress from 'nprogress'
import { ViteSSG } from 'vite-ssg'
import { setupRouterScroller } from 'vue-router-better-scroller'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'

import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'
import 'markdown-it-github-alerts/styles/github-base.css'

import 'markdown-it-copy-code/styles/base.css'
import 'markdown-it-copy-code/styles/large.css'

import '@shikijs/twoslash/style-rich.css'
import './styles/main.css'
import './styles/markdown.css'
import './styles/prose.css'

import 'uno.css'

// `export const createApp` is required instead of the original `createApp(App).mount('#app')`
export const createApp = ViteSSG(
  // the root component
  App,
  // vue-router options
  { routes },
  // function to have custom setups
  async ({ router }) => {
    dayjs.extend(LocalizedFormat)

    if (!import.meta.env.SSR) {
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
              || import.meta.hot
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
