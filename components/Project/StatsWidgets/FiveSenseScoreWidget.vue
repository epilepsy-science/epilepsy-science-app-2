<template>
  <div class="five-sense-widget">
    <div class="widget-header">
      <div class="title-block">
        <h3 class="widget-title">5-SENSE score</h3>
        <p class="widget-subtitle">Focality score (0 = nonfocal, 1 = highly focal).</p>
      </div>
      <span class="n-badge">N = {{ totalScoredCount }} of {{ totalPatientCount }}</span>
    </div>
    <div v-if="hasData" class="widget-body">
      <svg
        class="histogram-chart"
        :viewBox="`0 0 ${chartViewWidth} ${chartViewHeight}`"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <g
          v-for="tick in yAxisTicks"
          :key="`y-${tick.value}`"
          class="y-axis-tick"
        >
          <line
            :x1="chartPlotLeft - 2"
            :x2="chartPlotLeft"
            :y1="tick.y"
            :y2="tick.y"
          />
          <line
            class="y-axis-grid"
            :x1="chartPlotLeft"
            :x2="chartPlotRight"
            :y1="tick.y"
            :y2="tick.y"
          />
          <text
            class="axis-label"
            :x="chartPlotLeft - 4"
            :y="tick.y + 3"
            text-anchor="end"
          >{{ tick.value }}</text>
        </g>
        <text
          class="axis-title"
          :x="chartPlotLeft - 22"
          :y="(chartPlotTop + chartPlotBottom) / 2"
          :transform="`rotate(-90 ${chartPlotLeft - 22} ${(chartPlotTop + chartPlotBottom) / 2})`"
          text-anchor="middle"
        >Count</text>

        <rect
          v-for="(bar, index) in histogramBars"
          :key="`bar-${index}`"
          class="histogram-bar"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          rx="1"
        />

        <g
          v-for="marker in quartileMarkers"
          :key="`marker-${marker.label}`"
          class="quartile-marker"
        >
          <line
            class="quartile-line"
            :x1="marker.x"
            :x2="marker.x"
            :y1="chartPlotTop"
            :y2="chartPlotBottom"
          />
          <text
            class="quartile-label"
            :x="marker.x"
            :y="chartPlotTop - 12"
            text-anchor="middle"
          >{{ marker.label }}</text>
          <text
            class="quartile-value"
            :x="marker.x"
            :y="chartPlotTop - 2"
            text-anchor="middle"
          >{{ marker.value.toFixed(2) }}</text>
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
          >{{ tick.value.toFixed(1) }}</text>
        </g>
        <text
          class="axis-title"
          :x="(chartPlotLeft + chartPlotRight) / 2"
          :y="chartViewHeight - 1"
          text-anchor="middle"
        >5-SENSE score</text>
      </svg>
    </div>
    <div v-else class="widget-body widget-body-empty">No data</div>
    <div v-if="hasData && unscoredCount > 0" class="widget-footer">
      {{ unscoredCount }} patients without 5-SENSE data (not shown).
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  binCounts: { type: Array, required: true },
  medianScore: { type: Number, default: null },
  q1Score: { type: Number, default: null },
  q3Score: { type: Number, default: null },
  totalScoredCount: { type: Number, required: true },
  totalPatientCount: { type: Number, required: true },
  scoreMin: { type: Number, default: 0 },
  scoreMax: { type: Number, default: 1 },
})

const chartViewWidth = 320
const chartViewHeight = 180
const chartPlotLeft = 38
const chartPlotRight = chartViewWidth - 8
const chartPlotTop = 32
const chartPlotBottom = chartViewHeight - 22

const innerPlotWidth = chartPlotRight - chartPlotLeft
const innerPlotHeight = chartPlotBottom - chartPlotTop

const hasData = computed(
  () => props.totalScoredCount > 0 && props.binCounts.length > 0,
)

const unscoredCount = computed(
  () => Math.max(props.totalPatientCount - props.totalScoredCount, 0),
)

const yAxisNiceMax = computed(() => {
  const rawMax = Math.max(...props.binCounts, 1)
  const step = rawMax <= 10 ? 5 : rawMax <= 25 ? 5 : 10
  return Math.ceil(rawMax / step) * step
})

const yAxisStep = computed(() => (yAxisNiceMax.value <= 10 ? 2 : 5))

const yAxisTicks = computed(() => {
  const ticks = []
  for (let tickValue = 0; tickValue <= yAxisNiceMax.value; tickValue += yAxisStep.value) {
    const tickFraction = tickValue / yAxisNiceMax.value
    ticks.push({
      value: tickValue,
      y: chartPlotBottom - tickFraction * innerPlotHeight,
    })
  }
  return ticks
})

const xAxisTicks = computed(() => {
  const ticks = []
  const tickCount = props.binCounts.length + 1
  for (let tickIndex = 0; tickIndex < tickCount; tickIndex++) {
    const tickFraction = tickIndex / (tickCount - 1)
    ticks.push({
      value: props.scoreMin + tickFraction * (props.scoreMax - props.scoreMin),
      x: chartPlotLeft + tickFraction * innerPlotWidth,
    })
  }
  return ticks
})

const histogramBars = computed(() => {
  const binCount = props.binCounts.length
  if (binCount === 0) return []
  const barSlotWidth = innerPlotWidth / binCount
  const barInnerPadding = 1.5
  return props.binCounts.map((countInBin, binIndex) => {
    const barHeightFraction = countInBin / yAxisNiceMax.value
    const barHeight = barHeightFraction * innerPlotHeight
    return {
      x: chartPlotLeft + binIndex * barSlotWidth + barInnerPadding,
      y: chartPlotBottom - barHeight,
      width: barSlotWidth - barInnerPadding * 2,
      height: barHeight,
    }
  })
})

function scoreToPlotX(scoreValue) {
  const scoreSpan = props.scoreMax - props.scoreMin
  if (scoreSpan === 0) return chartPlotLeft + innerPlotWidth / 2
  const scoreFraction = (scoreValue - props.scoreMin) / scoreSpan
  return chartPlotLeft + scoreFraction * innerPlotWidth
}

const quartileMarkers = computed(() => {
  const markers = []
  if (props.q1Score != null) {
    markers.push({ label: 'Q1 (25%)', value: props.q1Score, x: scoreToPlotX(props.q1Score) })
  }
  if (props.medianScore != null) {
    markers.push({ label: 'Median', value: props.medianScore, x: scoreToPlotX(props.medianScore) })
  }
  if (props.q3Score != null) {
    markers.push({ label: 'Q3 (75%)', value: props.q3Score, x: scoreToPlotX(props.q3Score) })
  }
  return markers
})
</script>

<style scoped lang="scss">
.five-sense-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
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
  color: #1c1c1c;
}

.widget-subtitle {
  margin: 0;
  font-size: 12px;
  color: #777;
}

.n-badge {
  font-size: 12px;
  color: #555;
  white-space: nowrap;
  flex-shrink: 0;
}

.widget-body {
  display: flex;
  align-items: stretch;
  flex: 1;
  min-height: 0;
  min-width: 0;
}

.widget-body-empty {
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 13px;
}

.histogram-chart {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: block;
}

.histogram-bar {
  fill: #3eaf7c;
}

.axis-label {
  font-size: 8px;
  fill: #777;
}

.axis-title {
  font-size: 9px;
  fill: #555;
}

.x-axis-line,
.y-axis-tick line:first-child,
.x-axis-tick line {
  stroke: #cfd4dc;
  stroke-width: 0.75;
}

.y-axis-grid {
  stroke: #eef0f3;
  stroke-width: 0.5;
}

.quartile-line {
  stroke: #8a93a3;
  stroke-width: 0.75;
  stroke-dasharray: 3 2;
}

.quartile-label {
  font-size: 8px;
  fill: #666;
}

.quartile-value {
  font-size: 9px;
  font-weight: 600;
  fill: #1c1c1c;
}

.widget-footer {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}
</style>
