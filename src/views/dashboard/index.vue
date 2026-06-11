<script setup lang="ts">  
import { herfList } from '@/constants/herfList'
import InfoCard from '@/components/infoCard.vue'
import { onMounted, onUnmounted, ref } from 'vue'

const CARD_WIDTH = 190
const GAP = 50
const CONTAINER_PADDING = 64

const pageRef = ref<HTMLElement | null>(null)
const containerWidth = ref<number>()

function updateLayout() {
  const page = pageRef.value
  if (!page) return

  const available = page.clientWidth - CONTAINER_PADDING
  const cols = Math.max(1, Math.floor((available + GAP) / (CARD_WIDTH + GAP)))
  containerWidth.value = cols * CARD_WIDTH + (cols - 1) * GAP + CONTAINER_PADDING
}

let observer: ResizeObserver | null = null

onMounted(() => {
  updateLayout()
  observer = new ResizeObserver(updateLayout)
  if (pageRef.value) observer.observe(pageRef.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div ref="pageRef" class="dashboard-page">
    <div
      class="dashboard-container"
      :style="containerWidth ? { width: `${containerWidth}px` } : undefined"
    >
      <InfoCard v-for="item in herfList" :key="item.href" :title="item.title" :content="item.content" :button-href="item.href" />
    </div>
  </div>
</template>

<style scoped> 
.dashboard-page {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0 32px;
  box-sizing: border-box;
}

.dashboard-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  gap: 50px;
  margin-top: auto;
  margin-bottom: auto;
  padding: 32px;
  flex-shrink: 0;
  max-width: 100%;
  box-sizing: border-box;
}
</style>
