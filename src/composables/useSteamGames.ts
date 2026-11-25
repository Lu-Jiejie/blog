import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl } from '~/logic'

export interface SteamGame {
  id: string
  name: string
  nameZh: string
  playtimeForever: number
  timeLastPlayed: number
  icon: string
  link: string
  linkZh?: string
}

const API = getGithubCDNUrl({
  owner: 'lu-jiejie',
  repo: 'static',
  path: 'data/steam/games.json',
})

/** 主页卡片和完整页共用同一份 Steam 库数据 */
export function useSteamGames() {
  const games = ref<SteamGame[]>([])
  const isLoading = ref(true)
  const hasError = ref(false)

  onMounted(async () => {
    try {
      const response = await fetch(API)
      if (!response.ok)
        throw new Error(`HTTP ${response.status}`)
      games.value = (await response.json()) as SteamGame[]
    }
    catch (err) {
      hasError.value = true
      console.error('Failed to load steam games:', err)
    }
    finally {
      isLoading.value = false
    }
  })

  const prepared = computed(() => !isLoading.value && !hasError.value && games.value.length > 0)

  return { games, isLoading, hasError, prepared }
}

/** 只保留真的玩过的，按最近一次游玩倒序 */
export function playedGames(games: SteamGame[]) {
  return [...games]
    .filter(game => game.playtimeForever > 10)
    .sort((a, b) => b.timeLastPlayed - a.timeLastPlayed)
}

/** 十小时以上取整，短的保留一位小数 */
export function formatHours(minutes: number) {
  const hours = minutes / 60
  return hours >= 10 ? String(Math.round(hours)) : hours.toFixed(1)
}

/** 带单位的时长；中文用「小时」，英文用 hrs */
export function formatPlaytime(minutes: number, lang: 'en' | 'zh' = 'zh') {
  return `${formatHours(minutes)} ${lang === 'zh' ? '小时' : 'hrs'}`
}
