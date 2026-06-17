<template>
  <div class="intervention-type-widget">
    <div class="widget-header">
      <div class="title-block">
        <h3 class="widget-title">Intervention type</h3>
        <p class="widget-subtitle">First or primary post-iEEG intervention.</p>
      </div>
      <span class="n-badge">N = {{ totalPatientCount }}</span>
    </div>
    <div v-if="hasData" class="widget-body">
      <svg
        class="bar-chart"
        :viewBox="`0 0 ${chartViewWidth} ${chartViewHeight}`"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g
          v-for="(row, index) in chartRows"
          :key="row.label"
          class="bar-row"
        >
          <text
            class="row-label"
            :x="chartPlotLeft - 6"
            :y="row.centerY + 3"
            text-anchor="end"
          >{{ row.label }}</text>
          <rect
            class="bar-fill"
            :x="chartPlotLeft"
            :y="row.barY"
            :width="row.barWidth"
            :height="barHeight"
            rx="1.5"
          />
          <text
            class="bar-value"
            :x="chartPlotLeft + row.barWidth + 4"
            :y="row.centerY + 3"
            text-anchor="start"
          >{{ row.count }}</text>
        </g>

        <line
          class="x-axis-line"
          :x1="chartPlotLeft"
          :x2="chartPlotRight"
          :y1="chartPlotBottom"
          :y2="chartPlotBottom"
        />
        <g
          v-for="tick in xAxisTicks"
          :key="`x-${tick.value}`"
          class="x-axis-tick"
        >
          <line
            :x1="tick.x"
            :x2="tick.x"
            :y1="chartPlotBottom"
            :y2="chartPlotBottom + 2"
          />
          <text
            class="axis-label"
            :x="tick.x"
            :y="chartPlotBottom + 9"
            text-anchor="middle"
          >{{ tick.value }}</text>
        </g>
        <text
          class="axis-title"
          :x="(chartPlotLeft + chartPlotRight) / 2"
          :y="chartViewHeight - 1"
          text-anchor="middle"
        >Count</text>
      </svg>
    </div>
    <div v-else class="widget-body widget-body-empty">No data</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: { type: Array, required: true },
  totalPatientCount: { type: Number, required: true },
})

const chartViewWidth = 320
const chartViewHeight = 180
const chartPlotLeft = 78
const chartPlotRight = chartViewWidth - 16
const chartPlotTop = 6
const chartPlotBottom = chartViewHeight - 22

const innerPlotWidth = chartPlotRight - chartPlotLeft
const innerPlotHeight = chartPlotBottom - chartPlotTop

const barHeight = 12

const hasData = computed(() => props.categories.length > 0)

const niceMax = computed(() => {
  const rawMax = props.categories.reduce(
    (currentMax, category) => Math.max(currentMax, category.count),
    0,
  )
  if (rawMax === 0) return 1
  return computeNiceMax(rawMax, 4)
})

const xAxisTicks = computed(() => {
  const tickStep = niceMax.value / 4
  const ticks = []
  for (let tickIndex = 0; tickIndex <= 4; tickIndex++) {
    const tickValue = tickStep * tickIndex
    ticks.push({
      value: Math.round(tickValue),
      x: chartPlotLeft + (tickValue / niceMax.value) * innerPlotWidth,
    })
  }
  return ticks
})

const chartRows = computed(() => {
  const rowCount = props.categories.length
  if (rowCount === 0) return []
  const rowHeight = innerPlotHeight / rowCount
  return props.categories.map((category, rowIndex) => {
    const rowCenterY = chartPlotTop + rowHeight * (rowIndex + 0.5)
    const barWidth = (category.count / niceMax.value) * innerPlotWidth
    return {
      label: category.label,
      count: category.count,
      centerY: rowCenterY,
      barY: rowCenterY - barHeight / 2,
      barWidth,
    }
  })
})

function computeNiceMax(rawMax, desiredTickCount) {
  const rawTickStep = rawMax / desiredTickCount
  const tickStepMagnitude = Math.pow(10, Math.floor(Math.log10(rawTickStep)))
  const normalizedTickStep = rawTickStep / tickStepMagnitude
  let niceNormalizedStep
  if (normalizedTickStep <= 1) niceNormalizedStep = 1
  else if (normalizedTickStep <= 2) niceNormalizedStep = 2
  else if (normalizedTickStep <= 5) niceNormalizedStep = 5
  else niceNormalizedStep = 10
  const niceTickStep = niceNormalizedStep * tickStepMagnitude
  return Math.ceil(rawMax / niceTickStep) * niceTickStep
}
</script>

<style scoped lang="scss">
.intervention-type-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  color: $gray_5;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.title-block {
  min-width: 0;
}

.widget-title {
  margin: 0 0 2px;
  font-size: 15px;
  font-weight: 600;
  color: $gray_6;
}

.widget-subtitle {
  margin: 0;
  font-size: 12px;
  color: $neutralGrey;
}

.n-badge {
  font-size: 12px;
  color: $gray_5;
  white-space: nowrap;
  flex-shrink: 0;
}

.widget-body {
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
}

.widget-body-empty {
  justify-content: center;
  align-items: center;
  color: $lightGrey;
  font-size: 13px;
}

.bar-chart {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: block;
  font-family: 'Montserrat', sans-serif;
}

.bar-fill {
  fill: $es-primary-color;
}

.row-label {
  font-size: 10px;
  fill: $gray_6;
}

.bar-value {
  font-size: 10px;
  font-weight: 600;
  fill: $gray_6;
}

.axis-label {
  font-size: 8px;
  fill: $neutralGrey;
}

.axis-title {
  font-size: 9px;
  fill: $gray_5;
}

.x-axis-line,
.x-axis-tick line {
  stroke: $lineColor1;
  stroke-width: 0.75;
}
</style>
