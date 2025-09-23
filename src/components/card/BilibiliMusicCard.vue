<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getGithubCDNUrl } from '~/logic'

// B站收藏夹数据API
const API = getGithubCDNUrl({
  owner: 'lu-jiejie',
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
const error = ref<string | null>(null)

// 获取B站喜欢的音乐数据
async function fetchFavoriteMusic() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`)
    }

    const data = await response.json()

    if (data.musicLiked && data.musicLiked.length > 0) {
      // 获取第一个视频的信息
      musicVideo.value = data.musicLiked[0]
      cover.value = getGithubCDNUrl({
        owner: 'lu-jiejie',
        repo: 'static',
        path: `data/bilibili/${musicVideo.value?.bvid}.jpg`,
      })
    }
    else {
      error.value = '没有找到收藏的音乐'
    }
  }
  catch (err) {
    console.error('获取B站收藏音乐失败:', err)
    error.value = '加载失败，请稍后再试'
  }
  finally {
    isLoading.value = false
  }
}

// 格式化时长（秒转换为分:秒）
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  fetchFavoriteMusic()
})
</script>

<template>
  <CardTemplate title="Favorite Music on Bilibili" icon="i-carbon-music" :prepared="!isLoading">
    <div v-if="error" class="text-center text-sm op-50 py-2">
      {{ error }}
    </div>

    <div v-else-if="musicVideo" class="relative">
      <!-- 音乐卡片 -->
      <a
        :href="musicVideo.link" target="_blank"
        class="flex flex-col hover:op-80 transition duration-300"
      >
        <!-- 封面图片 -->
        <div class="relative aspect-video rounded-md overflow-hidden">
          <img :src="cover!" :alt="musicVideo.title" class="w-full h-full object-cover">
          <!-- 播放时长指示 -->
          <div class="absolute bottom-1 right-1 bg-black bg-op-60 text-white text-xs px-1 rounded">
            {{ formatDuration(musicVideo.duration) }}
          </div>
        </div>

        <!-- 标题和播放量 -->
        <div class="mt-2">
          <div class="text-sm font-medium line-clamp-2 leading-tight">
            {{ musicVideo.title }}
          </div>
          <div class="text-xs op-60 mt-1 flex items-center">
            <span class="i-ri-play-mini-fill mr-1" />
            {{ musicVideo.stats.view_text_1 }}
          </div>
        </div>
      </a>
    </div>

    <template #loading>
      <div class="flex items-center justify-center h-32 op-50">
        <div class="i-svg-spinners-180-ring-with-bg w-6 h-6" />
      </div>
    </template>
  </CardTemplate>
</template>
