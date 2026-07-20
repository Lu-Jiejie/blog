---
title: Lu Jiejie
description: Portfolio of Lu Jiejie
---

<script setup>
import { useI18n } from '~/logic/i18n'

const messages = {
  en: {
    hello: 'Lu Jiejie',
    desc: "I'm enthusiastic about open-source development.",
  },
  zh: {
    hello: '鹿解解',
    desc: '热衷于开源开发，记录生活的点滴。',
  },
}
const t = useI18n(messages)
</script>

<div
  min-h="[calc(100vh-14rem)]"
  flex="~ col"
  justify-center items-center
  text-center
>
  <img
    src="/avatar.png"
    alt="avatar"
    w-32 h-32
    aspect-1
    object-cover
    rounded-full
    mb-6
    min-w-0
  >

  <h1 text-4xl font-bold font-serif mb-3>
    {{ t.hello }}
  </h1>

  <p op-60 max-w-lg mb-10 v-html="t.desc" />

  <div flex="~ row" gap-4 items-center>
    <SocialButton
      href="https://github.com/Lu-Jiejie"
      title="GitHub"
      icon="i-uil-github-alt"
      hover-color="#24292f"
      hover-color-dark="#ffffff"
    />
    <SocialButton
      href="https://space.bilibili.com/15253584"
      title="Bilibili"
      icon="i-streamline-ultimate-bilibili-logo-bold"
      hover-color="#00A1D6"
    />
    <SocialButton
      href="https://music.163.com/#/user/home?id=342864073"
      title="NetEase Cloud Music"
      icon="i-simple-icons-neteasecloudmusic"
      hover-color="#FC3D49"
    />
  </div>
</div>

<div py-2 />
<CardGithubHeatmap />
<div py-4 />
<CardGithubLanguageBar />
<div py-4 />
<CardSongsRecentPlayed />
<div py-4 />
<CardGamesRecentPlayed />
<div py-4 />
<CardAnimeRecentPlayed />
