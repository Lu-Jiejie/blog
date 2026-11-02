<script setup lang="ts">
import type { Projects } from '~/data/projects'
import { isDark } from '~/logic'

const { projects } = defineProps<{
  projects: Projects
}>()

function getHoverClass(hoverClasses?: string) {
  if (!hoverClasses)
    return ''
  // 将 "color-red op-100" 转换为 "group-hover:color-red group-hover:op-100"
  return hoverClasses.split(' ').map(cls => `group-hover:${cls}!`).join(' ')
}
</script>

<template>
  <div max-w-300 mx-auto select-none class="prose">
    <div
      v-for="key, cidx in Object.keys(projects)" :key="key"
      slide-enter :style="{ '--enter-stage': cidx + 1 }"
    >
      <!-- category header -->
      <div
        relative min-h-18 mt-5 slide-enter
        :style="{
          '--enter-stage': cidx - 2,
          '--enter-step': '60ms',
        }"
      >
        <span
          relative left--1rem
          text-5em text-stroke-2 text-stroke-hex-aaa font-bold
          color-transparent op-30 dark:op-20
          block leading-1em
        >
          {{ key }}
        </span>
      </div>

      <!-- project item -->
      <div
        w-max max-w-500 py-2 mx-auto
        grid="~ cols-1 gap-4 md:cols-2 lg:cols-3"
      >
        <UiLink
          v-for="p, pidx in projects[key]" :key="pidx" :href="p.link"
          external class="group"
          relative flex items-center bg-transparent
          text-1.1rem w-87.5 lg:w-75 xl:w-87.5 max-w-full p="y-2 x-3.5"
        >
          <!-- rounded-lg hover:bg-hex-88888820 -->
          <div p="t-2 r-5">
            <!-- 图片 icon -->
            <div v-if="p.icon.startsWith('project_icons/')" w-9 h-9 flex="~ items-center">
              <img
                :src="isDark ? p.icon_dark || p.icon : p.icon" alt=""
                w-full h-full
                :class="[p.icon_css, p.icon_hover_css ? getHoverClass(p.icon_hover_css) : '']"
                transition="all duration-300"
              >
            </div>
            <!-- UnoCSS icon -->
            <div
              v-else
              :class="[p.icon, p.icon_css, p.icon_hover_css ? getHoverClass(p.icon_hover_css) : '']"
              text-3xl op-40
              transition="all duration-300"
            />
          </div>
          <div>
            <div>{{ p.name }}</div>
            <div text-sm op-50>
              {{ p.description }}
            </div>
          </div>
        </UiLink>
      </div>
    </div>
  </div>
</template>
