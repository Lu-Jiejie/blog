<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

function getRandomBg() {
  const bgArr = ['dots', 'stars', 'particle', 'plum']
  return bgArr[Math.floor(Math.random() * bgArr.length)]
}

const routeBgMap: Record<string, string> = {
  '/': 'random',
  '/projects': 'dots',
  '/favorites': 'plum',
  '/posts': 'plum',
}

const BgComponent = computed(() => {
  let art = route.meta.frontmatter?.background || routeBgMap[route.path]

  if (art === undefined) {
    return undefined
  }
  if (art === 'random') {
    art = getRandomBg()
  }
  if (typeof window !== 'undefined') {
    switch (art) {
      case 'dots':
        return defineAsyncComponent(() => import('./Dots.vue'))
      case 'stars':
        return defineAsyncComponent(() => import('./Stars.vue'))
      case 'particle':
        return defineAsyncComponent(() => import('./Particle.vue'))
      case 'plum':
        return defineAsyncComponent(() => import('./Plum.vue'))
      default:
        return undefined
    }
  }

  return undefined
})
</script>

<template>
  <ClientOnly v-if="BgComponent">
    <component :is="BgComponent" />
  </ClientOnly>
</template>
