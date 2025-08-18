<script setup lang="ts">
import type { Post } from '~/types'
import { useEventListener } from '@vueuse/core'
import { useCopyCode } from 'markdown-it-copy-code'
import { nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '~/logic'

const { frontmatter } = defineProps<{
  frontmatter: Post
}>()

const content = ref<HTMLDivElement>()
const router = useRouter()

onMounted(() => {
  // for copy code
  useCopyCode()

  const navigate = () => {
    if (location.hash) {
      const anchor = content.value?.querySelector(decodeURIComponent(location.hash))
      if (anchor) {
        const rect = anchor.getBoundingClientRect()
        window.scrollTo({
          top: window.scrollY + rect.top - 20,
          behavior: 'smooth',
        })
      }
    }
    return true
  }

  const handleAnchorClick = (event: MouseEvent & { target: HTMLElement }) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== location.origin) {
        return
      }

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        history.replaceState({}, '', hash)
        navigate()
      }
      else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(content.value, 'click', handleAnchorClick, { passive: false })
  useEventListener(window, 'hashchange', navigate)

  nextTick(() => {
    if (!navigate()) {
      setTimeout(navigate, 1000)
    }
  })
})
</script>

<template>
  <div
    v-if="frontmatter.display || frontmatter.title"
    class="prose" m-auto mb-8
  >
    <h1 mb-0>
      {{ frontmatter.display || frontmatter.title }}
    </h1>

    <p v-if="frontmatter.subtitle" m="t--5! b-6!" op-80 italic>
      {{ frontmatter.subtitle }}
    </p>

    <div op-60 m="t--5!" flex="~ gap-2 items-center wrap">
      <span>{{ formatDate(frontmatter.date, false) }}</span>
      <span v-if="frontmatter.place">
        {{ frontmatter.place }}
      </span>

      <!-- <PostTags :tags="frontmatter.tags" /> -->
      <div flex="~ gap-2 items-center">
        <RouterLink v-for="tag in frontmatter.tags" :key="tag" :to="`/tags/${tag}`">
          #{{ tag }}
        </RouterLink>
      </div>
    </div>
  </div>

  <article
    ref="content"
  >
    <slot />
  </article>
</template>
