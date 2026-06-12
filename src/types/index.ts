export type PostType = 'essays' | 'notes'
export interface PostFrontmatter {
  title: string
  date: string
  type: PostType
  subtitle?: string
  display?: string
  description?: string
  tags?: string[]
  place?: string
}

export interface TocItem {
  depth: number
  slug: string
  text: string
}

export interface Project {
  name: string
  link: string
  description: string
  icon: string
  icon_css?: string
}
export type Projects = Record<string, Project[]>
