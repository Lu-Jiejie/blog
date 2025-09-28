<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { useI18n } from '~/logic/i18n'

useHead({
  title: 'Photos - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: 'Selection of photos by Lu Jiejie',
    },
  ],
})

const $t = useI18n({
  en: {
    title: 'Photos',
    contents: [
      'Photography may be the simplest way for humans to record life.',
      'It is straightforward and direct, yet it captures the moment.',
      'Though I am not a professional photographer, I still want to preserve the beauty I see.',
    ],
  },
  zh: {
    title: '相片',
    contents: [
      '摄影，也许是人类记录生活最朴素的方式。',
      '它简单，直接，却能定格瞬间。',
      '我虽并非专业摄影师，却也想留住眼中的美好。',
    ],
  },
} as const)
</script>

<template>
  <div class="prose" max-width-70ch m-auto mb-8>
    <h1 text-4xl>
      {{ $t.title }}
    </h1>
  </div>
  <div class="prose" max-width-70ch m-auto mb-8>
    <p v-for="(c, cidx) in $t.contents" :key="cidx" v-html="c" />
  </div>
  <PhotoGallery />
</template>
