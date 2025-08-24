<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { isDark, useExpireStorage } from '~/logic'

interface ContributionDay {
  date: string
  count: number
  level: number
}

interface MonthLabel {
  month: string
  position: number
}

interface CacheData {
  total: number
  contributions: ContributionDay[]
  startDate: string
  endDate: string
  weeks: ContributionDay[][]
  monthLabels: MonthLabel[]
}

const props = defineProps<{
  username: string
}>()
const lightColor = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
const darkColor = ['#161b22', '#003820', '#00602d', '#10983d', '#27d545']

const emptyWeeks = ref(createEmptyWeeks())

const CACHE_EXPIRY = 24 * 60 * 60 * 1000
const CACHE_KEY = 'github_contributions'
const storage = useExpireStorage<CacheData>(CACHE_KEY, CACHE_EXPIRY)

function filterContributionsForLastYear(contributions: ContributionDay[]) {
  const sortedContributions = [...contributions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDay = new Date()
  startDay.setDate(today.getDate() - 370)
  startDay.setHours(0, 0, 0, 0)

  const filteredDays = sortedContributions.filter((day) => {
    const date = new Date(day.date)
    date.setHours(0, 0, 0, 0)
    return date >= startDay && date <= today
  })

  if (filteredDays.length > 0) {
    const lastDate = new Date(filteredDays[filteredDays.length - 1].date)
    lastDate.setHours(0, 0, 0, 0)

    if (lastDate.getTime() !== today.getTime()) {
      const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      filteredDays.push({
        date: todayFormatted,
        count: 0,
        level: 0,
      })
    }
  }

  const sortedDays = [...filteredDays].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  return {
    filteredDays: sortedDays,
    today,
    startDay,
  }
}

function calculateWeeks(filteredDays: ContributionDay[]) {
  const weeksArray: ContributionDay[][] = []
  let week: ContributionDay[] = []

  const firstDay = filteredDays.length > 0 ? new Date(filteredDays[0].date) : new Date()
  const firstDayOfWeek = firstDay.getDay()

  for (let i = 0; i < firstDayOfWeek; i++) {
    week.push({ date: '', count: 0, level: 0 })
  }

  filteredDays.forEach((day) => {
    week.push(day)

    if (week.length === 7) {
      weeksArray.push([...week])
      week = []
    }
  })

  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ date: '', count: 0, level: 0 })
    }
    weeksArray.push(week)
  }

  return weeksArray.slice(0, 53)
}

function createEmptyWeeks() {
  return Array.from({ length: 53 }).map(() =>
    Array.from({ length: 7 }).map(() => ({ date: '', count: 0, level: 0 })),
  )
}

function calculateMonthLabels(weeks: ContributionDay[][]) {
  if (weeks.length === 0)
    return []

  const result: MonthLabel[] = []
  const monthPositions = new Map<string, number>()

  const MIN_MONTH_GAP = 2

  weeks.forEach((week, weekIndex) => {
    for (let dayIndex = 0; dayIndex < week.length; dayIndex++) {
      const day = week[dayIndex]
      if (day.date) {
        const date = new Date(day.date)
        const month = date.getMonth()
        const year = date.getFullYear()
        const monthKey = `${year}-${month}`
        if (!monthPositions.has(monthKey)) {
          const canAdd = result.length === 0 || (weekIndex - result[result.length - 1].position >= MIN_MONTH_GAP)

          if (canAdd) {
            monthPositions.set(monthKey, weekIndex)
            result.push({
              month: String(month + 1).padStart(2, '0'),
              position: weekIndex,
            })
          }
        }

        break
      }
    }
  })

  return result
}

async function fetchContributions(username: string) {
  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const res = (await response.json()).contributions as ContributionDay[]

    const { filteredDays, today, startDay } = filterContributionsForLastYear(res)

    const total = filteredDays.reduce((sum, day) => sum + day.count, 0)

    const weeksData = calculateWeeks(filteredDays)
    const monthLabelsData = calculateMonthLabels(weeksData)
    const data = {
      total,
      contributions: filteredDays,
      startDate: startDay.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      weeks: weeksData,
      monthLabels: monthLabelsData,
    }

    return data
  }
  catch (error) {
    console.error('Failed to fetch contributions:', error)
    return null
  }
}

const weeks = computed(() => {
  return storage.value?.weeks || emptyWeeks.value
})
const monthLabels = computed(() => {
  return storage.value?.monthLabels || []
})
const prepared = computed(() => {
  return storage.value !== null
})

onMounted(async () => {
  const loadContributions = async () => {
    try {
      if (!prepared.value) {
        const data = await fetchContributions(props.username)
        if (data) {
          storage.value = data
        }
      }
    }
    catch {
    }
  }

  loadContributions()
})
</script>

<template>
  <div
    rounded-5px slide-enter select-none mx-auto max-w-fit
  >
    <span text-sm op-80 block ml-1 mb--0.5>
      {{ prepared ? `${storage?.total} GitHub contributions in the last year` : 'Loading contributions...' }}
    </span>

    <div overflow-x-auto overflow-y-hidden>
      <!-- heatmap -->
      <div flex gap-0.56 min-w-0 p-1>
        <div
          v-for="(week, weekIndex) in weeks"
          :key="weekIndex"
          flex flex-col gap-0.56 flex-shrink-0
          :style="{ width: '11px' }"
        >
          <div
            v-for="(day, dayIndex) in week"
            :key="`${weekIndex}-${dayIndex}`"
            w-3 h-3 rounded-2px transition-all relative
            :style="{ backgroundColor: isDark ? darkColor[day.level] : lightColor[day.level] }"
            :title="day.date ? `${day.date}: ${day.count} contributions` : ''"
          />
        </div>
      </div>
      <!-- month labels -->
      <div v-if="prepared" relative h-3 text-9px m="t--1 b-2">
        <div
          v-for="label in monthLabels"
          :key="label.month + label.position"
          absolute text-center w-3 h-3
          :style="{
            left: `${label.position * 13.25 + 4}px`,
          }"
        >
          {{ label.month }}
        </div>
      </div>
      <div v-else w-full h-3 m="t--1 b-2" />
    </div>
  </div>
</template>
