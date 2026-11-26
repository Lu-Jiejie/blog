import type { Collection } from '~/types'
import { computed, onMounted, ref } from 'vue'
import { getGithubCDNUrl } from '~/logic'

// 收藏数据在 static 仓库里，直接读 jsDelivr：加一本书不用重新构建，刷新即可
const API = getGithubCDNUrl({
  owner: 'lu-jiejie',
  repo: 'static',
  path: 'data/collection.json',
})

interface CollectionFile {
  version: number
  groups?: Partial<Collection>
}

/** 分栏固定这四个，缺一个 ListCollection 的表格就少一张 */
function emptyCollection(): Collection {
  return { anime: [], movie: [], book: [], game: [] }
}

/** 收藏列表：一次请求拿全部，分栏顺序由 JSON 决定 */
export function useCollection() {
  const collection = ref<Collection>(emptyCollection())
  const isLoading = ref(true)
  const hasError = ref(false)

  // onMounted 内才请求：SSG 预渲染阶段没有网络，也不该把数据烤进 HTML
  onMounted(async () => {
    try {
      const response = await fetch(API)
      if (!response.ok)
        throw new Error(`HTTP ${response.status}`)
      const data = (await response.json()) as CollectionFile
      collection.value = { ...emptyCollection(), ...data.groups }
    }
    catch (err) {
      hasError.value = true
      console.error('Failed to load collection:', err)
    }
    finally {
      isLoading.value = false
    }
  })

  const prepared = computed(() => !isLoading.value && !hasError.value)

  return { collection, isLoading, hasError, prepared }
}
