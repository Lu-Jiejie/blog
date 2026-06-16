<script setup lang="ts">
import type { TocItem } from '~/types'
import { useElementHover, useScroll } from '@vueuse/core'
import { computed, ref } from 'vue'
import TheScrollbar from '../base/Scrollbar.vue'

defineProps<{
  headings: TocItem[]
  activeId: string
}>()

const tocEl = ref<HTMLElement>()
const isTocHovered = useElementHover(tocEl)

const articleEl = computed(() => typeof document !== 'undefined' ? document.querySelector('article') : null)
const isArticleHovered = useElementHover(articleEl)

const tocOpacity = computed(() => {
  return (isTocHovered.value || isArticleHovered.value) ? 1 : 1
})

const { y: windowY } = useScroll(() => typeof window !== 'undefined' ? window : null)

function scrollToHeading(event: Event, id: string) {
  event.preventDefault()

  const el = document.getElementById(id)
  if (el) {
    const offset = 25
    const targetTop = el.getBoundingClientRect().top + windowY.value - offset

    window.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    })

    history.replaceState(null, '', `#${id}`)
  }
}
</script>

<template>
  <nav
    id="toc-sidebar"
    fixed top-40 left-20
    w-auto max-w-50
    text-sm z-400
    transition-opacity duration-700
    aria-label="Table of contents"
    style="max-height: 70vh; display: flex; flex-direction: column;"
    :style="{ opacity: tocOpacity }" ref="tocEl"
  >
    <TheScrollbar
      element="ul" op-70
      flex-1 min-h-0
    >
      <li v-for="heading in headings" :key="heading.slug">
        <Link
          :href="`#${heading.slug}`"
          py-1 pr-4
          :aria-current="activeId === heading.slug ? 'true' : undefined"
          :class="[
            heading.depth === 2 && 'pl-0',
            heading.depth === 3 && 'pl-4',
            heading.depth === 4 && 'pl-8',
          ]"
          @click="scrollToHeading($event, heading.slug)"
        >
          <span line-clamp-2>{{ heading.text }}</span>
        </Link>
      </li>
    </TheScrollbar>
  </nav>
</template>

<style scoped>
#toc-sidebar a {
  opacity: 0.6;
}
#toc-sidebar a:hover {
  opacity: 0.8;
}
#toc-sidebar a[aria-current='true'] {
  opacity: 1;
}
</style>
