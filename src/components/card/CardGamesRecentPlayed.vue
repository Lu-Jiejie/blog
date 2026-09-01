<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { formatDate, getGithubCDNUrl, imgProxy } from '~/logic'
import { isZh } from '~/logic/i18n'

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
  owner: 'Lu-Jiejie',
  repo: 'static',
  path: 'data/steam/games.json',
})

const gamesData = ref<GameItem[] | null>(null)
const isLoading = ref(true)

async function fetchRecentGames() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = (await response.json()) as GameItem[]
    gamesData.value = data
    return data
  }
  catch (err) {
    console.error('Failed to fetch recent games:', err)
    return null
  }
  finally {
    isLoading.value = false
  }
}

const prepared = computed(() => {
  return gamesData.value !== null
})

const formatGames = computed(() => {
  if (!gamesData.value) {
    return []
  }

  return [...gamesData.value].sort((a, b) => {
    return b.timeLastPlayed - a.timeLastPlayed
  }).filter(i => i.playtimeForever > 10).slice(0, limit)
})

onMounted(async () => {
  await fetchRecentGames()
})
</script>

<template>
  <CardTemplate
    title="Games I've Played Recently"
    title-zh="我最近玩的游戏"
    icon="i-simple-icons-steam color-hex-04699D"
    :prepared="!isLoading && prepared"
  >
    <template v-if="prepared">
      <div flex="~ col gap-1">
        <Link
          v-for="item in formatGames" :key="item.id" :title="isZh ? item.nameCN : item.name"
          :href="`https://store.steampowered.com/app/${item.id}`" external
          class="entry" flex="~ items-center gap-3" p-1.5
          cursor-pointer rounded-md overflow-hidden
          transition-colors duration-300 important-op-100
          hover="bg-hex-8882"
        >
          <img
            :src="imgProxy(item.icon)" alt="cover"
            h-11 w-auto flex-shrink-0 object-cover rounded-sm important-m-0
          >
          <div flex="~ col justify-center" min-w-0 flex-1>
            <span class="name" font-serif text-[15px] op-85 transition text-truncate leading-snug>
              {{ isZh ? item.nameCN : item.name }}
            </span>
            <span text-sm text-truncate leading-snug mt-1>
              <span class="playtime" op-60 tabular-nums>{{ (item.playtimeForever / 60).toFixed(1) }} hrs</span>
              <span op-35> · {{ formatDate(item.timeLastPlayed * 1000, false) }}</span>
            </span>
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
