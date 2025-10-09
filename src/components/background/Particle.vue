<script setup lang="ts">
// https://github.com/JulianLaval/canvas-particle-network
import type { Graphics as GraphicsType } from 'pixi.js'
import { tryOnMounted, tryOnScopeDispose, useRafFn, useWindowSize } from '@vueuse/core'
import { Application, Graphics } from 'pixi.js'
import { shallowRef, useTemplateRef } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  graphics: GraphicsType
}

const el = useTemplateRef('el')
const { width, height } = useWindowSize()

const CONFIG = {
  // Particle connection color (with alpha)
  COLOR: 0x888888,
  ALPHA: 0.15,
  // Particle velocity
  VELOCITY: 0.8,
  // Particle density (pixels per particle)
  DENSITY: 6000,
  // Connection distance threshold
  DISTANCE: 120,
  // Particle circle radius
  RADIUS: 1.5,
  // Line width for connections
  LINE_WIDTH: 0.5,
} as const

const particles = shallowRef<Particle[]>([])
let app: Application | null = null
let connectionGraphics: GraphicsType | null = null

function createParticle(w: number, h: number): Particle {
  const x = Math.random() * w
  const y = Math.random() * h
  const vx = (Math.random() - 0.5) * CONFIG.VELOCITY
  const vy = (Math.random() - 0.5) * CONFIG.VELOCITY

  const graphics = new Graphics()
  graphics.circle(0, 0, CONFIG.RADIUS)
  graphics.fill({ color: CONFIG.COLOR, alpha: CONFIG.ALPHA })

  return { x, y, vx, vy, graphics }
}

function updateParticle(particle: Particle, w: number, h: number): void {
  // Reverse direction if outside bounds (with buffer zone)
  if (particle.x > w + 20 || particle.x < -20) {
    particle.vx = -particle.vx
  }
  if (particle.y > h + 20 || particle.y < -20) {
    particle.vy = -particle.vy
  }

  particle.x += particle.vx
  particle.y += particle.vy

  // Update graphics position
  particle.graphics.x = particle.x
  particle.graphics.y = particle.y
}

function drawConnections(): void {
  if (!connectionGraphics)
    return

  connectionGraphics.clear()

  const particleList = particles.value
  const distanceSquared = CONFIG.DISTANCE * CONFIG.DISTANCE

  // Draw connections between nearby particles
  for (let i = 0; i < particleList.length; i++) {
    const p1 = particleList[i]

    for (let j = i + 1; j < particleList.length; j++) {
      const p2 = particleList[j]

      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      const dSquared = dx * dx + dy * dy

      if (dSquared < distanceSquared) {
        connectionGraphics
          .moveTo(p1.x, p1.y)
          .lineTo(p2.x, p2.y)
          .stroke({ width: CONFIG.LINE_WIDTH, color: CONFIG.COLOR, alpha: CONFIG.ALPHA })
      }
    }
  }
}

function initializeParticles(w: number, h: number): void {
  if (!app)
    return

  // Clear existing particles
  particles.value.forEach((p) => {
    app!.stage.removeChild(p.graphics)
  })

  const particleCount = Math.floor((w * h) / CONFIG.DENSITY)
  const newParticles: Particle[] = []

  for (let i = 0; i < particleCount; i++) {
    const particle = createParticle(w, h)
    app.stage.addChild(particle.graphics)
    newParticles.push(particle)
  }

  particles.value = newParticles
}

const { pause, resume } = useRafFn(() => {
  const w = width.value
  const h = height.value
  const particleList = particles.value

  // Update all particles
  for (let i = 0; i < particleList.length; i++) {
    updateParticle(particleList[i], w, h)
  }

  // Draw connections
  drawConnections()
}, { immediate: false })

async function initializePixiApp(): Promise<void> {
  if (!el.value)
    return

  app = new Application()

  await app.init({
    background: 0x000000,
    backgroundAlpha: 0,
    antialias: false, // Disable antialiasing to avoid WebGL1 warnings
    resolution: window.devicePixelRatio,
    resizeTo: el.value,
    eventMode: 'none',
    autoDensity: true,
  })

  el.value.appendChild(app.canvas)

  // Create graphics for connections
  connectionGraphics = new Graphics()
  app.stage.addChild(connectionGraphics)

  // Initialize particles
  initializeParticles(width.value, height.value)

  resume()
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
      connectionGraphics = null
      particles.value = []
    }
  }
}

tryOnMounted(initializePixiApp)
tryOnScopeDispose(destroyPixiApp)
</script>

<template>
  <div
    ref="el"
    z--1 fixed size-screen left-0 right-0 top-0 bottom-0 pointer-events-none print:hidden
  />
</template>
