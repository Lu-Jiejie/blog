---
title: Lu Jiejie
description: Portfolio of Lu Jiejie
---

<script setup>
import { useIntersectionObserver } from '@vueuse/core'
import { onMounted, ref } from 'vue'
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

// 动态卡片区：进入视口前隐藏，滚动进入后以滑动动画显示
const cardsSection = ref(null)
const cardsRevealed = ref(false)

onMounted(() => {
  const { stop } = useIntersectionObserver(
    cardsSection,
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        cardsRevealed.value = true
        stop()
      }
    },
    { threshold: 0.1 },
  )
})
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

  <h1 text-5xl font-bold font-serif mb-10>
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

<div
  ref="cardsSection"
  class="cards-section"
  :class="{ 'is-revealed': cardsRevealed }"
>
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
</div>

<style scoped>
.cards-section {
  opacity: 0;
  transform: translateY(32px);
  transition:
    opacity 0.9s cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: opacity, transform;
}

.cards-section.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .cards-section {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
