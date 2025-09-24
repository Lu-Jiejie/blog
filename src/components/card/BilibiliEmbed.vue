<script setup lang="ts">
defineProps<{
  bvid: string
  page?: number
  noScale?: boolean
}>()
</script>

<template>
  <div>
    <iframe
      class="aspect-16/9 w-full rounded-lg shadow"
      :src="`https://player.bilibili.com/player.html?bvid=${bvid}&page=${page || 1}&high_quality=1&danmaku=0&autoplay=0`"
      title="Bilibili video player"
      frameborder="true"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen="true"
    />
  </div>
</template>
