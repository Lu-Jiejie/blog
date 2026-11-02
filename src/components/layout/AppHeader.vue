<script setup lang="ts">
import { useEventListener, useTimeoutFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import UiBackdrop from '~/components/ui/UiBackdrop.vue'
import { useI18n } from '~/logic/i18n'

const route = useRoute()

const $t = useI18n({
  en: {
    home: 'Home',
    posts: 'Posts',
    thinking: 'Thinking',
    more: 'More',
    projects: 'Projects',
    favorites: 'Favorites',
    photos: 'Photos',
    about: 'About me',
    history: 'History',
  },
  zh: {
    home: '首页',
    posts: '文章',
    thinking: '随想',
    more: '更多',
    projects: '项目',
    favorites: '收藏',
    photos: '相册',
    about: '关于我',
    history: '历史',
  },
})

const mainNav = computed(() => [
  { label: $t.value.home, href: '/' },
  { label: $t.value.posts, href: '/posts' },
  { label: $t.value.thinking, href: '/thinking' },
])

const moreNav = computed(() => [
  { label: $t.value.projects, href: '/projects' },
  { label: $t.value.favorites, href: '/favorites' },
  { label: $t.value.photos, href: '/photos' },
  { label: $t.value.about, href: '/about' },
  { label: $t.value.history, href: '/history' },
])

function isActive(href: string) {
  return href === '/' ? route.path === '/' : route.path.startsWith(href)
}

// 悬停有 80ms 进入延迟和 150ms 离开延迟，避免指针划过时面板闪动
const moreOpen = ref(false)
const { start: scheduleOpen, stop: cancelOpen } = useTimeoutFn(() => (moreOpen.value = true), 80)
const { start: scheduleClose, stop: cancelClose } = useTimeoutFn(() => (moreOpen.value = false), 150)

function onMoreEnter() {
  cancelClose()
  scheduleOpen()
}
function onMoreLeave() {
  cancelOpen()
  scheduleClose()
}

function onMoreFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (!next || !(e.currentTarget as HTMLElement).contains(next))
    moreOpen.value = false
}

const menuOpen = ref(false)

watch(() => route.fullPath, () => {
  moreOpen.value = false
  menuOpen.value = false
})

useEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    moreOpen.value = false
    menuOpen.value = false
  }
})
</script>

<template>
  <header z-40 flex items-center min-h-[2rem] p="x-8 t-7 b-8" lt-md:px-7>
    <!-- 固定定位，滚到任何位置都能点回主页 -->
    <RouterLink to="/" class="typewriter-logo fixed left-8 top-7 z-40 lt-md:left-7" aria-label="Home">
      <AppLogo />
    </RouterLink>

    <div flex items-center justify-end gap-5 w-full>
      <!-- hidden / flex 必须写在 class 里；裸写 hidden 是 HTML 属性，会被 preflight 的 [hidden] 规则压成 display:none -->
      <nav class="hidden nav:flex items-center gap-6" aria-label="Main menu">
        <RouterLink
          v-for="item in mainNav"
          :key="item.href"
          :to="item.href"
          class="nav-link"
          :class="isActive(item.href) && 'nav-link-active'"
        >
          {{ item.label }}
        </RouterLink>

        <div relative @pointerenter="onMoreEnter" @pointerleave="onMoreLeave">
          <button
            type="button"
            class="nav-link"
            :class="moreOpen && 'nav-link-active'"
            aria-haspopup="true"
            :aria-expanded="moreOpen"
            @focusin="moreOpen = true"
          >
            {{ $t.more }}
          </button>

          <!-- 面板与触发器同在一个 relative 容器内，pt-2 作为悬停桥 -->
          <div
            absolute top-full right-0 pt-2 z-50
            transition="all duration-150" ease-out
            :class="moreOpen ? 'op-100 translate-y-0' : 'op-0 -translate-y-1 invisible'"
            @focusout="onMoreFocusOut"
          >
            <div
              flex="~ col" min-w-40 py-2 rounded-lg border="~ base"
              bg="[var(--c-bg)]"
              shadow="[0_4px_24px_rgba(0,0,0,0.1)] dark:[0_4px_24px_rgba(0,0,0,0.4)]"
            >
              <RouterLink
                v-for="item in moreNav"
                :key="item.href"
                :to="item.href"
                class="nav-link px-4 py-1.5 whitespace-nowrap"
                :class="isActive(item.href) && 'nav-link-active'"
              >
                {{ item.label }}
              </RouterLink>
            </div>
          </div>
        </div>
      </nav>

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
        <!-- 条目用 mx-5 内缩：分隔线两端留白，文字左缘正好压在线的起点上 -->
        <RouterLink
          v-for="item in mainNav"
          :key="item.href"
          :to="item.href"
          class="nav-link mx-5 py-2.5 border-b border-[#8883]"
          :class="isActive(item.href) && 'nav-link-active'"
          @click="menuOpen = false"
        >
          {{ item.label }}
        </RouterLink>

        <!-- More 只是分组标签，不可点，所以压到比链接更淡的小字；子项与一级链接同尺寸 -->
        <div class="mx-5 pt-3 pb-2.5">
          <div class="text-xs uppercase tracking-wider op-30" :class="moreNav.some(i => isActive(i.href)) && 'op-60'">
            {{ $t.more }}
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-2 mt-2">
            <RouterLink
              v-for="item in moreNav"
              :key="item.href"
              :to="item.href"
              class="nav-link whitespace-nowrap"
              :class="isActive(item.href) && 'nav-link-active'"
              @click="menuOpen = false"
            >
              {{ item.label }}
            </RouterLink>
          </div>
        </div>

        <div class="mx-5 flex justify-center items-center gap-4 py-3 border-t border-[#8883]">
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
}
</style>
