<script setup lang="ts">
import { useRoute } from 'vue-router'

const { categories } = defineProps<{
  categories: Array<{ name: string, label: string }>
}>()
const route = useRoute()
const activeStyle = 'op-100'
const inactiveStyle = 'op-20 hover:op-50'
const basePath = '/category'
</script>

<template>
  <!-- flex="~ wrap col gap-1 sm:row sm:gap-3" -->
  <div
    flex="~ wrap row gap-3"
    m-auto mb-8 select-none text-4xl font-serif
  >
    <template v-for="c in categories" :key="c.name">
      <RouterLink
        :to="`${basePath}/${c.name}`"
        :class="route.path === `${basePath}/${c.name}` ? activeStyle : inactiveStyle"
        important-border-none
      >
        {{ c.label }}
      </RouterLink>
    </template>
  </div>
</template>
