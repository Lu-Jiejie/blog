<script setup lang="ts">
import { usePageHead } from '~/composables/usePageHead'

interface Props {
  frontmatter?: {
    title?: string
    description?: string
  }
}

const props = defineProps<Props>()

usePageHead({
  title: props.frontmatter?.title,
  description: props.frontmatter?.description,
})
</script>

<template>
  <article m-auto>
    <slot />
  </article>
</template>
