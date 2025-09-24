<script setup lang="ts">
import type { Projects } from '~/types'
import { useI18n } from '~/logic/i18n'

const { projects } = defineProps<{
  projects: Projects
}>()

const $t = useI18n({
  en: {
    title: 'Projects',
    contents: [
      'These are some of the projects maintained by me.',
      'You can see all projects on my <a target=\"_blank\" href=\"https://github.com/Lu-Jiejie\">GitHub</a> page.',
    ],
  },
  zh: {
    title: '项目',
    contents: [
      '下面是我维护的一部分项目。',
      '你可以在我的 <a target=\"_blank\" href=\"https://github.com/Lu-Jiejie\">GitHub</a> 上找到全部项目。',
    ],
  },
})
</script>

<template>
  <div class="prose" max-width-70ch m-auto mb-8>
    <h1 text-4xl>
      {{ $t.title }}
    </h1>
  </div>
  <div class="prose" max-width-70ch m-auto mb-8>
    <p v-for="(c, cidx) in $t.contents" :key="cidx" v-html="c" />
  </div>
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
        <a
          v-for="p, pidx in projects[key]" :key="pidx"
          class="item" :href="p.link" target="_blank" :title="p.name"
          relative flex items-center bg-transparent
          text-1.1rem w-87.5 lg:w-75 xl:w-87.5 max-w-full p="y-2 x-3.5"
        >
          <!-- rounded-lg hover:bg-hex-88888820 -->
          <div p="t-2 r-5">
            <div v-if="p.icon.startsWith('project_icons/')" w-9 h-9 flex="~ items-center">
              <img
                :src="p.icon" alt=""
                w-full h-full :class="p.icon_css!"
              >
            </div>
            <div v-else :class="p.icon" text-3xl op-40 />
          </div>
          <div>
            <div>{{ p.name }}</div>
            <div text-sm op-50>{{ p.description }}</div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
