import type { MidiTrack } from '~/types'

// name 直接写中文曲名；path 里的英文文件名保留原曲的官方英文标题，便于回溯
export const tracks: MidiTrack[] = [
  {
    name: '泪铸生花',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Tearforged Blossoms.mid', import.meta.url).href,
  },
  {
    name: '若我不曾见过太阳',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Had I Not Seen the Sun.mid', import.meta.url).href,
  },
  {
    name: '使一颗心免于哀伤',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/If I Can Stop One Heart From Breaking.mid', import.meta.url).href,
  },
  {
    name: '闪亮',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Shining.mid', import.meta.url).href,
  },
  {
    name: '乐园游梦记',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Wonderland Reverie.mid', import.meta.url).href,
  },
  {
    name: '原色',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Original Me.mid', import.meta.url).href,
  },
  {
    name: '丽都假日',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Ridu Holidays.mid', import.meta.url).href,
  },
  {
    name: '不及',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Almost.mid', import.meta.url).href,
  },
  {
    name: '复梦天使',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Redreaming Angel.mid', import.meta.url).href,
  },
  {
    name: '把心跳变成节奏',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Turn Heartbeats Into Tempo.mid', import.meta.url).href,
  },
  {
    name: '天使加载中...^_−☆',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Angel Loading...^_−☆.mid', import.meta.url).href,
  },
  {
    name: '妄想色心跳',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Fantastical-Colored Heartbeat.mid', import.meta.url).href,
  },
  {
    name: '千万次初见',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/A Thousand First Meetings.mid', import.meta.url).href,
  },
  {
    name: '预言',
    artist: 'HOYO-MiX',
    path: new URL('../assets/midi/Prophecy.mid', import.meta.url).href,
  },
]
