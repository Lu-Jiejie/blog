import type { Ref } from 'vue'
import { useDark, useStorage, useToggle } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'

export const isDark = useDark()
export const toggleDark = useToggle(isDark)

export function formatDate(d: string | number | Date, onlyDate = true) {
  const date = dayjs(d)
  if (onlyDate || date.year() === dayjs().year()) {
    return date.format('MM-DD')
  }
  return date.format('YYYY-MM-DD')
}

export function getHSLAForStr(str: string, alpha: number = 1) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const h = Math.abs(hash) % 360
  const s = 80 + (Math.abs(hash) % 20)
  const l = 50 + (Math.abs(hash) % 20)

  return `hsla(${h}, ${s}%, ${l}%, ${alpha})`
}
interface StorageWithExpire<T> {
  value: T
  expireAt: number
}
export function useExpireStorage<T>(
  key: string,
  expireTime: number = 1000 * 60 * 60,
) {
  const storage = useStorage<StorageWithExpire<T> | null>(
    key,
    null,
    undefined,
    {
      serializer: {
        read: (v: any) => v ? JSON.parse(v) : null,
        write: (v: any) => JSON.stringify(v),
      },
    },
  )

  const innerValue = ref<T | null>(null) as Ref<T | null>

  const loadStorage = () => {
    if (storage.value) {
      if (Date.now() < storage.value.expireAt) {
        innerValue.value = storage.value.value
      }
      else {
        // Storage expired
        storage.value = null
        innerValue.value = null
      }
    }
    else {
      innerValue.value = null
    }
  }
  loadStorage()

  const updateStorage = (newValue: T) => {
    storage.value = {
      value: newValue,
      expireAt: Date.now() + expireTime,
    }
    innerValue.value = newValue
  }

  const valueRef = computed({
    get: () => innerValue.value,
    set: (newValue: T) => {
      updateStorage(newValue)
    },
  })

  return valueRef
}

export function useStorageByUTC<T>(
  key: string,
  waitMinutes: number = 5,
) {
  interface StorageWithDate {
    value: T
    dateUTC: string
  }
  const storage = useStorage<StorageWithDate | null>(
    key,
    null,
    undefined,
    {
      serializer: {
        read: (v: any) => v ? JSON.parse(v) : null,
        write: (v: any) => JSON.stringify(v),
      },
    },
  )

  const innerValue = ref<T | null>(null) as Ref<T | null>

  const getCurrentUTCDate = () => new Date().toISOString().slice(0, 10)
  const getCurrentUTCTime = () => {
    const now = new Date()
    return { hour: now.getUTCHours(), minute: now.getUTCMinutes() }
  }

  const loadStorage = () => {
    if (storage.value) {
      const currentDate = getCurrentUTCDate()
      const { hour, minute } = getCurrentUTCTime()
      if (storage.value.dateUTC !== currentDate) {
        if (hour === 0 && minute < waitMinutes) {
          innerValue.value = storage.value.value
        }
        else {
          storage.value = null
          innerValue.value = null
        }
      }
      else {
        innerValue.value = storage.value.value
      }
    }
    else {
      innerValue.value = null
    }
  }
  loadStorage()

  const updateStorage = (newValue: T) => {
    storage.value = {
      value: newValue,
      dateUTC: getCurrentUTCDate(),
    }
    innerValue.value = newValue
  }

  const valueRef = computed({
    get: () => innerValue.value,
    set: (newValue: T) => {
      updateStorage(newValue)
    },
  })

  return valueRef
}

export function getGithubCDNUrl({
  owner,
  repo,
  path,
  branch = 'main',
}: {
  owner: string
  repo: string
  path: string
  branch?: string
}) {
  // 1-1: https://cdn.jsdelivr.net/gh/Lu-Jiejie/static@main/data/netease.json
  // 1-2: https://testingcf.jsdelivr.net/gh/Lu-Jiejie/static@main/data/netease.json
  // 1-3: https://gcore.jsdelivr.net/gh/Lu-Jiejie/static@main/data/netease.json
  // 2: https://github.com/sky22333/hubproxy  https://demo.52013120.xyz/
  return `https://cdn.jsdmirror.com/gh/${owner}/${repo}@${branch}/${path}`
}

export async function purgeJsDelivrCache({
  owner,
  repo,
  path,
  branch = 'main',
}: {
  owner: string
  repo: string
  path: string
  branch?: string
}) {
  const url = `https://purge.jsdelivr.net/gh/${owner}/${repo}@${branch}/${path}`
  try {
    const response = await fetch(url, { method: 'GET' })
    return await response.json()
  }
  catch (error) {
    console.error('Failed to purge jsDelivr cache:', error)
    return null
  }
}

export function imgProxy(url: string, params?: string) {
  const cleanUrl = url.replace(/^https?:\/\//, '')
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}${params ? `&${params}` : ''}`
}
