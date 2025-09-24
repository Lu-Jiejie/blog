import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

type Language = 'en' | 'zh'
const lang = useLocalStorage<Language>('lujiejie-lang', 'en')

const messages = {
  en: {
  },
  zh: {
  },
} as const

export const $t = computed(() => messages[lang.value])
export function toggleLang() {
  lang.value = lang.value === 'en' ? 'zh' : 'en'
}
export const isZh = computed(() => lang.value === 'zh')
export function useI18n<T extends Record<string, Record<string, any>>>(messages: T) {
  type Message = T[keyof T]
  return computed(() => messages[lang.value] as Message)
}
