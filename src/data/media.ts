export type MediaType = 'anime' | 'movie' | 'book' | 'game'
export interface MediaItem {
  name: string
  nameZh?: string
  creator?: string | string[]
  note?: string
  lang?: string
  wikiKeywordEn?: string
  wikiKeywordZh?: string
  wikiUrlFallback?: string
}
export type Media = Record<MediaType, MediaItem[]>

export const media: Media = {
  // jp by default
  anime: [
    { name: '四月は君の嘘', nameZh: '四月是你的谎言', creator: '新川直司' },
    { name: '葬送のフリーレン', nameZh: '葬送的芙莉莲', creator: ['山田鐘人', 'アベツカサ'] },
    { name: 'ラブライブ!', nameZh: 'Love Live!', creator: '矢立肇' },
    { name: 'ダンダダン', nameZh: '胆大党', creator: '龍幸伸', wikiKeywordEn: 'Dandadan' },
    { name: '無職転生 ～異世界行ったら本気だす～', nameZh: '无职转生～到了异世界就拿出真本事～', creator: '理不尽な孫の手', wikiKeywordEn: 'Mushoku Tensei' },
    { name: '氷菓', nameZh: '冰菓', creator: '米澤穂信', wikiKeywordEn: 'Hyouka (TV series)' },
    { name: 'からかい上手の高木さん', nameZh: '擅长捉弄人的高木同学', creator: '山本崇一朗', wikiKeywordEn: 'Teasing Master Takagi-san' },
    { name: '負けヒロインが多すぎる！', nameZh: '败犬女主太多了！', creator: '雨森たきび', wikiKeywordEn: 'Too Many Losing Heroines!' },
    { name: 'K-On!', nameZh: '轻音少女', creator: 'Kakifly' },
    { name: 'SPY x FAMILY', nameZh: '间谍过家家', creator: '遠藤達哉' },
    { name: 'とある科学の超電磁砲', nameZh: '某科学的超电磁炮', creator: '鎌池和馬', wikiKeywordEn: 'A Certain Scientific Railgun' },
    { name: '青春ブタ野郎シリーズ', nameZh: '青春猪头少年系列', creator: '鴨志田一', wikiKeywordEn: 'Rascal Does Not Dream' },
    { name: 'あの日見た花の名前を僕達はまだ知らない。', nameZh: '未闻花名', creator: '岡田麿里', wikiKeywordEn: 'Anohana' },
    { name: 'ソードアート・オンライン', nameZh: '刀剑神域', creator: '川原礫', wikiKeywordEn: 'Sword Art Online season 1' },
    { name: 'Re:ゼロから始める異世界生活', nameZh: 'Re:从零开始的异世界生活', creator: '長月達平', wikiKeywordEn: 'Re:Zero' },
    { name: '東京喰種', nameZh: '东京食尸鬼', creator: '石田スイ', wikiKeywordEn: 'Tokyo Ghoul' },
    { name: '时光代理人', nameZh: '时光代理人', creator: '李豪凌', lang: 'zh', wikiKeywordEn: 'Link Click' },
    { name: 'チェンソーマン', nameZh: '电锯人', creator: '藤本タツキ' },
    { name: '鬼滅の刃', nameZh: '鬼灭之刃', creator: '吾峠呼世晴', wikiKeywordEn: 'Demon Slayer: Kimetsu no Yaiba (TV series)' },
    { name: '進撃の巨人', nameZh: '进击的巨人', creator: '諫山創', wikiKeywordEn: 'Attack on Titan (TV series)' },
    { name: '月がきれい', nameZh: '月色真美', creator: '岸誠二', wikiKeywordEn: 'Tsuki ga Kirei' },
    { name: '夏目友人帳', nameZh: '夏目友人帐', creator: '緑川ゆき', wikiKeywordEn: 'Natsume\'s Book of Friends' },
    { name: '魔法少女まどか☆マギカ', nameZh: '魔法少女小圆', creator: 'Magica Quartet' },
    { name: 'たまこまーけっと', nameZh: '玉子市场', creator: '山田尚子', wikiKeywordEn: 'Tamako Market' },
    { name: 'Arcane', nameZh: '双城之战', creator: 'Riot Games', wikiKeywordEn: 'Arcane (TV series)' },
    { name: 'ぼっち・ざ・ろっく!', nameZh: '孤独摇滚！', creator: 'はまじあき', wikiKeywordEn: 'Bocchi the Rock!' },
    { name: '少女終末旅行', nameZh: '少女终末旅行', creator: 'つくみず' },
    { name: 'とらドラ!', nameZh: '龙与虎', creator: '竹宮ゆゆこ', wikiKeywordEn: 'Toradora!' },
    { name: '伍六七', nameZh: '伍六七', creator: '何小疯', lang: 'zh', wikiKeywordEn: 'Scissor Seven' },
  ],
  movie: [
    { name: '君の名は。', nameZh: '你的名字。', creator: '新海誠' },
    { name: '天気の子', nameZh: '天气之子', creator: '新海誠', wikiKeywordEn: 'Weathering with You' },
    { name: '秒速5センチメートル', nameZh: '秒速五厘米', creator: '新海誠', wikiKeywordEn: '5 Centimeters per Second' },
    { name: 'Flipped', nameZh: '怦然心动', creator: 'Rob Reiner', wikiKeywordEn: 'Flipped (2010 film)' },
    { name: 'The Shawshank Redemption', nameZh: '肖申克的救赎', creator: 'Frank Darabont' },
    { name: '千と千尋の神隠し', nameZh: '千与千寻', creator: '宮崎駿' },
    { name: 'The Truman Show', nameZh: '楚门的世界', creator: 'Peter Weir' },
    { name: 'Hachi: A Dog\'s Tale', nameZh: '忠犬八公的故事', creator: 'Lasse Hallström' },
    { name: '我不是药神', nameZh: '我不是药神', creator: '文牧野', lang: 'zh', wikiKeywordEn: 'Dying to Survive' },
    { name: 'Life of Pi', nameZh: '少年派的奇幻漂流', creator: 'Ang Lee' },
    { name: 'Green Book', nameZh: '绿皮书', creator: 'Peter Farrelly' },
    { name: 'Avengers: Endgame', nameZh: '复仇者联盟：终局之战', creator: 'Marvel Studios' },
    { name: '全民目击', nameZh: '全民目击', creator: '非行', lang: 'zh', wikiKeywordEn: 'Silent Witness (2013 film)' },
    { name: 'Lover Letter', nameZh: '情书', creator: '岩井俊二', wikiKeywordEn: 'Love Letter (1995 film)', wikiKeywordZh: '情书 (1995年电影)' },
    { name: '流浪地球', nameZh: '流浪地球', creator: '郭帆', lang: 'zh', wikiKeywordEn: 'The Wandering Earth' },
    { name: '功夫', nameZh: '功夫', creator: '周星驰', lang: 'zh', wikiKeywordEn: 'Kung Fu Hustle' },
    { name: '喜剧之王', nameZh: '喜剧之王', creator: '周星驰', lang: 'zh', wikiKeywordEn: 'King of Comedy (film)' },
    { name: '扬名立万', nameZh: '扬名立万', creator: '刘循子墨', lang: 'zh', wikiKeywordEn: 'Be Somebody (2021 film)' },
    { name: '기생충', nameZh: '寄生虫', creator: '봉준호' },
    { name: '7번방의 선물', nameZh: '7号房的礼物', creator: '이환경', wikiKeywordEn: 'Miracle in Cell No. 7' },
    { name: '부산행', nameZh: '釜山行', creator: '연상호' },
    { name: 'Despicable Me', nameZh: '卑鄙的我', creator: ['Pierre Coffin', 'Chris Renaud'] },
  ],
  book: [
    { name: '活着', nameZh: '活着', creator: '余华', lang: 'zh', wikiKeywordEn: 'To Live (novel)' },
    { name: '容疑者Xの献身', nameZh: '嫌疑人X的献身', creator: '东野圭吾', wikiKeywordEn: 'The Devotion of Suspect X' },
    { name: '白夜行', nameZh: '白夜行', creator: '东野圭吾', wikiKeywordEn: 'Journey Under the Midnight Sun' },
    { name: '悪意', nameZh: '恶意', creator: '东野圭吾', wikiUrlFallback: 'https://ja.wikipedia.org/wiki/悪意 (小説)' },
  ],
  game: [
    { name: 'Ys Origin', nameZh: '伊苏：起源', creator: 'Falcom' },
    { name: 'Pokémon X & Y', nameZh: '宝可梦 X／Y', creator: 'Game Freak' },
    { name: 'Pokémon Emerald', nameZh: '宝可梦 绿宝石', creator: 'Game Freak' },
    { name: 'Black Myth: Wukong', nameZh: '黑神话：悟空', creator: 'Game Science' },
    { name: 'Hollow Knight: Silksong', nameZh: '空洞骑士：丝之歌', creator: 'Team Cherry' },
    { name: 'Hollow Knight', nameZh: '空洞骑士', creator: 'Team Cherry' },
    { name: 'The Legend of Zelda: Breath of the Wild', nameZh: '塞尔达传说：旷野之息', creator: 'Nintendo' },
    { name: 'Cyberpunk 2077', nameZh: '赛博朋克2077', creator: 'CD Projekt Red' },
    { name: 'Stardew Valley', nameZh: '星露谷物语', creator: 'ConcernedApe' },
    { name: 'Elden Ring', nameZh: '艾尔登法环', creator: 'FromSoftware' },
    { name: 'Ori and the Will of the Wisps', nameZh: '奥日与精灵意志', creator: 'Moon Studios' },
    { name: 'Danganronpa', nameZh: '弹丸论破', creator: 'Spike Chunsoft' },
    { name: 'Terraria', nameZh: '泰拉瑞亚', creator: 'Re-Logic' },
    { name: 'Phoenix Wright: Ace Attorney', nameZh: '逆转裁判', creator: 'Capcom' },
  ],
}
