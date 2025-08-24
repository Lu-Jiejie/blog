<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const { y: scrollY } = useWindowScroll()
</script>

<template>
  <button
    title="Scroll to Top" :class="scrollY > 300 ? 'op30' : '!op0 pointer-events-none'"
    z-100
    fixed right-4 bottom-4 w-10 h-10 rounded-full hover:op-100
    hover-bg-hex-8883 transition cursor-pointer
    duration-300 print:hidden @click="toTop()"
  >
    <div i-icon-park-outline-to-top-one />
  </button>
</template>
