import type Buffer from 'node:buffer'
import fs from 'node:fs/promises'
import sharp from 'sharp'

const maxSize = 1500

export async function compressImage(image: sharp.Sharp, inBuffer: Buffer, inFile: string, outFile: string) {
  const { format, width, height } = await image.metadata()
  if (!format || !width || !height) {
    throw new Error(`Invalid image: ${inFile}`)
  }
  if (format !== 'jpeg' && format !== 'png' && format !== 'webp') {
    throw new Error(`Unsupported format ${format} in file: ${inFile}`)
  }

  const resized = (width > maxSize || height > maxSize)
    ? image.resize(maxSize)
    : image

  const processed = resized[format]({
    quality: format === 'png' ? 100 : 80,
    compressionLevel: 9,
  })

  const outBuffer = await processed.withMetadata().toBuffer()
  const percent = (outBuffer.byteLength - inBuffer.byteLength) / inBuffer.byteLength

  return {
    image: processed,
    outBuffer,
    size: inBuffer.byteLength,
    outSize: outBuffer.byteLength,
    percent,
    inFile,
    outFile,
  }
}

export async function compressImages(files: string[]) {
  return Promise.all(files.map(async (file) => {
    const buffer = await fs.readFile(file)
    const image = sharp(buffer)
    const { outBuffer, size, outSize, percent, inFile, outFile } = await compressImage(image, buffer, file, file)
    const msg = `${bytesToHuman(size)} -> ${bytesToHuman(outSize)} ${(percent * 100).toFixed(1).padStart(5, ' ')}%  ${inFile}`
    if (percent < -0.1) {
      await fs.writeFile(outFile, outBuffer)
      console.log('✅', msg)
    }
    else {
      console.log('❌', '[SKIPPED]', msg)
    }
  }))
}

function bytesToHuman(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0)
    return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / 1024 ** i)} ${sizes[i]}`
}
