<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { toggleDark } from '~/logic'
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
          <span lt-sm:hidden>Me</span>
          <div i-icon-park-outline-home sm:hidden scale-x-110 />
        </RouterLink>
        <RouterLink to="/posts" title="Posts">
          <span lt-sm:hidden>Posts</span>
          <div i-icon-park-outline-align-text-right-one sm:hidden />
        </RouterLink>
        <RouterLink to="/projects" title="Projects">
          <span lt-sm:hidden>Projects</span>
          <div i-icon-park-outline-blocks-and-arrows sm:hidden scale-y-95 />
        </RouterLink>
        <RouterLink to="/media" title="Media">
          <span lt-sm:hidden>Media</span>
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
