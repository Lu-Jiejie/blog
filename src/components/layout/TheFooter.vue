<script setup lang="ts">
import { isZh, toggleLang } from '~/logic/i18n'
</script>

<template>
  <div class="prose" mt-10 mb-6 m-auto flex select-none>
    <span text-sm op-50 flex flex-wrap>
      <a
        important-color-inherit mr-3 mb-2 target="_blank"
        href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
      >CC BY-NC-SA 4.0</a>

      <span mr-3 mb-2>2025-PRESENT © Lu Jiejie</span>
      <!-- i18n toggle -->
      <a
        @click.prevent="toggleLang"
        important-color-inherit cursor-pointer mb-2
      >
        {{ isZh ? 'Switch to English' : '切换为简体中文' }}
      </a>
    </span>
    <div flex-auto />
  </div>
</template>
