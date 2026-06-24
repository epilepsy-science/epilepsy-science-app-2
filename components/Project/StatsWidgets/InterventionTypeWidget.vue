<template>
  <div class="intervention-type-widget">
    <h3 class="widget-title">Intervention Type</h3>
    <div v-if="hasData" class="widget-body">
      <svg
        class="bar-chart"
        :viewBox="`0 0 ${chartViewWidth} ${chartViewHeight}`"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g
          v-for="(row) in chartRows"
          :key="row.label"
          class="bar-row"
        >
          <text
            class="row-label"
            :x="chartPlotLeft - 8"
            :y="row.centerY + 4"
            text-anchor="end"
          >{{ row.label }}</text>
          <rect
            class="bar-fill"
            :x="chartPlotLeft"
            :y="row.barY"
            :width="row.barWidth"
            :height="barHeight"
            rx="2"
          />
          <text
            class="bar-value"
            :x="chartPlotLeft + row.barWidth + 6"
            :y="row.centerY + 4"
            text-anchor="start"
          >{{ row.count }}</text>
        </g>

        <line
          class="axis-line"
          :x1="chartPlotLeft"
          :x2="chartPlotLeft"
          :y1="chartPlotTop"
          :y2="chartPlotBottom"
        />
        <line
          class="axis-line"
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
            :y2="chartPlotBottom + 5"
          />
          <text
            class="axis-label"
            :x="tick.x"
            :y="chartPlotBottom + 20"
            text-anchor="middle"
          >{{ tick.value }}</text>
        </g>
        <text
          class="axis-title"
          :x="(chartPlotLeft + chartPlotRight) / 2"
          :y="chartViewHeight - 4"
          text-anchor="middle"
        >Number of patients</text>
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

// viewBox height is sized close to the rendered cell height so that, since a
// full-row cell is wider than this aspect ratio (height-constrained scaling),
// `font-size` in user units renders at roughly the same pixel size as the
// 12px HTML text in the Modality Coverage widget.
const chartViewWidth = 1000
const chartViewHeight = 280
const chartPlotLeft = 230
const chartPlotRight = chartViewWidth - 24
const chartPlotTop = 16
const chartPlotBottom = chartViewHeight - 44

const innerPlotWidth = chartPlotRight - chartPlotLeft
const innerPlotHeight = chartPlotBottom - chartPlotTop

const barHeight = 18

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

.widget-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  color: $gray_6;
  text-transform: none;
  text-align: left;
  align-self: flex-start;
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
  font-size: 12px;
  fill: $gray_6;
}

.bar-value {
  font-size: 12px;
  font-weight: 600;
  fill: $gray_6;
}

.axis-label {
  font-size: 11px;
  fill: $neutralGrey;
}

.axis-title {
  font-size: 12px;
  fill: $gray_6;
  font-weight: 500;
}

.axis-line,
.x-axis-tick line {
  stroke: $gray_5;
  stroke-width: 1;
}
</style>
