<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { projects } from '../data/projects'

useHead({
  title: 'Projects - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: 'Selection of projects by Lu Jiejie',
    },
  ],
})
</script>

<template>
  <ListProjects :projects="projects" />
</template>
