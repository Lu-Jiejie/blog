export interface Post {
  title: string
  date: string
  type: string
  subtitle?: string
  display?: string
  description?: string
  tags?: string[]
  place?: string
}

export interface Project {
  name: string
  link: string
  description: string
  icon: string
  icon_css?: string
}
export type Projects = Record<string, Project[]>

export type MediaType = 'anime' | 'movie' | 'book' | 'manga' | 'game'
export interface MediaItem {
  name: string
  creator?: string | string[]
  date?: string
  note?: string
  lang?: string
}
export type Media = Record<MediaType, MediaItem[]>
