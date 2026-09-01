import type { Directive } from 'vue'

/**
 * v-reveal —— 滚动进入视口时才显示元素的公共指令。
 *
 * 用法：`<div v-reveal>...</div>`，可选传延迟毫秒：`<div v-reveal="120">...</div>`
 *
 * 行为：
 * - 初始给元素加 `data-reveal`（配合全局 CSS 隐藏），进入视口后改为 `data-reveal="active"`（滑动显示）。
 * - 首屏已在视口内的元素（例如主页卡片区露出的一角）不会立即显示，
 *   而是等用户第一次滚动后再按当前位置判断是否显示 —— 解决"一进入页面就显示"。
 * - 视口下方的元素由 IntersectionObserver 在滚动进入视口时逐个触发，天然从上到下。
 * - 每个元素独立观察、独立 reveal。
 * - SSR 时通过 getSSRProps 输出 `data-reveal`，预渲染 HTML 与客户端状态一致（无闪烁）。
 */

let observer: IntersectionObserver | null = null
let hasScrolled = false
// 所有正在观察的元素
const observed = new Set<HTMLElement>()

function reveal(el: HTMLElement) {
  if (el.dataset.reveal === 'active')
    return
  el.dataset.reveal = 'active'
  observer?.unobserve(el)
  observed.delete(el)
  scheduleRevealCleanup(el)
}

/**
 * reveal 动画结束后移除 data-reveal 属性，让元素脱离 [data-reveal] 规则。
 *
 * 原因：CSS 里 [data-reveal] 带 will-change: opacity, transform 且 active 态
 * transform: translateY(0)（非 none），两者都会让容器一直留在合成层。
 * 合成层上的文字禁用子像素抗锯齿，hover 时内部文本自身做 opacity 过渡
 * （如卡片 item 的 title 0.85 → 1）会触发合成层提升/撤销，文字渲染路径
 * 切换，表现为"先往下位移一点再回归"的抖动。动画结束后释放合成层即可根治。
 */
function scheduleRevealCleanup(el: HTMLElement) {
  let done = false
  let timer: number | undefined

  function finish() {
    if (done)
      return
    done = true
    el.removeEventListener('transitionend', onTransitionEnd)
    if (timer)
      window.clearTimeout(timer)
    el.removeAttribute('data-reveal')
    el.style.transitionDelay = ''
  }

  function onTransitionEnd(e: TransitionEvent) {
    if (e.target === el && e.propertyName === 'opacity')
      finish()
  }

  el.addEventListener('transitionend', onTransitionEnd)
  // 兜底：prefers-reduced-motion 下 transition 为 none，不会触发 transitionend，
  // 用与 CSS 时长（0.9s）+ 延迟匹配的定时器保证最终一定清理。
  const delay = Number.parseFloat(el.style.transitionDelay || '0') || 0
  timer = window.setTimeout(finish, 900 + delay + 100)
}

function revealIfInView(el: HTMLElement) {
  if (el.dataset.reveal === 'active')
    return
  const rect = el.getBoundingClientRect()
  if (rect.top < window.innerHeight && rect.bottom > 0)
    reveal(el)
}

function onWindowScroll() {
  hasScrolled = true
  window.removeEventListener('scroll', onWindowScroll)
  // 首次滚动：让首屏内尚未显示的元素按当前位置决定是否显示
  for (const el of observed) {
    if (el.dataset.reveal !== 'active')
      revealIfInView(el)
  }
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  // 在元素插入 DOM 之前设置隐藏属性：避免客户端首次渲染时
  // "先以可见状态插入 → mounted 补上 data-reveal → 触发反向隐藏动画"的闪烁。
  // created 在 SSR 与客户端都会调用，对 SSR 无害（getSSRProps 负责输出属性）。
  created(el, binding) {
    el.dataset.reveal = ''
    const delay = typeof binding.value === 'number' ? binding.value : 0
    if (delay > 0)
      el.style.transitionDelay = `${delay}ms`
  },
  mounted(el) {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined')
      return

    const isFirstObserved = observed.size === 0
    observed.add(el)

    // 页面带滚动位置加载（如刷新/返回），视口内元素直接显示
    if (window.scrollY > 0) {
      hasScrolled = true
      revealIfInView(el)
    }

    // 只注册一个滚动监听：等用户第一次真实滚动后再显示首屏元素
    if (!hasScrolled && isFirstObserved)
      window.addEventListener('scroll', onWindowScroll, { passive: true })

    if (el.dataset.reveal !== 'active') {
      observer ??= new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          if (entry.isIntersecting && hasScrolled)
            reveal(target)
        }
      }, {
        threshold: 0,
        // 把判定视口底部向上收窄 15%：卡片需要进入屏幕更深一些才触发，
        // 避免刚露出一角就滑入、看不到滑动过程
        rootMargin: '0px 0px -15% 0px',
      })
      observer.observe(el)
    }
  },
  unmounted(el) {
    observed.delete(el)
    observer?.unobserve(el)
    // 离开页面（所有观察元素卸载）后复位，避免跨路由时首屏元素直接显示
    if (observed.size === 0) {
      hasScrolled = false
      window.removeEventListener('scroll', onWindowScroll)
    }
  },
  getSSRProps() {
    return {
      'data-reveal': '',
    }
  },
}