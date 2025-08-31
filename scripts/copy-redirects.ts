import fs from 'fs-extra'

async function copyRedirects() {
  await fs.copy('_dist_redirects', 'dist/_redirects', { overwrite: true })
}

copyRedirects()
