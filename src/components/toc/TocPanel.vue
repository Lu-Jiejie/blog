<script setup lang="ts">
import type { TocItem } from '~/types'
import { useScroll } from '@vueuse/core'
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  headings: TocItem[]
  visible: boolean
  activeId: string
}>()

const emit = defineEmits<{
  close: []
}>()

const panelEl = ref<HTMLElement>()

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

  emit('close')
}

// 当 panel 打开时，检查 active 项是否可见，不可见则滚动到它
watch(() => props.visible, async (isVisible) => {
  if (!isVisible || !props.activeId || !panelEl.value)
    return

  await nextTick()

  const activeLink = panelEl.value.querySelector(`a[href="#${props.activeId}"]`)
  if (activeLink) {
    activeLink.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
    })
  }
})
</script>

<template>
  <nav
    ref="panelEl"
    fixed z-200
    top="[10%]" left="1/2" un-translate="x--1/2"
    w="[90%]"
    p="x-6 y-4" rounded-lg
    flex="~ col" bg="[var(--c-bg)]"
    shadow="[0_0_10px_0_rgba(0,0,0,0.3)] dark:[0_0_10px_0_rgba(255,255,255,0.3)]"
    transition="opacity duration-300"
    :class="visible ? 'op-100' : 'op-0 pointer-events-none'"
    aria-label="Table of contents"
    style="max-height: calc(100vh - 10% - 30%);"
  >
    <div pb-2 border-b op-60>
      Table of Contents
    </div>
    <Scrollbar
      element="ul"
      text-sm mt-3
      style="max-height: calc(80vh - 4rem); overflow: hidden;"
      defer
    >
      <li v-for="heading in headings" :key="heading.slug">
        <Link
          :href="`#${heading.slug}`"
          block py-1 decoration-none
          transition-opacity
          :aria-current="activeId === heading.slug ? 'true' : undefined"
          :class="[
            heading.depth === 2 && 'pl-0',
            heading.depth === 3 && 'pl-4',
            heading.depth === 4 && 'pl-8',
            activeId === heading.slug ? 'op-100!' : 'op-50 hover:op-75',
          ]"
          @click="scrollToHeading($event, heading.slug)"
        >
          {{ heading.text }}
        </Link>
      </li>
    </Scrollbar>
  </nav>
</template>
