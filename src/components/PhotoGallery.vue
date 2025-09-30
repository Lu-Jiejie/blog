<script setup lang="ts">
import type { PhotoData } from '~/photos/data'
import { blurhashToCssGradientString } from '@unpic/placeholder'
import { useWindowSize } from '@vueuse/core'
import { computed } from 'vue'
import { isZh } from '~/logic/i18n'
import photos from '~/photos/data'

const indexedPhotos = photos.map((p, i) => ({ ...p, index: i }))
const breakpoints = [1280, 1024, 768]
const columnCounts = [4, 3, 2, 1]
const { width: windowWidth } = useWindowSize()
const masonryCols = computed(() => {
  for (let i = 0; i < breakpoints.length; i++) {
    if (windowWidth.value >= breakpoints[i])
      return columnCounts[i]
  }
  return columnCounts[columnCounts.length - 1]
})
const masonryColumns = computed(() => {
  const cols: (PhotoData & { index: number })[][] = Array.from({ length: masonryCols.value }, () => [])
  const colHeights = Array.from({ length: masonryCols.value }, () => 0)
  const tolerance = 150
  indexedPhotos.forEach((img) => {
    const minHeight = Math.min(...colHeights)
    const candidateCols = colHeights
      .map((h, idx) => ({ h, idx }))
      .filter(c => c.h <= minHeight + tolerance)
    const chosen = candidateCols[0].idx
    cols[chosen].push(img)
    colHeights[chosen] += img.height || 1
  })
  return cols
})
</script>

<template>
  <div flex="~ gap-4" class="photos">
    <div
      v-for="(col, colIdx) in masonryColumns"
      :key="colIdx"
      flex="~ 1 col"
    >
      <div
        v-for="p in col" :key="p.name" class="relative mb-4 w-full rounded"
        :style="{
          backgroundImage: p.blurhash ? blurhashToCssGradientString(p.blurhash) : undefined,
          backgroundSize: 'cover',
        }"
      >
        <img
          :src="p.url"
          :alt="isZh ? p.textZh || p.text : p.text"
          :width="p.width"
          :height="p.height"
          loading="lazy"
          :data-image-index="p.index"
          class="w-full rounded"
          @error="e => ((e.target as HTMLImageElement).style.opacity = '0')"
        >
      </div>
    </div>
  </div>
</template>
