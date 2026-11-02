import type { PostFrontmatter, TocItem } from '~/types'
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter?: PostFrontmatter
    toc?: TocItem[]
  }
}

// View Transitions API 类型声明
interface Document {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition
}

interface ViewTransition {
  finished: Promise<void>
  ready: Promise<void>
  updateCallbackDone: Promise<void>
  skipTransition: () => void
}

interface CSSStyleDeclaration {
  viewTransitionName?: string
}
