<script setup lang="ts">
import { isDark } from '~/logic'
</script>

<template>
  <img
    :src="isDark ? '/icon-dark.png' : '/icon.png'"
    h-6 w-auto object-cover block cursor-pointer
  >
</template>
