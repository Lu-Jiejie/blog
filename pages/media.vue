<script setup lang="ts">
import { media } from '~/data/media'
</script>

<template>
  <div class="prose" m-auto mb-8>
    <h1>Media Consumption</h1>
  </div>
  <div class="prose slide-enter-content" m-auto>
    <p>This page simply records the media I’ve enjoyed — partly for my own memory, partly to share what resonates with me.</p>
    <p>What’s listed here is but a small selection of what I’ve enjoyed.</p>
    <ListMedia :media="media" />
  </div>
</template>
