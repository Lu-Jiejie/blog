import type { MidiTrack } from '~/types'
import * as ToneMidi from '@tonejs/midi'

import * as Tone from 'tone'
import { readonly, ref, shallowRef } from 'vue'

// 把 glob 结果转成 Tone.Sampler 需要的 { 音名: URL } 映射，
// 文件名用 s 表示升号（As1 -> A#1）。
function toSampleUrls(files: Record<string, unknown>): Record<string, string> {
  const urls: Record<string, string> = {}
  for (const path in files) {
    const fileName = path.split('/').pop()!
    urls[fileName.replace('.mp3', '').replace('s', '#')] = files[path] as string
  }
  return urls
}

// Salamander Grand Piano V3（Alexander Holm，CC-BY 3.0）：Yamaha C5，48kHz/24bit，16 力度层。
// 上游只放出 A/C/Ds/Fs 四种音名的小三度网格共 30 个音，缺的音由 Sampler 重采样补齐。
const pianoUrls = toSampleUrls(import.meta.glob('../assets/piano/*.mp3', { eager: true, query: '?url', import: 'default' }))

export function useMidiPlayer() {
  // Public state
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0) // dB
  const currentTrack = ref<MidiTrack | null>(null)

  // Internal MIDI resources
  const sampler = shallowRef<Tone.Sampler | null>(null)
  const midiScheduler = shallowRef<Tone.Part | null>(null)

  let pendingNotes: Array<{ time: number, note: string, duration: number, velocity: number }> = []

  function createSampler() {
    const next = new Tone.Sampler(pianoUrls, { release: 1 }).toDestination()
    next.volume.value = volume.value
    return next
  }

  function disposeSampler() {
    sampler.value?.dispose()
    sampler.value = null
  }

  function buildScheduler() {
    if (midiScheduler.value) {
      midiScheduler.value.dispose()
      midiScheduler.value = null
    }
    midiScheduler.value = new Tone.Part((time, note) => {
      sampler.value?.triggerAttackRelease(
        note.note,
        note.duration,
        time,
        note.velocity,
      )
    }, pendingNotes)
    midiScheduler.value.loop = true
    midiScheduler.value.loopEnd = duration.value
  }

  let animationFrameId: number | null = null

  // 根据 Tone.Transport 的当前时间更新播放进度。
  // 该函数会在播放时通过 requestAnimationFrame 持续轮询，
  // 保持 currentTime 与音频引擎同步。
  // 如果当前时间超过已加载 MIDI 的总时长，则会自动回到开头，实现循环播放。
  // 主要作用：让 UI 能实时显示当前播放进度。
  function updateCurrentTime() {
    const transport = Tone.getTransport()
    if (isPlaying.value && transport.state === 'started') {
      const seconds = transport.seconds
      // 如果已知 MIDI 总时长且当前时间超过它，
      // 则用取模运算让播放进度回到头部，实现循环。
      if (duration.value > 0 && seconds >= duration.value) {
        currentTime.value = seconds % duration.value
      }
      else {
        // 否则直接用 transport 的绝对时间。
        currentTime.value = seconds
      }
      // 如果还在播放，则继续下一帧轮询。
      animationFrameId = requestAnimationFrame(updateCurrentTime)
    }
  }

  // 加载一个 MIDI 文件（通过 MidiTrack 的 path），解析并准备播放。
  // 包括：停止当前播放、释放旧资源、拉取并解析新 MIDI、创建采样器和音符调度器。
  async function loadTrack(track: MidiTrack) {
    try {
      isLoading.value = true

      // 加载新 MIDI 前，先停止当前播放并取消所有已调度的事件，
      // 保证不会出现资源冲突或声音重叠。
      await stop()

      // 释放并清空之前创建的发声单元和调度器，
      // 防止内存泄漏和音频节点堆积。
      disposeSampler()
      if (midiScheduler.value) {
        midiScheduler.value.dispose()
        midiScheduler.value = null
      }

      // 根据 track.path 拉取 MIDI 文件，并用 @tonejs/midi 解析。
      // 解析后可获得所有音轨、音符和总时长。
      const response = await fetch(track.path)
      const arrayBuffer = await response.arrayBuffer()
      const midi = new ToneMidi.Midi(arrayBuffer)

      duration.value = midi.duration

      // 收集所有音轨的音符事件，扁平化成统一的调度列表。
      // 所有音符共用一个钢琴采样器播放（多轨在音色上不做区分）。
      const scheduledNotes: typeof pendingNotes = []
      midi.tracks.forEach((midiTrack) => {
        midiTrack.notes.forEach((note) => {
          scheduledNotes.push({
            time: note.time,
            note: note.name,
            duration: note.duration,
            velocity: note.velocity,
          })
        })
      })

      sampler.value = createSampler()
      pendingNotes = scheduledNotes

      // 等待采样器加载完成
      await Tone.loaded()

      // 创建 Tone.Part 调度器，统一调度所有音符事件。
      buildScheduler()

      // 记录当前加载的曲目，并重置播放进度。
      currentTrack.value = track
      currentTime.value = 0

      isLoading.value = false
    }
    catch (error) {
      console.error('Failed to load MIDI file:', error)
      isLoading.value = false
      throw error
    }
  }

  // 开始播放：启动音频引擎和调度器。
  async function play() {
    if (!midiScheduler.value)
      return

    // 确保 Web Audio 的 AudioContext 已启动，否则无法播放。
    await Tone.start()
    Tone.getTransport().start()
    midiScheduler.value.start(0)
    isPlaying.value = true

    // 开始轮询播放进度，驱动 UI 实时更新。
    updateCurrentTime()
  }

  // 暂停播放：暂停音频引擎并停止进度轮询。
  function pause() {
    Tone.getTransport().pause()
    isPlaying.value = false

    // 停止进度轮询。
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 停止播放：停止音频引擎、取消所有调度事件，并重置进度。
  async function stop() {
    const transport = Tone.getTransport()
    transport.stop()
    transport.cancel() // 取消所有计划的事件
    isPlaying.value = false
    // 停止后将播放进度重置为 0。
    currentTime.value = 0

    // 停止进度轮询。
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 切换播放/暂停状态。如果正在播放则暂停，否则开始播放。
  async function togglePlayback() {
    if (isPlaying.value) {
      pause()
    }
    else {
      await play()
    }
  }

  // 跳转到指定时间（秒）。如果跳转前正在播放，则跳转后继续播放。
  function seekTo(time: number) {
    const wasPlaying = isPlaying.value
    const transport = Tone.getTransport()

    // 暂停音频引擎，设置新的播放时间，并更新进度。
    // 如果之前在播放，则跳转后继续播放。
    transport.stop()

    transport.seconds = time
    currentTime.value = time

    if (wasPlaying && midiScheduler.value) {
      transport.start()
      midiScheduler.value.start(0)
    }
  }

  // 设置播放音量（单位：dB）。
  // vol 参数为分贝值，直接应用到采样器的音量节点，实现全局音量控制。
  function setVolume(vol: number) {
    volume.value = vol
    if (sampler.value)
      sampler.value.volume.value = vol
  }

  // 释放本 Hook 创建的所有音频资源。
  // 包括：停止播放、释放发声单元、清空调度器，便于垃圾回收。
  function cleanup() {
    stop()
    disposeSampler()
    if (midiScheduler.value) {
      midiScheduler.value.dispose()
      midiScheduler.value = null
    }
    pendingNotes = []
  }

  return {
    // Readonly state
    isPlaying: readonly(isPlaying),
    isLoading: readonly(isLoading),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    currentTrack: readonly(currentTrack),

    // Actions
    loadTrack,
    togglePlayback,
    seekTo,
    setVolume,
    cleanup,
  }
}
