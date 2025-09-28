import sg from 'simple-git'
import { compressImages } from './compress-image'

const git = sg()
const images = (await git.diff(['--cached', '--name-only']))
  .split('\n')
  .map(i => i.trim())
  .filter(i => i.match(/\.(jpe?g|png|webp)$/i))

if (images.length !== 0) {
  console.log('Staged images:', images)
  await compressImages(images)
}
else {
  console.log('No staged images found.')
}
