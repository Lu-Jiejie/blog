<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { formatDate, getGithubCDNUrl, useStorageByUTC } from '~/logic'

interface GameItem {
  id: string
  name: string
  nameCN: string
  playtimeForever: number
  playtime2Weeks: number
  timeLastPlayed: number
  icon: string
}

const { limit = 6 } = defineProps<{
  limit?: number
}>()

const API = getGithubCDNUrl({
  owner: 'lu-jiejie',
  repo: 'static',
  path: 'data/steam.json',
})
const CACHE_KEY = 'games-recent-played'
const storage = useStorageByUTC<GameItem[]>(CACHE_KEY)

async function fetchRecentGames() {
  try {
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = (await response.json()).games as GameItem[]

    return data
  }
  catch (err) {
    console.error('Failed to fetch recent games:', err)
    return null
  }
}

const prepared = computed(() => {
  return storage.value !== null
})

const formatGames = computed(() => {
  if (!storage.value) {
    return []
  }

  return [...storage.value].sort((a, b) => {
    return b.timeLastPlayed - a.timeLastPlayed
  }).filter(i => i.playtimeForever > 1000).slice(0, limit)
})

onMounted(async () => {
  const loadRecentGames = async () => {
    try {
      if (storage.value === null) {
        const data = await fetchRecentGames()
        if (data) {
          storage.value = data
        }
      }
    }
    catch {
    }
  }
  await loadRecentGames()
})
</script>

<template>
  <CardTemplate
    title="Games Recently Played"
    icon="i-simple-icons-steam color-hex-04699D"
    :prepared="prepared"
  >
    <template v-if="prepared">
      <div grid="~ cols-1  gap-2" mt-2>
        <a
          v-for="item in formatGames" :key="item.id" :title="item.name"
          :href="`https://store.steampowered.com/app/${item.id}`" target="_blank" rel="noopener noreferrer"
          class="item" flex="~" h-16 box-content p-2
          cursor-pointer bg-card-item-link
          rounded-md transition important-op-100
        >
          <div flex-shrink-0>
            <img
              :src="item.icon" alt="cover"
              important-m-0 rounded-sm h-full
            >
          </div>
          <div flex="~ col justify-center" ml-2 h-full overflow-hidden>
            <span class="name" op-80 text-truncate transition leading-tight mb-1.5>
              {{ item.name }}
            </span>
            <span text-sm op-60 text-truncate leading-tight mb-1>
              Playtime:
              <span op-70>{{ (item.playtimeForever / 60).toFixed(1) }} hours</span>
            </span>
            <span text-sm op-60 text-truncate leading-tight>
              Last Played:
              <span op-70>{{ formatDate(item.timeLastPlayed * 1000) }}</span>
            </span>
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
