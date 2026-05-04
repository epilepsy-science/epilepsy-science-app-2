<template>
  <ClientOnly>
    <div class="dashboard-page">
      <div class="body-wrapper">
        <component
          v-if="DashboardComponent && dashboardOptions"
          :is="DashboardComponent"
          class="dashboard-app"
          :options="dashboardOptions"
        />
        <div v-else class="loading">Loading dashboard...</div>
      </div>
    </div>
    <template #fallback>
      <div class="dashboard-page">
        <div class="body-wrapper">
          <div class="loading">Loading dashboard...</div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, markRaw, shallowRef, onMounted } from 'vue'
import { useMainStore } from '~/store/index'

const mainStore = useMainStore()

const datasetCount = computed(() => mainStore.pageStats.datasets)
const fileCount = computed(() => mainStore.pageStats.files)

const DashboardComponent = shallowRef(null)
const dashboardOptions = ref(null)

onMounted(async () => {
  const { PennsieveDashboard, MarkdownWidget, TextWidget } = await import('pennsieve-dashboard')

  DashboardComponent.value = PennsieveDashboard

  const availableWidgets = [
    { name: 'TextWidget', component: markRaw(TextWidget) },
    { name: 'MarkdownWidget', component: markRaw(MarkdownWidget) },
  ]

  const defaultLayout = [
    {
      id: 'MarkdownWidget-1',
      x: 0, y: 0, w: 4, h: 6,
      componentKey: 'MarkdownWidget',
      componentName: 'About',
      component: markRaw(MarkdownWidget),
      Props: {
        markdownText: '# Epilepsy.Science Dashboard\n\nWelcome to the Epilepsy.Science data dashboard. Use this page to explore key metrics and insights about the datasets available on the platform.',
      },
    },
    {
      id: 'TextWidget-1',
      x: 4, y: 0, w: 4, h: 2,
      componentKey: 'TextWidget',
      componentName: 'Datasets',
      component: markRaw(TextWidget),
      hideHeader: true,
      Props: {
        displayText: 'Total Datasets',
        bindedKey: 'DatasetCount',
      },
    },
    {
      id: 'TextWidget-2',
      x: 8, y: 0, w: 4, h: 2,
      componentKey: 'TextWidget',
      componentName: 'Files',
      component: markRaw(TextWidget),
      hideHeader: true,
      Props: {
        displayText: 'Total Files',
        bindedKey: 'FileCount',
      },
    },
  ]

  const services = {
    ApiUrl: useRuntimeConfig().public.discover_api_host || '',
  }

  dashboardOptions.value = {
    globalData: {
      DatasetCount: datasetCount.value,
      FileCount: fileCount.value,
    },
    availableWidgets,
    defaultLayout,
    services,
  }
})
</script>

<style>
@import 'pennsieve-dashboard/style.css';
</style>

<style scoped lang="scss">
.dashboard-page {
  .body-wrapper {
    max-width: 1400px;
    margin: 0 auto;
    padding: 32px;
  }
}

.dashboard-app {
  --el-color-primary: #297fca;
  --el-color-primary-light-3: #fbfdff;
  --el-color-primary-dark-2: #1a5a8e;
  --color: #297fca;
  --el-dialog-width: 90%;
  --dash-secondary: #297fca;
}
</style>
