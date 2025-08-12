/* eslint-disable no-control-regex */
import { remove } from 'diacritics'

export default function slugify(str: string): string {
  return remove(str)
    .toLowerCase()
    .replace(/[\x00-\x1F]/g, '')
    .replace(/[\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^(\d)/, '_$1')
    .replace(/^-+|-+$/g, '')
}
