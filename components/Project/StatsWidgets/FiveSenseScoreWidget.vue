<template>
  <div class="five-sense-widget">
    <h3 class="widget-title">Distribution of 5-SENSE Scores</h3>
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
          <text
            class="axis-label"
            :x="chartPlotLeft - 4"
            :y="tick.y + 3"
            text-anchor="end"
          >{{ tick.value }}</text>
        </g>
        <text
          class="axis-title"
          :x="chartPlotLeft - 24"
          :y="(chartPlotTop + chartPlotBottom) / 2"
          :transform="`rotate(-90 ${chartPlotLeft - 24} ${(chartPlotTop + chartPlotBottom) / 2})`"
          text-anchor="middle"
        >Number of patients</text>

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
    <div v-if="hasData" class="widget-footer">
      median {{ medianScoreFormatted }} · IQR {{ q1ScoreFormatted }}–{{ q3ScoreFormatted }} ·
      N = {{ totalScoredCount }} of {{ totalPatientCount }}
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
const chartPlotTop = 12
const chartPlotBottom = chartViewHeight - 22

const innerPlotWidth = chartPlotRight - chartPlotLeft
const innerPlotHeight = chartPlotBottom - chartPlotTop

const hasData = computed(
  () => props.totalScoredCount > 0 && props.binCounts.length > 0,
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

function formatScore(scoreValue) {
  return scoreValue == null ? '–' : scoreValue.toFixed(2)
}

const medianScoreFormatted = computed(() => formatScore(props.medianScore))
const q1ScoreFormatted = computed(() => formatScore(props.q1Score))
const q3ScoreFormatted = computed(() => formatScore(props.q3Score))
</script>

<style scoped lang="scss">
.five-sense-widget {
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
  color: $lightGrey;
  font-size: 13px;
}

.histogram-chart {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: block;
  font-family: 'Montserrat', sans-serif;
}

.histogram-bar {
  fill: $es-primary-color;
}

.axis-label {
  font-size: 8px;
  fill: $neutralGrey;
}

.axis-title {
  font-size: 9px;
  fill: $gray_6;
  font-weight: 500;
}

.axis-line,
.y-axis-tick line,
.x-axis-tick line {
  stroke: $gray_5;
  stroke-width: 0.75;
}

.widget-footer {
  margin-top: 12px;
  font-size: 12px;
  color: $lightGrey;
}
</style>
