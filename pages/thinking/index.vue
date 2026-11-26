<script setup lang="ts">
import { useHead } from '@unhead/vue'
import NProgress from 'nprogress'
import { watch } from 'vue'
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

if (!import.meta.env.SSR) {
  // 数据请求不在路由切换里，nprogress 得自己开关一次：只在顶上走一条细线，不占版面
  watch(isLoading, loading => (loading ? NProgress.start() : NProgress.done()), { immediate: true })
}
</script>

<template>
  <!-- 标题块与 PageLayout 保持一致 -->
  <div class="prose" max-w-[var(--prose-max-width)] m-auto mb-6 text-center>
    <h1 text-4xl>
      随想
    </h1>
    <!-- 和 PageLayout 里的 frontmatter description 一致：把 .prose p 的 margin-top 压回去 -->
    <p class="intro" m="t--4!">
      我思故我在。
    </p>
  </div>

  <div class="list-wrap" :class="prepared && 'is-ready'">
    <span class="sr-only" role="status">{{ prepared ? '随想已载入' : '正在载入随想' }}</span>

    <p v-if="hasError" py-12 text-center text-[var(--c-text-muted)]>
      暂时读不到随想。
    </p>

    <p v-else-if="prepared && !entries.length" py-12 text-center text-[var(--c-text-faint)]>
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
  --uno: max-w-[var(--prose-max-width)] m-auto p-b-8;
}

/* 数据到了整体淡入；读数据期间不占位，只靠顶部那条 nprogress 细线示意 */
.list-wrap.is-ready {
  animation: fade-in 0.4s ease both;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 与 PageLayout 的 frontmatter description 完全一致：斜体、淡一档、负 margin-top 抵消 .prose p 的上间距 */
.intro {
  --uno: italic;

  color: var(--c-text-muted);
}
</style>
