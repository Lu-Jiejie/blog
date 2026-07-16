<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { computed } from 'vue'

interface Props {
  href: string
  title: string
  icon: string
  hoverColor: string
  hoverColorDark?: string
}

const props = defineProps<Props>()

const isDark = useDark()
const effectiveHoverColor = computed(() =>
  isDark.value ? (props.hoverColorDark || props.hoverColor) : props.hoverColor,
)
</script>

<template>
  <Link
    :href="href"
    external
    :title="title"
    flex="~" items-center justify-center
    w-10 h-10
    rounded-full
    p-2.5
    op-50
    :style="{
      '--hover-color': effectiveHoverColor,
    }"
    class="social-btn"
    transition-all duration-300
  >
    <div :class="icon" class="social-btn-icon" />
  </Link>
</template>

<style scoped>
.social-btn {
  border: 1.5px solid color-mix(in srgb, var(--c-fg) 40%, transparent) !important;
}
.social-btn:hover {
  opacity: 1 !important;
  border-color: var(--hover-color) !important;
}
.social-btn:hover .social-btn-icon {
  color: var(--hover-color);
}
</style>
