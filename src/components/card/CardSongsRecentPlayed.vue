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
    title="我最近喜欢的音乐"
    icon="i-simple-icons-neteasecloudmusic color-hex-FC3D49"
    :prepared="!isLoading && prepared"
  >
    <template v-if="prepared">
      <div class="wall">
        <a
          v-for="item in list" :key="item.id"
          class="wall-item"
          :href="item.url" target="_blank" rel="noopener"
          :title="`${item.name} - ${item.artist}`"
        >
          <!-- 别再用网易云的 ?param=100y100：100px 在 2 倍屏上会被拉糊。源图交给 weserv 出 2 倍宽的 webp -->
          <img :src="imgProxy(item.pic, 'w=480&output=webp&q=90')" alt="" class="wall-cover">
          <span class="wall-name">{{ item.name }}</span>
          <span class="wall-artist">{{ item.artist }}</span>
        </a>
      </div>
    </template>
  </CardTemplate>
</template>

<style scoped>
.wall {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}

@media (min-width: 640px) {
  .wall {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.wall-item {
  display: block;
  min-width: 0;
  text-decoration: none;
}

/* 封面是这面墙的主角：方形、裁切，底色兜住加载中的空位 */
.wall-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  background-color: var(--c-fill);
  box-shadow: inset 0 0 0 1px var(--c-hairline);
  margin-bottom: 6px;
}

/* 三张「最近…」卡片共用一套字阶：主标题 --text-body(15px) 衬线，副内容 --text-copy(13px) muted */
.wall-name {
  --uno: font-serif;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  /* 中文靠 line-clamp 断行，英文长单词要 anywhere 才断得开 */
  overflow-wrap: anywhere;
  font-size: var(--text-body);
  line-height: 1.35;
  color: var(--c-text);
}

/* 歌手只给一行：歌名已经占了两行，再涨就把封面挤下去 */
.wall-artist {
  display: block;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-copy);
  line-height: 1.35;
  color: var(--c-text-muted);
}
</style>
