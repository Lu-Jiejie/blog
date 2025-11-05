---
title: Lu Jiejie
display: Lu Jiejie
description: Portfolio of Lu Jiejie
---

<script setup>
import { useI18n } from '~/logic/i18n'

const messages = {
  en: {
    hello: "Hello, I’m Lu Jiejie (陆解解/鹿姐姐).",
    desc: "I’m enthusiastic about open-source development, you can find a selection of my projects <a href=\"/projects\">here</a>, or explore all of them on my <a target=\"_blank\" href=\"https://github.com/Lu-Jiejie\">GitHub</a>.",
    why: "I wanted a space to capture the moments of my life and leave traces of my existence, which is why I created this blog."
  },
  zh: {
    hello: "你好，我是陆解解（Lu Jiejie/鹿姐姐）。",
    desc: "我热衷于开源开发，你可以在 <a href=\"/projects\">这里</a> 看到我的部分项目，或在 <a target=\"_blank\" href=\"https://github.com/Lu-Jiejie\">GitHub</a> 上浏览全部。",
    why: "我想要一个空间来记录生活的点滴，留下存在的痕迹，这正是我创建这个博客的原因。"
  }
}
const t = useI18n(messages)
</script>

<p v-html="t.hello"></p>
<p v-html="t.desc"></p>
<p v-html="t.why"></p>

<div py-2 />
<GithubHeatmapCard />
<div py-2 />
<GithubLanguageBarCard />
<div py-2 />
<SongsRecentPlayedCard :limit="4" />
<div py-2 />
<GamesRecentPlayedCard :limit="4"/>
<div py-2 />
<AnimeRecentPlayedCard :limit="4"/>
<div py-2 />
<BilibiliMusicCard />
