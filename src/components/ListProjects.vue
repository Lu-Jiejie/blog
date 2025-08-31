<script setup lang="ts">
import type { Projects } from '~/types'

const { projects } = defineProps<{
  projects: Projects
}>()
</script>

<template>
  <div max-w-300 mx-auto select-none class="prose">
    <h1 text-4xl text-center>
      Projects
    </h1>
    <p important-mt--6 mb-5 op-60 italic text-lg text-center>
      Projects maintained by me.
    </p>
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
            <div v-if="p.icon.startsWith('i-')" :class="p.icon" text-3xl op-40 />
            <div v-else-if="p.icon.startsWith('project_icons/')" w-9 h-9 flex="~ items-center">
              <img
                :src="p.icon" alt=""
                w-full h-full :class="p.icon_css!"
              >
            </div>

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
