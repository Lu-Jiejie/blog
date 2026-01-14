<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl, imgProxy } from '~/logic'
import { isZh } from '~/logic/i18n'

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

type BangumiInfo = AnimeItem[]

const { limit = 6 } = defineProps<{
  limit?: number
}>()

const API = getGithubCDNUrl({
  owner: 'Lu-Jiejie',
  repo: 'static',
  path: 'data/bangumi/watched.json',
})

const animeData = ref<BangumiInfo | null>(null)
const isLoading = ref(true)

const prepared = computed(() => animeData.value !== null)

const watchingList = computed(() => {
  if (!animeData.value)
    return []
  return animeData.value.slice(0, limit)
})

async function fetchBangumi() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok)
      throw new Error('Network response was not ok')
    const data = await response.json()
    animeData.value = data as BangumiInfo
    return data
  }
  catch (err) {
    console.error('Failed to fetch bangumi:', err)
    return null
  }
  finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchBangumi()
})
</script>

<template>
  <!-- icon="i-simple-icons-bilibili color-hex-00A1D6" -->
  <CardTemplate
    title="Anime I've Watched Recently"
    title-zh="我最近看过的动画"
    icon="i-mingcute-video-fill color-hex-4065ba"
    :prepared="!isLoading && prepared"
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
            <img :src="imgProxy(item.pic)" alt="cover" w-full h-full object-cover rounded-sm shadow-sm>
          </div>
          <div flex="~ col justify-center" ml-2 h-full overflow-hidden>
            <span class="name" op-80 transition leading-tight mb-1>
              {{ isZh ? item.name_cn : item.name }}
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
