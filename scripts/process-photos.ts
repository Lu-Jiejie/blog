import * as BlurHash from 'blurhash'
import ExifReader from 'exifreader'
import fg from 'fast-glob'
import fs from 'fs-extra'
import path from 'pathe'
import sharp from 'sharp'
import { compressImage } from './compress-image'

const photoFolder = 'photos'
const backupFolder = path.join(photoFolder, 'backup')
// 确保备份目录存在
await fs.mkdir(backupFolder, { recursive: true })

let photos = await fg(['**/*.{jpg,jpeg,png}', '!backup/**'], {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: photoFolder,
})

for (const photoPath of photos) {
  if (path.basename(photoPath).startsWith('P-')) {
    continue
  }

  let { ext } = path.parse(photoPath.toLowerCase())
  if (ext === '.jpeg') {
    ext = '.jpg'
  }
  const buffer = await fs.readFile(photoPath)
  const img = sharp(buffer).rotate()
  const exif = ExifReader.load(buffer)

  let dateRaw = exif.DateTimeOriginal?.value
    || exif.DateTime?.value
    || null

  dateRaw = String(Array.isArray(dateRaw) ? dateRaw[0] : dateRaw)

  // get date from filename
  let date: Date
  if (dateRaw && !Number.isNaN(Date.parse(dateRaw.replace(/:/g, (x, idx) => idx < 10 ? '-' : x)))) {
    date = new Date(dateRaw.replace(/:/g, (x, idx) => idx < 10 ? '-' : x))
  }
  else {
    // IMG_20250924_232031  CRnall_20250918_182742526
    const baseName = path.basename(photoPath)
    const match = baseName.match(/(\d{8})_(\d{6,9})/)
    if (match) {
      // 20250924_232031   20250918_182742526
      const y = match[1].slice(0, 4)
      const m = match[1].slice(4, 6)
      const d = match[1].slice(6, 8)
      const h = match[2].slice(0, 2)
      const min = match[2].slice(2, 4)
      const s = match[2].slice(4, 6)
      date = new Date(`${y}-${m}-${d}T${h}:${min}:${s}.000`)
    }
    else {
      date = new Date()
    }
  }

  const base = `P-${date.toISOString().replace(/[:.a-z]/gi, '-')}`
  let i = 1
  while (await fs.exists(path.join(photoFolder, `${base}${i}${ext}`))) {
    i++
  }
  const writePath = path.join(photoFolder, `${base}${i}${ext}`)

  const { outBuffer, percent, outFile } = await compressImage(img, buffer, photoPath, writePath)
  // backup
  const backupPath = path.join(backupFolder, path.basename(photoPath))
  await fs.copyFile(photoPath, backupPath)

  if (outFile !== photoPath || percent > -0.1) {
    await fs.writeFile(outFile, outBuffer)
    console.log('✅', `${(percent * 100).toFixed(1).padStart(5, ' ')}%  ${photoPath} -> ${outFile}`)
  }
  if (outFile !== photoPath) {
    await fs.unlink(photoPath)
  }
}

photos = await fg(['**/*.{jpg,jpeg,png}', '!backup/**'], {
  caseSensitiveMatch: false,
  absolute: true,
  cwd: photoFolder,
})

const dataJsonPath = path.join(photoFolder, 'data.json')
let allData: Record<string, any> = {}
if (await fs.exists(dataJsonPath)) {
  allData = await fs.readJSON(dataJsonPath)
}

for (const photoPath of photos) {
  if (!path.basename(photoPath).startsWith('P-')) {
    continue
  }

  const name = path.basename(photoPath).replace(/\.\w+$/, '')
  const config = allData[name] || {}

  // skip if already has blurhash
  if (config.blurhash) {
    continue
  }

  const buffer = await fs.readFile(photoPath)
  const img = sharp(buffer).rotate()

  // Get original image dimensions
  const metadata = await img.metadata()
  if (metadata.width && metadata.height) {
    config.width = metadata.width
    config.height = metadata.height
  }

  const { data, info } = await img.raw()
    .ensureAlpha()
    .resize(32, 32, { fit: 'cover' })
    .toBuffer({ resolveWithObject: true })
  const blurhash = BlurHash.encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
  config.blurhash = blurhash

  allData[name] = config
}

// clean up configs for non-existent photos
const existingNames = new Set(
  photos
    .filter(p => path.basename(p).startsWith('P-'))
    .map(p => path.basename(p).replace(/\.\w+$/, '')),
)
for (const name in allData) {
  if (!existingNames.has(name)) {
    delete allData[name]
    console.log('🗑️', name)
  }
}

await fs.writeJSON(dataJsonPath, allData, { spaces: 2 })
