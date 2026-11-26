<script setup lang="ts">
import type { ThinkingEntry } from '~/types'
import { computed } from 'vue'
import { formatEntryTime } from '~/composables/useThinking'
import { renderMarkdown } from '~/logic/markdown'
import RefCard from './RefCard.vue'

const props = defineProps<{
  entry: ThinkingEntry
  index?: number
}>()

const html = computed(() => (props.entry.text ? renderMarkdown(props.entry.text) : ''))
</script>

<template>
  <article
    class="entry"
    slide-enter
    :style="{ '--enter-stage': index ?? 0, '--enter-step': '40ms' }"
  >
    <time class="entry-time" :datetime="entry.timestamp">
      {{ formatEntryTime(entry.timestamp) }}
    </time>

    <div class="entry-main">
      <!-- 正文是运行时渲染的 markdown（见 logic/markdown.ts），已关掉原始 HTML -->
      <div v-if="html" class="entry-text" v-html="html" />
      <RefCard v-if="entry.ref" :item="entry.ref" />
    </div>
  </article>
</template>

<style scoped>
.entry {
  --uno: flex flex-col gap-2 py-6;
}

.entry + .entry {
  --uno: border-t border-[var(--c-border-light)];
}

/* 时间放在正文上方，单独一行；不用纯装饰性的极浅灰，得看得清 */
.entry-time {
  --uno: text-xs tabular-nums op-55;
}

.entry-main {
  --uno: flex min-w-0 flex-1 flex-col gap-3;
}

.entry-text {
  --uno: text-[0.95rem] leading-7 op-85;
  overflow-wrap: anywhere;
}

.entry-text :deep(p) {
  --uno: m-0;
}

.entry-text :deep(p + p) {
  --uno: mt-3;
}

.entry-text :deep(a) {
  --uno: underline underline-offset-2 decoration-[var(--c-border-medium)];
}

.entry-text :deep(a:hover) {
  text-decoration-color: currentColor;
}

.entry-text :deep(code) {
  --uno: font-mono text-[0.85em] px-1 py-0.5 rounded bg-[var(--c-fill)];
}

.entry-text :deep(pre) {
  --uno: my-3 p-3 rounded bg-[var(--c-surface)] overflow-x-auto text-sm;
}

.entry-text :deep(ul),
.entry-text :deep(ol) {
  --uno: my-2 pl-5;
}

.entry-text :deep(ul) {
  --uno: list-disc;
}

.entry-text :deep(ol) {
  --uno: list-decimal;
}

.entry-text :deep(blockquote) {
  --uno: my-3 pl-3 border-l-2 border-[var(--c-accent)] op-70;
}
</style>
