<script setup lang="ts">
import { isZh, toggleLang } from '~/logic/i18n'
</script>

<template>
  <div class="prose" mt-10 mb-6 m-auto flex select-none>
    <span text-sm op-50 flex flex-wrap items-baseline>
      <UiLink
        :border="true"
        important-color-inherit mr-3 op-100!
        href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
      >CC BY-NC-SA 4.0</UiLink>

      <span mr-3 mb-2>2025-PRESENT © Lu Jiejie</span>
      <!-- i18n toggle -->
      <UiLink
        :border="true"
        important-color-inherit op-100!
        @click.prevent="toggleLang"
      >
        {{ isZh ? 'Switch to English' : '切换为简体中文' }}
      </UiLink>
    </span>
    <div flex-auto />
  </div>
</template>
