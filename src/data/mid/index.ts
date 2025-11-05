export interface MidiTrack {
  name: string
  nameZh: string
  artist: string
  path: string
}

export const tracks: MidiTrack[] = [
  {
    name: '成歩堂龍太郎~異議あり!',
    nameZh: '成步堂龙太郎~异议!',
    artist: '北川保昌',
    path: new URL('./成歩堂龍太郎~異議あり!.mid', import.meta.url).href,
  },
  {
    name: '新世界に咲く花',
    nameZh: '新世界绽放的花',
    artist: '前馬宏充',
    path: new URL('./新世界に咲く花.mid', import.meta.url).href,
  },
  {
    name: 'Tearforged Blossoms',
    nameZh: '泪铸生花',
    artist: 'HOYO-MiX',
    path: new URL('./Tearforged Blossoms.mid', import.meta.url).href,
  },
  {
    name: 'Shining',
    nameZh: '闪亮',
    artist: 'HOYO-MiX',
    path: new URL('./Shining.mid', import.meta.url).href,
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
    name: 'Wonderland Reverie',
    nameZh: '乐园游梦记',
    artist: 'HOYO-MiX',
    path: new URL('./Wonderland Reverie.mid', import.meta.url).href,
  },
  {
    name: 'Almost',
    nameZh: '不及',
    artist: 'HOYO-MiX',
    path: new URL('./Almost.mid', import.meta.url).href,
  },
  {
    name: 'Ridu Holidays',
    nameZh: '丽都假日',
    artist: 'HOYO-MiX',
    path: new URL('./Ridu Holidays.mid', import.meta.url).href,
  },
  {
    name: 'Hide and Seek',
    nameZh: '捉迷藏',
    artist: 'HOYO-MiX',
    path: new URL('./Hide and Seek.mid', import.meta.url).href,
  },
]
