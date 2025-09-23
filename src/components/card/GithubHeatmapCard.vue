<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl, isDark } from '~/logic'

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface ContributionsInfo {
  total: number
  weeks: ContributionDay[][]
}

const lightColor = ['#8883', '#9be9a8', '#40c463', '#30a14e', '#216e39']
const darkColor = ['#8883', '#003820', '#00602d', '#10983d', '#27d545']

const API = getGithubCDNUrl({
  owner: 'Lu-Jiejie',
  repo: 'static',
  path: 'data/github.json',
})

const contributions = ref<ContributionsInfo | null>(null)
const isLoading = ref(true)

async function fetchContributions() {
  try {
    isLoading.value = true
    const response = await fetch(API)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = (await response.json()).lastYearContributions as ContributionsInfo
    contributions.value = data
    return data
  }
  catch (error) {
    console.error('Failed to fetch contributions:', error)
    return null
  }
  finally {
    isLoading.value = false
  }
}

const prepared = computed(() => {
  return contributions.value !== null
})

const scrollContainer = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  await fetchContributions()

  // 数据加载后自动滚动到最右侧
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft = scrollContainer.value.scrollWidth
  }
})
</script>

<template>
  <CardTemplate
    :title="prepared ? `${contributions?.total} GitHub contributions in the last year` : 'GitHub contributions in the last year'"
    icon="i-simple-icons-github"
    :prepared="!isLoading && prepared"
  >
    <template v-if="prepared">
      <div ref="scrollContainer" overflow-x-auto overflow-y-hidden>
        <!-- heatmap -->
        <div flex gap-0.49 min-w-0>
          <div
            v-for="(week, weekIndex) in contributions?.weeks"
            :key="weekIndex"
            flex flex-col gap-0.5 flex-shrink-0 w-11px
          >
            <div
              v-for="(day, dayIndex) in week"
              :key="`${weekIndex}-${dayIndex}`"
              w-3 h-3 rounded-2px transition-all relative
              :style="{ backgroundColor: isDark ? darkColor[day.level] : lightColor[day.level] }"
              :title="`${day.date}: ${day.count} contributions`"
            />
          </div>
        </div>
      </div>
    </template>
  </CardTemplate>
</template>
