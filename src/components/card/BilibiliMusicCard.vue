<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl } from '~/logic'

// B站收藏夹数据API
const API = getGithubCDNUrl({
  owner: 'Lu-Jiejie',
  repo: 'static',
  path: 'data/bilibili.json',
})

// 定义音乐视频的数据结构
interface MusicVideo {
  title: string
  cover: string
  bvid: string
  intro: string
  id: number
  link: string
  duration: number
  stats: {
    collect: number
    play: number
    danmaku: number
    view_text_1: string
  }
}

const musicVideo = ref<MusicVideo | null>(null)
const cover = ref<string | null>(null)
const isLoading = ref(true)

const prepared = computed(() => {
  return musicVideo.value !== null && cover.value !== null
})

async function fetchFavoriteMusic() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`)
    }

    const data = await response.json()

    if (data.musicLiked && data.musicLiked.length > 0) {
      musicVideo.value = data.musicLiked[0]
      cover.value = getGithubCDNUrl({
        owner: 'lu-jiejie',
        repo: 'static',
        path: `data/bilibili/${musicVideo.value?.bvid}.jpg`,
      })
    }
  }
  catch (err) {
    console.error('获取B站收藏音乐失败:', err)
    musicVideo.value = null
    cover.value = null
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchFavoriteMusic()
})
</script>

<template>
  <CardTemplate
    title="Songs I'm Enjoying on Bilibili"
    icon="i-streamline-ultimate-bilibili-logo-bold color-hex-00A1D6"
    :prepared="prepared"
  >
    <a
      :href="musicVideo!.link" target="_blank"
      class="no-prose"
      flex="~ col"
    >
      <img
        :src="cover!" :alt="musicVideo!.title"
        w-full h-full object-cover rounded-md important-m-0
      >

      <div
        class="title"
        mt-2 line-clamp-2 leading-tight
      >
        {{ musicVideo!.title }}
      </div>
    </a>
  </CardTemplate>
</template>

<style scoped>
a .title {
  --uno: op-85 transition;
}
a:hover .title {
  --uno: op-100;
}
</style>
