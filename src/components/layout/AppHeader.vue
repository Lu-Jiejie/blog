<script setup lang="ts">
import { useEventListener, useTimeoutFn } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import UiBackdrop from '~/components/ui/UiBackdrop.vue'
import { isDark, toggleDark } from '~/logic'

const route = useRoute()

interface NavItem {
  label: string
  href: string
  external?: boolean
}

// 桌面端不重复主页入口：左上角「鹿巢」就是回主页的入口
const desktopNav: NavItem[] = [
  { label: '文章', href: '/posts' },
  { label: '随想', href: '/thinking' },
]

// 「三」面板里没有常驻的 logo，所以主页要单独列出来
const mobileNav: NavItem[] = [
  { label: '首页', href: '/' },
  { label: '文章', href: '/posts' },
  { label: '随想', href: '/thinking' },
]

const moreNav: NavItem[] = [
  { label: '项目', href: '/projects' },
  { label: '收藏', href: '/collection' },
  { label: '相册', href: '/photos' },
  { label: '游戏记录', href: '/game-playlog' },
]

const aboutNav: NavItem[] = [
  { label: '关于我', href: '/about' },
  { label: '关于本站', href: '/history' },
  { label: '关于本项目', href: 'https://github.com/Lu-Jiejie/blog', external: true },
]

// 外链走原生 a，站内走 RouterLink；属性也随之一分为二
function linkProps(item: NavItem) {
  return item.external
    ? { href: item.href, target: '_blank', rel: 'noopener' }
    : { to: item.href }
}

function isActive(href: string) {
  return href === '/' ? route.path === '/' : route.path.startsWith(href)
}

function groupActive(items: NavItem[]) {
  return items.some(i => !i.external && isActive(i.href))
}

const menus = computed(() => [
  { id: 'more', label: '更多', items: moreNav, active: groupActive(moreNav) },
  { id: 'about', label: '关于', items: aboutNav, active: groupActive(aboutNav) },
])

// 同一时刻只开一个菜单；延迟避免指针划过时面板闪动
const openMenu = ref<string | null>(null)
const pendingMenu = ref<string | null>(null)
const { start: scheduleOpen, stop: cancelOpen } = useTimeoutFn(() => {
  openMenu.value = pendingMenu.value
}, 80)
const { start: scheduleClose, stop: cancelClose } = useTimeoutFn(() => {
  openMenu.value = null
}, 150)

function onMenuEnter(id: string) {
  pendingMenu.value = id
  cancelClose()
  scheduleOpen()
}
function onMenuLeave() {
  cancelOpen()
  scheduleClose()
}

function onMenuFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (!next || !(e.currentTarget as HTMLElement).contains(next))
    openMenu.value = null
}

const menuOpen = ref(false)

// ===== 下拉菜单的强调色竖条：在行之间滑动，指针离开面板后回到当前页那一行 =====
const BAR_HEIGHT = 14

interface MenuGroup {
  id: string
  items: NavItem[]
}

const panelEls = new Map<string, HTMLElement>()
const barState = ref<Record<string, { top: number, visible: boolean }>>({})

function setPanelEl(id: string, el: unknown) {
  if (el instanceof HTMLElement)
    panelEls.set(id, el)
  else
    panelEls.delete(id)
}

function menuRows(id: string) {
  return Array.from(panelEls.get(id)?.querySelectorAll<HTMLElement>('[data-menu-row]') ?? [])
}

function placeBar(id: string, index: number) {
  const row = menuRows(id)[index]
  if (!row)
    return
  barState.value = {
    ...barState.value,
    [id]: { top: row.offsetTop + (row.offsetHeight - BAR_HEIGHT) / 2, visible: true },
  }
}

function resetBar(menu: MenuGroup) {
  const index = menu.items.findIndex(item => !item.external && isActive(item.href))
  if (index === -1) {
    barState.value = {
      ...barState.value,
      [menu.id]: { top: barState.value[menu.id]?.top ?? 0, visible: false },
    }
    return
  }
  placeBar(menu.id, index)
}

function barStyle(id: string) {
  const state = barState.value[id]
  return {
    transform: `translateY(${state?.top ?? 0}px)`,
    opacity: state?.visible ? 1 : 0,
  }
}

// 面板刚展开时先落到当前页那一行
watch(openMenu, async (id) => {
  if (!id)
    return
  const menu = menus.value.find(m => m.id === id)
  if (!menu)
    return
  await nextTick()
  resetBar(menu)
})

const themeIcon = computed(() => isDark.value ? 'i-ri-moon-line' : 'i-ri-sun-line')
const themeLabel = computed(() => isDark.value ? '切换到浅色主题' : '切换到深色主题')

watch(() => route.fullPath, () => {
  openMenu.value = null
  menuOpen.value = false
})

useEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    openMenu.value = null
    menuOpen.value = false
  }
})
</script>

<template>
  <header z-40 flex items-center gap-6 min-h-[2rem] p="x-5 t-5 b-7">
    <RouterLink to="/" class="typewriter-logo shrink-0" aria-label="首页">
      <AppLogo />
    </RouterLink>

    <div flex items-center justify-end gap-5 w-full>
      <!-- hidden / flex 必须写在 class 里；裸写 hidden 是 HTML 属性，会被 preflight 的 [hidden] 规则压成 display:none -->
      <nav class="hidden nav:flex items-center gap-6" aria-label="主导航">
        <RouterLink
          v-for="item in desktopNav"
          :key="item.href"
          :to="item.href"
          class="nav-link"
          :class="isActive(item.href) && 'nav-link-active'"
        >
          {{ item.label }}
        </RouterLink>

        <div
          v-for="menu in menus"
          :key="menu.id"
          relative
          @pointerenter="onMenuEnter(menu.id)"
          @pointerleave="onMenuLeave"
        >
          <button
            type="button"
            class="nav-link"
            :class="[menu.active && 'nav-link-active', openMenu === menu.id && 'nav-link-open']"
            aria-haspopup="true"
            :aria-expanded="openMenu === menu.id"
            @focusin="openMenu = menu.id"
          >
            {{ menu.label }}
          </button>

          <!-- 面板与触发器同在一个 relative 容器内，pt-2 作为悬停桥 -->
          <div
            absolute top-full right-0 pt-2 z-50
            transition="all duration-150" ease-out
            :class="openMenu === menu.id ? 'op-100 translate-y-0' : 'op-0 -translate-y-1 invisible'"
            @focusout="onMenuFocusOut"
          >
            <div
              :ref="el => setPanelEl(menu.id, el)"
              class="popover-panel menu-panel"
              @pointerleave="resetBar(menu)"
            >
              <span class="menu-bar" :style="barStyle(menu.id)" aria-hidden="true" />
              <component
                :is="item.external ? 'a' : RouterLink"
                v-for="(item, index) in menu.items"
                :key="item.href"
                v-bind="linkProps(item)"
                data-menu-row
                class="nav-link menu-item whitespace-nowrap"
                :class="isActive(item.href) && 'nav-link-active'"
                @pointerenter="placeBar(menu.id, index)"
              >
                {{ item.label }}
                <span v-if="item.external" class="i-ri-arrow-right-up-line menu-item-ext" />
              </component>
            </div>
          </div>
        </div>
      </nav>

      <!-- 文字导航与图标工具区之间的竖线；窄屏整组隐藏，所以线也一起隐藏 -->
      <div class="hidden nav:block w-px h-4 shrink-0 bg-[var(--c-hairline)]" aria-hidden="true" />

      <!-- 图标组的间距与父级 gap-5 保持一致，否则主题↔GitHub 比 GitHub↔音乐紧一档 -->
      <div class="hidden nav:flex items-center gap-5">
        <button
          type="button"
          class="nav-link flex items-center justify-center w-[1.2em] h-[1.2em]"
          :aria-label="themeLabel"
          @click="toggleDark()"
        >
          <div :class="themeIcon" />
        </button>
        <a
          href="https://github.com/Lu-Jiejie"
          target="_blank"
          rel="noopener"
          class="nav-link flex items-center justify-center w-[1.2em] h-[1.2em]"
          aria-label="GitHub"
        >
          <div i-ri-github-fill />
        </a>
      </div>

      <!-- 移动端：音乐按钮在左，"三"在右 -->
      <AppMusicPlayer />

      <button
        type="button"
        class="nav-link nav:hidden flex items-center justify-center w-[1.4em] h-[1.4em]"
        aria-label="打开菜单"
        :aria-expanded="menuOpen"
        @click="menuOpen = true"
      >
        <div i-ri-menu-line text-lg />
      </button>
    </div>

    <UiBackdrop :visible="menuOpen" @close="menuOpen = false">
      <!-- 与 TocPanel 同用 .popover-panel；自身 fixed 定位，w-[90%] 才是相对视口，否则会按 backdrop 的 flex 子项收缩 -->
      <nav
        class="popover-panel overflow-y-auto select-none"
        fixed z-200
        top="[10%]" left="1/2" un-translate="x--1/2"
        w="[90%]"
        flex="~ col"
        transition="opacity duration-300"
        :class="menuOpen ? 'op-100' : 'op-0 pointer-events-none'"
        aria-label="菜单"
        style="max-height: calc(100vh - 10% - 30%);"
      >
        <!-- 分隔线单独挂在包裹层上，不跟链接的变色走 -->
        <div v-for="item in mobileNav" :key="item.href" class="mx-5 border-b border-[var(--c-hairline)]">
          <RouterLink
            :to="item.href"
            class="nav-link block py-2.5"
            :class="isActive(item.href) && 'nav-link-active'"
            @click="menuOpen = false"
          >
            {{ item.label }}
          </RouterLink>
        </div>

        <!-- 分组标签不可点，压到比链接更淡的小字；子项与一级链接同尺寸 -->
        <div
          v-for="menu in menus"
          :key="menu.id"
          class="mx-5 pt-3 pb-2.5 border-t border-[var(--c-hairline)]"
        >
          <div
            class="text-xs uppercase tracking-wider"
            :class="menu.active ? 'text-[var(--c-text-muted)]' : 'text-[var(--c-text-faint)]'"
          >
            {{ menu.label }}
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-2 mt-2">
            <component
              :is="item.external ? 'a' : RouterLink"
              v-for="item in menu.items"
              :key="item.href"
              v-bind="linkProps(item)"
              class="nav-link whitespace-nowrap"
              :class="isActive(item.href) && 'nav-link-active'"
              @click="menuOpen = false"
            >
              {{ item.label }}
              <span v-if="item.external" class="i-ri-arrow-right-up-line text-12px text-[var(--c-text-faint)]" />
            </component>
          </div>
        </div>

        <!-- 主题刻意不关闭面板，方便连续调整观察效果 -->
        <div class="mx-5 flex justify-center items-center gap-4 py-3 border-t border-[var(--c-hairline)]">
          <button
            type="button"
            class="nav-link p-1 flex items-center justify-center"
            :aria-label="themeLabel"
            @click="toggleDark()"
          >
            <div :class="themeIcon" text-lg />
          </button>
          <a
            href="https://github.com/Lu-Jiejie"
            target="_blank"
            rel="noopener"
            class="nav-link p-1"
            aria-label="GitHub"
          >
            <div i-ri-github-fill text-lg />
          </a>
        </div>
      </nav>
    </UiBackdrop>
  </header>
</template>

<style scoped>
.nav-link {
  --uno: transition-colors duration-300 cursor-pointer;

  color: var(--c-text-muted);
  font-weight: 600;
}

/* 悬停只是提亮到正文色，强调色留给当前页 */
.nav-link:not(.nav-link-active):hover {
  color: var(--c-text);
}

/* 面板展开时触发器升到与 hover 同一档：关闭是延迟的，若在这个窗口里跳 accent，
   鼠标离开瞬间就会闪一下深粉再退回灰。 */
.nav-link-open {
  color: var(--c-text);
}

.nav-link-active {
  color: var(--c-accent);
}

/* 下拉面板：6px 内边距配 6px 行圆角，与外层 8px 圆角同心 */
.menu-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 10.5rem;
  padding: 0.375rem;
}

.menu-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
  padding: 0.375rem 0.625rem 0.375rem 1rem;
  border-radius: 6px;
}

/* 整块面板只有一根竖条，靠 translateY 在行之间滑；位置由 JS 按行高算 */
.menu-bar {
  position: absolute;
  top: 0;
  left: 0.5rem;
  width: 2px;
  height: 14px;
  border-radius: 1px;
  background-color: var(--c-accent);
  pointer-events: none;
  transition:
    transform 0.2s ease,
    opacity 0.15s ease;
}

.menu-item-ext {
  font-size: 0.75rem;
  color: var(--c-text-faint);
}

.typewriter-logo {
  font-size: 1.1rem;
  font-weight: 600;
  --uno: transition-colors duration-300;

  color: var(--c-text);
}

.typewriter-logo:hover {
  color: var(--c-text-strong);
}
</style>
