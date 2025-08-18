<script setup lang="ts">
import type { Post } from '~/types'
import { useRouter } from 'vue-router'
import { formatDate } from '~/logic'

type PostRoute = {
  path: string
} & Post

const props = defineProps<{
  category?: string
}>()

const router = useRouter()
const posts: PostRoute[] = router.getRoutes()
  .filter(r =>
    r.path.startsWith('/posts')
    && !r.path.endsWith('.html')
    && r.meta.frontmatter.date
    && (
      props.category === undefined
      || r.meta.frontmatter.category === props.category
    ),
  )
  .map(r => ({
    path: r.path,
    ...(r.meta.frontmatter),
  }))

function getYear(date: Date | string | number) {
  // console.log(date, new Date(date).getFullYear())
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
          font-bold text-stroke-2 text-stroke-hex-aaa op-10
        >{{ getYear(post.date) }}</span>
      </div>

      <RouterLink
        :to="post.path" class="item"
        block font-normal m="b-6 t-2"
      >
        <li flex="~ col gap-2 md:row md:items-center">
          <!-- category & title -->
          <div leading-1.2em flex="~ wrap">
            <span
              v-if="!category"
              align-middle flex-none
              text-xs rounded bg-hex-a1a1a160 text-hex-a1a1a1
              p="x-1 y-0.5" m="l--12 r-2 y-auto"
              hidden md:important-block
            >
              {{ post.category }}
            </span>
            <span text-lg>
              {{ post.title }}
            </span>
          </div>

          <!-- extra info -->
          <div text-sm ws-nowrap op-50 flex="~ gap-2 items-center wrap">
            <span>
              {{ formatDate(post.date, true) }}
            </span>
            <!-- <span> · </span> -->
            <span v-if="post.place">
              {{ post.place }}
            </span>
            <div>
              <RouterLink
                v-for="tag in post.tags" :key="tag" :to="`/tags/${tag}`"
              >
                #{{ tag }}
              </RouterLink>
            </div>
          </div>
        </li>
      </RouterLink>
    </template>
  </ul>
</template>
