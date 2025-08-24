import type { Ref } from 'vue'
import { useDark, useStorage, useToggle } from '@vueuse/core'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'

export const isDark = useDark()
export const toggleDark = useToggle(isDark)

export function formatDate(d: string | Date, onlyDate = true) {
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
