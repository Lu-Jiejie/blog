<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useExpireStorage } from '~/logic'

interface MusicItem {
  name: string
  artist: string
  url: string
  pic: string
  lrc: string
}

const props = defineProps<{
  favouriteListId: number
  limit: number
  title?: string
}>()

const API = 'https://api.injahow.cn/meting/'
const NETEASE_MUSIC_URL = 'https://music.163.com/#/song?id='
const CACHE_EXPIRY = 24 * 60 * 60 * 1000
const CACHE_KEY = 'recent-listens'
const list = useExpireStorage<MusicItem[]>(CACHE_KEY, CACHE_EXPIRY)

const prepared = computed(() => {
  return list.value !== null
})

function openURL(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

async function fetchMusicList(id: number) {
  try {
    const response = await fetch(`${API}?type=playlist&id=${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const res = (await response.json() as MusicItem[])
      .map(item => ({
        ...item,
        url: `${NETEASE_MUSIC_URL}${item.url.split('id=')[1]}`,
      }))
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
        const data = await fetchMusicList(props.favouriteListId)
        if (data) {
          list.value = data.slice(0, props.limit)
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
  <div slide-enter select-none font-sans>
    <span text-sm op-80 block ml-1>Recent Listens</span>
    <div
      grid="~ cols-1 sm:cols-2 gap-1"
    >
      <div
        @click="openURL(item.url)"
        v-for="(item, index) in list" :key="index" class="item"
        flex="~" h-16 box-content p-2
        cursor-pointer bg-hex-8882 hover:bg-hex-8883
        rounded-md transition
      >
        <div w-16 flex-shrink-0>
          <img
            :src="item.pic" alt="cover"
            important-m-0 rounded-md
          >
        </div>
        <div flex="~ col justify-center" ml-2 h-full overflow-hidden>
          <span text-truncate>{{ item.name }}</span>
          <span text-sm op-70 text-truncate>{{ item.artist }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
