<script setup lang="ts">
import type { MidiTrack } from '~/data/mid'
import { onClickOutside, useLocalStorage, useWindowScroll } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { tracks } from '~/data/mid'
import { isZh } from '~/logic/i18n'
import { useMidiPlayer } from '~/logic/useMidiPlayer'

const isBrowser = typeof window !== 'undefined'

// ========== ToTop ==========
function toTop() {
  if (isBrowser)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const { y: scrollY } = useWindowScroll()

const showToTop = computed(() => scrollY.value > 300)

// ========== MusicPlayer ==========
const {
  isPlaying,
  isLoading,
  currentTime,
  duration,
  currentTrack,
  loadTrack,
  togglePlayback,
  seekTo,
  setVolume,
  cleanup,
} = useMidiPlayer()

// Settings (persisted)
const shouldAutoPlay = useLocalStorage<boolean>('music-autoplay', true)
const volumeLevel = useLocalStorage<number>('music-volume', 80)
const volumeBeforeMute = ref<number>(volumeLevel.value)
const playMode = useLocalStorage<PlayMode>('music-playmode', 'order')
const currentIndex = useLocalStorage<number>('music-current-index', 0)

// UI state
const isPlayerOpen = ref(false)
const hasScrolledToCurrentTrack = ref(false)
const controlsRef = useTemplateRef<HTMLElement>('controls')
const playlistRef = useTemplateRef<HTMLElement>('playlist')

// Volume conversion: percent (0-100) to dB (-60 to 0)
const volumeInDb = computed(() => {
  return -60 + (volumeLevel.value / 100) * 60
})

// Sync volume changes to player
watch(volumeInDb, (newVolumeDb) => {
  setVolume(newVolumeDb)
}, { immediate: true })

// Sync playing state to localStorage
watch(isPlaying, (newIsPlaying) => {
  shouldAutoPlay.value = newIsPlaying
})

// Volume icon
const volumeIcon = computed(() => {
  if (volumeLevel.value === 0) {
    return 'i-icon-park-outline-volume-mute'
  }
  if (volumeLevel.value <= 50) {
    return 'i-icon-park-outline-volume-small'
  }
  return 'i-icon-park-outline-volume-notice'
})

// Shuffle play history
const shuffleHistory = ref<number[]>([])

// Current track index (computed)
const currentTrackIndex = computed(() => {
  if (!currentTrack.value) {
    return 0
  }
  return tracks.findIndex(track => track.path === currentTrack.value?.path)
})

// Toggle mute/unmute
function toggleMute() {
  // Currently muted, restore previous volume
  if (volumeLevel.value === 0) {
    volumeLevel.value = volumeBeforeMute.value > 0 ? volumeBeforeMute.value : 80
  }
  // Currently unmuted, save current volume and mute
  else {
    volumeBeforeMute.value = volumeLevel.value
    volumeLevel.value = 0
  }
}

// Toggle playback mode
type PlayMode = 'order' | 'shuffle' | 'loop'
function togglePlayMode() {
  const playModes: PlayMode[] = ['order', 'shuffle', 'loop']
  const playModeIndex = playModes.indexOf(playMode.value)
  playMode.value = playModes[(playModeIndex + 1) % playModes.length]
  // Clear shuffle history when switching to shuffle mode
  if (playMode.value === 'shuffle') {
    shuffleHistory.value = [currentTrackIndex.value]
  }
}

// Play mode icon
const playModeIcon = computed(() => {
  switch (playMode.value) {
    case 'order':
      return 'i-ri-repeat-2-fill' // Sequential play
    case 'shuffle':
      return 'i-ri-shuffle-fill' // Shuffle play
    case 'loop':
      return 'i-ri-repeat-one-fill' // Single loop
    default:
      return 'i-ri-repeat-2-fill'
  }
})

// Scroll playlist to ensure current track is visible.
function scrollToCurrentTrack() {
  setTimeout(() => {
    const container = playlistRef.value
    if (!container)
      return

    const currentItem = container.querySelectorAll('button')[currentTrackIndex.value] as HTMLElement
    if (!currentItem)
      return

    const { offsetTop: buttonTop, offsetHeight: buttonHeight } = currentItem
    const { clientHeight: containerHeight, scrollTop: containerScrollTop } = container

    const buttonBottom = buttonTop + buttonHeight
    const viewportBottom = containerScrollTop + containerHeight

    if (buttonTop < containerScrollTop || buttonBottom > viewportBottom) {
      container.scrollTo({
        top: buttonTop - containerHeight / 2 + buttonHeight / 2,
        behavior: 'smooth',
      })
    }
  }, 250)
}

// Switch to a specific track.
async function switchToTrack(index: number, options: { autoScroll?: boolean } = {}) {
  const { autoScroll = true } = options

  currentIndex.value = index
  await loadTrack(tracks[index])

  // Scroll to current track
  if (autoScroll) {
    scrollToCurrentTrack()
  }

  // Auto-play after switching track
  if (!isPlaying.value) {
    await togglePlayback()
  }
}

// Previous track
async function previousTrack() {
  let prevIndex: number
  // Shuffle mode: get previous track from history
  if (playMode.value === 'shuffle' && shuffleHistory.value.length > 1) {
    shuffleHistory.value.pop() // Remove current
    prevIndex = shuffleHistory.value[shuffleHistory.value.length - 1]
  }
  else {
    prevIndex = currentTrackIndex.value > 0 ? currentTrackIndex.value - 1 : tracks.length - 1
  }

  await switchToTrack(prevIndex)
}

// Next track
async function nextTrack() {
  let nextIndex: number

  // Shuffle mode: randomly select next track (excluding current)
  if (playMode.value === 'shuffle') {
    const availableIndices = tracks
      .map((_, index) => index)
      .filter(index => index !== currentTrackIndex.value)

    nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    shuffleHistory.value.push(nextIndex)
  }
  else {
    nextIndex = currentTrackIndex.value < tracks.length - 1 ? currentTrackIndex.value + 1 : 0
  }

  await switchToTrack(nextIndex)
}

// Select track (from playlist click)
async function selectTrack(_track: MidiTrack, index: number) {
  await switchToTrack(index, { autoScroll: false })
}

// Click outside to close player
onClickOutside(controlsRef, () => {
  if (isPlayerOpen.value) {
    isPlayerOpen.value = false
  }
})

// Watch player open state, auto-scroll to current track on first open
watch(isPlayerOpen, (open) => {
  if (open && !hasScrolledToCurrentTrack.value) {
    scrollToCurrentTrack()
    hasScrolledToCurrentTrack.value = true
  }
})

// Handle playlist scroll, prevent propagation to page
function handlePlaylistWheel(event: WheelEvent) {
  // Always stop event propagation to prevent page scroll
  event.stopPropagation()
}

// Format time display
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Get localized track name
function getTrackName(track: MidiTrack): string {
  return isZh.value ? track.nameZh : track.name
}

// Progress bar percentage
const progressPercent = computed(() => {
  if (duration.value === 0)
    return 0
  return (currentTime.value / duration.value) * 100
})

// Handle seek bar click
function handleSeek(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * duration.value
  seekTo(newTime)
}

// Handle volume slider click
function handleVolumeChange(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  volumeLevel.value = Math.round(percent * 100)
  // Watch will auto-sync volume changes
}

// Initialize: load first track
onMounted(async () => {
  if (tracks.length > 0) {
    // Load last played track
    const trackIndex = Math.min(currentIndex.value, tracks.length - 1)
    await loadTrack(tracks[trackIndex])

    // Auto-play based on localStorage
    if (shouldAutoPlay.value && !isPlaying.value) {
      await togglePlayback()
    }
  }
})

// Cleanup
onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div
    ref="controls"
    fixed bottom-4 right-4 z-100
    print:hidden select-none
  >
    <Transition name="fade" mode="out-in">
      <div v-if="!isPlayerOpen" key="collapsed" relative>
        <div
          bg="white dark:hex-050505"
          backdrop-blur-8
          transition-all duration-300
          :class="showToTop ? 'rounded-3xl w-10 h-21' : 'rounded-full w-10 h-10'"
          absolute bottom-0 right-0
          border="~ base"
          shadow="![0_0_8px_rgba(0,0,0,0.12)] dark:![0_0_8px_rgba(255,255,255,0.12)]"
        />

        <div flex flex-col items-center relative z-1 pointer-events-none>
          <!-- ToTop button -->
          <button
            @click="toTop()"
            w-10 rounded-full
            transition-all duration-300 cursor-pointer
            flex items-center justify-center
            relative
            overflow-hidden
            :class="showToTop ? 'h-10 op-40 hover:op-80 mb-1 pointer-events-auto' : 'h-0 op-0 pointer-events-none'"
          >
            <div
              i-icon-park-outline-to-top-one
              relative z-1 color-inherit op-85
              transition-opacity duration-300
            />
          </button>

          <!-- Music play button (fixed at the bottom) -->
          <button
            w-10 h-10 rounded-full
            flex items-center justify-center
            cursor-pointer
            op-40 hover:op-80
            transition duration-300
            relative
            pointer-events-auto
            @click="isPlayerOpen = true"
          >
            <!-- play progress circle -->
            <svg
              v-if="duration > 0"
              absolute left-0 top-0 w-full h-full z-0
              style="transform: rotate(-90deg);"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50" cy="50" r="45"
                fill-transparent
                stroke="#22c55e"
                stroke-width="5"
                :stroke-dasharray="`${progressPercent * 2.83}, 283`"
              />
            </svg>

            <div
              :class="isPlaying ? 'i-icon-park-outline-pause' : 'i-material-symbols-play-arrow-outline'"
              text-xl op-85 relative z-1
            />
          </button>
        </div>
      </div>

      <!-- Expanded state: full player -->
      <div
        v-else
        key="expanded"
        bg="white dark:hex-050505"
        backdrop-blur-10
        rounded-2xl p-4
        border="~ base" w-80
        shadow="[0_0_12px_rgba(0,0,0,0.08)] dark:[0_0_12px_rgba(255,255,255,0.12)]"
        @wheel.prevent
      >
        <!-- Playlist -->
        <div v-if="tracks.length > 1" mb-3 pb-3 border-b="1 hex-8882 dark:hex-8883">
          <!-- <div text-xs op-60 mb-2>
            Playlist ({{ tracks.length }})
          </div> -->
          <div
            ref="playlist" max-h-40 overflow-y-auto overflow-x-hidden space-y-1
            @wheel.passive="handlePlaylistWheel"
          >
            <button
              v-for="(track, index) in tracks"
              :key="track.path"
              w-full text-left px-2 py-1.5 rounded
              cursor-pointer
              :class="currentTrackIndex === index
                ? 'bg-black/10 dark:bg-white/10'
                : 'hover:bg-black/5 dark:hover:bg-white/5 op-80'"
              transition-colors duration-200
              :disabled="isLoading"
              :title="`${getTrackName(track)} - ${track.artist}`"
              @click="selectTrack(track, index)"
            >
              <div flex flex-col gap-0.5>
                <span
                  text-sm truncate block
                  :class="currentTrackIndex === index ? 'font-medium' : ''"
                >
                  {{ getTrackName(track) }}
                </span>
                <span text-xs op-50 truncate block>
                  {{ track.artist }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <!-- Header: Title and Artist -->
        <div flex flex-col gap-1 mb-3>
          <span
            text-sm font-medium op-80 truncate
            :title="currentTrack ? getTrackName(currentTrack) : 'Music Player'"
          >
            {{ currentTrack ? getTrackName(currentTrack) : 'Music Player' }}
          </span>
          <span
            v-if="currentTrack?.artist"
            text-xs op-50 truncate
            :title="currentTrack.artist"
          >
            {{ currentTrack.artist }}
          </span>
        </div>

        <!-- Progress bar -->
        <div mb-3 relative>
          <div
            relative h-1.5 bg-hex-8882 dark:bg-hex-8883 rounded-full
            cursor-pointer overflow-hidden
            :class="isLoading ? 'op-50 pointer-events-none' : ''"
            @click="handleSeek"
          >
            <div
              absolute left-0 top-0 h-full
              bg="black dark:white op-70"
              rounded-full
              transition-all duration-0
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <div flex justify-between mt-1 text-xs op-60>
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- Control buttons -->
        <div grid grid-cols-5 items-center w-full>
          <div />

          <!-- Previous button -->
          <button
            v-if="tracks.length > 1"
            w-10 h-10 rounded-full mx-auto
            flex items-center justify-center
            transition duration-300 cursor-pointer
            :disabled="isLoading"
            :class="isLoading ? 'cursor-not-allowed' : ''"
            @click="previousTrack"
          >
            <div
              i-ri-skip-back-fill text-xl transition-opacity duration-300
              :class="isLoading ? 'op-20' : 'op-40 hover:op-60'"
            />
          </button>

          <!-- Play/Pause button -->
          <button
            w-14 h-14 rounded-full mx-auto
            flex items-center justify-center
            transition duration-300 cursor-pointer
            :disabled="isLoading"
            :class="isLoading ? 'cursor-not-allowed' : ''"
            @click="togglePlayback"
          >
            <div
              text-3xl transition-opacity duration-300
              :class="[
                isPlaying ? 'i-ri-pause-large-fill' : 'i-ri-play-large-fill',
                isLoading ? 'op-20' : 'op-40 hover:op-60',
              ]"
            />
          </button>

          <!-- Next button -->
          <button
            v-if="tracks.length > 1"
            w-10 h-10 rounded-full mx-auto
            flex items-center justify-center
            transition duration-300 cursor-pointer
            :disabled="isLoading"
            :class="isLoading ? 'cursor-not-allowed' : ''"
            @click="nextTrack"
          >
            <div
              i-ri-skip-forward-fill text-xl transition-opacity duration-300
              :class="isLoading ? 'op-20' : 'op-40 hover:op-60'"
            />
          </button>

          <!-- Play mode toggle button -->
          <button
            v-if="tracks.length > 1"
            w-10 h-10 rounded-full mx-auto
            flex items-center justify-center
            transition duration-300 cursor-pointer
            @click="togglePlayMode"
          >
            <div
              :class="playModeIcon"
              text-lg transition-opacity duration-300 op-40 hover:op-60
            />
          </button>
        </div>

        <!-- Volume control area -->
        <div mt-3 pt-3 border-t="1 hex-8882 dark:hex-8883">
          <div flex items-center gap-2>
            <button
              w-8 h-8 rounded-full flex-shrink-0
              flex items-center justify-center
              op-40 hover:op-60
              transition duration-300 cursor-pointer
              @click="toggleMute"
            >
              <div :class="volumeIcon" text-base op-85 />
            </button>

            <!-- Volume slider -->
            <div
              flex-1 relative h-1.5 bg-hex-8882 dark:bg-hex-8883 rounded-full
              cursor-pointer overflow-hidden
              @click="handleVolumeChange"
            >
              <div
                absolute left-0 top-0 h-full
                bg="black dark:white op-70"
                rounded-full
                transition-all duration-100
                :style="{ width: `${volumeLevel}%` }"
              />
            </div>

            <span text-xs op-60 w-10 text-right>
              {{ volumeLevel }}%
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
