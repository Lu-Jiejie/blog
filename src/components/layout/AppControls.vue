<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { onMounted, ref } from 'vue'
import { hasTocHeadings, isTocOpen } from '~/state/toc'

const TOP_THRESHOLD = 300
const scrolled = ref(false)

function toTop() {
  if (typeof window !== 'undefined')
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function updateScrolled() {
  // OverlayScrollbars 接管后滚动量可能落在 body 而不是 window，三处取最大值才可靠
  const y = Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop)
  scrolled.value = y > TOP_THRESHOLD
}

// 滚动事件不冒泡，只有捕获阶段才能在 window 上收到 body 的滚动
useEventListener('scroll', updateScrolled, { capture: true, passive: true })

onMounted(updateScrolled)
</script>

<template>
  <div
    fixed bottom-5 right-5 z-50
    print:hidden select-none
    flex="~ col" items-center gap-1
  >
    <button
      v-if="hasTocHeadings"
      id="toc-open-button"
      class="toc:hidden text-[var(--c-text-muted)] hover:text-[var(--c-accent)]"
      w-10 h-10 rounded-full
      flex="~" items-center justify-center
      bg="[var(--c-fill)]"
      op="70 hover:100"
      transition-opacity duration-300
      cursor-pointer
      title="目录"
      @click="isTocOpen = true"
    >
      <div i-lucide-table-of-contents />
    </button>

    <button
      id="to-top-button"
      w-10 h-10 rounded-full
      flex="~" items-center justify-center
      bg="[var(--c-fill)]"
      class="text-[var(--c-text-muted)] hover:text-[var(--c-accent)]"
      transition="all duration-300"
      title="回到顶部"
      :class="scrolled ? 'op-70 hover:op-100 cursor-pointer' : 'op-0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>
  </div>
</template>
