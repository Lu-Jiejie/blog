<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getGithubCDNUrl, useStorageByUTC } from '~/logic'

interface MusicItem {
  name: string
  artist: string
  album: string
  pic: string
  id: number
  url: string
  score: number
}

const API = getGithubCDNUrl({
  owner: 'lu-jiejie',
  repo: 'static',
  path: 'data/netease.json',
})
const CACHE_KEY = 'songs-recent-played'
const list = useStorageByUTC<MusicItem[]>(CACHE_KEY)
const LIMIT = 6

const prepared = computed(() => {
  return list.value !== null
})

async function fetchMusicList() {
  try {
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const res = (await response.json()).recentPlayed as MusicItem[]
    return res
  }
  catch (err) {
    console.error('Failed to fetch music list:', err)
    return null
  }
}

onMounted(async () => {
  const loadMusicList = async () => {
    try {
      if (!prepared.value) {
        const data = await fetchMusicList()
        if (data) {
          list.value = data.slice(0, LIMIT)
        }
      }
    }
    catch {
    }
  }
  loadMusicList()
})
</script>

<template>
  <CardTemplate
    title="Songs Recently Played"
    icon="i-simple-icons-neteasecloudmusic color-hex-FC3D49"
    :prepared="prepared"
  >
    <template v-if="prepared">
      <div grid="~ cols-1 sm:cols-2 gap-2" mt-2>
        <a
          :href="item.url" target="_blank" rel="noopener noreferrer"
          v-for="(item, index) in list" :key="index" :title="`${item.name} - ${item.artist}`"
          class="item" flex="~" h-16 box-content p-2
          cursor-pointer bg-card-item-link
          rounded-md transition important-op-100
        >
          <div w-16 flex-shrink-0>
            <img
              :src="`${item.pic}?param=100y100`" alt="cover"
              important-m-0 rounded-sm
            >
          </div>
          <div flex="~ col justify-center" ml-2 h-full>
            <span
              class="name" op-80 transition mb-1 leading-tight text-truncate
            >{{ item.name }}</span>
            <span text-sm op-60 mb-1 leading-tight text-truncate>{{ item.album }}</span>
            <span text-sm op-40 leading-tight text-truncate>{{ item.artist }}</span>
          </div>
        </a>
      </div>
    </template>
  </CardTemplate>
</template>

<style scoped>
a:hover .name {
  --uno: op-100;
}
</style>
