<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl, imgProxy } from '~/logic'

const API = getGithubCDNUrl({
  owner: 'Lu-Jiejie',
  repo: 'static',
  path: 'data/bilibili/musicLiked.json',
})

const showPlayer = ref(false)

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
  return musicVideo.value !== null
})

async function fetchFavoriteMusic() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.length > 0) {
      musicVideo.value = data[0]
      // cover.value = getGithubCDNUrl({
      //   owner: 'lu-jiejie',
      //   repo: 'static',
      //   path: `data/bilibili/${musicVideo.value?.bvid}.jpg`,
      // })
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

const aspectRatio = ref('16 / 9')
function handleImgLoad(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.naturalWidth && img.naturalHeight) {
    aspectRatio.value = `${img.naturalWidth} / ${img.naturalHeight}`
  }
}

function togglePlayer(event: Event) {
  event.preventDefault()
  showPlayer.value = !showPlayer.value
}

onMounted(() => {
  fetchFavoriteMusic()
})
</script>

<template>
  <CardTemplate
    title="Songs I'm Enjoying on Bilibili"
    title-zh="我最近喜欢的音乐（哔哩哔哩）"
    icon="i-streamline-ultimate-bilibili-logo-bold color-hex-00A1D6"
    :prepared="prepared"
  >
    <div v-if="musicVideo">
      <div flex="~ col" class="no-prose">
        <!-- 播放器或缩略图 -->
        <div class="media-container" relative>
          <iframe
            v-if="showPlayer"
            :style="{ aspectRatio }"
            :src="`https://player.bilibili.com/player.html?bvid=${musicVideo.bvid}&p=1&autoplay=1&t=1`"
            title="Bilibili video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen w-full
          />

          <div v-else relative>
            <img
              @click="togglePlayer"
              @load="handleImgLoad"
              :src="imgProxy(musicVideo.cover)" :alt="musicVideo.title"
              w-full h-full object-cover rounded-md important-m-0
              class="cursor-pointer"
            >
            <div
              v-if="!showPlayer" @click="togglePlayer"
              class="play-overlay"
              absolute top-0 left-0 w-full h-full z-2 rounded-md
            >
              <div i-carbon-play-filled-alt class="play-icon" />
            </div>
          </div>
        </div>

        <!-- 标题始终显示 -->
        <div
          class="title"
          mt-2 line-clamp-2 leading-tight
        >
          {{ musicVideo.title }}
        </div>
      </div>
    </div>
  </CardTemplate>
</template>

<style scoped>
.play-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.media-container:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 3rem;
  color: white;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
  opacity: 0.9;
}
</style>
