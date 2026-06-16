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
import ModalityCoverageWidget from './StatsWidgets/ModalityCoverageWidget.vue'
import SexBreakdownWidget from './StatsWidgets/SexBreakdownWidget.vue'
import AgeAtIeegImplantWidget from './StatsWidgets/AgeAtIeegImplantWidget.vue'
import SectionHeaderWidget from './StatsWidgets/SectionHeaderWidget.vue'

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
  { name: 'SexBreakdownWidget', component: markRaw(SexBreakdownWidget) },
  { name: 'AgeAtIeegImplantWidget', component: markRaw(AgeAtIeegImplantWidget) },
  { name: 'SectionHeaderWidget', component: markRaw(SectionHeaderWidget) },
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

function sectionHeaderWidget({ id, x, y, w, title }) {
  return {
    id, x, y, w, h: 1,
    componentKey: 'SectionHeaderWidget',
    component: markRaw(SectionHeaderWidget),
    componentName: '',
    hideHeader: true,
    Props: { title },
  }
}

const defaultLayout = computed(() => [
  textWidget({ id: 'stats-patients',         x: 0, y: 0, w: 3, h: 4, name: 'Patients',            value: epilepsyStats.value.patients }),
  textWidget({ id: 'stats-ieeg-recordings',  x: 3, y: 0, w: 3, h: 4, name: 'iEEG Recordings',     value: epilepsyStats.value.ieegRecordings }),
  textWidget({ id: 'stats-datasets',         x: 6, y: 0, w: 3, h: 4, name: 'Datasets Available',  value: String(pageStats.value.datasets) }),
  textWidget({ id: 'stats-total-data',       x: 9, y: 0, w: 3, h: 4, name: 'Total Data',          value: formattedTotalSize.value }),
  sectionHeaderWidget({ id: 'section-demographics', x: 0, y: 4, w: 12, title: 'Demographics' }),
  {
    id: 'stats-sex',
    x: 0, y: 5, w: 6, h: 6,
    componentKey: 'SexBreakdownWidget',
    component: markRaw(SexBreakdownWidget),
    componentName: '',
    hideHeader: true,
    Props: {
      segments: epilepsyStats.value.sexBreakdown.segments,
      totalCount: epilepsyStats.value.sexBreakdown.totalCount,
      sourceLabel: epilepsyStats.value.sexBreakdown.sourceLabel,
    },
  },
  {
    id: 'stats-age-ieeg-implant',
    x: 6, y: 5, w: 6, h: 6,
    componentKey: 'AgeAtIeegImplantWidget',
    component: markRaw(AgeAtIeegImplantWidget),
    componentName: '',
    hideHeader: true,
    Props: {
      binCounts: epilepsyStats.value.ageAtIeegImplant.binCounts,
      medianAge: epilepsyStats.value.ageAtIeegImplant.medianAge,
      q1Age: epilepsyStats.value.ageAtIeegImplant.q1Age,
      q3Age: epilepsyStats.value.ageAtIeegImplant.q3Age,
      minAge: epilepsyStats.value.ageAtIeegImplant.minAge,
      maxAge: epilepsyStats.value.ageAtIeegImplant.maxAge,
      totalCount: epilepsyStats.value.ageAtIeegImplant.totalCount,
    },
  },
  {
    id: 'stats-modality-coverage',
    x: 0, y: 11, w: 12, h: 8,
    componentKey: 'ModalityCoverageWidget',
    component: markRaw(ModalityCoverageWidget),
    componentName: 'Modality Coverage',
    Props: {
      modalityCoverage: modalityCoverage.value,
      totalPatientCount: totalPatientCount.value,
    },
  },
  textWidget({ id: 'stats-mri-lesion',         x: 0, y: 19, w: 6, h: 4, name: 'Pre-implant · MRI lesion',     value: epilepsyStats.value.mriLesionBreakdown }),
  textWidget({ id: 'stats-five-sense',         x: 6, y: 19, w: 6, h: 4, name: 'Pre-implant · 5-SENSE score',  value: epilepsyStats.value.fiveSenseScore }),
  textWidget({ id: 'stats-ieeg-focality',      x: 0, y: 23, w: 6, h: 4, name: 'Post-implant · iEEG focality', value: epilepsyStats.value.ieegFocalityBreakdown }),
  textWidget({ id: 'stats-intervention-type',  x: 6, y: 23, w: 6, h: 4, name: 'Post-implant · Intervention type', value: epilepsyStats.value.interventionTypeBreakdown }),
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

.project-stats-dashboard :deep(.grid-stack-item-content:has(.section-header-widget)) {
  background: transparent;
  border: none;
  box-shadow: none;
}
</style>
