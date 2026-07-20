<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl, imgProxy } from '~/logic'

interface MusicItem {
  name: string
  artist: string
  album: string
  pic: string
  id: number
  url: string
  score: number
}

const { limit = 6 } = defineProps<{
  limit?: number
}>()

const API = getGithubCDNUrl({
  owner: 'Lu-Jiejie',
  repo: 'static',
  path: 'data/netease/favorite.json',
})

const musicData = ref<MusicItem[] | null>(null)
const isLoading = ref(true)

const prepared = computed(() => {
  return musicData.value !== null
})

async function fetchMusicList() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const res = (await response.json()) as MusicItem[]
    musicData.value = res
    return res
  }
  catch (err) {
    console.error('Failed to fetch music list:', err)
    return null
  }
  finally {
    isLoading.value = false
  }
}

const list = computed(() => {
  if (!musicData.value) {
    return []
  }
  return musicData.value.slice(0, limit)
})

onMounted(async () => {
  await fetchMusicList()
})
</script>

<template>
  <CardTemplate
    title="Songs I'm Enjoying"
    title-zh="我最近喜欢的音乐"
    icon="i-simple-icons-neteasecloudmusic color-hex-FC3D49"
    :prepared="!isLoading && prepared"
  >
    <template v-if="prepared">
      <div grid="~ cols-1 sm:cols-2 gap-x-3 gap-y-1">
        <Link
          :href="item.url" external
          v-for="(item, index) in list" :key="index" :title="`${item.name} - ${item.artist}`"
          class="entry" flex="~ items-center gap-3" p-1.5
          cursor-pointer rounded-md overflow-hidden
          transition-colors duration-300 important-op-100
          hover="bg-hex-8882"
        >
          <img
            :src="imgProxy(`${item.pic}?param=100y100`)" alt="cover"
            w-13 h-13 flex-shrink-0 object-cover rounded-sm important-m-0
          >
          <div flex="~ col justify-center" min-w-0 flex-1>
            <span class="name" op-85 transition text-truncate leading-snug>{{ item.name }}</span>
            <span text-sm op-45 text-truncate leading-snug mt-1>{{ item.artist }} · {{ item.album }}</span>
          </div>
        </Link>
      </div>
    </template>
  </CardTemplate>
</template>

<style scoped>
a:hover .name {
  --uno: op-100;
}
</style>
