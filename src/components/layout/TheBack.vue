<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const needBackPath = ['/projects', '/category', '/posts']

const to = computed(() => {
  if (route.path.startsWith('/posts/')) {
    const historyState = window.history.state
    if (historyState && historyState.back && historyState.back.startsWith('/category/')) {
      return historyState.back
    }
    return `/category/${route.meta.frontmatter.category}`
  }

  return route.path.split('/').slice(0, -1).join('/') || '/'
})
</script>

<template>
  <div
    v-if="needBackPath.some(p => route.path.startsWith(p))"
    class="prose" select-none
    m="t-8 b-8" m-auto slide-enter animate-delay-500 print:hidden
  >
    <span op-50 mr-2> > </span>
    <RouterLink
      :to="to"
      op-50 hover:op-75 font-mono
    >
      {{ `cd ..` }}
    </RouterLink>
  </div>
</template>
