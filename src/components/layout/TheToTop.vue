<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { onMounted, onUnmounted, ref } from 'vue'

// 检查是否在浏览器环境中
const isBrowser = typeof window !== 'undefined'

// 回到顶部函数
function toTop() {
  if (isBrowser)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 初始化数据，避免SSR报错
const scrollY = ref(0)
const documentHeight = ref(0)
const scrollPercentage = ref(0)

// 更新文档高度
function updateDocumentHeight() {
  if (!isBrowser)
    return

  documentHeight.value = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight,
  )
}

// 计算滚动百分比
function calculateScrollPercentage() {
  if (!isBrowser)
    return

  const windowHeight = window.innerHeight
  const scrollable = documentHeight.value - windowHeight
  if (scrollable <= 0) {
    scrollPercentage.value = 0
    return
  }

  scrollPercentage.value = Math.min(Math.round((scrollY.value / scrollable) * 100), 100)
}

// 浏览器环境下的逻辑
if (isBrowser) {
  // 使用 vueuse 的 windowScroll 获取滚动位置
  const { y } = useWindowScroll()

  // 监听滚动更新值
  const updateScrollY = () => {
    scrollY.value = y.value
    calculateScrollPercentage()
  }

  // 组件挂载时设置
  onMounted(() => {
    updateScrollY()
    updateDocumentHeight()
    calculateScrollPercentage()

    window.addEventListener('scroll', updateScrollY)
    window.addEventListener('resize', updateDocumentHeight)
    window.addEventListener('scroll', updateDocumentHeight)
  })

  // 组件卸载时移除监听器
  onUnmounted(() => {
    window.removeEventListener('scroll', updateScrollY)
    window.removeEventListener('resize', updateDocumentHeight)
    window.removeEventListener('scroll', updateDocumentHeight)
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
