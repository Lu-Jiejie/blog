<script setup lang="ts">
import { useHead } from '@vueuse/head'

useHead({
  title: 'All Posts - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: 'All posts by Lu Jiejie',
    },
  ],
})
</script>

<template>
  <CategoryView />
</template>
