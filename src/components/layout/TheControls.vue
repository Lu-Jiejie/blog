<script setup lang="ts">
import type { MidiTrack } from '~/logic/useMidiPlayer'
import { onClickOutside, useEventListener, useWindowScroll } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMidiPlayer } from '~/logic/useMidiPlayer'

const isBrowser = typeof window !== 'undefined'

// ========== ToTop 相关逻辑 ==========
function toTop() {
  if (isBrowser)
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const { y: scrollY } = useWindowScroll()
const documentHeight = ref(0)

function getDocumentHeight() {
  if (!isBrowser)
    return 0

  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight,
  )
}

const scrollPercentage = computed(() => {
  if (!isBrowser || documentHeight.value === 0)
    return 0

  const windowHeight = window.innerHeight
  const scrollable = documentHeight.value - windowHeight
  if (scrollable <= 0)
    return 0

  return Math.min(Math.round((scrollY.value / scrollable) * 100), 100)
})

if (isBrowser) {
  documentHeight.value = getDocumentHeight()

  useEventListener('scroll', () => {
    documentHeight.value = getDocumentHeight()
  })

  useEventListener('resize', () => {
    documentHeight.value = getDocumentHeight()
  })
}

// 是否显示 ToTop 按钮
const showToTop = computed(() => scrollY.value > 300)

// ========== MusicPlayer 相关逻辑 ==========
// 音乐轨道列表
const tracks: MidiTrack[] = [
  {
    name: 'Tearforged Blossoms',
    path: '/src/data/mid/Tearforged Blossoms.mid',
  },
  {
    name: 'Shining',
    path: '/src/data/mid/Shining.mid',
  },
  {
    name: 'Had I Not Seen the Sun',
    path: '/src/data/mid/Had I Not Seen the Sun.mid',
  },
  {
    name: 'If I Can Stop One Heart From Breaking',
    path: '/src/data/mid/If I Can Stop One Heart From Breaking.mid',
  },
  {
    name: 'Wonderland Reverie',
    path: '/src/data/mid/Wonderland Reverie.mid',
  },
  {
    name: 'Almost',
    path: '/src/data/mid/Almost.mid',
  },
  {
    name: 'Ridu Holidays',
    path: '/src/data/mid/Ridu Holidays.mid',
  },
]

const {
  isPlaying,
  isLoading,
  currentTime,
  duration,
  currentTrack,
  loadMidi,
  togglePlay,
  seek,
  dispose,
} = useMidiPlayer()

// UI 状态
const isExpanded = ref(false)
const controlsRef = ref<HTMLElement | null>(null)

// 从 localStorage 读取播放状态
const STORAGE_KEY = 'lujiejie-music-play'
const savedPlayState = isBrowser ? localStorage.getItem(STORAGE_KEY) : null
const shouldAutoPlay = savedPlayState === null ? true : savedPlayState === 'true'

// 播放模式: 'order' | 'random' | 'loop'
type PlayMode = 'order' | 'random' | 'loop'
const playMode = ref<PlayMode>('order')

// 随机播放历史记录
const randomHistory = ref<number[]>([])

// 当前播放索引
const currentTrackIndex = computed(() => {
  if (!currentTrack.value)
    return 0
  return tracks.findIndex(track => track.path === currentTrack.value?.path)
})

// 切换播放模式
function togglePlayMode() {
  const modes: PlayMode[] = ['order', 'random', 'loop']
  const currentIndex = modes.indexOf(playMode.value)
  playMode.value = modes[(currentIndex + 1) % modes.length]
  // 切换模式时清空随机播放历史
  if (playMode.value === 'random') {
    randomHistory.value = [currentTrackIndex.value]
  }
}

// 获取播放模式图标
const playModeIcon = computed(() => {
  switch (playMode.value) {
    case 'order':
      return 'i-icon-park-outline-loop-once' // 顺序播放
    case 'random':
      return 'i-icon-park-outline-shuffle-one' // 随机播放
    case 'loop':
      return 'i-icon-park-outline-cycle' // 单曲循环
    default:
      return 'i-icon-park-outline-loop-once'
  }
})

// 包装的 togglePlay，保存播放状态到 localStorage
function togglePlayWithStorage() {
  togglePlay()
  if (isBrowser) {
    localStorage.setItem(STORAGE_KEY, (!isPlaying.value).toString())
  }
}

// 上一首
async function playPrevious() {
  let prevIndex: number

  if (playMode.value === 'loop') {
    // 单曲循环模式：重新开始当前歌曲
    seek(0)
    if (!isPlaying.value) {
      await togglePlay()
    }
    return
  }
  else if (playMode.value === 'random' && randomHistory.value.length > 1) {
    // 随机模式：从历史记录中获取上一首
    randomHistory.value.pop() // 移除当前
    prevIndex = randomHistory.value[randomHistory.value.length - 1]
  }
  else {
    // 顺序模式：播放上一首
    prevIndex = currentTrackIndex.value > 0 ? currentTrackIndex.value - 1 : tracks.length - 1
  }

  await loadMidi(tracks[prevIndex])
  // 切换歌曲后自动开始播放
  if (!isPlaying.value) {
    await togglePlay()
  }
}

// 下一首
async function playNext() {
  let nextIndex: number

  if (playMode.value === 'loop') {
    // 单曲循环模式：重新开始当前歌曲
    seek(0)
    if (!isPlaying.value) {
      await togglePlay()
    }
    return
  }
  else if (playMode.value === 'random') {
    // 随机模式：随机选择下一首（不包括当前正在播放的）
    const availableIndices = tracks
      .map((_, index) => index)
      .filter(index => index !== currentTrackIndex.value)

    nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
    randomHistory.value.push(nextIndex)
  }
  else {
    // 顺序模式：播放下一首
    nextIndex = currentTrackIndex.value < tracks.length - 1 ? currentTrackIndex.value + 1 : 0
  }

  await loadMidi(tracks[nextIndex])
  // 切换歌曲后自动开始播放
  if (!isPlaying.value) {
    await togglePlay()
  }
}

// 选择歌曲
async function selectTrack(track: MidiTrack) {
  await loadMidi(track)
  // 加载完成后自动播放
  if (!isPlaying.value) {
    togglePlay()
  }
}

// 点击外部关闭播放器
onClickOutside(controlsRef, () => {
  if (isExpanded.value) {
    isExpanded.value = false
  }
})

// 格式化时间显示
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 进度条百分比
const progress = computed(() => {
  if (duration.value === 0)
    return 0
  return (currentTime.value / duration.value) * 100
})

// 处理进度条拖动
function handleSeek(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * duration.value
  seek(newTime)
}

// 初始化：加载第一首音乐
onMounted(async () => {
  if (tracks.length > 0) {
    await loadMidi(tracks[0])
    // 根据 localStorage 决定是否自动播放
    if (shouldAutoPlay && !isPlaying.value) {
      await togglePlay()
    }
  }
})

// 清理
onUnmounted(() => {
  dispose()
})
</script>

<template>
  <div
    ref="controlsRef"
    fixed bottom-4 right-4 z-100
    print:hidden select-none
  >
    <!-- 收起状态：显示按钮容器 -->
    <Transition name="fade" mode="out-in">
      <div v-if="!isExpanded" key="collapsed" relative>
        <!-- 容器背景 -->
        <div
          bg="white dark:hex-050505"
          backdrop-blur-8
          transition-all duration-300
          :class="showToTop ? 'rounded-3xl w-10 h-21' : 'rounded-full w-10 h-10'"
          absolute bottom-0 right-0
          border="~ base"
          style="box-shadow: 0 0 8px rgba(0, 0, 0, 0.08);"
          class="dark:![box-shadow:0_0_8px_rgba(255,255,255,0.12)]"
        />

        <div flex flex-col items-center relative z-1>
          <!-- ToTop 按钮（在上方，从下往上出现） -->
          <Transition name="slide-up">
            <button
              v-if="showToTop"
              @click="toTop()"
              title="Scroll to Top"
              w-10 h-10 rounded-full
              hover-bg-hex-8883
              transition duration-300 cursor-pointer
              op-30 hover:op-70
              flex items-center justify-center
              mb-1
              relative
            >
              <svg
                absolute left-0 top-0 w-full h-full z-0 op-70 lt-sm:hidden
                style="transform: rotate(-90deg);"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50" cy="50" r="45"
                  fill-transparent
                  stroke="currentColor"
                  stroke-width="5"
                  :stroke-dasharray="`${scrollPercentage * 2.83}, 283`"
                />
              </svg>

              <div
                i-icon-park-outline-to-top-one
                relative z-1 color-inherit op-85
              />
            </button>
          </Transition>

          <!-- Music 播放按钮（在下方，固定不动） -->
          <button
            w-10 h-10 rounded-full
            hover-bg-hex-8883
            flex items-center justify-center
            cursor-pointer
            op-30 hover:op-70
            transition duration-300
            relative
            @click="isExpanded = true"
          >
            <!-- 播放进度圆圈 -->
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
                :stroke-dasharray="`${progress * 2.83}, 283`"
              />
            </svg>

            <div
              :class="isPlaying ? 'i-icon-park-outline-pause' : 'i-material-symbols-play-arrow-outline'"
              text-xl op-85 relative z-1
            />
          </button>
        </div>
      </div>

      <!-- 展开状态：完整播放器 -->
      <div
        v-else
        key="expanded"
        bg="white dark:hex-050505"
        backdrop-blur-10
        rounded-2xl
        p-4
        border="~ base"
        w-80
        style="box-shadow: 0 0 12px rgba(0, 0, 0, 0.08);"
        class="dark:![box-shadow:0_0_12px_rgba(255,255,255,0.12)]"
      >
        <!-- 播放列表 -->
        <div v-if="tracks.length > 1" mb-3 pb-3 border-b="1 gray-200 dark:gray-700">
          <div text-xs op-60 mb-2>
            Playlist ({{ tracks.length }})
          </div>
          <div max-h-40 overflow-y-auto space-y-1>
            <button
              v-for="(track, index) in tracks"
              :key="track.path"
              w-full text-left px-2 py-1.5 rounded
              text-sm
              :class="currentTrackIndex === index
                ? 'bg-black/10 dark:bg-white/10 font-medium'
                : 'hover:bg-black/5 dark:hover:bg-white/5 op-80'"
              transition-colors duration-200
              :disabled="isLoading"
              @click="selectTrack(track)"
            >
              <div flex items-center gap-2>
                <div
                  :class="currentTrackIndex === index && isPlaying ? 'i-svg-spinners-pulse-rings-2' : 'i-icon-park-outline-music-one'"
                  text-sm flex-shrink-0
                  :op="currentTrackIndex === index ? '100' : '60'"
                />
                <span truncate>{{ track.name }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- 头部：标题 -->
        <div flex items-center mb-3>
          <div flex items-center gap-2 flex-1 min-w-0>
            <span text-sm font-medium op-80 truncate>
              {{ currentTrack?.name || 'Music Player' }}
            </span>
          </div>
        </div>

        <!-- 进度条 -->
        <div mb-3 relative>
          <div
            relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full
            cursor-pointer overflow-hidden
            :class="isLoading ? 'op-50 pointer-events-none' : ''"
            @click="handleSeek"
          >
            <div
              absolute left-0 top-0 h-full
              bg-black dark:bg-white
              rounded-full
              transition-all duration-0
              :style="{ width: `${progress}%` }"
            />
          </div>
          <div flex justify-between mt-1 text-xs op-60>
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div grid grid-cols-5 items-center w-full>
          <!-- 占位 -->
          <div />

          <!-- 上一首按钮 -->
          <button
            v-if="tracks.length > 1"
            w-10 h-10 rounded-full mx-auto
            hover-bg-hex-8883
            flex items-center justify-center
            transition duration-300 cursor-pointer
            op-30 hover:op-70
            :disabled="isLoading"
            :class="isLoading ? '!op-20 cursor-not-allowed' : ''"
            @click="playPrevious"
          >
            <div i-icon-park-outline-left text-xl op-85 />
          </button>

          <!-- 播放/暂停按钮 -->
          <button
            w-12 h-12 rounded-full mx-auto
            hover-bg-hex-8883
            flex items-center justify-center
            transition duration-300 cursor-pointer
            op-30 hover:op-70
            :disabled="isLoading"
            :class="isLoading ? '!op-20 cursor-not-allowed' : ''"
            @click="togglePlayWithStorage"
          >
            <div
              :class="isPlaying ? 'i-icon-park-outline-pause' : 'i-material-symbols-play-arrow-outline'"
              text-2xl op-85
            />
          </button>

          <!-- 下一首按钮 -->
          <button
            v-if="tracks.length > 1"
            w-10 h-10 rounded-full mx-auto
            hover-bg-hex-8883
            flex items-center justify-center
            transition duration-300 cursor-pointer
            op-30 hover:op-70
            :disabled="isLoading"
            :class="isLoading ? '!op-20 cursor-not-allowed' : ''"
            @click="playNext"
          >
            <div i-icon-park-outline-right text-xl op-85 />
          </button>

          <!-- 播放模式切换按钮 -->
          <button
            v-if="tracks.length > 1"
            w-10 h-10 rounded-full mx-auto
            hover-bg-hex-8883
            flex items-center justify-center
            transition duration-300 cursor-pointer
            op-30 hover:op-70
            @click="togglePlayMode"
          >
            <div :class="playModeIcon" text-lg op-85 />
          </button>
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

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
