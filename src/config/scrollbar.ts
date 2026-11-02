import type { PartialOptions } from 'overlayscrollbars'

export const globalScrollbarOptions: PartialOptions = {
  scrollbars: {
    visibility: 'auto',
    autoHide: 'leave',
    autoHideDelay: 600,
    clickScroll: true,
  },
  overflow: {
    x: 'hidden',
    y: 'scroll',
  },
}
