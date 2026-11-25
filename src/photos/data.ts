import dataJsonRaw from './data.json' with { type: 'json' }

const dataJson: { [key: string]: PhotoMeta } = dataJsonRaw

interface PhotoMeta {
  /** 相片说明，中文 */
  text?: string
  blurhash?: string
  width: number
  height: number
}

export interface PhotoData extends PhotoMeta {
  name: string
  url: string
}

const photos = Object.entries(
  import.meta.glob<string>(['./**/*.{jpg,jpeg,png}', '!./backup/**'], {
    eager: true,
    import: 'default',
    query: '?url',
  }),
).map(([name, url]): PhotoData => {
  name = name.replace(/^\.\//, '').replace(/\.(jpg|jpeg|png)$/, '')
  return {
    name,
    url,
    ...dataJson[name],
  }
})

export default photos
