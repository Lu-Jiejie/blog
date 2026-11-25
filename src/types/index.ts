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
