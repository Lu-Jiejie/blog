<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { getGithubCDNUrl, useStorageByUTC } from '~/logic'

type LanguageDistribution = Record<string, {
  bytes: number
  color: string
  percentage: number
}>

const API = getGithubCDNUrl({
  owner: 'lu-jiejie',
  repo: 'static',
  path: 'data/github.json',
})

const CACHE_KEY = 'github-language-distribution'
const storage = useStorageByUTC<LanguageDistribution>(CACHE_KEY)

const prepared = computed(() => {
  return storage.value !== null
})

const sortedLanguages = computed(() => {
  if (!storage.value) {
    return []
  }

  return Object.entries(storage.value)
    .sort((a, b) => b[1].bytes - a[1].bytes)
})

async function fetchLanguageDistribution() {
  try {
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const res = (await response.json()).languageDistribution as LanguageDistribution
    return res
  }
  catch (err) {
    console.error('Failed to fetch language distribution:', err)
    return null
  }
}

onMounted(async () => {
  const loadLanguageDistribution = async () => {
    try {
      if (!prepared.value) {
        const data = await fetchLanguageDistribution()
        if (data) {
          storage.value = data
        }
      }
    }
    catch {
    }
  }
  loadLanguageDistribution()
})
</script>

<template>
  <CardTemplate
    title="GitHub Language Distribution"
    icon="i-simple-icons-github"
    :prepared="prepared"
  >
    <template v-if="prepared">
      <div flex flex-col gap-2 mt-2>
        <!-- Language Distribution Bar -->
        <div flex h-8 rounded-sm overflow-hidden>
          <div
            v-for="([lang, item]) in sortedLanguages" :key="lang"
            :style="{ width: `${item.percentage}%`, background: item.color }"
            :title="`${lang} ${item.percentage.toFixed(1)}%`"
            h-full transition-all
          />
        </div>
        <!-- Language Tags -->
        <div flex="~ wrap gap-1" mt-1>
          <a
            v-for="([lang, item]) in sortedLanguages"
            :key="lang" class="item"
            :href="`https://github.com/search?q=owner:Lu-Jiejie++language:${lang}`"
            target="_blank" rel="noopener noreferrer"
            flex="~ items-center" text-xs p="x-1 y-0.5"
            rounded-sm transition cursor-pointer
            bg-card-item-link important-op-100
          >
            <span
              w-2 h-2 rounded-full inline-block mr-1
              :style="{ background: item.color }"
            />
            <span class="language" op-70 mr-0.5 transition>{{ lang }}</span>
            <span op-50>{{ item.percentage.toFixed(1) }}%</span>
          </a>
        </div>
      </div>
    </template>
  </CardTemplate>
</template>

<style scoped>
a:hover .language {
  --uno: op-90;
}
</style>
