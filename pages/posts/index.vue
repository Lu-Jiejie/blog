<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isZh } from '~/logic/i18n'

type CategoryType = 'all' | 'essays' | 'notes'

const route = useRoute()
const type = computed<CategoryType>(() => {
  return route.query.type as CategoryType || 'all'
})

const categories = [
  { name: 'all', label: 'All Posts', labelZh: '所有' },
  { name: 'essays', label: 'Essays', labelZh: '随笔' },
  { name: 'notes', label: 'Notes', labelZh: '笔记' },
]

const metaMap: Record<CategoryType, { title: string, description: string }> = {
  all: {
    title: 'All Posts - Lu Jiejie',
    description: 'All posts by Lu Jiejie.',
  },
  essays: {
    title: 'Essays - Lu Jiejie',
    description: 'Essays by Lu Jiejie.',
  },
  notes: {
    title: 'Notes - Lu Jiejie',
    description: 'Notes by Lu Jiejie.',
  },
}

useHead(computed(() => ({
  title: metaMap[type.value].title,
  meta: [
    { name: 'description', content: metaMap[type.value].description },
  ],
})))
</script>

<template>
  <div m-auto class="prose">
    <div
      flex="~ wrap row gap-3"
      m-auto mb-8 select-none text-3xl
    >
      <template v-for="c in categories" :key="c.name">
        <RouterLink
          :to="{ query: { type: c.name } }"
          :class="type === c.name ? 'op-100' : 'op-20 hover:op-50'"
          important-border-none
        >
          {{ isZh ? c.labelZh : c.label }}
        </RouterLink>
      </template>
    </div>

    <ListPosts :categories="categories" :type="type" :key="type" />
  </div>
</template>
