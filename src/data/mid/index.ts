export interface MidiTrack {
  name: string
  nameZh: string
  artist: string
  path: string
}

export const tracks: MidiTrack[] = [
  {
    name: 'Tearforged Blossoms',
    nameZh: '泪铸生花',
    artist: 'HOYO-MiX',
    path: new URL('./Tearforged Blossoms.mid', import.meta.url).href,
  },
  {
    name: 'Had I Not Seen the Sun',
    nameZh: '若我不曾见过太阳',
    artist: 'HOYO-MiX',
    path: new URL('./Had I Not Seen the Sun.mid', import.meta.url).href,
  },
  {
    name: 'If I Can Stop One Heart From Breaking',
    nameZh: '使一颗心免于哀伤',
    artist: 'HOYO-MiX',
    path: new URL('./If I Can Stop One Heart From Breaking.mid', import.meta.url).href,
  },
  {
    name: 'Shining',
    nameZh: '闪亮',
    artist: 'HOYO-MiX',
    path: new URL('./Shining.mid', import.meta.url).href,
  },
  {
    name: 'Wonderland Reverie',
    nameZh: '乐园游梦记',
    artist: 'HOYO-MiX',
    path: new URL('./Wonderland Reverie.mid', import.meta.url).href,
  },
  {
    name: 'Original Me',
    nameZh: '原色',
    artist: 'HOYO-MiX',
    path: new URL('./Original Me.mid', import.meta.url).href,
  },
  {
    name: 'Ridu Holidays',
    nameZh: '丽都假日',
    artist: 'HOYO-MiX',
    path: new URL('./Ridu Holidays.mid', import.meta.url).href,
  },
  {
    name: 'Almost',
    nameZh: '不及',
    artist: 'HOYO-MiX',
    path: new URL('./Almost.mid', import.meta.url).href,
  },
  {
    name: 'Hide and Seek',
    nameZh: '捉迷藏',
    artist: 'HOYO-MiX',
    path: new URL('./Hide and Seek.mid', import.meta.url).href,
  },
  {
    name: 'Redreaming Angel',
    nameZh: '复梦天使',
    artist: 'HOYO-MiX',
    path: new URL('./Redreaming Angel.mid', import.meta.url).href,
  },
  {
    name: 'Turn Heartbeats Into Tempo',
    nameZh: '把心跳变成节奏',
    artist: 'HOYO-MiX',
    path: new URL('./Turn Heartbeats Into Tempo.mid', import.meta.url).href,
  },
  {
    name: 'Angel Loading...^_−☆',
    nameZh: '天使加载中...^_−☆',
    artist: 'HOYO-MiX',
    path: new URL('./Angel Loading...^_−☆.mid', import.meta.url).href,
  },
  {
    name: 'Fantastical-Colored Heartbeat',
    nameZh: '妄想色心跳',
    artist: 'HOYO-MiX',
    path: new URL('./Fantastical-Colored Heartbeat.mid', import.meta.url).href,
  },
  {
    name: 'A Thousand First Meetings',
    nameZh: '千万次初见',
    artist: 'HOYO-MiX',
    path: new URL('./A Thousand First Meetings.mid', import.meta.url).href,
  },
  {
    name: 'Prophecy',
    nameZh: '预言',
    artist: 'HOYO-MiX',
    path: new URL('./Prophecy.mid', import.meta.url).href,
  },
]
