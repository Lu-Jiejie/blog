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
  <header z-40 flex items-center gap-6 p="x-8 t-7 b-8" lt-md:px-7>
    <RouterLink to="/" class="typewriter-logo" lg:fixed !>
      <AppLogo />
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
        <UiLink href="https://github.com/Lu-Jiejie" external title="GitHub">
          <div i-uil-github-alt scale-96 />
        </UiLink>
        <UiLink href="/feed.xml" external title="RSS" lt-sm:hidden>
          <div i-la-rss-square scale-115 />
        </UiLink>
        <a title="Toggle Theme Mode" @click.prevent="toggleDark()">
          <div i-ri-sun-line dark:i-ri-moon-line scale-95 />
        </a>
        <AppMusicPlayer />
      </div>
    </nav>
  </header>
</template>

<style scoped>
a {
  --uno: op-60 hover-op100 transition-opacity duration-300 cursor-pointer;
}

.typewriter-logo {
  font-size: 1.1rem;
  font-weight: 500;
}
</style>
