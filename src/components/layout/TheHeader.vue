<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { toggleDark } from '~/logic'
import { useI18n } from '~/logic/i18n'

const $t = useI18n({
  en: {
    me: 'Me',
    posts: 'Posts',
    projects: 'Projects',
    media: 'Media',
  },
  zh: {
    me: '我',
    posts: '文章',
    projects: '项目',
    media: '媒介',
  },
})
</script>

<template>
  <header>
    <nav
      flex w="100%" items-center z-40 text-lg
      print:op-0 select-none p-8 box-border
    >
      <div flex-1 />
      <div class="right" flex items-center gap-4>
        <RouterLink to="/" title="Me">
          <span lt-sm:hidden>{{ $t.me }}</span>
          <div i-icon-park-outline-home sm:hidden scale-x-110 />
        </RouterLink>
        <RouterLink to="/posts" title="Posts">
          <span lt-sm:hidden>{{ $t.posts }}</span>
          <div i-icon-park-outline-align-text-right-one sm:hidden />
        </RouterLink>
        <RouterLink to="/projects" title="Projects">
          <span lt-sm:hidden>{{ $t.projects }}</span>
          <div i-icon-park-outline-blocks-and-arrows sm:hidden scale-y-95 />
        </RouterLink>
        <RouterLink to="/media" title="Media">
          <span lt-sm:hidden>{{ $t.media }}</span>
          <div i-icon-park-outline-film sm:hidden scale-y-95 />
        </RouterLink>

        <a href="https://github.com/Lu-Jiejie" target="_blank" title="GitHub">
          <div i-icon-park-outline-github-one scale-95 />
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
.right > a {
  --uno: op-60 hover-op100 transition duration-200 ease cursor-pointer;
}
</style>
