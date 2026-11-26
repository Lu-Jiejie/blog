<script setup lang="ts">
import { useHead } from '@unhead/vue'
import NProgress from 'nprogress'
import { computed, ref, watch } from 'vue'
import { formatHours, playedGames, useSteamGames } from '~/composables/useSteamGames'
import { formatLocaleDate, imgProxy } from '~/logic'

useHead({
  title: '游戏记录 - 鹿解解',
})

const { games, isLoading, hasError, prepared } = useSteamGames()

const sortBy = ref<'recent' | 'longest'>('recent')

const played = computed(() => playedGames(games.value))

if (!import.meta.env.SSR) {
  // 数据请求不在路由切换里，nprogress 得自己开关一次：只在顶上走一条细线，不占版面
  watch(isLoading, loading => (loading ? NProgress.start() : NProgress.done()), { immediate: true })
}

const list = computed(() => {
  return sortBy.value === 'longest'
    ? [...played.value].sort((a, b) => b.playtimeForever - a.playtimeForever)
    : played.value
})

/** 按最近游玩的年份分组；按时长排序时不分，免得年份头打断排名 */
const groups = computed(() => {
  if (sortBy.value === 'longest')
    return [{ year: 0, items: list.value, stage: 0 }]

  const buckets = new Map<number, typeof list.value>()
  for (const game of list.value) {
    const year = new Date(game.timeLastPlayed * 1000).getFullYear()
    const bucket = buckets.get(year) ?? []
    bucket.push(game)
    buckets.set(year, bucket)
  }

  // stage 是这一组的年份头在整条入场序列里的序号：年份头占一格，组内每行再各占一格
  let stage = 0
  return [...buckets.entries()].map(([year, items]) => {
    const group = { year, items, stage }
    stage += items.length + 1
    return group
  })
})

const totalHours = computed(() => Math.round(played.value.reduce((sum, game) => sum + game.playtimeForever, 0) / 60))
const lastPlayed = (game: (typeof played.value)[number]) => formatLocaleDate(game.timeLastPlayed * 1000)
</script>

<template>
  <!-- 标题块与 PageLayout 保持一致 -->
  <div class="prose" max-w-[var(--prose-max-width)] m-auto mb-8 text-center>
    <h1 text-4xl>
      游戏记录
    </h1>
    <p class="intro" m="t--4!">
      只收录玩过十分钟以上的游戏。
    </p>
  </div>

  <!-- 列表不用 .prose：它会给 img 加 width:100%，封面会被拉成一条 -->
  <!-- 不放占位：数据到了整体淡入，顶上那条 nprogress 负责"还在读"的反馈 -->
  <div class="list-wrap" :class="prepared && !hasError && 'is-ready'" select-none>
    <span class="sr-only" role="status">{{ prepared ? '游戏记录已载入' : '正在载入游戏记录' }}</span>

    <p v-if="hasError" py-12 text-center text-[var(--c-text-muted)]>
      暂时读不到 Steam 数据。
    </p>

    <template v-else-if="prepared">
      <!-- 统计居中成一组，排序单独一行靠右 -->
      <div class="stats">
        <div class="stat">
          <span class="stat-num">{{ list.length }}</span>
          <span class="stat-label">款游戏</span>
        </div>
        <span class="stat-divider" />
        <div class="stat">
          <span class="stat-num">{{ totalHours }}</span>
          <span class="stat-label">小时</span>
        </div>
      </div>

      <div class="sort-bar">
        <template v-for="(option, index) in (['recent', 'longest'] as const)" :key="option">
          <span v-if="index > 0" class="sort-sep" aria-hidden="true">/</span>
          <button
            class="sort-btn"
            :class="sortBy === option ? 'is-active' : 'text-[var(--c-text-faint)]'"
            @click="sortBy = option"
          >
            {{ option === 'recent' ? '最近游玩' : '游玩时长' }}
          </button>
        </template>
      </div>

      <!-- key 绑 sortBy：换排序时整列重建，否则位置未变的行不会重播入场动画 -->
      <div :key="sortBy">
        <section v-for="group in groups" :key="group.year" class="group">
          <h2
            v-if="group.year" class="group-head"
            slide-enter
            :style="{ '--enter-stage': group.stage, '--enter-step': '30ms' }"
          >
            <span class="group-label">{{ group.year }}</span>
            <span class="group-rule" />
            <span class="group-count">{{ group.items.length }} 款</span>
          </h2>

          <div
            v-for="(item, idx) in group.items" :key="item.id"
            slide-enter
            :style="{ '--enter-stage': group.stage + (group.year ? 1 : 0) + idx, '--enter-step': '30ms' }"
          >
            <UiLink :title="item.name" :href="item.link" external class="game-row">
              <img
                :src="imgProxy(item.icon)" alt="cover"
                class="game-cover"
              >
              <span class="game-body">
                <span class="game-name">{{ item.name }}</span>
                <span class="game-date">{{ lastPlayed(item) }}</span>
              </span>
              <span class="game-hours">
                {{ formatHours(item.playtimeForever) }}<span class="hours-unit">小时</span>
              </span>
            </UiLink>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.list-wrap {
  --uno: max-w-[var(--prose-max-width)] m-auto p-b-8;
}

/* 与 PageLayout 的 frontmatter description 一致：斜体、淡一档、负 margin-top 抵消 .prose p 的上间距 */
.intro {
  --uno: italic;
  color: var(--c-text-muted);
}

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
  --uno: text-sm;
  color: var(--c-text-faint);
}

.stat-divider {
  --uno: w-px h-6;
  background-color: var(--c-hairline);
}

.sort-bar {
  --uno: flex items-center justify-end gap-3 mb-2 text-sm;
}

.sort-btn {
  --uno: cursor-default whitespace-nowrap transition-colors duration-300;
}

.sort-btn:not(.is-active):hover {
  color: var(--c-text-muted);
}

/* 选中的按钮用强调色，鼠标移上去保持原样 */
.sort-btn.is-active {
  color: var(--c-accent);
}

.sort-sep {
  --uno: select-none;
  color: var(--c-text-faint);
  opacity: 0.5;
}

/* 年份作分节标记：细体数字 + 一条拉满的发丝线 + 款数，跟 thinking 页的月份头是同一套节奏 */
.group + .group {
  --uno: mt-8;
}

.group-head {
  --uno: flex items-center gap-3 mb-2;
}

.group-label {
  --uno: font-serif text-lg leading-none tabular-nums;
  color: var(--c-text);
}

.group-rule {
  --uno: h-px flex-1;
  background-color: var(--c-hairline);
}

.group-count {
  --uno: tabular-nums;
  font-size: var(--text-label);
  color: var(--c-text-faint);
}

/* 四边各留 8px，再用负 margin 抵回：封面贴内容列边缘，悬停底色不贴着图 */
.game-row {
  --uno: flex items-center gap-3 rounded-md py-2 px-2 -mx-2 important-op-100 transition-colors duration-300;
}

.game-row:hover {
  --uno: bg-[var(--c-paper-hover)];
}

/* 行间用发丝线分界，第一行不画 */
section > div + div {
  border-top: 1px solid var(--c-hairline);
}

.game-cover {
  --uno: h-16 w-auto flex-shrink-0 rounded object-cover;
  --uno: important-w-auto important-m-0;
  /* 宽度不写死：头图是 460:215，写死 168×80 会让 object-cover 左右各裁掉一点五像素，看着像没展示全 */
  aspect-ratio: 460 / 215;
  background-color: var(--c-fill);
  box-shadow: inset 0 0 0 1px var(--c-hairline);
}

@media (min-width: 40rem) {
  .game-cover {
    --uno: h-20;
  }
}

.game-body {
  --uno: flex min-w-0 flex-1 flex-col gap-1;
}

.game-name {
  --uno: font-serif text-base leading-snug;
  color: var(--c-text);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.game-date {
  --uno: tabular-nums;
  font-size: var(--text-label);
  color: var(--c-text-faint);
}

/* 时长靠右立成一列，衬线数字 + 小字单位，扫读时成一列数字 */
.game-hours {
  --uno: font-serif text-lg leading-none tabular-nums flex-shrink-0;
  color: var(--c-text-muted);
  transition: color 0.3s;
}

.hours-unit {
  --uno: ml-1;
  font-size: var(--text-label);
  color: var(--c-text-faint);
}

.game-row:hover .game-hours {
  color: var(--c-text);
}

/* 数据到了整体淡入；读数据期间不占位，只靠顶部那条 nprogress 细线示意 */
.list-wrap.is-ready {
  animation: fade-in 0.4s ease both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
