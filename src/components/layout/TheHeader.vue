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
      <!-- <RouterLink to="/" title="鹿巢">
        <Logo
          h-7 op-75 hover:op-100 transition duration-400 ease
        />
      </RouterLink> -->
      <div flex-1 />
      <div class="right" flex items-center gap-4>
        <RouterLink to="/" title="Me">
          <span lt-md:hidden font-serif text-xl>Me</span>
          <div i-carbon-home md:hidden />
        </RouterLink>
        <RouterLink to="/category/all" title="Posts">
          <span lt-md:hidden font-serif text-xl>Posts</span>
          <div i-ri-article-line md:hidden />
        </RouterLink>
        <RouterLink to="/projects" title="Projects">
          <span lt-md:hidden font-serif text-xl>Projects</span>
          <div i-ri-git-repository-line md:hidden />
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
