<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const { y: scrollY } = useWindowScroll()
const documentHeight = ref(0)

// 更新文档高度
function updateDocumentHeight() {
  documentHeight.value = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight,
  )
}

// 监听窗口大小变化以更新文档高度
onMounted(() => {
  updateDocumentHeight()
  window.addEventListener('resize', updateDocumentHeight)
  window.addEventListener('scroll', updateDocumentHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDocumentHeight)
  window.removeEventListener('scroll', updateDocumentHeight)
})

const scrollPercentage = computed(() => {
  const windowHeight = window.innerHeight
  const scrollable = documentHeight.value - windowHeight
  if (scrollable <= 0)
    return 0
  return Math.min(Math.round((scrollY.value / scrollable) * 100), 100)
})
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
