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

/**
 * 色带宽度按百分比的平方根分配：线性分配时 Dockerfile 那种 0.0088% 只有 0.06px，
 * 长尾全被压成看不见的细线；开方后 TypeScript 36.5% 与 Kotlin 25.8% 的宽度差被拉平，
 * 只剩三四种语言的区别也看得出来。代价是宽度不再等于百分比，读数由图例负责。
 */
const widths = computed(() => {
  const weights = sortedLanguages.value.map(([, item]) => Math.sqrt(item.percentage))
  const sum = weights.reduce((acc, weight) => acc + weight, 0)
  return weights.map(weight => (sum === 0 ? 0 : (weight / sum) * 100))
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
    title="GitHub 语言分布"
    icon="i-simple-icons-github"
    :prepared="!isLoading && prepared"
  >
    <template v-if="prepared">
      <div flex flex-col gap-3>
        <!-- 色带：宽度按平方根分配 -->
        <div class="ribbon" flex overflow-hidden>
          <div
            v-for="([lang, item], index) in sortedLanguages" :key="lang"
            :style="{ width: `${widths[index]}%`, background: item.color }"
            :title="`${lang} ${item.percentage.toFixed(2)}%`"
            h-full
          />
        </div>
        <!-- 图例：数字由这里出，色带宽度不能直接读成百分比 -->
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
            <span class="language">{{ lang }}</span>
            <span class="percent">{{ item.percentage.toFixed(1) }}%</span>
          </UiLink>
        </div>
      </div>
    </template>
  </CardTemplate>
</template>

<style scoped>
.ribbon {
  height: 2rem;
  border-radius: 6px;
}

.language {
  color: var(--c-text-muted);
  transition: color 0.2s;
}

.percent {
  margin-left: 4px;
  color: var(--c-text-faint);
  font-variant-numeric: tabular-nums;
}

.entry:hover .language {
  color: var(--c-text);
}
</style>
