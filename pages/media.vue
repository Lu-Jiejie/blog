<script setup lang="ts">
import { media } from '~/data/media'
import { useI18n } from '~/logic/i18n'

const $t = useI18n({
  en: {
    title: 'Media Consumption',
    contents: [
      'This page simply records the media I’ve enjoyed — partly for my own memory, partly to share what resonates with me.',
      'What’s listed here is but a small selection of what I’ve enjoyed.',
    ],
  },
  zh: {
    title: '媒介消费',
    contents: [
      '这个页面用来记录我所喜爱的媒介——既是为了自己的回忆，也希望能分享那些令我共鸣的内容。',
      '这里展示的只是我所喜爱的众多内容中的一小部分。',
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
