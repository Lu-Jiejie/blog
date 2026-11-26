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
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const progress = computed(() => {
  if (duration.value === 0)
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

watch(isOpen, async (open) => {
  if (open && showPlaylist.value && osInstance.value) {
    // 面板从 display:none 变为可见，强制 Scrollbar 重新计算尺寸
    osInstance.value.update()
    await nextTick()
    const el = playerRef.value?.querySelector('[data-current-track]')
    if (el) {
      const { viewport } = osInstance.value.elements()
      const top = el.getBoundingClientRect().top - viewport.getBoundingClientRect().top + viewport.scrollTop
      viewport.scrollTop = top - viewport.clientHeight / 2
    }
  }
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
      class="flex items-center justify-center transition-colors duration-300 cursor-pointer text-[var(--c-text-muted)] hover:text-[var(--c-accent)]"
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
      absolute top-full right-0 mt-2
      bg="[var(--c-surface)]"
      rounded-xl border="~ base"
      w-72 p-4 z-100
      :class="isVisible ? 'op-100 visible translate-y-0' : 'op-0 invisible -translate-y-1'"
      transition-all duration-200 ease
      style="box-shadow: 0 4px 24px rgba(0,0,0,0.1);"
      class="dark:![box-shadow:0_4px_24px_rgba(0,0,0,0.4)]"
    >
      <!-- Track title -->
      <div mb-1>
        <div text-sm font-medium truncate :op="currentTrack ? '85' : '40'">
          {{ currentTrack ? currentTrack.name : '未在播放' }}
        </div>
        <div v-if="currentTrack?.artist" text-xs op-40 truncate>
          {{ currentTrack.artist }}
        </div>
      </div>

      <!-- Progress bar -->
      <div mb-2>
        <div
          relative h-1.5 bg-[var(--c-fill)] rounded-full cursor-pointer overflow-hidden
          :class="isLoading ? 'op-50 pointer-events-none' : ''"
          @click="handleSeek"
        >
          <div
            absolute left-0 top-0 h-full bg-[var(--c-accent)] rounded-full
            transition-none
            :style="{ width: `${progress}%` }"
          />
        </div>
        <div flex justify-between text-xs op-40 mt-0.5>
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div flex items-center justify-center gap-2>
        <button
          w-8 h-8 rounded-full hover-bg-[var(--c-fill)] flex items-center justify-center
          op-40 hover:op-70 transition cursor-pointer
          @click="togglePlayMode"
        >
          <div :class="playModeIcon" text-sm />
        </button>
        <button
          w-8 h-8 rounded-full hover-bg-[var(--c-fill)] flex items-center justify-center
          op-40 hover:op-70 transition cursor-pointer
          :disabled="isLoading"
          @click="playPrevious"
        >
          <div i-icon-park-outline-left text-lg />
        </button>
        <button
          w-10 h-10 rounded-full bg-[var(--c-fill)] flex items-center justify-center
          hover:bg-[var(--c-border-medium)] transition cursor-pointer
          :disabled="isLoading"
          @click="togglePlayback"
        >
          <div
            :class="isPlaying ? 'i-icon-park-outline-pause' : 'i-material-symbols-play-arrow-outline'"
            text-xl
          />
        </button>
        <button
          w-8 h-8 rounded-full hover-bg-[var(--c-fill)] flex items-center justify-center
          op-40 hover:op-70 transition cursor-pointer
          :disabled="isLoading"
          @click="playNext"
        >
          <div i-icon-park-outline-right text-lg />
        </button>
        <button
          w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer
          :class="showPlaylist ? 'bg-[var(--c-fill)] op-70' : 'hover-bg-[var(--c-fill)] op-40 hover:op-70'"
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
                  ? 'bg-[var(--c-fill)] font-medium'
                  : 'hover:bg-[var(--c-surface)] op-70'"
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
                    i-icon-park-outline-music-one text-xs op-50 flex-shrink-0
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
/* 顶栏播放按钮：播放中的动态音浪柱条（绿色） */
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
