<script setup lang="ts">
import { usePageHead } from '~/composables/usePageHead'

interface Props {
  frontmatter?: {
    title?: string
    description?: string
    /** 宽幅页（如 projects）关闭 prose 列宽限制，由内容自行居中 */
    wide?: boolean
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
  <div class="prose" max-width-[var(--prose-max-width)] m-auto mb-8 text-center>
    <h1 v-if="frontmatter?.title" text-4xl>
      {{ frontmatter?.title }}
    </h1>
    <p v-if="frontmatter?.description" m="t--4!" op-60 italic>
      {{ frontmatter?.description }}
    </p>
  </div>

  <article m-auto :class="frontmatter?.wide ? '' : 'prose'">
    <slot />
  </article>
</template>
