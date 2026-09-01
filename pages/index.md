---
title: Lu Jiejie
description: Portfolio of Lu Jiejie
---

<script setup>
import { useI18n } from '~/logic/i18n'

const messages = {
  en: {
    hello: 'Lu Jiejie',
  },
  zh: {
    hello: '鹿解解',
  },
}
const t = useI18n(messages)
</script>

<div
  class="home-hero"
  flex="~ col"
  justify-center items-center
  text-center
>
  <img
    src="/avatar.png"
    alt="avatar"
    w-28 h-28
    aspect-1
    object-cover
    rounded-full
    mb-6
    min-w-0
  >

  <h1 text-6xl font-bold font-serif mb-10>
    {{ t.hello }}
  </h1>

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

<div v-reveal>
  <div py-2 />
  <CardGithubHeatmap />
</div>
<div v-reveal>
  <div py-4 />
  <CardGithubLanguageBar />
</div>
<div v-reveal>
  <div py-4 />
  <CardSongsRecentPlayed />
</div>
<div v-reveal>
  <div py-4 />
  <CardGamesRecentPlayed />
</div>
<div v-reveal>
  <div py-4 />
  <CardAnimeRecentPlayed />
</div>

<style scoped>
/* 首屏头像区：占满视口剩余高度并在其中垂直居中。
   桌面端用 100vh；移动端用 100svh（地址栏显示时的高度，静态值）。
   svh 不随地址栏隐藏而变化，因此头像区位置在页面加载后保持定住，不会跳动。
   两行 min-height 是常规回退写法：旧浏览器不识别 svh 时回退到 vh。 */
.home-hero {
  min-height: calc(100vh - 14rem);
}

@media (max-width: 767px) {
  .home-hero {
    /* 移动端：header(~92px) + main 顶部 padding(40px) ≈ 132px，
       为使内容中心对齐视口中心，需 min-h = 100svh - 2×132px ≈ 100svh - 16.5rem */
    min-height: calc(100vh - 16.5rem);
    min-height: calc(100svh - 16.5rem);
  }
}
</style>
