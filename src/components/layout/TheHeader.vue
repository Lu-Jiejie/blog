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
          <span lt-md:hidden>Me</span>
          <div i-carbon-home md:hidden />
        </RouterLink>
        <RouterLink to="/posts" title="Posts">
          <span lt-md:hidden>Posts</span>
          <div i-ri-article-line md:hidden />
        </RouterLink>
        <RouterLink to="/projects" title="Projects">
          <span lt-md:hidden>Projects</span>
          <div i-ri-lightbulb-line md:hidden />
        </RouterLink>
        <RouterLink to="/media" title="Media">
          <span lt-md:hidden>Media</span>
          <div i-mingcute-film-line md:hidden />
        </RouterLink>
        <!-- <RouterLink to="/tags" title="标签">
          <span lt-md:hidden>标签</span>
          <div i-carbon-tag md:hidden />
        </RouterLink> -->

        <a href="https://github.com/Lu-Jiejie" target="_blank" title="GitHub">
          <div i-carbon-logo-github />
        </a>
        <a href="/feed.xml" target="_blank" title="RSS" lt-md:hidden>
          <div i-la-rss-square style="font-size: 1.3rem; margin: -0.13rem -0.13rem;" />
        </a>
        <a title="Toggle Theme Mode" @click.prevent="toggleDark()">
          <div i-ri-sun-line dark:i-ri-moon-line />
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
