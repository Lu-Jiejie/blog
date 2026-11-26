export interface PostFrontmatter {
  title: string
  date: string
  type?: string
  description?: string
  tags?: string[]
  place?: string
}

export interface TocItem {
  depth: number
  slug: string
  text: string
}

export interface MidiTrack {
  name: string
  artist: string
  path: string
}

/** 随想引用卡片的类型，决定卡片外观 */
export type ThinkingRefType = 'watched' | 'reading' | 'quote' | 'link' | 'music' | 'repo'

export interface ThinkingRef {
  type: ThinkingRefType
  url: string
  title?: string
  /** 副标题：影视是「电影 · 2001」，音乐是歌手，仓库是主语言 */
  subtitle?: string
  /** 豆瓣评分，十分制，只有影视和书会带 */
  rating?: number
  /** 仓库的 star 数，只有 type=repo 时出现 */
  stars?: number
  /** 一句话简介，抓来的文案快照 */
  description?: string
  cover?: string
  /** type 为 quote 时被引用的那段话 */
  quote?: string
}

export interface ThinkingEntry {
  /** 东八区、毫秒精度的 ISO 串，字典序即时间序 */
  timestamp: string
  text?: string
  images?: string[]
  ref?: ThinkingRef
}

/** 收藏页的四个分栏，同时也是 URL 里的 ?type= */
export type CollectionType = 'anime' | 'movie' | 'book' | 'game'

export interface CollectionItem {
  /** 中文名，列表展示的就是它 */
  name: string
  creator?: string | string[]
  note?: string
  /** 中文维基的词条名，缺省时用 name 直接拼 */
  wikiKeyword?: string
  /** 中文维基没有对应条目时，个别条目手写了跳转地址 */
  wikiUrlFallback?: string
}

export type Collection = Record<CollectionType, CollectionItem[]>
