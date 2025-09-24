<script setup lang="ts">
import type { Media, MediaItem, MediaType } from '~/data/media'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const { media } = defineProps<{
  media: Media
}>()
const route = useRoute()
const queryType = computed(() => {
  return route.query.type as MediaType || 'anime'
})
const typeKeys = computed(() => Object.keys(media) as MediaType[])
const wikipediaBaseUrl = 'https://en.wikipedia.org/wiki/'

function getWikiUrl(item: MediaItem) {
  if (item.wikiKeywordEN) {
    return `${wikipediaBaseUrl}${item.wikiKeywordEN}`
  }
  if (item.wikiUrlFallback) {
    return item.wikiUrlFallback
  }
  return `${wikipediaBaseUrl}${item.name}`
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
        {{ type }}
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
            <tr :lang="i.lang">
              <!-- <td>{{ i.name }}</td> -->
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
