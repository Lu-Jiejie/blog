import type { TocItem } from '../src/types'
import fs from 'fs-extra'
import { slugify } from './slugify'

export default function extractToc(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')

  const toc: TocItem[] = []
  const lines = content.split('\n')
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock)
      continue

    const match = line.match(/^(#{1,6})\s+(\S.*)$/)
    if (match) {
      const level = match[1].length
      const title = match[2].trim().replace(/\s+#+$/, '')
      toc.push({
        depth: level,
        text: title,
        slug: slugify(title),
      })
    }
  }

  return { toc }
}
