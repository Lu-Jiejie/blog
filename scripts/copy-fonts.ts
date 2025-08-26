import fs from 'fs-extra'

async function copyFonts() {
  await fs.copy('public/assets/fonts', 'dist/assets/fonts', { overwrite: true })
}

copyFonts()
