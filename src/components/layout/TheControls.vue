<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { hasTocHeadings, isTocOpen } from '~/composables/useToc'

function toTop() {
  if (typeof window !== 'undefined')
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// VueUse 全局滚动轴监听
const { y: scrollY } = useWindowScroll()
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
      class="toc:hidden"
      w-10 h-10 rounded-full
      flex="~" items-center justify-center
      bg="hex-8883"
      op="70 hover:100"
      transition-opacity duration-300
      cursor-pointer
      title="Open table of contents"
      @click="isTocOpen = true"
    >
      <div i-lucide-table-of-contents text-gray-700 dark:text-gray-200 />
    </button>

    <button
      id="to-top-button-mobile"
      class="toc:hidden"
      w-10 h-10 rounded-full
      flex="~" items-center justify-center
      bg="hex-8883"
      op="70 hover:100"
      transition-opacity duration-300
      cursor-pointer
      title="Scroll to top"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line text-gray-700 dark:text-gray-200 />
    </button>

    <button
      id="to-top-button-desktop"
      class="hidden toc:flex"
      w-10 h-10 rounded-full
      items-center justify-center
      transition duration-300
      title="Scroll to top"
      :class="scrollY > 300 ? 'op30 hover:op100 hover-bg-hex-8883 cursor-pointer' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line text-gray-700 dark:text-gray-200 />
    </button>
  </div>
</template>
