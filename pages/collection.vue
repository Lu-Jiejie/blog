<script setup lang="ts">
import { useHead } from '@unhead/vue'
import NProgress from 'nprogress'
import { watch } from 'vue'
import { useCollection } from '~/composables/useCollection'

useHead({
  title: '收藏 - Lu Jiejie',
  meta: [
    {
      name: 'description',
      content: 'Lu Jiejie 的收藏',
    },
  ],
})

const { collection, isLoading, hasError, prepared } = useCollection()

if (!import.meta.env.SSR) {
  // 数据请求不在路由切换里，nprogress 得自己开关一次：只在顶上走一条细线，不占版面
  watch(isLoading, loading => (loading ? NProgress.start() : NProgress.done()), { immediate: true })
}

const contents = [
  '这里收录了那些曾打动我的作品——为记忆，为分享，也为共鸣的喜悦。',
  '呈现于此的，只是旅途中陪伴我的众多作品之一角。',
]
</script>

<template>
  <div class="prose" m-auto mb-8>
    <h1>收藏</h1>
  </div>
  <div class="prose" m-auto>
    <p v-for="(c, cidx) in contents" :key="cidx" v-html="c" />
  </div>

  <div class="list-wrap" :class="prepared && 'is-ready'">
    <span class="sr-only" role="status">{{ prepared ? '收藏已载入' : '正在载入收藏' }}</span>

    <p v-if="hasError" py-12 text-center text-[var(--c-text-muted)]>
      暂时读不到收藏。
    </p>

    <template v-else-if="prepared">
      <!-- 表格样式全部挂在 .prose 下（prose.css 的 table/tr/td 规则 + ListCollection 自己的
           .prose .list-collection td），所以这里必须再包一层，不能直接放进 .list-wrap -->
      <div class="prose">
        <ListCollection :collection="collection" />
      </div>
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
</style>
