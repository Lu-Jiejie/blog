export type MediaType = 'anime' | 'movie' | 'book' | 'game'
export interface MediaItem {
  name: string
  nameZH?: string
  creator?: string | string[]
  note?: string
  lang?: string
  wikiKeywordEN?: string
  wikiKeywordZH?: string
  wikiUrlFallback?: string
}
export type Media = Record<MediaType, MediaItem[]>

export const media: Media = {
  // jp by default
  anime: [
    { name: '四月は君の嘘', nameZH: '四月是你的谎言', creator: '新川直司' },
    { name: '葬送のフリーレン', nameZH: '葬送的芙莉莲', creator: ['山田鐘人', 'アベツカサ'] },
    { name: 'ラブライブ!', nameZH: 'Love Live!', creator: '矢立肇' },
    { name: 'ダンダダン', nameZH: '胆大党', creator: '龍幸伸', wikiKeywordEN: 'Dandadan' },
    { name: '無職転生 ～異世界行ったら本気だす～', nameZH: '无职转生~到了异世界就拿出真本事~', creator: '理不尽な孫の手', wikiKeywordEN: 'Mushoku Tensei' },
    { name: '氷菓', nameZH: '冰菓', creator: '米澤穂信', wikiKeywordEN: 'Hyouka (TV series)' },
    { name: 'からかい上手の高木さん', nameZH: '擅长捉弄人的高木同学', creator: '山本崇一朗', wikiKeywordEN: 'Teasing Master Takagi-san' },
    { name: '負けヒロインが多すぎる！', nameZH: '败犬女主太多了！', creator: '雨森たきび', wikiKeywordEN: 'Too Many Losing Heroines!' },
    { name: 'K-On!', nameZH: '轻音少女', creator: 'Kakifly' },
    { name: 'SPY x FAMILY', nameZH: '间谍过家家', creator: '遠藤達哉' },
    { name: 'とある科学の超電磁砲', nameZH: '某科学的超电磁炮', creator: '鎌池和馬', wikiKeywordEN: 'A Certain Scientific Railgun' },
    { name: '青春ブタ野郎シリーズ', nameZH: '青春猪头少年系列', creator: '鴨志田一', wikiKeywordEN: 'Rascal Does Not Dream' },
    { name: 'あの日見た花の名前を僕達はまだ知らない。', nameZH: '未闻花名', creator: '岡田麿里', wikiKeywordEN: 'Anohana' },
    { name: 'ソードアート・オンライン', nameZH: '刀剑神域', creator: '川原礫', wikiKeywordEN: 'Sword Art Online season 1' },
    { name: 'Re:ゼロから始める異世界生活', nameZH: 'Re:从零开始的异世界生活', creator: '長月達平', wikiKeywordEN: 'Re:Zero' },
    { name: '東京喰種', nameZH: '东京食尸鬼', creator: '石田スイ', wikiKeywordEN: 'Tokyo Ghoul' },
    { name: '时光代理人', nameZH: '时光代理人', creator: '李豪凌', lang: 'zh', wikiKeywordEN: 'Link Click' },
    { name: 'チェンソーマン', nameZH: '电锯人', creator: '藤本タツキ' },
    { name: '鬼滅の刃', nameZH: '鬼灭之刃', creator: '吾峠呼世晴', wikiKeywordEN: 'Demon Slayer: Kimetsu no Yaiba (TV series)' },
    { name: '進撃の巨人', nameZH: '进击的巨人', creator: '諫山創', wikiKeywordEN: 'Attack on Titan (TV series)' },
    { name: '月がきれい', nameZH: '月色真美', creator: '岸誠二', wikiKeywordEN: 'Tsuki ga Kirei' },
    { name: '夏目友人帳', nameZH: '夏目友人帐', creator: '緑川ゆき', wikiKeywordEN: 'Natsume\'s Book of Friends' },
    { name: '魔法少女まどか☆マギカ', nameZH: '魔法少女小圆', creator: 'Magica Quartet' },
    { name: 'たまこまーけっと', nameZH: '玉子市场', creator: '山田尚子', wikiKeywordEN: 'Tamako Market' },
    { name: 'Arcane', nameZH: '双城之战', creator: 'Riot Games', wikiKeywordEN: 'Arcane (TV series)' },
    { name: 'ぼっち・ざ・ろっく!', nameZH: '孤独摇滚！', creator: 'はまじあき', wikiKeywordEN: 'Bocchi the Rock!' },
    { name: '少女終末旅行', nameZH: '少女终末旅行', creator: 'つくみず' },
    { name: 'とらドラ!', nameZH: '龙与虎', creator: '竹宮ゆゆこ', wikiKeywordEN: 'Toradora!' },
    { name: '伍六七', nameZH: '伍六七', creator: '何小疯', lang: 'zh', wikiKeywordEN: 'Scissor Seven' },
  ],
  movie: [
    { name: '君の名は。', nameZH: '你的名字。', creator: '新海誠' },
    { name: '天気の子', nameZH: '天气之子', creator: '新海誠', wikiKeywordEN: 'Weathering with You' },
    { name: '秒速5センチメートル', nameZH: '秒速五厘米', creator: '新海誠', wikiKeywordEN: '5 Centimeters per Second' },
    { name: 'Flipped', nameZH: '怦然心动', creator: 'Rob Reiner', wikiKeywordEN: 'Flipped (2010 film)' },
    { name: 'The Shawshank Redemption', nameZH: '肖申克的救赎', creator: 'Frank Darabont' },
    { name: '千と千尋の神隠し', nameZH: '千与千寻', creator: '宮崎駿' },
    { name: 'The Truman Show', nameZH: '楚门的世界', creator: 'Peter Weir' },
    { name: 'Hachi: A Dog\'s Tale', nameZH: '忠犬八公', creator: 'Lasse Hallström' },
    { name: '我不是药神', nameZH: '我不是药神', creator: '文牧野', lang: 'zh', wikiKeywordEN: 'Dying to Survive' },
    { name: 'Life of Pi', nameZH: '少年派的奇幻漂流', creator: 'Ang Lee' },
    { name: 'Green Book', nameZH: '绿皮书', creator: 'Peter Farrelly' },
    { name: 'Avengers: Endgame', nameZH: '复仇者联盟：终局之战', creator: 'Marvel Studios' },
    { name: '全民目击', nameZH: '全民目击', creator: '非行', lang: 'zh', wikiKeywordEN: 'Silent Witness (2013 film)' },
    { name: 'Lover Letter', nameZH: '情书', creator: '岩井俊二', wikiKeywordEN: 'Love Letter (1995 film)' },
    { name: '流浪地球', nameZH: '流浪地球', creator: '郭帆', lang: 'zh', wikiKeywordEN: 'The Wandering Earth' },
    { name: '功夫', nameZH: '功夫', creator: '周星驰', lang: 'zh', wikiKeywordEN: 'Kung Fu Hustle' },
    { name: '喜剧之王', nameZH: '喜剧之王', creator: '周星驰', lang: 'zh', wikiKeywordEN: 'King of Comedy (film)' },
    { name: '扬名立万', nameZH: '扬名立万', creator: '刘循子墨', lang: 'zh', wikiKeywordEN: 'Be Somebody (2021 film)' },
    { name: '기생충', nameZH: '寄生虫', creator: '봉준호' },
    { name: '7번방의 선물', nameZH: '7号房的礼物', creator: '이환경', wikiKeywordEN: 'Miracle in Cell No. 7' },
    { name: '부산행', nameZH: '釜山行', creator: '연상호' },
    { name: 'Despicable Me', nameZH: '卑鄙的我', creator: ['Pierre Coffin', 'Chris Renaud'] },
  ],
  book: [
    { name: '活着', nameZH: '活着', creator: '余华', lang: 'zh', wikiKeywordEN: 'To Live (novel)' },
    { name: '容疑者Xの献身', nameZH: '嫌疑人X的献身', creator: '东野圭吾', wikiKeywordEN: 'The Devotion of Suspect X' },
    { name: '白夜行', nameZH: '白夜行', creator: '东野圭吾', wikiKeywordEN: 'Journey Under the Midnight Sun' },
    { name: '悪意', nameZH: '恶意', creator: '东野圭吾', wikiUrlFallback: 'https://ja.wikipedia.org/wiki/悪意 (小説)' },
  ],
  game: [
    { name: 'Ys Origin', nameZH: '伊苏：起源', creator: 'Falcom' },
    { name: 'Pokémon X & Y', nameZH: '口袋妖怪 X/Y', creator: 'Game Freak' },
    { name: 'Pokémon Emerald', nameZH: '口袋妖怪 绿宝石', creator: 'Game Freak' },
    { name: 'Black Myth: Wukong', nameZH: '黑神话：悟空', creator: 'Game Science' },
    { name: 'Hollow Knight: Silksong', nameZH: '空洞骑士：丝之歌', creator: 'Team Cherry' },
    { name: 'Hollow Knight', nameZH: '空洞骑士', creator: 'Team Cherry' },
    { name: 'The Legend of Zelda: Breath of the Wild', nameZH: '塞尔达传说：旷野之息', creator: 'Nintendo' },
    { name: 'Cyberpunk 2077', nameZH: '赛博朋克2077', creator: 'CD Projekt Red' },
    { name: 'Stardew Valley', nameZH: '星露谷物语', creator: 'ConcernedApe' },
    { name: 'Elden Ring', nameZH: '艾尔登法环', creator: 'FromSoftware' },
    { name: 'Ori and the Will of the Wisps', nameZH: '奥日与鬼火意志', creator: 'Moon Studios' },
    { name: 'Danganronpa', nameZH: '弹丸论破', creator: 'Spike Chunsoft' },
    { name: 'Terraria', nameZH: '泰拉瑞亚', creator: 'Re-Logic' },
    { name: 'Phoenix Wright: Ace Attorney', nameZH: '逆转裁判', creator: 'Capcom' },
  ],
}
