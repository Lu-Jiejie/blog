<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { computed, ref } from 'vue'
import { formatPlaytime, playedGames, useSteamGames } from '~/composables/useSteamGames'
import { formatLocaleDate, imgProxy } from '~/logic'
import { isZh, useI18n } from '~/logic/i18n'

const $t = useI18n({
  en: {
    title: 'Playlog',
    recent: 'Recently played',
    longest: 'Most played',
    count: 'games',
    hours: 'hours',
    empty: 'Steam is not answering right now.',
  },
  zh: {
    title: '游戏记录',
    recent: '最近游玩',
    longest: '游玩时长',
    count: '款游戏',
    hours: '小时',
    empty: '暂时读不到 Steam 数据。',
  },
} as const)

useHead({
  title: computed(() => (isZh.value ? `${$t.value.title} - 鹿解解` : `${$t.value.title} - Lu Jiejie`)),
})

const { games, isLoading, hasError, prepared } = useSteamGames()

const sortBy = ref<'recent' | 'longest'>('recent')

const played = computed(() => playedGames(games.value))

const list = computed(() => {
  return sortBy.value === 'longest'
    ? [...played.value].sort((a, b) => b.playtimeForever - a.playtimeForever)
    : played.value
})

const totalHours = computed(() => Math.round(played.value.reduce((sum, game) => sum + game.playtimeForever, 0) / 60))
const name = (game: (typeof played.value)[number]) => (isZh.value ? game.nameZh : game.name)
const href = (game: (typeof played.value)[number]) => (isZh.value ? game.linkZh || game.link : game.link)
const lastPlayed = (game: (typeof played.value)[number]) => formatLocaleDate(game.timeLastPlayed * 1000, isZh.value ? 'zh' : 'en')
</script>

<template>
  <!-- 标题块与 PageLayout 保持一致 -->
  <div class="prose" max-w-70ch m-auto mb-8 text-center>
    <h1 text-4xl>
      {{ $t.title }}
    </h1>
  </div>

  <!-- 列表不用 .prose：它会给 img 加 width:100%，封面会被拉成一条 -->
  <div class="list-wrap" select-none>
    <p v-if="hasError" py-12 op-50 text-center>
      {{ $t.empty }}
    </p>
    <p v-else-if="isLoading" py-12 op-40 text-center>
      Loading…
    </p>

    <template v-else-if="prepared">
      <!-- 统计居中成一组，排序单独一行靠右 -->
      <div class="stats">
        <div class="stat">
          <span class="stat-num">{{ list.length }}</span>
          <span class="stat-label">{{ $t.count }}</span>
        </div>
        <span class="stat-divider" />
        <div class="stat">
          <span class="stat-num">{{ totalHours }}</span>
          <span class="stat-label">{{ $t.hours }}</span>
        </div>
      </div>

      <div class="sort-bar">
        <template v-for="(option, index) in (['recent', 'longest'] as const)" :key="option">
          <span v-if="index > 0" class="sort-sep" aria-hidden="true">/</span>
          <button
            class="sort-btn"
            :class="sortBy === option ? 'op-100' : 'op-35 hover:op-70'"
            @click="sortBy = option"
          >
            {{ option === 'recent' ? $t.recent : $t.longest }}
          </button>
        </template>
      </div>

      <!-- key 绑 sortBy：换排序时整列重建，否则位置未变的行不会重播动画 -->
      <div :key="sortBy" flex="~ col gap-1">
        <div
          v-for="(item, idx) in list" :key="item.id"
          slide-enter
          :style="{ '--enter-stage': idx, '--enter-step': '40ms' }"
        >
          <UiLink :title="name(item)" :href="href(item)" external class="game-row">
            <img
              :src="imgProxy(item.icon)" alt="cover"
              class="game-cover"
            >
            <div class="game-body">
              <span class="game-name">{{ name(item) }}</span>
              <span class="game-meta">
                <span class="meta-hours">{{ formatPlaytime(item.playtimeForever, isZh ? 'zh' : 'en') }}</span>
                <span class="meta-dot">·</span>
                <span class="meta-date">{{ lastPlayed(item) }}</span>
              </span>
            </div>
          </UiLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.list-wrap {
  --uno: max-w-70ch m-auto;
}

/* 统计居中成一组：数字大、标签小，中间一条竖线分隔 */
.stats {
  --uno: flex items-center justify-center gap-6 mt-1 mb-7;
}

.stat {
  --uno: flex items-baseline gap-2;
}

.stat-num {
  --uno: font-serif text-3xl leading-none tabular-nums;
}

.stat-label {
  --uno: text-sm op-45;
}

.stat-divider {
  --uno: w-px h-6 bg-[#8883];
}

/* 排序独占一行，贴右边缘 */
.sort-bar {
  --uno: flex items-center justify-end gap-3 mb-4 text-sm;
}

.sort-btn {
  --uno: cursor-pointer whitespace-nowrap transition-opacity duration-300;
}

.sort-sep {
  --uno: select-none op-20;
}

/* 右侧留白比左侧小：封面自己撑满行高，文字块更贴近右边缘 */
.game-row {
  --uno: flex items-center gap-3 rounded-md py-1 pr-1 important-op-100 transition-colors duration-300;
}

.game-row:hover {
  --uno: bg-[#8882];
}

/* 封面高度决定行高，文字块整体要落在封面上下边缘之内 */
.game-cover {
  --uno: h-18 w-[9.375rem] flex-shrink-0 rounded object-cover;
  --uno: important-w-[9.375rem] important-m-0;
}

@media (min-width: 40rem) {
  .game-cover {
    --uno: h-22 w-[11.75rem];
    --uno: important-w-[11.75rem];
  }
}

.game-body {
  --uno: flex min-w-0 flex-1 flex-col justify-center gap-1;
}

/* 名称最多两行 + 元信息一行，总高控制在封面之内 */
.game-name {
  --uno: font-serif text-base leading-snug op-85;
  --uno: transition-opacity duration-300;
  --uno: overflow-hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.game-row:hover .game-name {
  --uno: op-100;
}

/* 永远单行：窄屏把字号降一档，宽度才压得进文字区 */
.game-meta {
  --uno: flex items-baseline gap-x-1.5 text-xs leading-snug min-w-0;
}

@media (min-width: 40rem) {
  .game-meta {
    --uno: text-sm;
  }
}

.meta-hours {
  --uno: flex-shrink-0 tabular-nums op-65;
}

.meta-dot {
  --uno: flex-shrink-0 op-30;
}

/* 兜底：极窄视口下宁可截断日期，也不让它换行撑高整行 */
.meta-date {
  --uno: min-w-0 whitespace-nowrap tabular-nums op-45 text-truncate;
}
</style>
