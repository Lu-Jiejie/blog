<script setup lang="ts">
import type { ThinkingRef } from '~/types'
import { computed, ref } from 'vue'
import { thinkingAssetUrl } from '~/composables/useThinking'
import { imgProxy, isDark } from '~/logic'

const props = defineProps<{ item: ThinkingRef }>()

// quote 但没有摘录时按普通卡片渲染，免得留一个空引文框
const isQuote = computed(() => props.item.type === 'quote' && !!props.item.quote)
const isRepo = computed(() => props.item.type === 'repo')
// 普通网页链接用大标题版；reading（在读的书）也走这版，它同样没有海报
const isPlainLink = computed(() => props.item.type === 'link' || props.item.type === 'reading')

const host = computed(() => {
  try {
    return new URL(props.item.url).hostname.replace(/^www\./, '')
  }
  catch {
    return ''
  }
})

const pathParts = computed(() => {
  try {
    return new URL(props.item.url).pathname.split('/').filter(Boolean)
  }
  catch {
    return [] as string[]
  }
})

// 豆瓣的 favicon 也有防盗链，仓库里存了一份；其它站先问 DuckDuckGo 图标库，再退回站点根目录。
// 非本地的一律过图片代理：体积小，而且代理带 CORS 头，才能读像素判断深浅
const LOCAL_FAVICON = /(?:^|\.)douban\.com$/.test(host.value) ? thinkingAssetUrl('favicons/douban.ico') : ''

const FAVICON_SOURCES = computed(() => {
  if (!host.value)
    return []
  if (LOCAL_FAVICON)
    return [LOCAL_FAVICON]
  return [
    `https://icons.duckduckgo.com/ip3/${host.value}.ico`,
    `https://${host.value}/favicon.ico`,
  ].map(src => imgProxy(src, 'w=64&h=64&fit=contain'))
})

const faviconStage = ref(0)
const faviconSrc = computed(() => FAVICON_SOURCES.value[faviconStage.value] ?? '')
// 两级的都加载失败后 faviconSrc 变空，这时退回地球图标，别留一个破图
const showFavicon = computed(() => !!faviconSrc.value)

// 有些站点的 favicon 是单色标（GitHub 的黑猫就是），深色主题下几乎看不见。
// 采一下亮度和彩度，跟卡片底色反差太小时翻过来显示；彩色图标不动
const iconLuma = ref<number | null>(null)
const iconChroma = ref<number | null>(null)

function sampleIcon(img: HTMLImageElement) {
  try {
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx)
      return
    ctx.drawImage(img, 0, 0, size, size)
    const { data } = ctx.getImageData(0, 0, size, size)
    let luma = 0
    let chroma = 0
    let count = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 80)
        continue
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      luma += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      chroma += (Math.max(r, g, b) - Math.min(r, g, b)) / 255
      count++
    }
    if (!count)
      return
    iconLuma.value = luma / count
    iconChroma.value = chroma / count
  }
  catch {
    // 跨域污染时读不到像素，当作不需要适配
  }
}

const invertFavicon = computed(() => {
  const luma = iconLuma.value
  if (luma === null || (iconChroma.value ?? 0) > 0.12)
    return false
  return Math.abs(luma - (isDark.value ? 0.1 : 0.94)) < 0.3
})

function nextFavicon() {
  faviconStage.value += 1
  iconLuma.value = null
  iconChroma.value = null
}

const owner = computed(() => (pathParts.value[0] ?? '').toUpperCase())
const repoName = computed(() => pathParts.value[1] ?? '')

const title = computed(() => {
  // 仓库卡的大标题只放仓库名，owner 放在上面的 REPOSITORY 行里
  if (isRepo.value)
    return repoName.value || props.item.title || props.item.url
  return props.item.title || props.item.url
})

/** 卡片顶部的分类行：仓库显示「仓库 · OWNER」，音乐补上「收听」，其余直接用副标题 */
const kindLine = computed(() => {
  if (isRepo.value)
    return `仓库${owner.value ? ` · ${owner.value}` : ''}`
  if (props.item.type === 'music')
    return props.item.subtitle ? `收听 · ${props.item.subtitle}` : '收听'
  return props.item.subtitle || ''
})

/** GitHub 语言色，取不到就灰点 */
const LANGUAGE_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Vue': '#41b883',
  'Swift': '#f05138',
  'Python': '#3572a5',
  'Rust': '#dea584',
  'Go': '#00add8',
  'Java': '#b07219',
  'C++': '#f34b7d',
  'C': '#555555',
  'Shell': '#89e051',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'Ruby': '#701516',
  'Kotlin': '#a97bff',
  'Dart': '#00b4ab',
}

const languageColor = computed(() => LANGUAGE_COLORS[props.item.subtitle ?? ''] ?? '#8888')

// 视频站点的封面是 16:9 的，硬裁成方形会把画面切掉，所以单独给一档横版尺寸
const isVideoHost = computed(() => /(?:^|\.)(?:bilibili\.com|youtube\.com|youtu\.be|vimeo\.com|douyin\.com)$/i.test(host.value))

// 仓库里的封面已经按卡片尺寸存过了，只有外链（下载失败时留下的）才需要再过一遍代理缩图
const localCover = computed(() => (props.item.cover ? thinkingAssetUrl(props.item.cover) : ''))
const needsProxy = computed(() => /^https?:\/\//.test(props.item.cover ?? ''))

function thumbOf(width: number, height: number) {
  if (!localCover.value)
    return ''
  return needsProxy.value ? imgProxy(localCover.value, `w=${width}&h=${height}&fit=cover`) : localCover.value
}

const posterThumb = computed(() => thumbOf(192, 288))
const squareThumb = computed(() => thumbOf(180, 180))
const wideThumb = computed(() => thumbOf(320, 180))

// 只有影视/动画的海报是竖的；视频是横的；专辑封面、仓库头像都是方的
const coverMode = computed<'poster' | 'wide' | 'square'>(() => {
  if (isVideoHost.value)
    return 'wide'
  if (props.item.type === 'watched' || props.item.type === 'reading')
    return 'poster'
  return 'square'
})

const coverSrc = computed(() => {
  if (coverMode.value === 'poster')
    return posterThumb.value
  if (coverMode.value === 'wide')
    return wideThumb.value
  return squareThumb.value
})

const coverClass = computed(() => `thumb--${coverMode.value}`)

// 抓来的封面经常 404 或防盗链，坏掉就整块藏起来，别留一个破图标
function hideBrokenCover(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<template>
  <div v-if="isQuote" class="card card--quote">
    <blockquote class="quote-text">
      {{ item.quote }}
    </blockquote>
    <a class="quote-source" :href="item.url" target="_blank" rel="noopener noreferrer">
      —— {{ item.title || host }}
    </a>
  </div>

  <!-- 仓库：REPOSITORY 行 + 右侧星数，大标题，底部语言色点，右侧方形 logo -->
  <a
    v-else-if="isRepo"
    class="card card--repo"
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
  >
    <span class="repo-body">
      <span class="repo-head">
        <span class="card-kind">
          {{ kindLine }}
        </span>
        <span v-if="item.stars" class="repo-stars">
          <span class="i-carbon-star card-kind-icon" aria-hidden="true" />
          {{ item.stars }}
        </span>
      </span>
      <span class="card-title">{{ title }}</span>
      <span class="card-meta">
        <span class="card-host-line">
          <img v-if="showFavicon" class="card-favicon" :class="{ 'is-inverted': invertFavicon }" :src="faviconSrc" alt="" loading="lazy" crossorigin="anonymous" @load="sampleIcon($event.target as HTMLImageElement)" @error="nextFavicon">
          <span v-else class="i-carbon-earth card-meta-icon" aria-hidden="true" />
          <span class="card-host">{{ host }}</span>
        </span>
        <span v-if="item.subtitle" class="repo-lang">
          <span class="repo-dot" :style="{ backgroundColor: languageColor }" />
          {{ item.subtitle }}
        </span>
      </span>
    </span>

    <img v-if="item.cover" class="thumb thumb--square" :src="squareThumb" alt="" loading="lazy" @error="hideBrokenCover">
  </a>

  <!-- 普通链接：无封面的标题 + 摘要 + 地球图标元信息行 -->
  <a
    v-else-if="isPlainLink"
    class="card card--link"
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
  >
    <span class="card-body">
      <span v-if="item.subtitle" class="card-kind">{{ item.subtitle }}</span>
      <span class="card-title card-title--lg">{{ title }}</span>
      <span v-if="item.description" class="card-description">{{ item.description }}</span>
      <span class="card-meta">
        <span class="card-host-line">
          <img v-if="showFavicon" class="card-favicon" :class="{ 'is-inverted': invertFavicon }" :src="faviconSrc" alt="" loading="lazy" crossorigin="anonymous" @load="sampleIcon($event.target as HTMLImageElement)" @error="nextFavicon">
          <span v-else class="i-carbon-earth card-meta-icon" aria-hidden="true" />
          <span class="card-host">{{ host }}</span>
        </span>
        <span v-if="item.rating" class="card-rating">
          <span class="i-carbon-star-filled card-rating-icon" aria-hidden="true" />{{ item.rating }}
        </span>
      </span>
    </span>

    <img v-if="item.cover" class="thumb" :class="coverClass" :src="coverSrc" alt="" loading="lazy" @error="hideBrokenCover">
  </a>

  <!-- 影视 / 动画 / 音乐：左侧文字、右侧封面 -->
  <a
    v-else
    class="card card--media"
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
  >
    <span class="card-body">
      <span v-if="kindLine" class="card-kind">{{ kindLine }}</span>
      <span class="card-title">{{ title }}</span>
      <span v-if="item.description" class="card-description">{{ item.description }}</span>
      <span class="card-meta">
        <span class="card-host-line">
          <img v-if="showFavicon" class="card-favicon" :class="{ 'is-inverted': invertFavicon }" :src="faviconSrc" alt="" loading="lazy" crossorigin="anonymous" @load="sampleIcon($event.target as HTMLImageElement)" @error="nextFavicon">
          <span v-else class="i-carbon-earth card-meta-icon" aria-hidden="true" />
          <span class="card-host">{{ host }}</span>
        </span>
        <span v-if="item.rating" class="card-rating">
          <span class="i-carbon-star-filled card-rating-icon" aria-hidden="true" />{{ item.rating }}
        </span>
      </span>
    </span>

    <img v-if="item.cover" class="thumb" :class="coverClass" :src="coverSrc" alt="" loading="lazy" @error="hideBrokenCover">
  </a>
</template>

<style scoped>
.card {
  --uno: relative flex gap-4 rounded-lg p-4 important-op-100;
  --uno: bg-[#8881] border border-[#8882];
  --uno: transition-colors duration-300 hover: bg-[#8882];
}

.card-body,
.repo-body {
  --uno: flex min-w-0 flex-1 flex-col gap-1.5;
}

/* 仓库卡的顶部一行：左边 REPOSITORY · OWNER，右边星数 */
.repo-head {
  --uno: flex items-center justify-between gap-3;
}

/* 分类行：豆瓣的「电影 · 2001」、仓库的「REPOSITORY · MX-SPACE」。这是真正的信息，不能淡到看不见 */
.card-kind {
  --uno: inline-flex items-baseline gap-1 text-[0.72rem] op-60 tracking-[0.08em];
}

/* 图标按字高（cap height）取尺寸、底边落在基线上，才和旁边的文字数字齐平 */
.card-kind-icon,
.card-rating-icon {
  --uno: h-[0.75em] w-[0.75em];
}

/* 标题最多两行：抓来的标题常常又长又带噪音 */
.card-title {
  --uno: text-[0.95rem] leading-snug font-medium op-90;
  --uno: overflow-hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.card--link .card-title--lg {
  --uno: text-[1rem] leading-6 font-semibold;
  -webkit-line-clamp: 2;
}

/* 摘要最多两行，是抓来的快照，只用来判断要不要点进去 */
.card-description {
  --uno: text-[0.8rem] leading-5 op-65;
  --uno: overflow-hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

/* 底部元信息：站点 favicon + 域名。卡片里文字高时沉到底部，别让它浮在半空 */
.card-meta {
  --uno: flex items-center gap-2 text-[0.72rem] op-60;
  margin-top: auto;
}

/* 元信息行：域名在最左，评分 / 语言这类附加信息紧跟在域名右侧 */
.card-host-line {
  --uno: inline-flex min-w-0 items-center gap-1.5;
}

/* favicon 尺寸固定成 1em，跟文字基线对齐；不同站点的图标长宽比不一，object-contain 别拉变形 */
.card-favicon {
  --uno: h-3.5 w-3.5 flex-shrink-0 rounded-sm object-contain;
  --uno: bg-transparent;
}

/* 深底上的单色图标翻成浅色，不然基本看不见 */
.card-favicon.is-inverted {
  --uno: invert;
}

/* 图标的视觉重心比文字的基线略高一丁点，域名往下压 1px 看着才齐 */
.card-host {
  --uno: relative top-[1px] truncate;
}

.card-meta-icon {
  --uno: text-[0.9em];
}

/* 豆瓣评分单独压深一档，别和域名混成一片灰 */
.card-rating {
  --uno: inline-flex flex-shrink-0 items-baseline gap-1 text-[0.72rem] tabular-nums;
}

.thumb {
  --uno: flex-shrink-0 object-cover rounded bg-[#8882];
}

.thumb--poster {
  --uno: h-27 w-18;
}

.thumb--square {
  --uno: h-16 w-16;
}

/* 视频封面是 16:9，按原比例显示，不裁画面；窄屏先收窄一点，别挤掉标题 */
.thumb--wide {
  --uno: h-20 w-34;
}

@media (min-width: 40rem) {
  .thumb--wide {
    --uno: h-24 w-42;
  }
}

/* 仓库的星数，现在在 .repo-head 里，跟着 logo 左边对齐 */
.repo-stars {
  --uno: inline-flex flex-shrink-0 items-baseline gap-1 text-[0.75rem] op-60 tabular-nums;
}

/* 语言是「色点 + 文字」，圆点按居中走；星号是字形，跟数字共享基线 */
.repo-lang {
  --uno: inline-flex flex-shrink-0 items-center gap-1.5 text-[0.72rem];
}

.repo-dot {
  --uno: h-2 w-2 flex-shrink-0 rounded-full;
}

.card--quote {
  --uno: flex-col gap-2;
}

.quote-text {
  --uno: m-0 text-[0.95rem] leading-7 font-serif op-85;
}

.quote-source {
  --uno: text-xs op-55 important-op-55 transition-opacity duration-300 hover: important-op-85;
}
</style>
