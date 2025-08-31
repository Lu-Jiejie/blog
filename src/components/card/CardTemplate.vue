<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  prepared: boolean
}>()
</script>

<template>
  <div
    slide-enter select-none mx-auto w-full p-2 rounded-md
    border="~ base"
  >
    <div flex="~ items-center justify-between">
      <span text-sm op-90 block>
        {{ title }}
      </span>
      <div :class="icon" text-xl />
    </div>
    <div mt-2>
      <Transition name="fade">
        <div v-if="prepared" key="content">
          <slot />
        </div>
      </Transition>
      <div v-if="!prepared" key="loading">
        <slot name="loading">
          <CardLoading />
        </slot>
      </div>
    </div>
  </div>
</template>
