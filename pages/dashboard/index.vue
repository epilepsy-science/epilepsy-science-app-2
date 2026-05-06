<template>
  <div class="dashboard-page">
    <client-only>
      <PennsieveDashboard :options="dashboardOptions" />
    </client-only>
  </div>
</template>

<script setup>
import { PennsieveDashboard, TextWidget, MarkdownWidget } from 'pennsieve-dashboard'
import 'pennsieve-dashboard/style.css'
import { markRaw, computed } from 'vue'
import { useMainStore } from '~/store/index'

const pageStore = useMainStore()
pageStore.fetchDatasetStats()
const stats = computed(() => pageStore.pageStats)

const formattedTotalSize = computed(() => {
  if (typeof stats.value.totalDatasetSize === 'number') {
    return useFormatMetric(stats.value.totalDatasetSize)
  }
  return stats.value.totalDatasetSize
})

const availableWidgets = [
  { name: 'TextWidget', component: markRaw(TextWidget) },
  { name: 'MarkdownWidget', component: markRaw(MarkdownWidget) },
]

const defaultLayout = computed(() => [
  {
    x: 0, y: 0, w: 3, h: 4,
    id: 'stats-datasets',
    component: markRaw(TextWidget),
    componentName: 'Datasets Available',
    Props: { displayText: String(stats.value.datasets) },
  },
  {
    x: 3, y: 0, w: 3, h: 4,
    id: 'stats-total-data',
    component: markRaw(TextWidget),
    componentName: 'Total Data',
    Props: { displayText: formattedTotalSize.value },
  },
  {
    x: 6, y: 0, w: 6, h: 4,
    id: 'intro',
    component: markRaw(MarkdownWidget),
    componentName: 'Epilepsy.Science',
    Props: { markdownText: '## Epilepsy.Science\nAims to transform epilepsy research around the world by making data available to scientists.' },
  },
  {
    x: 0, y: 4, w: 6, h: 4,
    id: 'markdown-1',
    component: markRaw(MarkdownWidget),
    componentName: 'About',
    Props: { markdownText: '## About\nUse this dashboard to organize and visualize your research data.' },
  },
])

const dashboardOptions = computed(() => ({
  availableWidgets,
  defaultLayout: defaultLayout.value,
}))
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 20px;
}
</style>
