<script setup lang="ts">
import { isZh } from '~/logic/i18n'

defineProps<{
  title: string
  titleZh: string
  icon: string
  prepared: boolean
}>()
</script>

<template>
  <div
    slide-enter select-none mx-auto w-full p-2 rounded-md
    border="~ base"
  >
    <div flex="~ items-center justify-between" min-h-6>
      <span text-sm op-90 block>
        {{ isZh ? titleZh : title }}
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
