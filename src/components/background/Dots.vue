<script setup lang="ts">
import type { Texture } from 'pixi.js'
import { useEventListener } from '@vueuse/core'
import { Application, Graphics, Particle, ParticleContainer } from 'pixi.js'
import { createNoise3D } from 'simplex-noise'
import { effectScope, onMounted, onScopeDispose, onUnmounted, useTemplateRef } from 'vue'

const el = useTemplateRef('el')

let w = window.innerWidth
let h = window.innerHeight

const CONFIG = {
  // Noise scale for flow field
  SCALE: 200,
  // Maximum displacement length
  LENGTH: 5,
  // Spacing between dots
  SPACING: 15,
  // Dot color
  COLOR: 0xCCCCCC,
  // Dot radius
  RADIUS: 1,
  // Animation time divisor (lower = faster)
  TIME_SCALE: 10000,
} as const

const noise3d = createNoise3D()

const existingPoints = new Set<string>()
const points: { x: number, y: number, opacity: number, particle: Particle }[] = []

function getForceOnPoint(x: number, y: number, z: number) {
  return (noise3d(x / CONFIG.SCALE, y / CONFIG.SCALE, z) - 0.5) * 2 * Math.PI
}

const mountedScope = effectScope()

function createDotTexture(app: Application) {
  const g = new Graphics().circle(0, 0, CONFIG.RADIUS).fill(CONFIG.COLOR)
  return app.renderer.generateTexture(g)
}

function addPoints({ dotTexture, particleContainer }: { dotTexture: Texture, particleContainer: ParticleContainer }) {
  for (let x = -CONFIG.SPACING / 2; x < w + CONFIG.SPACING; x += CONFIG.SPACING) {
    for (let y = -CONFIG.SPACING / 2; y < h + CONFIG.SPACING; y += CONFIG.SPACING) {
      const id = `${x}-${y}`
      if (existingPoints.has(id))
        continue
      existingPoints.add(id)

      const particle = new Particle(dotTexture)
      particle.anchorX = 0.5
      particle.anchorY = 0.5
      particleContainer.addParticle(particle)

      const opacity = Math.random() * 0.5 + 0.5
      points.push({ x, y, opacity, particle })
    }
  }
}

async function setup() {
  if (el.value == null)
    return
  const app = new Application()
  await app.init({
    background: '#ffffff',
    antialias: true,
    resolution: window.devicePixelRatio,
    resizeTo: el.value,
    eventMode: 'none',
    autoDensity: true,
  })
  el.value.appendChild(app.canvas)

  const particleContainer = new ParticleContainer({ dynamicProperties: { position: true, alpha: true } })
  app.stage.addChild(particleContainer)

  const dotTexture = createDotTexture(app)
  addPoints({ dotTexture, particleContainer })

  app.ticker.add(() => {
    const t = Date.now() / CONFIG.TIME_SCALE

    for (const p of points) {
      const { x, y, opacity, particle } = p
      const rad = getForceOnPoint(x, y, t)
      const len = (noise3d(x / CONFIG.SCALE, y / CONFIG.SCALE, t * 2) + 0.5) * CONFIG.LENGTH
      const nx = x + Math.cos(rad) * len
      const ny = y + Math.sin(rad) * len

      particle.x = nx
      particle.y = ny
      particle.alpha = (Math.abs(Math.cos(rad)) * 0.8 + 0.2) * opacity
    }
  })

  mountedScope.run(() => {
    useEventListener('resize', () => {
      w = window.innerWidth
      h = window.innerHeight
      addPoints({ dotTexture, particleContainer })
    })
    onScopeDispose(() => {
      // For some reason this throws an error, maybe something wrong with pixi.js
      try {
        app?.destroy(true, { children: true, texture: true, textureSource: true })
      }
      catch (error) {
        console.error(error)
      }
    })
  })
}

onMounted(async () => {
  await setup()
})

onUnmounted(() => {
  mountedScope.stop()
})
</script>

<template>
  <div ref="el" z--1 fixed size-screen left-0 right-0 top-0 bottom-0 pointer-events-none dark:invert />
</template>
