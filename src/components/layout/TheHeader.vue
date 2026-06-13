<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { toggleDark } from '~/logic'
import { useI18n } from '~/logic/i18n'

const $t = useI18n({
  en: {
    notes: 'Notes',
    essays: 'Essays',
    projects: 'Projects',
  },
  zh: {
    notes: '笔记',
    essays: '随笔',
    projects: '项目',
  },
})
</script>

<template>
  <header z-40 flex items-center gap-6 p="x-8 y-7" lt-md:p-7>
    <RouterLink to="/" scale-160 md:scale-190 translate-x-1 lg:fixed>
      <TheLogo />
    </RouterLink>
    <nav flex items-center w-full justify-end aria-label="Main menu">
      <div grid="~ flow-col items-center gap-4.5" print:op-0>
        <RouterLink to="/notes" title="Notes">
          <span lt-sm:hidden>{{ $t.notes }}</span>
          <div i-icon-park-outline-align-text-right-one sm:hidden />
        </RouterLink>
        <RouterLink to="/essays" title="Essays">
          <span lt-sm:hidden>{{ $t.essays }}</span>
          <div i-mingcute-quill-pen-ai-line sm:hidden />
        </RouterLink>
        <RouterLink to="/projects" title="Projects">
          <span lt-sm:hidden>{{ $t.projects }}</span>
          <div i-icon-park-outline-blocks-and-arrows sm:hidden scale-y-95 />
        </RouterLink>
        <RouterLink to="/favorites" title="Favorites">
          <div i-ri-film-line />
        </RouterLink>
        <RouterLink to="/photos" title="Photos">
          <div i-ri-camera-ai-line />
        </RouterLink>
        <div nav-divider aria-hidden="true" />
        <a href="https://github.com/Lu-Jiejie" target="_blank" title="GitHub">
          <div i-uil-github-alt scale-96 />
        </a>
        <a href="/feed.xml" target="_blank" title="RSS" lt-sm:hidden>
          <div i-la-rss-square scale-115 />
        </a>
        <a title="Toggle Theme Mode" @click.prevent="toggleDark()">
          <div i-ri-sun-line dark:i-ri-moon-line scale-95 />
        </a>
      </div>
    </nav>
  </header>
</template>

<style scoped>
a {
  --uno: op-60 hover-op100 transition-opacity duration-300 cursor-pointer;
}
</style>
