<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  title: '相片 - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: 'Lu Jiejie 的相片',
    },
  ],
})

const contents = [
  '摄影，也许是人类记录生活最朴素的方式。',
  '它简单，直接，却能定格瞬间。',
  '我虽并非专业摄影师，却也想留住眼中的美好。',
]
</script>

<template>
  <div class="prose" max-width-[var(--prose-max-width)] m-auto mb-8>
    <h1 text-4xl>
      相片
    </h1>
  </div>
  <div class="prose" max-width-[var(--prose-max-width)] m-auto mb-8>
    <p v-for="(c, cidx) in contents" :key="cidx" v-html="c" />
  </div>
  <PhotoGallery />
</template>
