export { Project, Projects } from 'data/projects'

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
