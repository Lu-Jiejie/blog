<script setup lang="ts">
import { onMounted, ref } from 'vue'

const CONFIG = {
  // Star density configuration
  SMALL_STARS_COUNT: 1200,
  MEDIUM_STARS_COUNT: 800,
  LARGE_STARS_COUNT: 400,

  // Coverage area configuration
  MAX_WIDTH: 2560, // Maximum width coverage
  MAX_HEIGHT: 4000, // Maximum height coverage (including animation distance)
}

const starsSmall = ref('')
const starsMedium = ref('')
const starsLarge = ref('')

// Generate random star box-shadow string
function generateStarShadows(count: number, maxX: number, maxY: number): string {
  const shadows: string[] = []

  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * maxX)
    const y = Math.floor(Math.random() * maxY)
    shadows.push(`${x}px ${y}px var(--color)`)
  }

  return shadows.join(', ')
}

// Initialize stars
function initStars() {
  // Generate three different levels of stars
  starsSmall.value = generateStarShadows(CONFIG.SMALL_STARS_COUNT, CONFIG.MAX_WIDTH, CONFIG.MAX_HEIGHT)
  starsMedium.value = generateStarShadows(CONFIG.MEDIUM_STARS_COUNT, CONFIG.MAX_WIDTH, CONFIG.MAX_HEIGHT)
  starsLarge.value = generateStarShadows(CONFIG.LARGE_STARS_COUNT, CONFIG.MAX_WIDTH, CONFIG.MAX_HEIGHT)
}

onMounted(() => {
  initStars()

  // Do not listen to resize, keep star positions fixed
})
</script>

<template>
  <div class="stars w-screen h-screen top-0 left-0 fixed opacity-85 -z-1">
    <!-- Small stars -->
    <div
      class="h-1px w-1px rounded-full bg-transparent stars-small animate-stars-rising"
      :style="{ boxShadow: starsSmall, animationDuration: '100s' }"
    />
    <!-- Medium stars -->
    <div
      class="h-2px w-2px rounded-full bg-transparent stars-medium animate-stars-rising opacity-75"
      :style="{ boxShadow: starsMedium, animationDuration: '150s' }"
    />
    <!-- Large stars -->
    <div
      class="h-1.3px w-1.3px rounded-full bg-transparent stars-large animate-stars-rising opacity-50"
      :style="{ boxShadow: starsLarge, animationDuration: '200s' }"
    />
  </div>
</template>

<style scoped>
.stars {
  -webkit-mask-image: linear-gradient(
    180deg,
    rgba(217, 217, 217, 0) 0%,
    rgba(217, 217, 217, 0.8) 25%,
    #d9d9d9 50%,
    rgba(217, 217, 217, 0.8) 75%,
    rgba(217, 217, 217, 0) 100%
  );
  mask-image: linear-gradient(
    180deg,
    rgba(217, 217, 217, 0) 0%,
    rgba(217, 217, 217, 0.8) 25%,
    #d9d9d9 50%,
    rgba(217, 217, 217, 0.8) 75%,
    rgba(217, 217, 217, 0) 100%
  );
  -webkit-mask-size: cover;
  mask-size: cover;
  --color: #000;
}

.dark .stars {
  --color: #fff;
}

@keyframes stars-rising {
  0% {
    transform: translateZ(0) translateY(0);
  }
  to {
    transform: translateZ(0) translateY(-2000px);
  }
}

.animate-stars-rising {
  animation: stars-rising linear infinite;
}
</style>
