<script setup lang="ts">
import { onMounted } from 'vue'
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

// Umami 类型定义
interface UmamiPayload {
  name: string
  value: number
  rating: string
  delta: number
  id: string
  path: string
}

interface UmamiApi {
  track: (eventName: string, payload?: UmamiPayload) => void
}

// 发送指标到 Umami
const sendToUmami = (metric: Metric) => {
  // 使用 Umami 的 track 函数发送事件
  if (typeof window !== 'undefined') {
    const umami = (window as unknown as { umami?: UmamiApi }).umami
    if (umami) {
      umami.track('web-vitals', {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        delta: Math.round(metric.delta),
        id: metric.id,
        path: window.location.pathname,
      })
    }
  }

  // 同时发送到控制台，方便调试
  console.log(`[Web Vitals] ${metric.name}:`, {
    value: Math.round(metric.value),
    rating: metric.rating,
  })
}

onMounted(() => {
  // 使用 requestIdleCallback 延迟加载，避免影响页面性能
  const initWebVitals = () => {
    // Core Web Vitals
    onCLS(sendToUmami)
    onINP(sendToUmami)
    onLCP(sendToUmami)

    // Other metrics
    onFCP(sendToUmami)
    onTTFB(sendToUmami)
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(initWebVitals, { timeout: 3000 })
  } else {
    setTimeout(initWebVitals, 500)
  }
})
</script>

<template>
  <!-- 无 UI 渲染 -->
</template>