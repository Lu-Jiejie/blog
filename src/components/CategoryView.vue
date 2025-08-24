<script setup lang="ts">
const { category } = defineProps<{
  category?: string
}>()

const categories = [
  { name: 'all', label: 'All Posts' },
  { name: 'essays', label: 'Essays' },
  { name: 'notes', label: 'Notes' },
]
</script>

<template>
  <div class="prose" m-auto>
    <CategorySubNav :categories="categories" />

    <ListPosts :category="category" :categories="categories" />
  </div>
</template>

<style scoped></style>
