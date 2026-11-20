<script setup lang="ts">
import { isZh } from '~/logic/i18n'

defineProps<{
  title: string
  titleZh: string
  icon: string
  prepared: boolean
  /** 卡片对应的完整页面；有值时标题行右侧出现"查看全部"入口 */
  moreTo?: string
}>()
</script>

<template>
  <section slide-enter select-none mx-auto w-full max-w-3xl>
    <!-- 标签 + 细线 + 更多入口 + 图标，整块不画外框，内容直接落在页面背景上 -->
    <header class="card-head">
      <h2 class="card-label">
        {{ isZh ? titleZh : title }}
      </h2>
      <div class="card-rule" />
      <RouterLink v-if="moreTo" :to="moreTo" class="card-more">
        {{ isZh ? '查看全部' : 'See all' }}
      </RouterLink>
      <div :class="icon" class="card-icon" />
    </header>

    <Transition name="fade">
      <div v-if="prepared" key="content">
        <slot />
      </div>
    </Transition>
    <div v-if="!prepared" key="loading">
      <slot name="loading">
        <CardLoading />
      </slot>
    </div>
  </section>
</template>

<style scoped>
.card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-label {
  min-width: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.06em;
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-rule {
  flex: auto;
  min-width: 1.5rem;
  height: 1px;
  background-color: #8888;
}

/* 与标签同字号，靠透明度退后，避免和标题抢视线 */
.card-more {
  --uno: flex-shrink-0 whitespace-nowrap text-xs op-45;
  --uno: transition-opacity duration-300;
}

.card-more:hover {
  --uno: op-100;
}

.card-icon {
  flex-shrink: 0;
  font-size: 15px;
  opacity: 0.85;
}
</style>
