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
      <RouterLink to="/" title="鹿巢">
        <Logo
          h-7 op-75 hover:op-100 transition duration-400 ease
        />
      </RouterLink>
      <div flex-1 />
      <div class="right" flex items-center gap-4>
        <RouterLink to="/category/notes" title="文章">
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
