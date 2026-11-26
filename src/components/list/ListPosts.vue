<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '~/logic'

const router = useRouter()
const routes = router.getRoutes()

const posts = computed(() =>
  routes
    // 目录页自身也匹配 /posts/ 前缀，靠 date 区分文章
    .filter(r => r.path.startsWith('/posts/') && r.meta.frontmatter?.date)
    .map(r => ({
      path: r.path,
      ...r.meta.frontmatter!,
    }))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
)

function getYear(date: Date | string | number) {
  return new Date(date).getFullYear()
}
function isSameYear(date1?: Date | string | number, date2?: Date | string | number) {
  return date1 && date2 && getYear(date1) === getYear(date2)
}
</script>

<template>
  <ul>
    <div v-if="!posts.length" py-2 op-50>
      Nothing to see here yet.
    </div>
    <template v-for="post, idx in posts" v-else :key="post.title">
      <!-- Post Year Header -->
      <div
        v-if="!isSameYear(post.date, posts[idx - 1]?.date)"
        relative select-none pointer-events-none
        h-20 slide-enter
        :style="{
          '--enter-stage': idx - 2,
          '--enter-step': '60ms',
        }"
      >
        <span
          absolute text-8em color-transparent left--2.5rem top--2rem
          font-bold text-stroke-2 text-stroke-[var(--c-border-medium)] op-10
        >{{ getYear(post.date) }}</span>
      </div>

      <div
        slide-enter
        :style="{
          '--enter-stage': idx,
          '--enter-step': '60ms',
        }"
      >
        <UiLink
          :href="post.path" block font-normal m="b-6 t-2"
        >
          <li flex="~ col gap-2 md:row md:items-center">
            <!-- type & title -->
            <div leading-1.2em relative>
              <span text-lg block>
                {{ post.title }}
              </span>
            </div>

            <!-- extra info -->
            <div text-sm ws-nowrap flex="~ gap-2 items-center wrap">
              <span op-50>
                {{ formatDate(post.date, true) }}
              </span>
              <!-- <span> · </span> -->
              <span v-if="post.place" op-50>
                {{ post.place }}
              </span>
            </div>
          </li>
        </UiLink>
      </div>
    </template>
  </ul>
</template>
