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
  <section
    class="card-chapter"
    slide-enter select-none mx-auto w-full max-w-3xl
  >
    <!-- 章题：脱离卡片置于左上，细线延伸至右端徽记 -->
    <header flex="~ items-center gap-3" mb-2.5>
      <h2
        class="chapter-title"
        font-serif text-lg sm:text-xl leading-snug tracking-wide
      >
        {{ isZh ? titleZh : title }}
      </h2>
      <div class="chapter-rule" flex-auto min-w-6 h-1px />
      <div :class="icon" text-lg flex-shrink-0 op-90 />
    </header>

    <!-- 卡片本体 -->
    <div
      p-4 rounded-md bg-white dark:bg-hex-050505
      border="~ hex-8887"
    >
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
  </section>
</template>

<style scoped>
.chapter-title {
  color: var(--c-fg-deep);
}

.chapter-rule {
  background-color: #8883;
}
</style>
