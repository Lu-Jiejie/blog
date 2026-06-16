<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  href: string
  title?: string
  rel?: string
  external?: boolean
  showNewTabIcon?: boolean
  border?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  external: false,
  showNewTabIcon: false,
  border: false,
})

const isExternal = computed(() => props.external || /^https?:\/\/|\/\//i.test(props.href))
const componentTag = computed(() => isExternal.value ? 'a' : 'RouterLink')

const dynamicAttrs = computed(() => {
  if (isExternal.value) {
    return {
      href: props.href,
      target: '_blank',
      rel: `noopener noreferrer ${props.rel || ''}`.trim(),
    }
  }
  return { to: props.href }
})

const ariaLabel = computed(() => props.title ? props.title : isExternal.value ? 'Open in new tab' : undefined)
const shouldShowIcon = computed(() => isExternal.value && props.showNewTabIcon)
</script>

<template>
  <component
    :is="componentTag"
    v-bind="dynamicAttrs"
    :title="title"
    :aria-label="ariaLabel"

    class="[&.router-link-active]:op-100"
    :class="[
      !props.border ? '!border-none' : '',
    ]"
    leading-normal
    relative no-underline
    op="60 hover:100"
    transition="all! duration-300"
  >
    <slot />

    <span
      v-if="shouldShowIcon"
      u-i-carbon-arrow-up-right=""
      class="new-tab-icon ml-1"
      aria-hidden="true"
    />
  </component>
</template>
