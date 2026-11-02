import { useHead } from '@unhead/vue'
import { computed } from 'vue'

interface PageHeadOptions {
  title?: string
  description?: string
}

const SITE_NAME = 'Lu Jiejie'

export function usePageHead(options: PageHeadOptions) {
  const pageTitle = computed(() => {
    if (!options.title || options.title === SITE_NAME) {
      return SITE_NAME
    }
    return `${options.title} - ${SITE_NAME}`
  })

  useHead({
    title: pageTitle,
    meta: options.description
      ? [
          {
            name: 'description',
            content: options.description,
          },
        ]
      : [],
  })
}
