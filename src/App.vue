<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <TheHeader />
  <main p="x-7 y-10" overflow-x-hidden>
    <RouterView />
    <TheFooter :key="route.path" />
  </main>
</template>
