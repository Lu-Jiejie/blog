<script setup lang="ts">
import type { OverlayScrollbars } from 'overlayscrollbars'
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl, isDark } from '~/logic'

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface ContributionsInfo {
  total: number
  weeks: ContributionDay[][]
}

const lightColor = ['#8883', '#9be9a8', '#40c463', '#30a14e', '#216e39']
const darkColor = ['#8883', '#003820', '#00602d', '#10983d', '#27d545']

const API = getGithubCDNUrl({
  owner: 'Lu-Jiejie',
  repo: 'static',
  path: 'data/github/lastYearContributions.json',
})

const contributions = ref<ContributionsInfo | null>(null)
const isLoading = ref(true)

async function fetchContributions() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = (await response.json()) as ContributionsInfo
    contributions.value = data
    return data
  }
  catch (error) {
    console.error('Failed to fetch contributions:', error)
    return null
  }
  finally {
    isLoading.value = false
  }
}

const prepared = computed(() => {
  return contributions.value !== null
})

const scrollbarOptions = {
  scrollbars: {
    autoHide: 'never',
  },
  overflow: {
    x: 'scroll',
    y: 'hidden',
  },
} as const

// Scrollbar 延迟初始化，完成后再滚动到最右侧
function handleScrollbarInitialized(instance: OverlayScrollbars) {
  const { viewport } = instance.elements()
  viewport.scrollLeft = viewport.scrollWidth
}

onMounted(() => {
  fetchContributions()
})
</script>

<template>
  <CardTemplate
    :title="prepared ? `${contributions?.total} GitHub contributions in the last year` : 'GitHub contributions in the last year'"
    :title-zh="prepared ? `过去一年在 GitHub 上的 ${contributions?.total} 次贡献` : '过去一年在 GitHub 上的贡献'"
    icon="i-simple-icons-github"
    :prepared="!isLoading && prepared"
  >
    <template v-if="prepared">
      <Scrollbar
        class="heatmap-scrollbar"
        :options="scrollbarOptions"
        @os-initialized="handleScrollbarInitialized"
      >
        <!-- heatmap：大屏均分填满，小屏保底 10px 触发横向滚动 -->
        <div flex gap-0.5>
          <div
            v-for="(week, weekIndex) in contributions?.weeks"
            :key="weekIndex"
            flex flex-col gap-0.5 flex-1 min-w-10px
          >
            <div
              v-for="(day, dayIndex) in week"
              :key="`${weekIndex}-${dayIndex}`"
              w-full aspect-square rounded-2px transition-all relative
              :style="{ backgroundColor: isDark ? darkColor[day.level] : lightColor[day.level] }"
              :title="`${day.date}: ${day.count} contributions`"
            />
          </div>
        </div>
      </Scrollbar>
    </template>
  </CardTemplate>
</template>

<style scoped>
/*
 * 滚动条下移到卡片 padding 区域，避免盖住贡献格子：
 * host 元素 overflow hidden，滚动条无法移出边界，
 * 故用 padding-bottom 在 host 内部腾位（滚动条绝对定位于 padding box 底部），
 * 再用等值负 margin 抵消，不改变卡片高度与下方间距。
 */
.heatmap-scrollbar {
  padding-bottom: 13px;
  margin-bottom: -13px;
}

/* 无纵向滚动条，无需为角落留位，铺满整行 */
.heatmap-scrollbar :deep(.os-scrollbar-horizontal) {
  right: 0;
}
</style>
