<script setup lang="ts">
const { tags = [] } = defineProps<{
  tags: string [] | undefined
}>()
</script>

<template>
  <a
    v-for="tag in tags" :key="tag"
    mr-1 p="x-0.6 y-0.2" font-bold cursor-pointer op-80
  >#{{ tag }}</a>
</template>
