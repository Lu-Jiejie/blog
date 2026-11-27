<script setup lang="ts">
import type { Collection, CollectionItem, CollectionType } from '~/types'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = withDefaults(defineProps<{
  collection: Collection
  /** pill：实心药丸跟着走；underline：下划线跟着走 */
  variant?: 'pill' | 'underline'
  /** 自己管状态、不写路由：同一个页面放两个时它们才不会互相牵着走 */
  standalone?: boolean
}>(), {
  variant: 'pill',
  standalone: false,
})

const route = useRoute()
const localType = ref<CollectionType>('anime')
const queryType = computed<CollectionType>(() => {
  if (props.standalone) {
    return localType.value
  }
  return (route.query.type as CollectionType) || 'anime'
})

function selectType(type: CollectionType) {
  localType.value = type
}
const typeKeys = computed(() => Object.keys(props.collection) as CollectionType[])
const typeLabels: Record<CollectionType, string> = {
  anime: '动画',
  movie: '电影',
  book: '书籍',
  game: '游戏',
}
const wikiBaseUrl = 'https://zh.wikipedia.org/wiki/'

function getWikiUrl(item: CollectionItem) {
  if (item.wikiKeyword) {
    return `${wikiBaseUrl}${item.wikiKeyword}`
  }
  // 中文维基没有对应条目时，个别条目手写了跳转地址
  if (item.wikiUrlFallback) {
    return item.wikiUrlFallback
  }
  return `${wikiBaseUrl}${item.name}`
}

// 指示块的位移和宽度都是量出来的：标签宽度随字数与字体加载变化，写死会错位
const tabEls: HTMLElement[] = []
const indicator = ref({ left: 0, width: 0, ready: false })

function setTabRef(el: unknown, index: number) {
  const node = (el as { $el?: unknown } | null)?.$el ?? el
  if (node instanceof HTMLElement) {
    tabEls[index] = node
  }
}

function target(): { left: number, width: number } | null {
  const index = typeKeys.value.indexOf(queryType.value)
  const el = tabEls[index]
  if (!el) {
    return null
  }
  // 下划线只压住文字本身：标签有左右内边距，量整块会比文字宽出一截
  const label = props.variant === 'underline' ? el.querySelector<HTMLElement>('.tab-label') : null
  if (label) {
    return { left: el.offsetLeft + label.offsetLeft, width: label.offsetWidth }
  }
  return { left: el.offsetLeft, width: el.offsetWidth }
}

function measure() {
  const next = target()
  if (next) {
    indicator.value = { ...next, ready: true }
  }
}

// 切分类时换一次 key，让行的入场动画重放：元素不重建的话 CSS 动画不会重跑
const renderSeq = ref(0)

watch(queryType, () => {
  nextTick(measure)
  renderSeq.value++
})

onMounted(() => {
  nextTick(measure)
  window.addEventListener('resize', measure)
  // 字体加载完成前量到的宽度会偏小，等它好了再量一次
  document.fonts?.ready.then(measure)
})

onBeforeUnmount(() => window.removeEventListener('resize', measure))
</script>

<template>
  <div font-mono pt-8>
    <div class="tabs" :class="`tabs--${variant}`">
      <span
        class="tabs-indicator"
        :class="indicator.ready && 'is-ready'"
        :style="{ transform: `translateX(${indicator.left}px)`, width: `${indicator.width}px` }"
        aria-hidden="true"
      />
      <!-- no-prose：prose 会给链接加一条 border-bottom，在药丸样式里看起来就是多余的下划线 -->
      <template
        v-for="(type, idx) in typeKeys"
        :key="type"
      >
        <button
          v-if="standalone"
          :ref="el => setTabRef(el, idx)"
          type="button"
          class="tab no-prose" :class="type === queryType && 'is-active'"
          @click="selectType(type)"
        >
          <span class="tab-label">{{ typeLabels[type] }}</span>
        </button>
        <RouterLink
          v-else
          :ref="el => setTabRef(el, idx)" :to="{ query: { type } }"
          class="tab no-prose" :class="type === queryType && 'is-active'"
        >
          <span class="tab-label">{{ typeLabels[type] }}</span>
        </RouterLink>
      </template>
    </div>

    <!-- 这是「一串指向外部条目的链接」，不是表格数据：每行整块就是 <a>，
         悬停任意位置浏览器左下角都会显示目标地址，中键 / ctrl 点击也正常 -->
    <div
      v-for="type in typeKeys"
      :key="type"
      v-show="type === queryType"
      class="list-collection"
      font-400
    >
      <a
        v-for="(i, rowIndex) of collection[type]"
        :key="`${i.name}-${renderSeq}`"
        :href="getWikiUrl(i)"
        class="collection-row row-in no-prose"
        :style="{ '--row-stage': Math.min(rowIndex, 10) }"
        target="_blank"
        rel="noopener"
      >
        <span class="cell-name">{{ i.name }}</span>

        <span v-if="i.creator" class="cell-creator">
          <template v-if="typeof i.creator === 'string'">
            {{ i.creator }}
          </template>

          <template v-else-if="Array.isArray(i.creator)">
            <template v-for="(c, idx) in i.creator" :key="c">
              <span>{{ c }}</span>
              <span v-if="idx !== i.creator.length - 1" class="op-50 mx-1">/</span>
            </template>
          </template>
        </span>

        <span v-if="i.note" class="cell-note lt-sm:hidden">
          {{ i.note }}
        </span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  --uno: relative flex gap-2 w-fit ml-auto;
}

.tab {
  --uno: relative z-1 px-2.5 py-1 no-underline bg-transparent border-none;
  font: inherit;
  color: var(--c-text-muted);
  cursor: pointer;
  transition: color 0.28s ease;
}

.tab:hover {
  color: var(--c-text);
}

.tabs--pill .tab.is-active {
  color: var(--c-on-accent);
}

.tabs--underline .tab.is-active {
  color: var(--c-accent);
}

/* 靠右摆放时最后一格不要右内边距，线条与文字才能贴住 prose 右边界 */
.tabs--underline .tab:last-child {
  padding-right: 0;
}

.tabs-indicator {
  --uno: absolute left-0 top-0 z-0 h-full rounded;
  background: var(--c-accent-strong);
  opacity: 0;
  transition:
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease;
}

.tabs-indicator.is-ready {
  opacity: 1;
}

.tabs--underline .tabs-indicator {
  /* bottom-1 让线条贴住文字下沿；标签自身有 py-1，压到 0 就离字太远 */
  --uno: top-auto bottom-1 h-0.5 rounded-full;
  background: var(--c-accent);
}

/* 这一列是「指向外部条目的一串链接」，不是表格数据；每行整块就是 <a>，
   所以不再用 <table> 撑列，换成 flex 后悬停/中键/右键都按链接走 */
.list-collection {
  margin-top: 1.25rem;
  font-size: 0.875em;
}

.collection-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  /* 汉字墨迹在行框里偏上，上面多给 4px 才能让墨迹到上下两条线等距（12/8 是实测出来的，别改成等比） */
  padding-top: 12px;
  padding-bottom: 8px;
  line-height: 1.35;
  color: var(--c-text);
  text-decoration: none;
  /* 发丝线画在行自己身上，跟着行的入场动画一起走 */
  box-shadow: inset 0 -1px 0 var(--c-hairline);
}

.collection-row:last-child {
  box-shadow: none;
}

.cell-name {
  flex: 1;
  min-width: 0;
}

.cell-creator,
.cell-note {
  flex: none;
}

.cell-creator {
  text-align: right;
}

/* 行入场：跟随想条目同一套上浮淡入，步长压到 28ms——这里的行比随想密得多 */
@media (prefers-reduced-motion: no-preference) {
  html:not(.no-sliding) .row-in {
    animation: row-in 0.42s both;
    animation-delay: calc(var(--row-stage, 0) * 28ms);
  }
}

@keyframes row-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
