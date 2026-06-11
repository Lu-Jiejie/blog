import type { MidiTrack } from '~/data/mid'
import * as ToneMidi from '@tonejs/midi'

import * as Tone from 'tone'
import { readonly, ref, shallowRef } from 'vue'

// Use Vite's glob import to get all sample URLs.
// This is robust for both dev and prod environments.
const samples = import.meta.glob('../data/sample/*.mp3', { eager: true, query: '?url', import: 'default' })

// Create the note-to-URL mapping for Tone.Sampler
const urls: Record<string, string> = {}
for (const path in samples) {
  const fileName = path.split('/').pop()!
  // Convert file name (e.g., "As1.mp3") to note name (e.g., "A#1")
  const noteName = fileName.replace('.mp3', '').replace('s', '#')
  urls[noteName] = samples[path] as string
}

export function useMidiPlayer() {
  // Public state
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0) // dB
  const currentTrack = ref<MidiTrack | null>(null)

  // Internal MIDI resources
  const midiSamplers = shallowRef<Tone.Sampler[]>([])
  const midiScheduler = shallowRef<Tone.Part | null>(null)

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

      // 释放并清空之前创建的采样器和调度器，
      // 防止内存泄漏和音频节点堆积。
      midiSamplers.value.forEach(synth => synth.dispose())
      midiSamplers.value = []
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

      // 创建采样器用于播放，并收集所有待播放的音符事件。
      // - newSamplers: 每个 MIDI 音轨对应一个 Tone.Sampler 实例（钢琴采样器）
      // - scheduledNotes: 扁平化的音符事件列表，后续用于统一调度播放。
      const newSamplers: Tone.Sampler[] = []
      const scheduledNotes: Array<{ time: number, note: string, duration: number, velocity: number }> = []

      // 遍历每个 MIDI 音轨，为其创建一个本地钢琴采样器。
      // 采样器将音符名映射到本地 mp3 文件。
      // 当前实现所有音符都用第一个采样器播放（可扩展为多轨分流）。
      midi.tracks.forEach((midiTrack) => {
        // 创建一个钢琴采样器，映射 88 键所有音符到本地采样文件。
        const synth = new Tone.Sampler(
          urls,
          {
            release: 1,
            volume: volume.value,
          },
        ).toDestination()

        newSamplers.push(synth)

        // 收集该音轨所有音符事件，加入统一的 scheduledNotes 列表。
        // 每个事件包含：出现时间（秒）、音符名、持续时长（秒）、力度（0~1）。
        midiTrack.notes.forEach((note) => {
          scheduledNotes.push({
            time: note.time,
            note: note.name,
            duration: note.duration,
            velocity: note.velocity,
          })
        })
      })

      midiSamplers.value = newSamplers

      // 等待所有采样器加载完成
      await Tone.loaded()

      // 创建 Tone.Part 调度器，统一调度所有音符事件。
      // 回调会在指定时间触发采样器播放音符。
      // 当前所有音符都用第一个采样器播放（如需多乐器可扩展）。
      midiScheduler.value = new Tone.Part((time, note) => {
        if (midiSamplers.value.length > 0) {
          midiSamplers.value[0].triggerAttackRelease(
            note.note,
            note.duration,
            time,
            note.velocity,
          )
        }
      }, scheduledNotes)

      // 启用循环播放，并设置循环终点为 MIDI 总时长。
      midiScheduler.value.loop = true
      midiScheduler.value.loopEnd = midi.duration

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

  // 设置所有采样器的播放音量（单位：dB）。
  // vol 参数为分贝值，直接应用到每个采样器的音量节点，实现全局音量控制。
  function setVolume(vol: number) {
    volume.value = vol
    midiSamplers.value.forEach((synth) => {
      synth.volume.value = vol
    })
  }

  // 释放本 Hook 创建的所有音频资源。
  // 包括：停止播放、释放采样器节点、清空调度器，便于垃圾回收。
  function cleanup() {
    stop()
    midiSamplers.value.forEach(synth => synth.dispose())
    midiSamplers.value = []
    if (midiScheduler.value) {
      midiScheduler.value.dispose()
      midiScheduler.value = null
    }
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
