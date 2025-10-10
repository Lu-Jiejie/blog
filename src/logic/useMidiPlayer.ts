import { Midi } from '@tonejs/midi'
import * as Tone from 'tone'
import { ref, shallowRef } from 'vue'

export interface MidiTrack {
  name: string
  path: string
}

export function useMidiPlayer() {
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(-10) // dB
  const currentTrack = ref<MidiTrack | null>(null)

  const synths = shallowRef<Tone.Sampler[]>([])
  const part = shallowRef<Tone.Part | null>(null)

  let animationFrameId: number | null = null

  // 更新当前播放时间
  function updateCurrentTime() {
    const transport = Tone.getTransport()
    if (isPlaying.value && transport.state === 'started') {
      const seconds = transport.seconds
      // 如果超过了歌曲长度，重置到开头（处理循环播放）
      if (duration.value > 0 && seconds >= duration.value) {
        currentTime.value = seconds % duration.value
      }
      else {
        currentTime.value = seconds
      }
      animationFrameId = requestAnimationFrame(updateCurrentTime)
    }
  }

  // 加载 MIDI 文件
  async function loadMidi(track: MidiTrack) {
    try {
      isLoading.value = true

      // 停止当前播放
      await stop()

      // 清理之前的 synths 和 part
      synths.value.forEach(synth => synth.dispose())
      synths.value = []
      if (part.value) {
        part.value.dispose()
        part.value = null
      }

      // 获取 MIDI 文件
      const response = await fetch(track.path)
      const arrayBuffer = await response.arrayBuffer()
      const midi = new Midi(arrayBuffer)

      duration.value = midi.duration

      // 为每个音轨创建采样器
      const newSynths: Tone.Sampler[] = []
      const notes: Array<{ time: number, note: string, duration: number, velocity: number }> = []

      midi.tracks.forEach((track) => {
        // 使用本地钢琴采样器（完整88键钢琴，所有音符都使用真实采样）
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

        newSynths.push(synth)

        // 收集所有音符
        track.notes.forEach((note) => {
          notes.push({
            time: note.time,
            note: note.name,
            duration: note.duration,
            velocity: note.velocity,
          })
        })
      })

      synths.value = newSynths

      // 创建一个 Part 来播放所有音符
      part.value = new Tone.Part((time, note) => {
        // 使用第一个采样器播放所有音符
        if (synths.value.length > 0) {
          synths.value[0].triggerAttackRelease(
            note.note,
            note.duration,
            time,
            note.velocity,
          )
        }
      }, notes)

      part.value.loop = true
      part.value.loopEnd = midi.duration

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

  // 播放
  async function play() {
    if (!part.value)
      return

    await Tone.start() // 确保 AudioContext 已启动
    Tone.getTransport().start()
    part.value.start(0)
    isPlaying.value = true

    // 开始更新播放时间
    updateCurrentTime()
  }

  // 暂停
  function pause() {
    Tone.getTransport().pause()
    isPlaying.value = false

    // 停止更新播放时间
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 停止
  async function stop() {
    const transport = Tone.getTransport()
    transport.stop()
    transport.cancel() // 取消所有计划的事件
    isPlaying.value = false
    currentTime.value = 0

    // 停止更新播放时间
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 切换播放/暂停
  async function togglePlay() {
    if (isPlaying.value) {
      pause()
    }
    else {
      await play()
    }
  }

  // 跳转到指定时间
  function seek(time: number) {
    const wasPlaying = isPlaying.value
    const transport = Tone.getTransport()

    // 停止当前播放
    transport.stop()

    // 设置新的播放位置
    transport.seconds = time
    currentTime.value = time

    // 如果之前在播放，继续播放
    if (wasPlaying && part.value) {
      transport.start()
      part.value.start(0)
    }
  }

  // 设置音量
  function setVolume(vol: number) {
    volume.value = vol
    synths.value.forEach((synth) => {
      synth.volume.value = vol
    })
  }

  // 清理资源
  function dispose() {
    stop()
    synths.value.forEach(synth => synth.dispose())
    synths.value = []
    if (part.value) {
      part.value.dispose()
      part.value = null
    }
  }

  return {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    currentTrack,
    loadMidi,
    play,
    pause,
    stop,
    togglePlay,
    seek,
    setVolume,
    dispose,
  }
}
