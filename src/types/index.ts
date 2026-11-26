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
