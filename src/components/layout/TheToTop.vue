<script setup lang="ts">
import { useEventListener, useWindowScroll } from '@vueuse/core'
import { computed, ref } from 'vue'

const isBrowser = typeof window !== 'undefined'

function toTop() {
  if (isBrowser)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const { y: scrollY } = useWindowScroll()
const documentHeight = ref(0)

function getDocumentHeight() {
  if (!isBrowser)
    return 0

  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight,
  )
}

const scrollPercentage = computed(() => {
  if (!isBrowser || documentHeight.value === 0)
    return 0

  const windowHeight = window.innerHeight
  const scrollable = documentHeight.value - windowHeight
  if (scrollable <= 0)
    return 0

  return Math.min(Math.round((scrollY.value / scrollable) * 100), 100)
})

if (isBrowser) {
  documentHeight.value = getDocumentHeight()

  useEventListener('scroll', () => {
    documentHeight.value = getDocumentHeight()
  })

  useEventListener('resize', () => {
    documentHeight.value = getDocumentHeight()
  })
}
</script>

<template>
  <button
    @click="toTop()"
    title="Scroll to Top" :class="scrollY > 300 ? 'op30' : '!op0 pointer-events-none'"
    z-100 fixed right-4 bottom-4 w-10 h-10 rounded-full hover:op-70
    hover-bg-hex-8883 transition cursor-pointer duration-300 print:hidden
  >
    <svg
      absolute inset-0 w-full h-full z-0 op-70 lt-sm:hidden
      style="transform: rotate(-90deg);"
      viewBox="0 0 100 100"
    >
      <!-- <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" stroke-opacity="0.2" stroke-width="5" /> -->
      <circle
        cx="50" cy="50" r="45"
        fill-transparent
        stroke="currentColor"
        stroke-width="5"
        :stroke-dasharray="`${scrollPercentage * 2.83}, 283`"
      />
    </svg>

    <div
      i-icon-park-outline-to-top-one
      relative z-1 color-inherit op-85
    />
  </button>
</template>
