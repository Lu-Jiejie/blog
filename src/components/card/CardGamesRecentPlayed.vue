<script setup lang="ts">
import { computed } from 'vue'
import { formatHours, playedGames, useSteamGames } from '~/composables/useSteamGames'
import { formatDate, imgProxy } from '~/logic'

const { limit = 6 } = defineProps<{
  limit?: number
}>()

const { games, prepared } = useSteamGames()

const all = computed(() => playedGames(games.value))
const visible = computed(() => all.value.slice(0, limit))
</script>

<template>
  <CardTemplate
    title="我最近玩的游戏"
    icon="i-simple-icons-steam color-hex-04699D"
    :prepared="prepared"
    :more-to="all.length > limit ? '/game-playlog' : undefined"
  >
    <!-- 结构与 /game-playlog 同一套：封面 / 名称 + 日期 / 右侧衬线时长，行间一条发丝线 -->
    <div class="games">
      <!-- important-op-100 压掉 UiLink 自带的 op-60，颜色交给子元素 -->
      <UiLink
        v-for="(item, idx) in visible" :key="item.id" :title="item.name" :href="item.link" external
        class="game-row important-op-100"
        slide-enter
        :style="{ '--enter-stage': idx, '--enter-step': '30ms' }"
      >
        <img
          :src="imgProxy(item.icon)" alt="cover"
          class="game-cover"
        >
        <span class="game-body">
          <span class="game-name">{{ item.name }}</span>
          <span class="game-date">{{ formatDate(item.timeLastPlayed * 1000, false) }}</span>
        </span>
        <span class="game-hours">
          {{ formatHours(item.playtimeForever) }}<span class="hours-unit">小时</span>
        </span>
      </UiLink>
    </div>
  </CardTemplate>
</template>

<style scoped>
.games {
  --uno: flex flex-col -mt-1;
}

/* 四边各留 8px 再用负 margin 抵回：封面贴内容列边缘，行间发丝线跨满 */
.game-row {
  --uno: relative flex items-center gap-3 py-2 px-2 -mx-2;
}

.game-row + .game-row {
  border-top: 1px solid var(--c-hairline);
}

.game-cover {
  --uno: h-14 w-auto flex-shrink-0 rounded object-cover;
  --uno: important-w-auto important-m-0;
  /* 宽度不写死：头图是 460:215，写死尺寸会让 object-cover 左右各裁掉一点，看着像没展示全 */
  aspect-ratio: 460 / 215;
  background-color: var(--c-fill);
  box-shadow: inset 0 0 0 1px var(--c-hairline);
}

.game-body {
  --uno: flex min-w-0 flex-1 flex-col gap-0.5;
}

/* 三张「最近…」卡片共用一套字阶：主标题 --text-body(15px) 衬线，副内容 --text-copy(13px) muted */
.game-name {
  --uno: font-serif;
  font-size: var(--text-body);
  line-height: 1.35;
  color: var(--c-text);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.game-date {
  --uno: tabular-nums;
  font-size: var(--text-copy);
  line-height: 1.35;
  color: var(--c-text-muted);
}

/* 时长靠右立成一列：衬线数字 + 小字单位，扫读时成一列数字 */
.game-hours {
  --uno: font-serif text-base leading-none tabular-nums flex-shrink-0;
  color: var(--c-text-muted);
}

.hours-unit {
  --uno: ml-1;
  font-size: var(--text-caption);
  color: var(--c-text-faint);
}

/* 卡片这一档同样不做悬停态：与 /game-playlog 一致，可点性由封面和光标承担 */
</style>
