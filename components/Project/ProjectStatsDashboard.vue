<template>
  <client-only>
    <div class="project-stats-dashboard">
      <PennsieveDashboard :options="dashboardOptions" />
    </div>
  </client-only>
</template>

<script setup>
import { computed, markRaw, onMounted } from 'vue'
import { PennsieveDashboard, TextWidget } from 'pennsieve-dashboard'
import 'pennsieve-dashboard/style.css'
import { useMainStore } from '~/store/index'
import ModalityCoverageWidget from './ModalityCoverageWidget.vue'

const pageStore = useMainStore()
pageStore.fetchDatasetStats()
const pageStats = computed(() => pageStore.pageStats)

const { stats: epilepsyStats, fetchStats: fetchEpilepsyStats } = useEpilepsyStats()
const {
  modalityCoverage,
  totalPatientCount,
  fetchModalityCoverage,
} = useModalityCoverage()

const formattedTotalSize = computed(() => {
  const totalSize = pageStats.value.totalDatasetSize
  return typeof totalSize === 'number' ? useFormatMetric(totalSize) : totalSize
})

const availableWidgets = [
  { name: 'TextWidget', component: markRaw(TextWidget) },
  { name: 'ModalityCoverageWidget', component: markRaw(ModalityCoverageWidget) },
]

function textWidget({ id, x, y, w, h, name, value }) {
  return {
    id, x, y, w, h,
    componentKey: 'TextWidget',
    component: markRaw(TextWidget),
    componentName: name,
    Props: { displayText: value },
  }
}

const defaultLayout = computed(() => [
  textWidget({ id: 'stats-patients',         x: 0, y: 0, w: 3, h: 4, name: 'Patients',            value: epilepsyStats.value.patients }),
  textWidget({ id: 'stats-ieeg-recordings',  x: 3, y: 0, w: 3, h: 4, name: 'iEEG Recordings',     value: epilepsyStats.value.ieegRecordings }),
  textWidget({ id: 'stats-datasets',         x: 6, y: 0, w: 3, h: 4, name: 'Datasets Available',  value: String(pageStats.value.datasets) }),
  textWidget({ id: 'stats-total-data',       x: 9, y: 0, w: 3, h: 4, name: 'Total Data',          value: formattedTotalSize.value }),
  textWidget({ id: 'stats-sex',              x: 0, y: 4, w: 6, h: 4, name: 'Sex',                 value: epilepsyStats.value.sexBreakdown }),
  textWidget({ id: 'stats-age-ieeg-implant', x: 6, y: 4, w: 6, h: 4, name: 'Age at iEEG Implant', value: epilepsyStats.value.ageAtIeegImplant }),
  {
    id: 'stats-modality-coverage',
    x: 0, y: 8, w: 12, h: 8,
    componentKey: 'ModalityCoverageWidget',
    component: markRaw(ModalityCoverageWidget),
    componentName: 'Modality Coverage',
    Props: {
      modalityCoverage: modalityCoverage.value,
      totalPatientCount: totalPatientCount.value,
    },
  },
  textWidget({ id: 'stats-mri-lesion',         x: 0, y: 16, w: 6, h: 4, name: 'Pre-implant · MRI lesion',     value: epilepsyStats.value.mriLesionBreakdown }),
  textWidget({ id: 'stats-five-sense',         x: 6, y: 16, w: 6, h: 4, name: 'Pre-implant · 5-SENSE score',  value: epilepsyStats.value.fiveSenseScore }),
  textWidget({ id: 'stats-ieeg-focality',      x: 0, y: 20, w: 6, h: 4, name: 'Post-implant · iEEG focality', value: epilepsyStats.value.ieegFocalityBreakdown }),
  textWidget({ id: 'stats-intervention-type',  x: 6, y: 20, w: 6, h: 4, name: 'Post-implant · Intervention type', value: epilepsyStats.value.interventionTypeBreakdown }),
])

const dashboardOptions = computed(() => ({
  availableWidgets,
  defaultLayout: defaultLayout.value,
  hideEditGrid: true,
}))

onMounted(() => {
  fetchEpilepsyStats()
  fetchModalityCoverage()
})
</script>

<style scoped lang="scss">
.project-stats-dashboard :deep(.text-widget-wrap h2) {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
  color: #1c1c1c;
}
</style>
