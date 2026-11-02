<script setup lang="ts">
import type { PartialOptions } from 'overlayscrollbars'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { computed } from 'vue'
import { globalScrollbarOptions } from '~/config/scrollbar'

const props = withDefaults(defineProps<{
  options?: PartialOptions
  element?: string
}>(), {
  element: 'div',
})

const mergedOptions = computed(() => ({
  ...globalScrollbarOptions,
  ...props.options,
  scrollbars: {
    ...globalScrollbarOptions.scrollbars,
    ...(props.options?.scrollbars || {}),
  },
}))
</script>

<template>
  <OverlayScrollbarsComponent
    :element="element"
    :options="mergedOptions"
    v-bind="$attrs"
    defer
  >
    <slot />
  </OverlayScrollbarsComponent>
</template>
