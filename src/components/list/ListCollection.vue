<script setup lang="ts">
import type { Collection, CollectionItem, CollectionType } from '~/types'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { collection } = defineProps<{
  collection: Collection
}>()
const route = useRoute()
const queryType = computed(() => {
  return route.query.type as CollectionType || 'anime'
})
const typeKeys = computed(() => Object.keys(collection) as CollectionType[])
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
</script>

<template>
  <div font-mono pt-3>
    <div flex="~ gap-2">
      <RouterLink
        v-for="type in typeKeys"
        :key="type" :to="{ query: { type } }"
        important-border-none px-2 important-transition
        :class="type === queryType
          ? 'bg-[var(--c-accent-strong)] text-[var(--c-on-accent)]!'
          : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)]'"
      >
        {{ typeLabels[type] }}
      </RouterLink>
    </div>

    <template
      v-for="type in typeKeys"
      :key="type"
    >
      <table
        v-show="type === queryType" font-400 class="list-collection"
        important-mt-4
      >
        <tbody>
          <template v-for="i of collection[type]" :key="i.name">
            <tr>
              <td>
                <a
                  :href="getWikiUrl(i)"
                  class="no-prose" target="_blank"
                >{{ i.name }}</a>
              </td>
              <td v-if="i.creator" text-right>
                <template v-if="typeof i.creator === 'string'">
                  {{ i.creator }}
                </template>

                <template v-else-if="Array.isArray(i.creator)">
                  <template v-for="(c, idx) in i.creator" :key="c">
                    <span>{{ c }}</span>
                    <span v-if="idx !== i.creator.length - 1" class="op-50 mx-1">/</span>
                  </template>
                </template>
              </td>

              <td v-if="i.note" lt-sm:hidden>
                {{ i.note }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.prose .list-collection td {
  --uno: align-middle;
  line-height: 1.35;
  /* 汉字墨迹在行框里偏上，等比内边距看着反而更贴近上分割线；
     实测（3 倍截图像素扫描）上面多给 4px 才能让墨迹到上下两条线等距 */
  padding-top: 12px;
  padding-bottom: 8px;
}
</style>
