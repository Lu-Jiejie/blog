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
  }[]
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

// 卡片只放得下几个标签，取全站标记数最多的前六个；老数据没有 count 时保持原顺序
const TAG_LIMIT = 6
// bgm 会把档期混进标签（「2026年1月」），卡片上已有别的信息维度，这里剔掉
const SEASON_TAG = /^\d{4}\s*(?:年|$)/

const watchingList = computed(() => {
  if (!animeData.value)
    return []
  return animeData.value.slice(0, limit).map(item => ({
    ...item,
    topTags: [...(item.tags ?? [])]
      .filter(tag => !SEASON_TAG.test(tag.name))
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .slice(0, TAG_LIMIT)
      .map(tag => tag.name),
  }))
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
          cursor-pointer overflow-hidden important-op-100
        >
          <img
            :src="imgProxy(item.pic, 'w=160&output=webp&q=88')" alt="cover"
            class="cover" h-20 flex-shrink-0 object-cover important-m-0 important-w-auto
          >
          <div flex="~ col justify-center gap-1" min-w-0 flex-1>
            <span class="name" font-serif>
              {{ item.name_cn || item.name }}
            </span>
            <span v-if="item.topTags.length" class="tags">
              <template v-for="(tag, tagIndex) in item.topTags" :key="tag">
                <span v-if="tagIndex" class="tag-sep">·</span>{{ tag }}
              </template>
            </span>
          </div>
        </UiLink>
      </div>
    </template>
  </CardTemplate>
</template>

<style scoped>
/* 这张卡不做悬停态：整格铺底色太吵，可点性靠封面和光标 */
/* 三张「最近…」卡片共用一套字阶：主标题 --text-body(15px) 衬线，副内容 --text-copy(13px) muted */
.name {
  font-size: var(--text-body);
  line-height: 1.35;
  color: var(--c-text);
  /* 长标题（「无职转生 第三季 ～到了异世界就拿出真本事～」）两行封顶，否则整格高度会被它带跑 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

/* 封面用发丝线内描边代替投影：暗色下白光晕会脏，浅色下棕调投影也不需要 */
.cover {
  border-radius: 3px;
  background-color: var(--c-fill);
  box-shadow: inset 0 0 0 1px var(--c-hairline);
}

/* 标签是这一格的注脚：比标题低一档（13px / muted），两行截断避免把行撑高。
   隔点单独一层淡色，标签之间不至于连成一片。 */
.tags {
  font-size: var(--text-copy);
  line-height: 1.5;
  color: var(--c-text-muted);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.tag-sep {
  margin: 0 0.35em;
  color: var(--c-text-faint);
}
</style>
