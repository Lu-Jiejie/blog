<script setup lang="ts">
import type { MidiTrack } from '~/logic/useMidiPlayer'
import { onClickOutside } from '@vueuse/core'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMidiPlayer } from '~/logic/useMidiPlayer'

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
  // volume, // 音量控制已注释
  currentTrack,
  loadMidi,
  togglePlay,
  seek,
  // setVolume, // 音量控制已注释
  dispose,
} = useMidiPlayer()

// UI 状态
const isExpanded = ref(false)
const playerRef = ref<HTMLElement | null>(null)

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

// 上一首
function playPrevious() {
  let prevIndex: number

  if (playMode.value === 'loop') {
    // 单曲循环模式：播放当前歌曲
    prevIndex = currentTrackIndex.value
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

  loadMidi(tracks[prevIndex])
}

// 下一首
function playNext() {
  let nextIndex: number

  if (playMode.value === 'loop') {
    // 单曲循环模式：播放当前歌曲
    nextIndex = currentTrackIndex.value
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

  loadMidi(tracks[nextIndex])
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
onClickOutside(playerRef, () => {
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
onMounted(() => {
  if (tracks.length > 0) {
    loadMidi(tracks[0])
  }
})

// 清理
onUnmounted(() => {
  dispose()
})
</script>

<template>
  <div
    ref="playerRef"
    fixed bottom-20 right-4 z-100
    print:hidden select-none
  >
    <!-- 收起状态：只显示播放/暂停按钮 -->
    <Transition name="fade" mode="out-in">
      <div
        v-if="!isExpanded"
        key="collapsed"
        bg="white/80 dark:black/80"
        backdrop-blur-8
        rounded-full shadow-lg
        w-10 h-10
        flex items-center justify-center
        cursor-pointer
        hover:scale-105
        transition-transform duration-200
        @click="isExpanded = true"
      >
        <div
          :class="isPlaying ? 'i-icon-park-outline-pause' : 'i-material-symbols-play-arrow-outline'"
          text-xl op-80
        />
      </div>

      <!-- 展开状态：完整播放器 -->
      <div
        v-else
        key="expanded"
        bg="white/90 dark:black/90"
        backdrop-blur-10
        rounded-2xl shadow-xl
        p-4
        border="1 gray-200/50 dark:gray-700/50"
        w-80
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
              transition-all duration-100
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
            bg="hover:black/10 dark:hover:white/10"
            flex items-center justify-center
            transition-colors duration-200 cursor-pointer
            :disabled="isLoading"
            :class="isLoading ? 'op-50 cursor-not-allowed' : ''"
            @click="playPrevious"
          >
            <div i-icon-park-outline-left text-xl />
          </button>

          <!-- 播放/暂停按钮 -->
          <button
            w-12 h-12 rounded-full mx-auto
            bg="hover:black/20 dark:hover:white/20"
            flex items-center justify-center
            transition-colors duration-200 cursor-pointer
            :disabled="isLoading"
            :class="isLoading ? 'op-50 cursor-not-allowed' : ''"
            @click="togglePlay"
          >
            <div
              :class="isPlaying ? 'i-icon-park-outline-pause' : 'i-material-symbols-play-arrow-outline'"
              text-2xl
            />
          </button>

          <!-- 下一首按钮 -->
          <button
            v-if="tracks.length > 1"
            w-10 h-10 rounded-full mx-auto
            bg="hover:black/10 dark:hover:white/10"
            flex items-center justify-center
            transition-colors duration-200 cursor-pointer
            :disabled="isLoading"
            :class="isLoading ? 'op-50 cursor-not-allowed' : ''"
            @click="playNext"
          >
            <div i-icon-park-outline-right text-xl />
          </button>

          <!-- 播放模式切换按钮 -->
          <button
            v-if="tracks.length > 1"
            w-10 h-10 rounded-full mx-auto
            bg="hover:black/10 dark:hover:white/10"
            flex items-center justify-center
            transition-colors duration-200 cursor-pointer
            @click="togglePlayMode"
          >
            <div :class="playModeIcon" text-lg />
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
</style>
