<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getGithubCDNUrl, useStorageByUTC } from '~/logic'

interface AnimeItem {
  id: number
  date: string
  name: string
  name_cn: string
  summary: string
  tags: {
    name: string
    count: number
  }
  pic: string
  updated_at: string
}

interface BangumiInfo {
  watching: AnimeItem[]
  watched: AnimeItem[]
  toWatch: AnimeItem[]
}

const API = getGithubCDNUrl({
  owner: 'lu-jiejie',
  repo: 'static',
  path: 'data/bangumi.json',
})
const CACHE_KEY = 'anime-recent-watching'
const storage = useStorageByUTC<BangumiInfo>(CACHE_KEY)
const prepared = computed(() => storage.value !== null)

const watchingList = computed(() => {
  if (!storage.value)
    return []
  return storage.value.watching.slice(0, 6)
})

async function fetchBangumi() {
  try {
    const response = await fetch(API)
    if (!response.ok)
      throw new Error('Network response was not ok')
    const data = await response.json()
    return data as BangumiInfo
  }
  catch (err) {
    console.error('Failed to fetch bangumi:', err)
    return null
  }
}

onMounted(async () => {
  if (!prepared.value) {
    const data = await fetchBangumi()
    if (data)
      storage.value = data
  }
})
</script>

<template>
  <CardTemplate
    title="Anime Watching"
    icon="i-simple-icons-bilibili color-hex-00A1D6"
    :prepared="prepared"
  >
    <template v-if="prepared">
      <div grid="~ cols-1 sm:cols-2 gap-2" mt-2>
        <a
          v-for="item in watchingList" :key="item.id" :title="item.name"
          :href="`https://bgm.tv/subject/${item.id}`" target="_blank" rel="noopener noreferrer"
          class="item" flex="~" h-16 box-content p-2
          cursor-pointer bg-card-item-link
          rounded-md transition important-op-100
        >
          <div w-16 h-16 flex-shrink-0 flex items-center justify-center>
            <img :src="item.pic" alt="cover" w-full h-full object-cover rounded-sm shadow-sm>
          </div>
          <div flex="~ col justify-center" ml-2 h-full overflow-hidden>
            <span class="name" op-80 transition leading-tight mb-1>
              {{ item.name }}
            </span>
            <!-- <span text-sm op-60 text-truncate leading-tight mb-1>
              {{ item.summary }}
            </span>
            <span text-sm op-40 text-truncate leading-tight>
              {{ formatDate(item.date) }}
            </span> -->
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
