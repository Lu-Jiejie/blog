import { useDark, useToggle } from '@vueuse/core'
import dayjs from 'dayjs'

export const isDark = useDark()
export const toggleDark = useToggle(isDark)

export function formatDate(d: string | Date, onlyDate = true) {
  const date = dayjs(d)
  if (onlyDate || date.year() === dayjs().year()) {
    return date.format('M月D日')
  }
  return date.format('YYYY年M月D日')
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
