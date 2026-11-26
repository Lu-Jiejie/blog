<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { useThinking } from '~/composables/useThinking'

useHead({
  title: '随想 - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: '鹿解解的随想：我思故我在。',
    },
  ],
})

const { entries, isLoading, hasError, prepared } = useThinking()
</script>

<template>
  <!-- 标题块与 PageLayout 保持一致 -->
  <div class="prose" max-w-70ch m-auto mb-6 text-center>
    <h1 text-4xl>
      随想
    </h1>
    <!-- 和 PageLayout 里的 frontmatter description 一致：把 .prose p 的 margin-top 压回去 -->
    <p class="intro" m="t--4!">
      我思故我在。
    </p>
  </div>

  <div class="list-wrap">
    <p v-if="hasError" py-12 op-50 text-center>
      暂时读不到随想。
    </p>
    <p v-else-if="isLoading" py-12 op-40 text-center>
      载入中…
    </p>

    <p v-else-if="prepared && !entries.length" py-12 op-40 text-center>
      还没写什么。
    </p>

    <template v-else-if="prepared">
      <EntryItem
        v-for="(entry, idx) in entries"
        :key="entry.timestamp"
        :entry="entry"
        :index="idx"
      />
    </template>
  </div>
</template>

<style scoped>
.list-wrap {
  --uno: max-w-70ch m-auto p-b-8;
}

/* 与 PageLayout 的 frontmatter description 完全一致：斜体、淡一档、负 margin-top 抵消 .prose p 的上间距 */
.intro {
  --uno: op-60 italic;
}
</style>
