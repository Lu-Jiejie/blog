<script setup lang="ts">
import type { Fn } from '@vueuse/core'
import { useEventListener } from '@vueuse/core'
import { ref, watch } from 'vue'

const imageModel = ref<HTMLImageElement>()
const imageAlt = ref<string>()

const cleanupMoveEvent = ref<Fn>()
const cleanupKeydownEvent = ref<Fn>()
const nextImageEvent = ref<Fn>()

function setImageModel(img: HTMLImageElement) {
  imageModel.value = img
  imageAlt.value = img.alt
  const figure = img.closest('figure')
  if (figure) {
    const caption = figure.querySelector('figcaption')
    if (caption?.textContent) {
      imageAlt.value ||= caption.textContent
    }
  }
}

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLImageElement

  if (first.tagName !== 'IMG'
    || first.classList.contains('no-preview')
    || path.some(el => el instanceof HTMLElement && ['A', 'BUTTON'].includes(el.tagName))
    || !path.some(el => el instanceof HTMLElement && (el.classList.contains('prose') || el.classList.contains('photos')))) {
    return
  }

  const pos = first.getBoundingClientRect()
  await new Promise(resolve => setTimeout(resolve, 50))
  const newPos = first.getBoundingClientRect()
  if (pos.left !== newPos.left || pos.top !== newPos.top) {
    return
  }
  setImageModel(first)
})

let lastVal: HTMLImageElement | undefined
watch(imageModel, (val) => {
  if (!lastVal && val) {
    // null => on
    cleanupMoveEvent.value = useEventListener(['wheel', 'touchmove'], e => e.preventDefault(), { passive: false })
    cleanupKeydownEvent.value = useEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
      }
    })
    nextImageEvent.value = useEventListener('keydown', (e) => {
      if (imageModel.value?.dataset.imageIndex == null
        || !(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const).includes(e.key as any)) {
        return
      }

      const index = Number.parseInt(imageModel.value.dataset.imageIndex)
      let nextIndex = index
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = index + 1
      }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = index - 1
      }

      const nextImage = document.querySelector(`img[data-image-index="${nextIndex}"]`) as HTMLImageElement
      if (nextImage) {
        setImageModel(nextImage)
        e.preventDefault()
      }
    })
  }
  else if (lastVal && !val) {
    // on => null
    cleanupMoveEvent.value?.()
    cleanupKeydownEvent.value?.()
    nextImageEvent.value?.()
  }
  lastVal = val
})
</script>

<template>
  <!-- 页脚贴底：min-h-screen + main 撑满剩余高度，内容不足一屏时也不会悬在半空 -->
  <div flex="~ col" min-h-screen>
    <AppHeader />

    <main flex-1 p="x-5 y-8" overflow-x-hidden>
      <RouterView />

      <AppBackButton />
    </main>

    <!-- 页脚与正文同宽，摆在自己的一层里以便贴底 -->
    <AppFooter />
  </div>

  <AppControls />

  <Transition name="fade">
    <div v-if="imageModel" fixed top-0 bottom-0 left-0 right-0 z-500 backdrop-blur-7 @click="imageModel = undefined">
      <div absolute top-0 bottom-0 left-0 right-0 bg-[#ffffffcc] dark:bg-[#000000cc] z--1 />
      <img
        :src="imageModel.src" :alt="imageModel.alt" :class="imageModel.className"
        max-w-screen max-h-screen w-full h-full object-contain
      >
      <div
        v-if="imageAlt"
        text-white dark:text-black
        class="bg-black/50 dark:bg-white/40"
        absolute bottom-5 right-5 p="x-2 y-1"
        flex="~ justify-center items-center" select-none
        max-w="[calc(100vw-5rem)]"
      >
        {{ imageAlt }}
      </div>
    </div>
  </Transition>
</template>
