<script setup lang="ts">
import type { Favorites, FavoritesItem, FavoritesType } from '~/data/favorites'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { favorites } = defineProps<{
  favorites: Favorites
}>()
const route = useRoute()
const queryType = computed(() => {
  return route.query.type as FavoritesType || 'anime'
})
const typeKeys = computed(() => Object.keys(favorites) as FavoritesType[])
const typeLabels: Record<FavoritesType, string> = {
  anime: '动画',
  movie: '电影',
  book: '书籍',
  game: '游戏',
}
const wikiBaseUrl = 'https://zh.wikipedia.org/wiki/'

function getWikiUrl(item: FavoritesItem) {
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
          ? 'bg-hex-050505 dark:bg-white text-white! dark:text-hex-050505!'
          : 'op-70 hover:op-100'"
      >
        {{ typeLabels[type] }}
      </RouterLink>
    </div>

    <template
      v-for="type in typeKeys"
      :key="type"
    >
      <table
        v-show="type === queryType" font-400
        important-mt-4
      >
        <tbody>
          <template v-for="i of favorites[type]" :key="i.name">
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
