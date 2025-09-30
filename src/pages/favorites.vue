<script setup lang="ts">
import { useHead } from '@vueuse/head'
import { favorites } from '~/data/favorites'
import { useI18n } from '~/logic/i18n'

useHead({
  title: 'Favorites - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: 'Favorites curated by Lu Jiejie',
    },
  ],
})

const $t = useI18n({
  en: {
    title: 'Favorites',
    contents: [
      'Here I collect works that have touched me — for memory, for sharing, and for the joy of resonance.',
      'What you see here is just a small part of the many favorites that have accompanied me along the way.',
    ],
  },
  zh: {
    title: '收藏',
    contents: [
      '这里收录了那些曾打动我的作品——为记忆，为分享，也为共鸣的喜悦。',
      '呈现于此的，只是旅途中陪伴我的众多作品之一角。',
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
    <ListFavorites :favorites="favorites" />
  </div>
</template>
