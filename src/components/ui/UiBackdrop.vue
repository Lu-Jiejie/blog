<script setup lang="ts">
import { useScrollLock } from '@vueuse/core'
import { watch } from 'vue'

const props = withDefaults(defineProps<{
  visible: boolean
  zIndex?: number
}>(), {
  zIndex: 500,
})

const emit = defineEmits<{
  close: []
}>()

const isLocked = useScrollLock(() => document.body)
watch(() => props.visible, (val) => {
  isLocked.value = val
})
</script>

<template>
  <Teleport to="body">
    <div
      :style="{ zIndex }"
      class="fixed inset-0 flex items-center justify-center print:hidden transition-opacity duration-300"
      :class="visible ? 'op-100' : 'op-0 pointer-events-none'"
    >
      <div
        absolute inset-0 bg="[var(--c-bg)]" op-80 z--1
        @click="emit('close')"
      />

      <div class="relative z-10 pointer-events-auto">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
