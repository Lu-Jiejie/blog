<script setup lang="ts">
import type { Media } from '~/types'

const media: Media = {
  anime: [
    { name: '四月は君の嘘', creator: '新川直司' },
    { name: '葬送のフリーレン', creator: ['山田鐘人', 'アベツカサ'] },
    { name: 'ラブライブ!' },
    { name: 'ダンダダン', creator: '龍幸伸' },
  ],
  movie: [],
  book: [],
  manga: [],
  game: [],
}
</script>

<template>
  <div class="prose" m-auto mb-8>
    <h1>Media Consumption</h1>
  </div>
  <div class="prose slide-enter-content" m-auto>
    <p>This page simply records the media I’ve enjoyed — partly for my own memory, partly to share what resonates with me.</p>
    <p>What’s listed here is but a small selection of what I’ve enjoyed.</p>
    <ListMedia :media="media" />
  </div>
</template>
