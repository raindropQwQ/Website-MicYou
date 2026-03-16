<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useData } from "vitepress";

const { lang } = useData();

// Umami 配置
const UMAMI_BASE_URL = "https://umami.micyou.top";
const UMAMI_SHARE_ID = "ca3lqhEXL5TaJrwv";

// 翻译
const translations: Record<string, { views: string; visits: string; loading: string }> = {
  "zh-CN": { views: "浏览量", visits: "访问次数", loading: "加载中..." },
  en: { views: "Views", visits: "Visits", loading: "Loading..." },
  "zh-TW": { views: "瀏覽量", visits: "訪問次數", loading: "載入中..." },
};

const t = computed(() => translations[lang.value] || translations["zh-CN"]);

// 统计数据类型
interface Stats {
  pageviews: number;
  visitors: number;
  visits: number;
}

// 状态
const stats = ref<Stats | null>(null);
const loading = ref(true);

// 获取分享信息（实时）
async function fetchShareInfo(baseUrl: string, shareId: string): Promise<{ websiteId: string; token: string }> {
  const response = await fetch(`${baseUrl}/api/share/${encodeURIComponent(shareId)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch share info: ${response.status}`);
  }

  const data = await response.json();
  if (!data?.token || !data?.websiteId) {
    throw new Error("Invalid share info response");
  }

  return data;
}

// 获取统计数据（实时）
async function fetchStats(): Promise<void> {
  try {
    const shareInfo = await fetchShareInfo(UMAMI_BASE_URL, UMAMI_SHARE_ID);
    const endAt = Date.now();
    const startAt = 0;

    const response = await fetch(
      `${UMAMI_BASE_URL}/api/websites/${encodeURIComponent(shareInfo.websiteId)}/stats?startAt=${startAt}&endAt=${endAt}`,
      {
        headers: {
          "x-umami-share-token": shareInfo.token,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`);
    }

    const data = await response.json();
    stats.value = data;
  } catch (err) {
    console.error("Failed to load Umami stats:", err);
  } finally {
    loading.value = false;
  }
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}w`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

onMounted(() => {
  fetchStats();
});
</script>

<template>
  <div class="umami-notice" aria-label="Website Statistics">
    <span class="notice-icon">📊</span>
    <span v-if="loading" class="notice-loading">{{ t.loading }}</span>
    <span v-else-if="stats" class="notice-content">
      <span class="stat">
        <strong>{{ formatNumber(stats.pageviews || 0) }}</strong>
        <span class="label">{{ t.views }}</span>
      </span>
      <span class="divider">·</span>
      <span class="stat">
        <strong>{{ formatNumber(stats.visits || 0) }}</strong>
        <span class="label">{{ t.visits }}</span>
      </span>
    </span>
  </div>
</template>

<style scoped>
.umami-notice {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.notice-icon {
  font-size: 0.875rem;
}

.notice-loading {
  color: var(--vp-c-text-3);
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.stat strong {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.stat .label {
  color: var(--vp-c-text-3);
  font-size: 0.7rem;
}

.divider {
  color: var(--vp-c-divider);
  margin: 0 2px;
}

/* 响应式 */
@media (max-width: 960px) {
  .umami-notice {
    display: none;
  }
}
</style>