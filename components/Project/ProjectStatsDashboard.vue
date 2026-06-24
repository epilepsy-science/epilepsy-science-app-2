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
import MriLesionWidget from './StatsWidgets/MriLesionWidget.vue'
import FiveSenseScoreWidget from './StatsWidgets/FiveSenseScoreWidget.vue'
import IeegFocalityWidget from './StatsWidgets/IeegFocalityWidget.vue'
import InterventionTypeWidget from './StatsWidgets/InterventionTypeWidget.vue'
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
  { name: 'MriLesionWidget', component: markRaw(MriLesionWidget) },
  { name: 'FiveSenseScoreWidget', component: markRaw(FiveSenseScoreWidget) },
  { name: 'IeegFocalityWidget', component: markRaw(IeegFocalityWidget) },
  { name: 'InterventionTypeWidget', component: markRaw(InterventionTypeWidget) },
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
    x: 0, y: 5, w: 6, h: 8,
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
    x: 6, y: 5, w: 6, h: 8,
    componentKey: 'AgeAtIeegImplantWidget',
    component: markRaw(AgeAtIeegImplantWidget),
    componentName: '',
    hideHeader: true,
    Props: {
      binCounts: epilepsyStats.value.ageAtIeegImplant.binCounts,
      binStartAge: epilepsyStats.value.ageAtIeegImplant.binStartAge,
      binWidthYears: epilepsyStats.value.ageAtIeegImplant.binWidthYears,
      medianAge: epilepsyStats.value.ageAtIeegImplant.medianAge,
      q1Age: epilepsyStats.value.ageAtIeegImplant.q1Age,
      q3Age: epilepsyStats.value.ageAtIeegImplant.q3Age,
      minAge: epilepsyStats.value.ageAtIeegImplant.minAge,
      maxAge: epilepsyStats.value.ageAtIeegImplant.maxAge,
      totalCount: epilepsyStats.value.ageAtIeegImplant.totalCount,
    },
  },
  sectionHeaderWidget({ id: 'section-modality-coverage', x: 0, y: 13, w: 12, title: 'Modality Coverage' }),
  {
    id: 'stats-modality-coverage',
    x: 0, y: 14, w: 12, h: 8,
    componentKey: 'ModalityCoverageWidget',
    component: markRaw(ModalityCoverageWidget),
    componentName: '',
    hideHeader: true,
    Props: {
      modalityCoverage: modalityCoverage.value,
      totalPatientCount: totalPatientCount.value,
    },
  },
  sectionHeaderWidget({ id: 'section-preimplant', x: 0, y: 22, w: 12, title: 'Preimplant' }),
  {
    id: 'stats-mri-lesion',
    x: 0, y: 23, w: 6, h: 8,
    componentKey: 'MriLesionWidget',
    component: markRaw(MriLesionWidget),
    componentName: '',
    hideHeader: true,
    Props: {
      segments: epilepsyStats.value.mriLesionBreakdown.segments,
      totalKnownCount: epilepsyStats.value.mriLesionBreakdown.totalKnownCount,
      unknownCount: epilepsyStats.value.mriLesionBreakdown.unknownCount,
      totalPatientCount: epilepsyStats.value.mriLesionBreakdown.totalPatientCount,
    },
  },
  {
    id: 'stats-five-sense',
    x: 6, y: 23, w: 6, h: 8,
    componentKey: 'FiveSenseScoreWidget',
    component: markRaw(FiveSenseScoreWidget),
    componentName: '',
    hideHeader: true,
    Props: {
      binCounts: epilepsyStats.value.fiveSenseScore.binCounts,
      medianScore: epilepsyStats.value.fiveSenseScore.medianScore,
      q1Score: epilepsyStats.value.fiveSenseScore.q1Score,
      q3Score: epilepsyStats.value.fiveSenseScore.q3Score,
      totalScoredCount: epilepsyStats.value.fiveSenseScore.totalScoredCount,
      totalPatientCount: epilepsyStats.value.fiveSenseScore.totalPatientCount,
    },
  },
  sectionHeaderWidget({ id: 'section-postimplant', x: 0, y: 31, w: 12, title: 'Postimplant' }),
  {
    id: 'stats-ieeg-focality',
    x: 0, y: 32, w: 6, h: 8,
    componentKey: 'IeegFocalityWidget',
    component: markRaw(IeegFocalityWidget),
    componentName: '',
    hideHeader: true,
    Props: {
      segments: epilepsyStats.value.ieegFocalityBreakdown.segments,
    },
  },
  {
    id: 'stats-intervention-type',
    x: 6, y: 32, w: 6, h: 8,
    componentKey: 'InterventionTypeWidget',
    component: markRaw(InterventionTypeWidget),
    componentName: '',
    hideHeader: true,
    Props: {
      categories: epilepsyStats.value.interventionTypeBreakdown.categories,
      totalPatientCount: epilepsyStats.value.interventionTypeBreakdown.totalPatientCount,
    },
  },
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
.project-stats-dashboard :deep(.dashboard-app),
.project-stats-dashboard :deep(.static-dashboard) {
  font-family: 'Montserrat', sans-serif;
}

.project-stats-dashboard :deep(.text-widget-wrap h2) {
  font-size: 30px;
  font-weight: 600;
  line-height: 1.1;
  margin: 0;
  color: $gray_6;
  font-family: 'Montserrat', sans-serif;
}

.project-stats-dashboard :deep(.widget-name) {
  font-family: 'Montserrat', sans-serif;
}

.project-stats-dashboard :deep(.grid-stack-item-content:has(.section-header-widget)) {
  background: transparent;
  border: none;
  box-shadow: none;
}
</style>
