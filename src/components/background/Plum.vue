<script setup lang="ts">
// https://github.com/antfu/antfu.me/blob/main/src/components/ArtPlum.vue
import type { Fn } from '@vueuse/core'
import type { Graphics as GraphicsType } from 'pixi.js'
import { tryOnMounted, tryOnScopeDispose, useRafFn, useWindowSize } from '@vueuse/core'
import { Application, Graphics } from 'pixi.js'
import { computed, shallowRef, useTemplateRef } from 'vue'

const el = useTemplateRef('el')
const { width, height } = useWindowSize()

const CONFIG = {
  // Branch color (with alpha)
  COLOR: 0x888888,
  ALPHA: 0.2,
  // Branch drawing threshold
  THRESHOLD: 30,
  // Branch length
  LEN: 6,
  // Frame interval (ms)
  INTERVAL: 1000 / 40,
  // Line width for branches
  LINE_WIDTH: 1,
  // Small screen width threshold
  SMALL_SCREEN: 500,
} as const

const R180 = Math.PI
const R90 = Math.PI / 2
const R15 = Math.PI / 12

const { random } = Math
const randomMiddle = () => random() * 0.6 + 0.2

let app: Application | null = null
let branchGraphics: GraphicsType | null = null
const pendingSteps = shallowRef<Fn[]>([])
const prevSteps = shallowRef<Fn[]>([])
const stopped = shallowRef(false)
let lastTime = performance.now()

function polar2cart(x = 0, y = 0, r = 0, theta = 0): [number, number] {
  const dx = r * Math.cos(theta)
  const dy = r * Math.sin(theta)

  return [x + dx, y + dy]
}

function step(
  x: number,
  y: number,
  rad: number,
  counter: { value: number } = { value: 0 },
): void {
  if (!branchGraphics)
    return

  const w = width.value
  const h = height.value

  // Drawing a branch
  const length = random() * CONFIG.LEN
  const [nx, ny] = polar2cart(x, y, length, rad)

  counter.value += 1

  branchGraphics
    .moveTo(x, y)
    .lineTo(nx, ny)
    .stroke({ width: CONFIG.LINE_WIDTH, color: CONFIG.COLOR, alpha: CONFIG.ALPHA })

  // Out of bounds then return
  if (nx < -100 || nx > w + 100 || ny < -100 || ny > h + 100)
    return

  // Otherwise continue drawing
  const rad1 = rad + random() * R15
  const rad2 = rad - random() * R15
  const rate = counter.value <= CONFIG.THRESHOLD ? 0.8 : 0.5

  // Left branch
  if (random() < rate)
    pendingSteps.value.push(() => step(nx, ny, rad1, counter))

  // Right branch
  if (random() < rate)
    pendingSteps.value.push(() => step(nx, ny, rad2, counter))
}

const { pause, resume } = useRafFn(() => {
  const now = performance.now()
  if (now - lastTime < CONFIG.INTERVAL)
    return

  prevSteps.value = pendingSteps.value
  pendingSteps.value = []
  lastTime = now

  if (!prevSteps.value.length) {
    pause()
    stopped.value = true
    return
  }

  // Execute all the steps from the previous frame
  prevSteps.value.forEach((fn) => {
    // 50% chance to keep the step for the next frame, to create a more organic look
    if (random() < 0.5)
      pendingSteps.value.push(fn)
    else
      fn()
  })
}, { immediate: false })

function start(): void {
  if (!branchGraphics)
    return

  pause()

  branchGraphics.clear()

  const w = width.value
  const h = height.value

  prevSteps.value = []
  pendingSteps.value = [
    () => step(randomMiddle() * w, -5, R90),
    () => step(randomMiddle() * w, h + 5, -R90),
    () => step(-5, randomMiddle() * h, 0),
    () => step(w + 5, randomMiddle() * h, R180),
  ]

  if (w < CONFIG.SMALL_SCREEN)
    pendingSteps.value = pendingSteps.value.slice(0, 2)

  resume()
  stopped.value = false
}

async function initializePixiApp(): Promise<void> {
  if (!el.value)
    return

  app = new Application()

  await app.init({
    background: 0x000000,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio,
    resizeTo: el.value,
    eventMode: 'none',
    autoDensity: true,
  })

  el.value.appendChild(app.canvas)

  // Create graphics for branches
  branchGraphics = new Graphics()
  app.stage.addChild(branchGraphics)

  // Start drawing
  start()
}

function destroyPixiApp(): void {
  pause()

  if (app) {
    try {
      app.destroy(true, { children: true, texture: true, textureSource: true })
    }
    catch (error) {
      console.error('Error destroying PIXI app:', error)
    }
    finally {
      app = null
      branchGraphics = null
      pendingSteps.value = []
      prevSteps.value = []
    }
  }
}

const mask = computed(() => 'radial-gradient(circle, transparent, black)')

tryOnMounted(initializePixiApp)
tryOnScopeDispose(destroyPixiApp)
</script>

<template>
  <div
    ref="el"
    style="z-index: -1"
    :style="{ maskImage: mask, WebkitMaskImage: mask }"
    fixed top-0 bottom-0 left-0 right-0 pointer-events-none print:hidden
  />
</template>
