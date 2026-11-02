<script setup lang="ts">
import { useEventListener, useTimeoutFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import UiBackdrop from '~/components/ui/UiBackdrop.vue'
import { isDark, toggleDark } from '~/logic'
import { isZh, toggleLang, useI18n } from '~/logic/i18n'

const route = useRoute()

const $t = useI18n({
  en: {
    home: 'Home',
    posts: 'Posts',
    thinking: 'Thinking',
    more: 'More',
    aboutGroup: 'About',
    projects: 'Projects',
    favorites: 'Favorites',
    photos: 'Photos',
    about: 'About me',
    aboutSite: 'About this site',
    aboutProject: 'About this project',
  },
  zh: {
    home: '首页',
    posts: '文章',
    thinking: '随想',
    more: '更多',
    aboutGroup: '关于',
    projects: '项目',
    favorites: '收藏',
    photos: '相册',
    about: '关于我',
    aboutSite: '关于本站',
    aboutProject: '关于本项目',
  },
} as const)

interface NavItem {
  label: string
  href: string
  external?: boolean
}

// 桌面端不重复主页入口：左上角「鹿巢」就是回主页的入口
const desktopNav = computed((): NavItem[] => [
  { label: $t.value.posts, href: '/posts' },
  { label: $t.value.thinking, href: '/thinking' },
])

// 「三」面板里没有常驻的 logo，所以主页要单独列出来
const mobileNav = computed((): NavItem[] => [
  { label: $t.value.home, href: '/' },
  { label: $t.value.posts, href: '/posts' },
  { label: $t.value.thinking, href: '/thinking' },
])

const moreNav = computed((): NavItem[] => [
  { label: $t.value.projects, href: '/projects' },
  { label: $t.value.favorites, href: '/favorites' },
  { label: $t.value.photos, href: '/photos' },
])

const aboutNav = computed((): NavItem[] => [
  { label: $t.value.about, href: '/about' },
  { label: $t.value.aboutSite, href: '/history' },
  { label: $t.value.aboutProject, href: 'https://github.com/Lu-Jiejie/blog', external: true },
])

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
  { id: 'more', label: $t.value.more, items: moreNav.value, active: groupActive(moreNav.value) },
  { id: 'about', label: $t.value.aboutGroup, items: aboutNav.value, active: groupActive(aboutNav.value) },
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

const themeIcon = computed(() => isDark.value ? 'i-ri-moon-line' : 'i-ri-sun-line')
const themeLabel = computed(() => isDark.value ? 'Switch to light theme' : 'Switch to dark theme')
const langIcon = computed(() => isZh.value ? 'i-icon-park-twotone-chinese' : 'i-icon-park-twotone-english')

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
  <header z-40 flex items-center gap-6 min-h-[2rem] p="x-8 t-7 b-8" lt-md:px-7>
    <RouterLink to="/" class="typewriter-logo shrink-0" aria-label="Home">
      <AppLogo />
    </RouterLink>

    <div flex items-center justify-end gap-5 w-full>
      <!-- hidden / flex 必须写在 class 里；裸写 hidden 是 HTML 属性，会被 preflight 的 [hidden] 规则压成 display:none -->
      <nav class="hidden nav:flex items-center gap-6" aria-label="Main menu">
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
            :class="openMenu === menu.id && 'nav-link-active'"
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
              flex="~ col" min-w-40 py-2 rounded-lg border="~ base"
              bg="[var(--c-bg)]"
              shadow="[0_4px_24px_rgba(0,0,0,0.1)] dark:[0_4px_24px_rgba(0,0,0,0.4)]"
            >
              <component
                :is="item.external ? 'a' : RouterLink"
                v-for="item in menu.items"
                :key="item.href"
                v-bind="linkProps(item)"
                class="nav-link px-4 py-1.5 whitespace-nowrap"
                :class="isActive(item.href) && 'nav-link-active'"
              >
                {{ item.label }}
                <span v-if="item.external" i-ri-arrow-right-up-line text-12px op-50 />
              </component>
            </div>
          </div>
        </div>
      </nav>

      <!-- 文字导航与图标工具区之间的竖线；窄屏整组隐藏，所以线也一起隐藏 -->
      <div class="hidden nav:block w-px h-4 shrink-0 bg-[#8883]" aria-hidden="true" />

      <div class="hidden nav:flex items-center gap-4">
        <button
          type="button"
          class="nav-link flex items-center justify-center w-[1.2em] h-[1.2em]"
          :aria-label="themeLabel"
          @click="toggleDark()"
        >
          <div :class="themeIcon" />
        </button>
        <button
          type="button"
          class="nav-link flex items-center justify-center w-[1.2em] h-[1.2em]"
          aria-label="Switch language"
          @click="toggleLang"
        >
          <div :class="langIcon" />
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
        aria-label="Open menu"
        :aria-expanded="menuOpen"
        @click="menuOpen = true"
      >
        <div i-ri-menu-line text-lg />
      </button>
    </div>

    <UiBackdrop :visible="menuOpen" @close="menuOpen = false">
      <!-- 与 TocPanel 一致：自身 fixed 定位，w-[90%] 才是相对视口，否则会按 backdrop 的 flex 子项收缩 -->
      <nav
        fixed z-200
        top="[10%]" left="1/2" un-translate="x--1/2"
        w="[90%]"
        rounded-md overflow-y-auto select-none
        flex="~ col" bg="[var(--c-bg)]"
        shadow="[0_0_10px_0_rgba(0,0,0,0.3)] dark:[0_0_10px_0_rgba(255,255,255,0.3)]"
        transition="opacity duration-300"
        :class="menuOpen ? 'op-100' : 'op-0 pointer-events-none'"
        aria-label="Menu"
        style="max-height: calc(100vh - 10% - 30%);"
      >
        <!-- 分隔线挂在无透明度的包裹层上：nav-link 的 op-60/100 会连 border 一起变浅变深 -->
        <div v-for="item in mobileNav" :key="item.href" class="mx-5 border-b border-[#8883]">
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
          class="mx-5 pt-3 pb-2.5 border-t border-[#8883]"
        >
          <div class="text-xs uppercase tracking-wider op-30" :class="menu.active && 'op-60'">
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
              <span v-if="item.external" i-ri-arrow-right-up-line text-12px op-50 />
            </component>
          </div>
        </div>

        <!-- 主题与语言刻意不关闭面板，方便连续调整观察效果 -->
        <div class="mx-5 flex justify-center items-center gap-4 py-3 border-t border-[#8883]">
          <button
            type="button"
            class="nav-link p-1 flex items-center justify-center"
            :aria-label="themeLabel"
            @click="toggleDark()"
          >
            <div :class="themeIcon" text-lg />
          </button>
          <button
            type="button"
            class="nav-link p-1 flex items-center justify-center"
            aria-label="Switch language"
            @click="toggleLang"
          >
            <div :class="langIcon" text-lg />
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
          <a href="/feed.xml" class="nav-link p-1" aria-label="RSS">
            <div i-ri-rss-line text-lg />
          </a>
        </div>
      </nav>
    </UiBackdrop>
  </header>
</template>

<style scoped>
.nav-link {
  --uno: op-60 hover-op-100 transition-opacity duration-300 cursor-pointer;
}

.nav-link-active {
  --uno: op-100;
}

.typewriter-logo {
  font-size: 1.1rem;
  font-weight: 500;
  --uno: op-70 hover-op-100 transition-opacity duration-300;
}
</style>
