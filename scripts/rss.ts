import type { FeedOptions, Item } from 'feed'
import { dirname } from 'node:path'
import fg from 'fast-glob'
import { Feed } from 'feed'
import fs from 'fs-extra'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'

const DOMAIN = 'https://lujiejie.de'
const AUTHOR = {
  name: 'Lu Jiejie',
  link: DOMAIN,
  email: 'lu-jiejie@outlook.com',
}
const markdown = MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

async function run() {
  const files = await fg('pages/posts/*.md')
  const options: FeedOptions = {
    author: AUTHOR,
    title: 'Lu Jiejie',
    image: `${DOMAIN}/avatar.png`,
    favicon: `${DOMAIN}/favicon.png`,
    description: 'Personal blog of Lu Jiejie',
    id: DOMAIN,
    link: DOMAIN,
    copyright: 'CC BY-NC-ND 4.0 2025-PRESENT © Lu Jiejie',
    feedLinks: {
      json: `${DOMAIN}/feed.json`,
      atom: `${DOMAIN}/feed.atom`,
      rss: `${DOMAIN}/feed.xml`,
    },
  }

  const posts = (
    await Promise.all(
      files.filter(f => !(f === 'pages/posts/index.md'))
        .map(async (f) => {
          const raw = await fs.readFile(f, 'utf-8')
          const { data: frontmatter, content } = matter(raw)

          const html = markdown.render(content)
          // Fix relative image paths
            .replace('src="/', `src="${DOMAIN}/`)

          return {
            ...frontmatter,
            date: new Date(frontmatter.date),
            content: html,
            author: [AUTHOR],
            link: DOMAIN + f.replace(/^pages(.+).md$/, '$1'),
          }
        }),
    )
  ).filter(Boolean) as any[]

  posts.sort((a, b) => +new Date(b.date) - +new Date(a.date))

  await writeFeed(posts, options)
}

async function writeFeed(items: Item[], options: FeedOptions) {
  const feed = new Feed(options)

  items.forEach(i => feed.addItem(i))

  await fs.ensureDir(dirname('dist'))

  await fs.writeFile('./dist/feed.xml', feed.rss2(), 'utf-8')
  await fs.writeFile('./dist/feed.json', feed.json1(), 'utf-8')
  await fs.writeFile('./dist/feed.atom', feed.atom1(), 'utf-8')
}

run()
