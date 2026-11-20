<script setup lang="ts">
import { computed } from 'vue'
import { formatHours, playedGames, useSteamGames } from '~/composables/useSteamGames'
import { formatDate, imgProxy } from '~/logic'
import { isZh } from '~/logic/i18n'

const { limit = 6 } = defineProps<{
  limit?: number
}>()

const { games, prepared } = useSteamGames()

const all = computed(() => playedGames(games.value))
const visible = computed(() => all.value.slice(0, limit))

const name = (game: (typeof all.value)[number]) => (isZh.value ? game.nameCN : game.name)
const href = (game: (typeof all.value)[number]) => (isZh.value ? game.linkZh || game.link : game.link)
</script>

<template>
  <CardTemplate
    title="Games I've Played Recently"
    title-zh="我最近玩的游戏"
    icon="i-simple-icons-steam color-hex-04699D"
    :prepared="prepared"
    :more-to="all.length > limit ? '/playlog' : undefined"
  >
    <div flex="~ col gap-1.5">
      <!-- important-op-100 压掉 UiLink 自带的 op-60，透明度交给子元素自己控制 -->
      <UiLink
        v-for="item in visible" :key="item.id" :title="name(item)" :href="href(item)" external
        class="entry flex items-center gap-4 rounded-md p-2 important-op-100 transition-colors duration-300 hover:bg-[#8882]"
      >
        <img
          :src="imgProxy(item.icon)" alt="cover"
          class="h-16 w-auto flex-shrink-0 rounded object-cover"
        >
        <div class="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <span class="entry-name font-serif text-[15px] leading-snug text-truncate">{{ name(item) }}</span>
          <span class="text-sm leading-snug text-truncate">
            <span class="tabular-nums op-60">{{ formatHours(item.playtimeForever) }} hrs</span>
            <span class="op-35"> · {{ formatDate(item.timeLastPlayed * 1000, false) }}</span>
          </span>
        </div>
      </UiLink>
    </div>
  </CardTemplate>
</template>

<style scoped>
.entry-name {
  --uno: op-85 transition-opacity duration-300;
}

.entry:hover .entry-name {
  --uno: op-100;
}
</style>
