<script setup lang="ts">
import { useI18n } from '~/logic/i18n'

const $t = useI18n({
  en: {
    title: 'DeerNest',
  },
  zh: {
    title: '鹿巢',
  },
})
</script>

<template>
  <div ws-nowrap font-serif text-2xl>
    <span>{{ $t.title }}</span>
  </div>
</template>
