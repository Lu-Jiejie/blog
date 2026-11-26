import type { ThinkingEntry } from '~/types'
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl } from '~/logic'

// 本地开发读 static 仓库的 data 目录（vite 插件把 /__thinking/* 映射过去），
// 线上读 jsDelivr：改数据不用重新构建，刷新即可
const API = import.meta.env.DEV
  ? '/__thinking/index.json'
  : getGithubCDNUrl({
      owner: 'lu-jiejie',
      repo: 'static',
      path: 'data/thinking/index.json',
    })

interface ThinkingIndex {
  version: number
  count: number
  entries?: ThinkingEntry[]
}

/**
 * 封面存在 static 仓库里（豆瓣这类站有防盗链，直接引用外链加载不出来），
 * JSON 里记的是 `covers/xxx.jpg` 这种相对路径，这里补上访问前缀。
 */
export function thinkingAssetUrl(relative: string): string {
  if (/^https?:\/\//.test(relative))
    return relative
  const clean = relative.replace(/^\/+/, '')
  return import.meta.env.DEV
    ? `/__thinking/${clean}`
    : getGithubCDNUrl({
        owner: 'lu-jiejie',
        repo: 'static',
        path: `data/thinking/${clean}`,
      })
}

/** 随想列表：一次请求拿全部，按时间倒序 */
export function useThinking() {
  const entries = ref<ThinkingEntry[]>([])
  const isLoading = ref(true)
  const hasError = ref(false)

  // onMounted 内才请求：SSG 预渲染阶段没有网络，也不该把数据烤进 HTML
  onMounted(async () => {
    try {
      const response = await fetch(API)
      if (!response.ok)
        throw new Error(`HTTP ${response.status}`)
      const data = (await response.json()) as ThinkingIndex | ThinkingEntry[]
      const list = Array.isArray(data) ? data : data.entries ?? []
      entries.value = [...list].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    }
    catch (err) {
      hasError.value = true
      console.error('Failed to load thinking entries:', err)
    }
    finally {
      isLoading.value = false
    }
  })

  // 空列表也算加载完成：页面要能显示「还没写什么」
  const prepared = computed(() => !isLoading.value && !hasError.value)

  return { entries, isLoading, hasError, prepared }
}

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

// 时间戳本身就带 +08:00，直接切字符串，不经过本地时区换算；
// 星期用 UTC 构造同一组年月日算，避免本机时区把日期挪走
export function formatEntryTime(timestamp: string) {
  const year = Number(timestamp.slice(0, 4))
  const month = Number(timestamp.slice(5, 7))
  const day = Number(timestamp.slice(8, 10))
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  return `${year}年${month}月${day}日 ${weekday} ${timestamp.slice(11, 16)}`
}
