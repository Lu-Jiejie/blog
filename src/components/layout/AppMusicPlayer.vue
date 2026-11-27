<script setup lang="ts">
import type { OverlayScrollbars } from 'overlayscrollbars'
import type { MidiTrack } from '~/types'
import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { tracks } from '~/data/tracks'
import { useMidiPlayer } from '~/logic/useMidiPlayer'

const {
  isPlaying,
  isLoading,
  currentTime,
  duration,
  currentTrack,
  loadTrack,
  togglePlayback,
  seekTo,
  cleanup,
} = useMidiPlayer()

// ========== 面板显隐 ==========
const isOpen = ref(false)
const isVisible = ref(false)
const playerRef = ref<HTMLElement | null>(null)
const willPlayAfterLoad = ref(false)

function togglePanel() {
  if (isOpen.value) {
    isVisible.value = false
    setTimeout(() => {
      isOpen.value = false
    }, 200)
  }
  else {
    isOpen.value = true
    requestAnimationFrame(() => {
      isVisible.value = true
    })
  }
}

onClickOutside(playerRef, () => {
  if (isOpen.value) {
    isVisible.value = false
    setTimeout(() => {
      isOpen.value = false
    }, 200)
  }
})

// ========== 播放状态持久化 ==========
const STORAGE_PLAYING = 'lujiejie-music-is-playing'
const shouldAutoPlay = localStorage.getItem(STORAGE_PLAYING) !== 'false' // 默认播放

watch(isPlaying, (val) => {
  localStorage.setItem(STORAGE_PLAYING, val.toString())
})

// ========== 播放列表展开状态持久化 ==========
const showPlaylist = ref(localStorage.getItem('lujiejie-music-show-playlist') === 'true')

watch(showPlaylist, (val) => {
  localStorage.setItem('lujiejie-music-show-playlist', val.toString())
})

// ========== 播放模式持久化 ==========
type PlayMode = 'order' | 'random' | 'loop'
const savedMode = localStorage.getItem('lujiejie-music-play-mode') as PlayMode | null
const playMode = ref<PlayMode>(savedMode && ['order', 'random', 'loop'].includes(savedMode) ? savedMode : 'order')
const randomHistory = ref<number[]>([])

watch(playMode, (val) => {
  localStorage.setItem('lujiejie-music-play-mode', val)
})

// ========== 当前播放歌曲持久化 ==========
watch(currentTrack, (track) => {
  if (track) {
    const idx = tracks.findIndex(t => t.path === track.path)
    if (idx !== -1)
      localStorage.setItem('lujiejie-music-track-index', idx.toString())
  }
})

const currentTrackIndex = computed(() => {
  if (!currentTrack.value)
    return 0
  return tracks.findIndex(t => t.path === currentTrack.value?.path)
})

function togglePlayMode() {
  const modes: PlayMode[] = ['order', 'random', 'loop']
  const i = modes.indexOf(playMode.value)
  playMode.value = modes[(i + 1) % modes.length]
  if (playMode.value === 'random')
    randomHistory.value = [currentTrackIndex.value]
}

const playModeIcon = computed(() => {
  switch (playMode.value) {
    case 'order':
      return 'i-ri-repeat-2-fill'
    case 'random':
      return 'i-ri-shuffle-fill'
    case 'loop':
      return 'i-ri-repeat-one-fill'
    default:
      return 'i-ri-repeat-2-fill'
  }
})

async function playPrevious() {
  let prevIndex: number
  // 上下一首是手动切歌，任何模式下都该真的换歌；loop 只决定播完之后是否重播本曲
  if (playMode.value === 'random' && randomHistory.value.length > 1) {
    randomHistory.value.pop()
    prevIndex = randomHistory.value[randomHistory.value.length - 1]
  }
  else {
    prevIndex = currentTrackIndex.value > 0 ? currentTrackIndex.value - 1 : tracks.length - 1
  }
  willPlayAfterLoad.value = true
  await loadTrack(tracks[prevIndex])
  willPlayAfterLoad.value = false
  if (!isPlaying.value)
    togglePlayback()
}

async function playNext() {
  let nextIndex: number
  if (playMode.value === 'random') {
    const available = tracks.map((_, i) => i).filter(i => i !== currentTrackIndex.value)
    nextIndex = available[Math.floor(Math.random() * available.length)]
    randomHistory.value.push(nextIndex)
  }
  else {
    nextIndex = currentTrackIndex.value < tracks.length - 1 ? currentTrackIndex.value + 1 : 0
  }
  willPlayAfterLoad.value = true
  await loadTrack(tracks[nextIndex])
  willPlayAfterLoad.value = false
  if (!isPlaying.value)
    togglePlayback()
}

async function selectTrack(track: MidiTrack) {
  willPlayAfterLoad.value = true
  await loadTrack(track)
  willPlayAfterLoad.value = false
  if (!isPlaying.value)
    togglePlayback()
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0)
    return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const progress = computed(() => {
  if (!Number.isFinite(duration.value) || duration.value <= 0)
    return 0
  return (currentTime.value / duration.value) * 100
})

function handleSeek(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const pct = (e.clientX - rect.left) / rect.width
  seekTo(pct * duration.value)
}

const osInstance = ref<OverlayScrollbars | null>(null)

function handleScrollbarInit(instance: OverlayScrollbars) {
  osInstance.value = instance
}

// 播放列表滚动：打开面板/展开列表时把当前曲目居中，切歌时只在跑出视窗才滚
function scrollToCurrentTrack(center: boolean) {
  const instance = osInstance.value
  const el = playerRef.value?.querySelector<HTMLElement>('[data-current-track]')
  if (!instance || !el)
    return
  // 面板刚由 display:none 变可见，先让 Scrollbar 重新量尺寸
  instance.update()
  const { viewport } = instance.elements()
  const offset = el.getBoundingClientRect().top - viewport.getBoundingClientRect().top
  const height = el.offsetHeight
  if (!center && offset >= 0 && offset + height <= viewport.clientHeight)
    return
  viewport.scrollTo({
    top: viewport.scrollTop + offset - (viewport.clientHeight - height) / 2,
    behavior: 'smooth',
  })
}

async function syncPlaylistScroll(center: boolean) {
  if (!isOpen.value || !showPlaylist.value)
    return
  await nextTick()
  scrollToCurrentTrack(center)
}

watch(isOpen, (open) => {
  if (open)
    void syncPlaylistScroll(true)
})

// 展开是 0.2s 的高度过渡，等它走完再滚，否则此时视窗高度还是 0
watch(showPlaylist, (show) => {
  if (show)
    setTimeout(() => void syncPlaylistScroll(true), 220)
})

watch(currentTrackIndex, () => {
  void syncPlaylistScroll(false)
})

onMounted(async () => {
  if (tracks.length > 0) {
    const savedIndex = localStorage.getItem('lujiejie-music-track-index')
    const index = savedIndex ? Number.parseInt(savedIndex, 10) : 0
    const validIndex = index >= 0 && index < tracks.length ? index : 0
    willPlayAfterLoad.value = shouldAutoPlay
    await loadTrack(tracks[validIndex])
    willPlayAfterLoad.value = false
    if (shouldAutoPlay && !isPlaying.value)
      await togglePlayback()
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div ref="playerRef" relative z-51>
    <button
      title="音乐播放器"
      class="flex items-center justify-center transition-colors duration-300 cursor-pointer text-[var(--c-text-muted)] hover:text-[var(--c-text)]"
      style="width: 1.2em; height: 1.2em"
      :class="(isPlaying || willPlayAfterLoad) && 'text-[var(--c-accent)]!'"
      @click="togglePanel"
    >
      <!-- 播放中：动态音浪柱条；暂停：音符 -->
      <div v-if="isPlaying || willPlayAfterLoad" class="eq-wave" aria-hidden="true">
        <span v-for="n in 4" :key="n" />
      </div>
      <div v-else i-icon-park-outline-music />
    </button>

    <div
      v-show="isOpen"
      class="popover-panel absolute top-full right-0 mt-2 w-72 p-4 z-100"
      :class="isVisible ? 'op-100 visible translate-y-0' : 'op-0 invisible -translate-y-1'"
      transition-all duration-200 ease
    >
      <!-- Track title -->
      <div class="track-meta">
        <div class="track-title" :class="{ 'is-empty': !currentTrack }">
          {{ currentTrack ? currentTrack.name : '未在播放' }}
        </div>
        <div v-if="currentTrack?.artist" class="track-artist">
          {{ currentTrack.artist }}
        </div>
      </div>

      <!-- Progress bar -->
      <div class="track-progress">
        <div class="progress-track" :class="{ 'is-loading': isLoading }" @click="handleSeek">
          <div class="progress-fill" :style="{ width: `${progress}%` }" />
        </div>
        <div class="progress-time">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="player-controls">
        <button type="button" class="player-btn" title="播放模式" @click="togglePlayMode">
          <div :class="playModeIcon" text-sm />
        </button>
        <button type="button" class="player-btn" title="上一首" :disabled="isLoading" @click="playPrevious">
          <div i-icon-park-outline-left text-lg />
        </button>
        <button
          type="button"
          class="player-btn player-btn--primary"
          :title="isPlaying ? '暂停' : '播放'"
          :disabled="isLoading"
          @click="togglePlayback"
        >
          <div
            :class="isPlaying ? 'i-icon-park-outline-pause' : 'i-material-symbols-play-arrow-outline'"
            text-2xl
          />
        </button>
        <button type="button" class="player-btn" title="下一首" :disabled="isLoading" @click="playNext">
          <div i-icon-park-outline-right text-lg />
        </button>
        <button
          type="button"
          class="player-btn"
          :class="{ 'is-on': showPlaylist }"
          title="播放列表"
          :aria-pressed="showPlaylist"
          @click="showPlaylist = !showPlaylist"
        >
          <div i-icon-park-outline-music-list text-sm />
        </button>
      </div>

      <!-- Playlist -->
      <Transition name="expand">
        <div v-if="showPlaylist" border="t base" pt-2 mt-1.5>
          <UiScrollbar
            class="max-h-36"
            :options="{ scrollbars: { autoHide: 'never' } }"
            @os-initialized="handleScrollbarInit"
          >
            <div space-y-0.5>
              <button
                v-for="(track, i) in tracks" :key="track.path"
                :data-current-track="currentTrackIndex === i ? '' : undefined"
                :title="`${track.name} - ${track.artist}`"
                w-full text-left px-2 py-1 rounded text-xs
                :class="currentTrackIndex === i
                  ? 'text-[var(--c-accent)] font-medium'
                  : 'hover:bg-[var(--c-paper-hover)] text-[var(--c-text-faint)] hover:text-[var(--c-text)]'"
                transition-colors duration-200
                @click="selectTrack(track)"
              >
                <div flex items-center gap-1.5>
                  <div
                    v-if="currentTrackIndex === i && isPlaying"
                    i-svg-spinners-pulse-rings-2 text-xs flex-shrink-0
                  />
                  <div
                    v-else
                    i-icon-park-outline-music-one text-xs text-[var(--c-text-faint)] flex-shrink-0
                  />
                  <span truncate>{{ track.name }}</span>
                </div>
              </button>
            </div>
          </UiScrollbar>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/* 面板字号走站点阶梯：text-sm / text-xs 是 Tailwind 自带刻度，跟正文节奏对不上 */
.track-meta {
  margin-bottom: 0.5rem;
}

.track-title {
  overflow: hidden;
  font-size: var(--text-body);
  font-weight: 500;
  line-height: 1.35;
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-title.is-empty {
  font-weight: 400;
  color: var(--c-text-faint);
}

.track-artist {
  margin-top: 1px;
  overflow: hidden;
  font-size: var(--text-label);
  line-height: 1.4;
  color: var(--c-text-faint);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-progress {
  margin-bottom: 0.75rem;
}

/* 进度槽：空槽色写死在 token 里（--c-progress-track），明暗两侧都能看出沟槽；填充只用强调色 */
.progress-track {
  position: relative;
  height: 5px;
  overflow: hidden;
  cursor: pointer;
  background-color: var(--c-progress-track);
  border-radius: 999px;
  transition: opacity 0.2s ease;
}

.progress-track.is-loading {
  opacity: 0.5;
  pointer-events: none;
}

.progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background-color: var(--c-accent);
  border-radius: 999px;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: var(--text-caption);
  color: var(--c-text-faint);
  font-variant-numeric: tabular-nums;
}

.player-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}

.player-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: var(--c-text-faint);
  background-color: transparent;
  border-radius: 999px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

/* 悬停只提亮到正文色，强调色留给状态 */
.player-btn:hover {
  color: var(--c-text);
}

.player-btn:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.player-btn--primary {
  width: 2.75rem;
  height: 2.75rem;
  color: var(--c-text);
}

/* 列表展开是状态，用强调色常驻 */
.player-btn.is-on,
.player-btn.is-on:hover {
  color: var(--c-accent);
}

/* 顶栏播放按钮：播放中的动态音浪柱条 */
.eq-wave {
  display: inline-flex;
  align-items: flex-end;
  /* 柱宽与间隙都用固定像素：flex 等比分配时每根 3.25px，亚像素舍入会让间距随容器宽度变化 */
  gap: 2px;
  height: 0.85em;
  margin-top: 2px;
  color: var(--c-accent);
}

.eq-wave > span {
  width: 2px;
  height: 100%;
  border-radius: 1px;
  background: currentColor;
  transform-origin: bottom;
  /* 默认就矮：动画 delay 期间柱子保持矮，切换时不会先"满高再降下" */
  transform: scaleY(0.3);
  animation: eq-bounce 0.8s ease-in-out infinite;
}

.eq-wave > span:nth-child(1) {
  animation-delay: 0s;
}
.eq-wave > span:nth-child(2) {
  animation-delay: 0.15s;
}
.eq-wave > span:nth-child(3) {
  animation-delay: 0.3s;
}
.eq-wave > span:nth-child(4) {
  animation-delay: 0.45s;
}

@keyframes eq-bounce {
  0%,
  100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0 !important;
  padding-top: 0;
  margin-top: 0;
  border-top-width: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 180px;
}
</style>
