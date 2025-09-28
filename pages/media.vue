<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { media } from '~/data/media'
import { useI18n } from '~/logic/i18n'

useHead({
  title: 'Media Consumption - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: 'Media consumed by Lu Jiejie',
    },
  ],
})

const $t = useI18n({
  en: {
    title: 'Media Consumption',
    contents: [
      'Here I gather the media that once moved me — for memory, for sharing, for the joy of resonance.',
      'What’s recorded is but a glimpse of the many works that have accompanied me along the way.',
    ],
  },
  zh: {
    title: '媒介消费',
    contents: [
      '这里收录了那些曾打动我的作品——为记忆，为分享，也为共鸣的喜悦。',
      '所呈现的，不过是陪伴我旅途的众多作品中的一隅。',
    ],
  },
} as const)
</script>

<template>
  <div class="prose" m-auto mb-8>
    <h1>{{ $t.title }}</h1>
  </div>
  <div class="prose slide-enter-content" m-auto>
    <p v-for="(c, cidx) in $t.contents" :key="cidx" v-html="c" />
    <ListMedia :media="media" />
  </div>
</template>
