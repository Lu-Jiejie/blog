import type { MidiTrack } from '~/data/mid'
import * as ToneMidi from '@tonejs/midi'

import * as Tone from 'tone'
import { readonly, ref, shallowRef } from 'vue'

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
        const synth = new Tone.Sampler({
          'A1': '/src/data/sample/A1.mp3',
          'A#1': '/src/data/sample/As1.mp3',
          'B1': '/src/data/sample/B1.mp3',
          'C1': '/src/data/sample/C1.mp3',
          'C#1': '/src/data/sample/Cs1.mp3',
          'D1': '/src/data/sample/D1.mp3',
          'D#1': '/src/data/sample/Ds1.mp3',
          'E1': '/src/data/sample/E1.mp3',
          'F1': '/src/data/sample/F1.mp3',
          'F#1': '/src/data/sample/Fs1.mp3',
          'G1': '/src/data/sample/G1.mp3',
          'G#1': '/src/data/sample/Gs1.mp3',
          'A2': '/src/data/sample/A2.mp3',
          'A#2': '/src/data/sample/As2.mp3',
          'B2': '/src/data/sample/B2.mp3',
          'C2': '/src/data/sample/C2.mp3',
          'C#2': '/src/data/sample/Cs2.mp3',
          'D2': '/src/data/sample/D2.mp3',
          'D#2': '/src/data/sample/Ds2.mp3',
          'E2': '/src/data/sample/E2.mp3',
          'F2': '/src/data/sample/F2.mp3',
          'F#2': '/src/data/sample/Fs2.mp3',
          'G2': '/src/data/sample/G2.mp3',
          'G#2': '/src/data/sample/Gs2.mp3',
          'A3': '/src/data/sample/A3.mp3',
          'A#3': '/src/data/sample/As3.mp3',
          'B3': '/src/data/sample/B3.mp3',
          'C3': '/src/data/sample/C3.mp3',
          'C#3': '/src/data/sample/Cs3.mp3',
          'D3': '/src/data/sample/D3.mp3',
          'D#3': '/src/data/sample/Ds3.mp3',
          'E3': '/src/data/sample/E3.mp3',
          'F3': '/src/data/sample/F3.mp3',
          'F#3': '/src/data/sample/Fs3.mp3',
          'G3': '/src/data/sample/G3.mp3',
          'G#3': '/src/data/sample/Gs3.mp3',
          'A4': '/src/data/sample/A4.mp3',
          'A#4': '/src/data/sample/As4.mp3',
          'B4': '/src/data/sample/B4.mp3',
          'C4': '/src/data/sample/C4.mp3',
          'C#4': '/src/data/sample/Cs4.mp3',
          'D4': '/src/data/sample/D4.mp3',
          'D#4': '/src/data/sample/Ds4.mp3',
          'E4': '/src/data/sample/E4.mp3',
          'F4': '/src/data/sample/F4.mp3',
          'F#4': '/src/data/sample/Fs4.mp3',
          'G4': '/src/data/sample/G4.mp3',
          'G#4': '/src/data/sample/Gs4.mp3',
          'A5': '/src/data/sample/A5.mp3',
          'A#5': '/src/data/sample/As5.mp3',
          'B5': '/src/data/sample/B5.mp3',
          'C5': '/src/data/sample/C5.mp3',
          'C#5': '/src/data/sample/Cs5.mp3',
          'D5': '/src/data/sample/D5.mp3',
          'D#5': '/src/data/sample/Ds5.mp3',
          'E5': '/src/data/sample/E5.mp3',
          'F5': '/src/data/sample/F5.mp3',
          'F#5': '/src/data/sample/Fs5.mp3',
          'G5': '/src/data/sample/G5.mp3',
          'G#5': '/src/data/sample/Gs5.mp3',
          'A6': '/src/data/sample/A6.mp3',
          'A#6': '/src/data/sample/As6.mp3',
          'B6': '/src/data/sample/B6.mp3',
          'C6': '/src/data/sample/C6.mp3',
          'C#6': '/src/data/sample/Cs6.mp3',
          'D6': '/src/data/sample/D6.mp3',
          'D#6': '/src/data/sample/Ds6.mp3',
          'E6': '/src/data/sample/E6.mp3',
          'F6': '/src/data/sample/F6.mp3',
          'F#6': '/src/data/sample/Fs6.mp3',
          'G6': '/src/data/sample/G6.mp3',
          'G#6': '/src/data/sample/Gs6.mp3',
          'A7': '/src/data/sample/A7.mp3',
          'A#7': '/src/data/sample/As7.mp3',
          'B7': '/src/data/sample/B7.mp3',
          'C7': '/src/data/sample/C7.mp3',
          'C#7': '/src/data/sample/Cs7.mp3',
          'D7': '/src/data/sample/D7.mp3',
          'D#7': '/src/data/sample/Ds7.mp3',
          'E7': '/src/data/sample/E7.mp3',
          'F7': '/src/data/sample/F7.mp3',
          'F#7': '/src/data/sample/Fs7.mp3',
          'G7': '/src/data/sample/G7.mp3',
          'G#7': '/src/data/sample/Gs7.mp3',
          'C8': '/src/data/sample/C8.mp3',
        }, {
          release: 1,
          volume: volume.value,
        }).toDestination()

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
