<script lang="ts">
export const globalScrollbarOptions: PartialOptions = {
  scrollbars: {
    visibility: 'auto',
    autoHide: 'leave',
    autoHideDelay: 600,
    clickScroll: true,
  },
  overflow: {
    x: 'hidden',
    y: 'scroll',
  },
}
</script>

<!-- eslint-disable import/first -->
<script setup lang="ts">
import type { PartialOptions } from 'overlayscrollbars'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
import { computed } from 'vue'

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
