<script setup lang="ts">
import type { OverlayScrollbars } from 'overlayscrollbars'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getGithubCDNUrl } from '~/logic'

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface ContributionsInfo {
  total: number
  weeks: ContributionDay[][]
}

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

const hover = ref<{ week: number, day: number } | null>(null)
const fade = ref<'' | 'fade-left' | 'fade-right' | 'fade-both'>('')
// 内容是否溢出：溢出时才给滚动条留出高度，没溢出时不留空白
const hasOverflow = ref(false)

const weeks = computed(() => contributions.value?.weeks ?? [])

const hoverLabel = computed(() => {
  if (!hover.value)
    return ''
  const day = weeks.value[hover.value.week]?.[hover.value.day]
  if (!day)
    return ''
  return `${day.date} · ${day.count} 次提交`
})

// 月份刻度：取每周第一天，跨月的那一列打标
const monthMarks = computed(() => {
  const marks: (string | null)[] = []
  let last = ''
  for (const week of weeks.value) {
    const month = week[0]?.date.slice(5, 7) ?? ''
    if (month && month !== last) {
      marks.push(`${Number(month)}月`)
      last = month
    }
    else {
      marks.push(null)
    }
  }
  return marks
})

// 触摸也会派发 pointerenter，手指一滑就照亮一个格子，所以只认鼠标
function onEnter(week: number, day: number, event: Event) {
  if (!(event instanceof PointerEvent) || event.pointerType !== 'mouse')
    return
  hover.value = { week, day }
}

// 十字高亮：同一周（竖）+ 同一星期几（横）都留着，其余淡出
function isDimmed(week: number, day: number) {
  if (!hover.value)
    return false
  return hover.value.week !== week && hover.value.day !== day
}

const scrollMax = (viewport: HTMLElement) => viewport.scrollWidth - viewport.clientWidth

const isAtEnd = (viewport: HTMLElement) => viewport.scrollLeft >= scrollMax(viewport) - 1

function syncFade(viewport: HTMLElement) {
  const max = scrollMax(viewport)
  hasOverflow.value = max > 1
  if (max <= 1) {
    fade.value = ''
    return
  }
  const atStart = viewport.scrollLeft <= 1
  const atEnd = isAtEnd(viewport)
  fade.value = atStart ? 'fade-right' : atEnd ? 'fade-left' : 'fade-both'
}

let viewportEl: HTMLElement | null = null
let resizeObserver: ResizeObserver | null = null

function onScroll() {
  if (viewportEl)
    syncFade(viewportEl)
}

// 初始化事件早于布局把宽度撑开，直接设会被夹回 0，等这一帧落定再滚到最右（最近的日子）
function scrollToLatest() {
  requestAnimationFrame(() => {
    if (!viewportEl)
      return
    viewportEl.scrollLeft = viewportEl.scrollWidth
    syncFade(viewportEl)
  })
}

function handleScrollbarInitialized(instance: OverlayScrollbars) {
  const { viewport } = instance.elements()
  viewportEl = viewport
  scrollToLatest()
  viewport.addEventListener('scroll', onScroll, { passive: true })

  // 断点切换、窗口缩放会改变可视宽度：原本停在最右就继续贴住最右，否则不动
  resizeObserver = new ResizeObserver(() => {
    if (!viewportEl)
      return
    if (isAtEnd(viewportEl))
      scrollToLatest()
    else
      syncFade(viewportEl)
  })
  resizeObserver.observe(viewport)
}

onMounted(() => {
  fetchContributions()
})

onBeforeUnmount(() => {
  viewportEl?.removeEventListener('scroll', onScroll)
  viewportEl = null
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <CardTemplate
    :title="prepared ? `过去一年在 GitHub 上的 ${contributions?.total} 次贡献` : '过去一年在 GitHub 上的贡献'"
    icon="i-simple-icons-github"
    :prepared="!isLoading && prepared"
  >
    <div v-if="prepared" class="heatmap" :class="{ 'heatmap--scroll': hasOverflow }">
      <div class="shell" :class="fade">
        <UiScrollbar
          class="scroller"
          :options="scrollbarOptions"
          @os-initialized="handleScrollbarInitialized"
        >
          <div class="content">
            <div class="months" aria-hidden="true">
              <span v-for="(mark, index) in monthMarks" :key="index" class="month">{{ mark }}</span>
            </div>

            <div class="grid" @pointerleave="hover = null">
              <div
                v-for="(week, weekIndex) in contributions?.weeks"
                :key="weekIndex"
                class="col"
              >
                <div
                  v-for="(day, dayIndex) in week"
                  :key="dayIndex"
                  class="cell"
                  :class="[`lv-${day.level}`, isDimmed(weekIndex, dayIndex) && 'is-dim']"
                  @pointerenter="onEnter(weekIndex, dayIndex, $event)"
                />
              </div>
            </div>
          </div>
        </UiScrollbar>
      </div>

      <div class="hover-line lt-sm:hidden">
        {{ hoverLabel }}
      </div>
    </div>
  </CardTemplate>
</template>

<style scoped>
.shell {
  position: relative;
}

/*
 * 小屏保底 690px（≈ 桌面正文宽 726px 减一点余量）：
 * 桌面上刚好不溢出、格子随容器均分；手机上每格约 11px，靠横向滚动看全年。
 */
.content {
  min-width: 690px;
}

/*
 * 滚动条要占真实高度，不能压住下面那行「日期 · N 次提交」：
 * 溢出时给 host 腾出 13px（滚动条绝对定位于 padding box 底部），
 * 那行文字因此落在滚动条下方；没溢出时不腾，避免多出一条空白。
 */
.heatmap--scroll .scroller {
  padding-bottom: 13px;
}

/* 无纵向滚动条，无需为角落留位，铺满整行 */
.scroller :deep(.os-scrollbar-horizontal) {
  right: 0;
}

/* 两端渐隐：只在那一侧确实还有内容时出现 */
.shell :deep(.os-viewport) {
  transition: mask-image 0.2s ease;
}

.shell.fade-left :deep(.os-viewport) {
  mask-image: linear-gradient(to right, transparent 0, #000 20px, #000 100%);
}

.shell.fade-right :deep(.os-viewport) {
  mask-image: linear-gradient(to right, #000 0, #000 calc(100% - 20px), transparent 100%);
}

.shell.fade-both :deep(.os-viewport) {
  mask-image: linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%);
}

.months {
  display: flex;
  gap: 2px;
  margin-bottom: 5px;
}

.month {
  flex: 1;
  min-width: 0;
  overflow: visible;
  font-size: 10px;
  line-height: 1;
  color: var(--c-text-faint);
  white-space: nowrap;
}

.grid {
  display: flex;
  gap: 2px;
}

.col {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 2px;
  transition: opacity 0.15s ease;
}

.cell.is-dim {
  opacity: 0.3;
}

.cell.lv-0 {
  background-color: var(--c-heat-0);
}

.cell.lv-1 {
  background-color: var(--c-heat-1);
}

.cell.lv-2 {
  background-color: var(--c-heat-2);
}

.cell.lv-3 {
  background-color: var(--c-heat-3);
}

.cell.lv-4 {
  background-color: var(--c-heat-4);
}

/* 整张图的注脚，居中；tabular-nums 免得日期位数的变化让文字左右跳 */
.hover-line {
  min-height: 16px;
  margin-top: 8px;
  font-size: 11px;
  line-height: 1.4;
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: var(--c-text-faint);
}
</style>
