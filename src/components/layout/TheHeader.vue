<script setup lang="ts">
import { toggleDark } from '~/logic'
</script>

<template>
  <header z-40>
    <!-- <img src="/icon-dark.png" class="h-100% w-auto object-cover block" alt=""> -->

    <nav
      flex w="100%" items-center
      print:op-0 select-none p-8 box-border
    >
      <div flex-1 />
      <div class="right" flex items-center gap-4>
        <RouterLink to="/posts" title="文章">
          <span lt-md:hidden>文章</span>
          <div i-ri-article-line md:hidden />
        </RouterLink>
        <RouterLink to="/projects" title="项目">
          <span lt-md:hidden>项目</span>
          <div i-ri-git-repository-line md:hidden />
        </RouterLink>

        <a href="https://github.com/Lu-Jiejie" target="_blank" title="GitHub">
          <div i-carbon-logo-github />
        </a>
        <a href="/feed.xml" target="_blank" title="订阅源">
          <div i-ri-rss-line />
        </a>
        <a title="切换主题" @click.prevent="toggleDark()">
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
