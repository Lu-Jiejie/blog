<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl } from '~/logic'

type LanguageDistribution = Record<string, {
  bytes: number
  color: string
  percentage: number
}>

const API = getGithubCDNUrl({
  owner: 'Lu-Jiejie',
  repo: 'static',
  path: 'data/github/languageDistribution.json',
})

const languageData = ref<LanguageDistribution | null>(null)
const isLoading = ref(true)

const prepared = computed(() => {
  return languageData.value !== null
})

const sortedLanguages = computed(() => {
  if (!languageData.value) {
    return []
  }

  return Object.entries(languageData.value)
    .sort((a, b) => b[1].bytes - a[1].bytes)
})

async function fetchLanguageDistribution() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const res = (await response.json()) as LanguageDistribution
    languageData.value = res
    return res
  }
  catch (err) {
    console.error('Failed to fetch language distribution:', err)
    return null
  }
  finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchLanguageDistribution()
})
</script>

<template>
  <CardTemplate
    title="GitHub Language Distribution"
    title-zh="GitHub 语言分布"
    icon="i-simple-icons-github"
    :prepared="!isLoading && prepared"
  >
    <template v-if="prepared">
      <div flex flex-col gap-3>
        <!-- Language Ribbon -->
        <div flex h-8 rounded-md overflow-hidden>
          <div
            v-for="([lang, item]) in sortedLanguages" :key="lang"
            :style="{ width: `${item.percentage}%`, background: item.color }"
            :title="`${lang} ${item.percentage.toFixed(1)}%`"
            h-full transition-all
          />
        </div>
        <!-- Language Legend -->
        <div flex="~ wrap" gap-x-4 gap-y-1.5>
          <UiLink
            v-for="([lang, item]) in sortedLanguages"
            :key="lang" class="entry"
            :href="`https://github.com/search?q=owner:Lu-Jiejie++language:${lang}`"
            external
            flex="~ items-center" text-xs
            cursor-pointer important-op-100
          >
            <span
              w-2 h-2 rounded-full inline-block mr-1.5
              :style="{ background: item.color }"
            />
            <span class="language" op-70 transition>{{ lang }}</span>
            <span op-40 ml-1>{{ item.percentage.toFixed(1) }}%</span>
          </UiLink>
        </div>
      </div>
    </template>
  </CardTemplate>
</template>

<style scoped>
a:hover .language {
  --uno: op-100;
}
</style>
