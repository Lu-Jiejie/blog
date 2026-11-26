<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl, imgProxy } from '~/logic'

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
  path: 'data/bangumi/watching.json',
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
    title="我最近看过的动画"
    icon="i-mingcute-video-fill color-hex-4065ba"
    :prepared="!isLoading && prepared"
  >
    <template v-if="prepared">
      <div grid="~ cols-1 sm:cols-2 gap-x-3 gap-y-1">
        <UiLink
          v-for="item in watchingList" :key="item.id" :title="item.name_cn || item.name"
          :href="`https://bgm.tv/subject/${item.id}`" external
          class="entry" flex="~ items-center gap-3" p-1.5
          cursor-pointer rounded-md overflow-hidden
          transition-colors duration-300 important-op-100
          hover="bg-[var(--c-fill)]"
        >
          <img
            :src="imgProxy(item.pic)" alt="cover"
            h-20 w-auto flex-shrink-0 object-cover rounded-sm shadow-sm important-m-0
          >
          <div flex="~ col justify-center" min-w-0 flex-1>
            <span class="name" font-serif text-[15px] op-85 transition leading-snug>
              {{ item.name_cn || item.name }}
            </span>
          </div>
        </UiLink>
      </div>
    </template>
  </CardTemplate>
</template>

<style scoped>
a:hover .name {
  --uno: op-100;
}
</style>
