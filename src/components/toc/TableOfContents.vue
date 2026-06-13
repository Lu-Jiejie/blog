<script setup lang="ts">
import { useScroll, useScrollLock } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { hasTocHeadings, isTocOpen } from '~/composables/useToc'
import Backdrop from '../base/Backdrop.vue'
import TocPanel from './TocPanel.vue'
import TocSidebar from './TocSidebar.vue'

const route = useRoute()
const headings = computed(() => route.meta.toc || [])

watch(headings, (newHeadings) => {
  hasTocHeadings.value = newHeadings.length > 0
}, { immediate: true })

const isLocked = useScrollLock(document)
watch(isTocOpen, (open) => {
  isLocked.value = open
})

const activeId = ref<string>('')
const articleEl = ref<HTMLElement | null>(null)
const cachedHeadingElements = ref<HTMLElement[]>([])

const { y: windowY } = useScroll(() => typeof window !== 'undefined' ? window : null)

watch(headings, async () => {
  if (typeof window === 'undefined')
    return

  await nextTick()

  articleEl.value = document.querySelector('article')

  cachedHeadingElements.value = Array.from(
    document.querySelectorAll('article h2, article h3, article h4'),
  )
}, { immediate: true })

watch(windowY, () => {
  if (typeof window === 'undefined' || !cachedHeadingElements.value.length)
    return

  const triggerLine = 65
  let currentActiveId = ''

  for (const el of cachedHeadingElements.value) {
    const top = el.getBoundingClientRect().top

    if (top <= triggerLine) {
      currentActiveId = el.id
    }
    else {
      break
    }
  }

  if (!currentActiveId && cachedHeadingElements.value.length > 0) {
    currentActiveId = cachedHeadingElements.value[0].id
  }

  activeId.value = currentActiveId
}, { immediate: true })
</script>

<template>
  <div v-if="hasTocHeadings">
    <TocSidebar :headings="headings" :active-id="activeId" hidden toc:flex! />

    <Backdrop :visible="isTocOpen" @close="isTocOpen = false">
      <TocPanel
        :headings="headings"
        :active-id="activeId"
        :visible="isTocOpen"
        @close="isTocOpen = false"
      />
    </Backdrop>
  </div>
</template>
