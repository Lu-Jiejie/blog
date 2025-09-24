<script setup lang="ts">
import type { Media, MediaItem, MediaType } from '~/data/media'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { isZh, useI18n } from '~/logic/i18n'

const { media } = defineProps<{
  media: Media
}>()
const route = useRoute()
const queryType = computed(() => {
  return route.query.type as MediaType || 'anime'
})
const typeKeys = computed(() => Object.keys(media) as MediaType[])
const wikiBaseUrl = 'https://en.wikipedia.org/wiki/'
const wikiBaseUrlZh = 'https://zh.wikipedia.org/wiki/'

const $t = useI18n({
  en: {
    anime: 'Anime',
    movie: 'Movie',
    book: 'Book',
    game: 'Game',
  },
  zh: {
    anime: '动画',
    movie: '电影',
    book: '书籍',
    game: '游戏',
  },
})

function getWikiUrl(item: MediaItem) {
  // zh
  if (isZh.value) {
    if (item.wikiKeywordZh) {
      return `${wikiBaseUrlZh}${item.wikiKeywordZh}`
    }
    return `${wikiBaseUrlZh}${item.nameZh || item.name}`
  }
  // en
  if (item.wikiKeywordEn) {
    return `${wikiBaseUrl}${item.wikiKeywordEn}`
  }
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
        {{ $t[type] }}
      </RouterLink>
    </div>

    <template
      v-for="type in typeKeys"
      :key="type"
    >
      <table
        v-show="type === queryType" font-400
        lang="ja"
        important-mt-4
      >
        <tbody>
          <template v-for="i of media[type]" :key="i.name">
            <tr :lang="isZh ? 'zh' : i.lang">
              <!-- <td>{{ i.name }}</td> -->
              <td>
                <a
                  :href="getWikiUrl(i)"
                  class="no-prose" target="_blank"
                >{{ isZh ? i.nameZh : i.name }}</a>
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
