<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
      <client-only>
        <PennsieveDashboard :options="dashboardOptions" />
      </client-only>
    </div>
  </div>
</template>

<script setup>
import { PennsieveDashboard, TextWidget } from 'pennsieve-dashboard'
import 'pennsieve-dashboard/style.css'
import { markRaw, computed, ref, onMounted } from 'vue'
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

const patientStats = ref({ total: '-' })

async function fetchPatientStats() {
  const { queryRaw, table } = useDuckDB()
  const results = await queryRaw(`
    SELECT
      COUNT(DISTINCT person_id) AS total
    FROM ${table('pennepi_person.parquet')}
  `)
  if (results.length > 0) {
    patientStats.value = {
      total: String(results[0].total),
    }
  }
}

onMounted(() => {
  fetchPatientStats()
})

const availableWidgets = [
  { name: 'TextWidget', component: markRaw(TextWidget) },
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
    x: 0, y: 4, w: 4, h: 4,
    id: 'stats-patients',
    component: markRaw(TextWidget),
    componentName: 'Unique Patients',
    Props: { displayText: patientStats.value.total },
  },
])

const dashboardOptions = computed(() => ({
  availableWidgets,
  defaultLayout: defaultLayout.value,
  hideEditGrid: true,
}))
</script>

<style scoped lang="scss">
.dashboard-page {
  background-color: #eef3f8;
  min-height: calc(100vh - 140px);
  padding: 40px;

  .dashboard-container {
    background-color: #fff;
    border-radius: 12px;
    max-width: 1140px;
    margin: 0 auto;
    padding: 24px;
  }
}
</style>
