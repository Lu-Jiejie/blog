<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const needTopPath = ['/posts/']
const needBackPath = ['/projects', '/media', '/posts']

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const to = computed(() => {
  if (route.path.startsWith('/posts/')) {
    if (typeof window !== 'undefined') {
      const historyState = window.history.state
      if (historyState && historyState.back && historyState.back.startsWith('/posts')) {
        return historyState.back
      }
    }
    return `/posts?type=${route.meta.frontmatter.type}`
  }

  return route.path.split('/').slice(0, -1).join('/') || '/'
})
</script>

<template>
  <div m="t-8 b-8">
    <div
      v-if="needTopPath.some(p => route.path.startsWith(p))"
      class="prose" select-none
      m-auto print:hidden mb-1
    >
      <span op-50 mr-2> > </span>
      <a
        :to="to" @click="toTop()"
        op-50 hover:op-75 font-mono cursor-pointer
      >
        {{ `top` }}
      </a>
    </div>
    <div
      v-if="needBackPath.some(p => route.path.startsWith(p))"
      class="prose" select-none
      m-auto print:hidden
    >
      <span op-50 mr-2> > </span>
      <RouterLink
        :to="to"
        op-50 hover:op-75 font-mono
      >
        {{ `cd ..` }}
      </RouterLink>
    </div>
  </div>
</template>
