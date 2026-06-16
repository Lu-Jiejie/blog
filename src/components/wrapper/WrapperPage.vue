<script setup lang="ts">
import { usePageHead } from '~/composables/usePageHead'

interface Props {
  frontmatter?: {
    title?: string
    description?: string
  }
}

const props = defineProps<Props>()

// 设置页面标题
usePageHead({
  title: props.frontmatter?.title,
  description: props.frontmatter?.description,
})
</script>

<template>
  <div class="prose" max-width-70ch m-auto mb-8 text-center>
    <h1 v-if="frontmatter?.title" text-4xl>
      {{ frontmatter?.title }}
    </h1>
    <p v-if="frontmatter?.description" m="t--4!" op-60 italic>
      {{ frontmatter?.description }}
    </p>
  </div>

  <article m-auto>
    <slot />
  </article>
</template>
