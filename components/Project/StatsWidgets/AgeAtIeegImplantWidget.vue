<template>
  <div class="age-implant-widget">
    <h3 class="widget-title">Distribution of Age at iEEG Implant</h3>
    <div v-if="hasData" class="histogram-wrap">
      <div class="y-axis-title">Number of patients</div>
      <div class="y-axis-ticks">
        <span
          v-for="tick in yAxisTicks"
          :key="`y-tick-${tick.value}`"
          class="y-tick"
        >{{ tick.value }}</span>
      </div>
      <div class="plot-area">
        <svg
          class="plot-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <rect
            v-for="(bar, index) in histogramBars"
            :key="`bar-${index}`"
            class="histogram-bar"
            :x="bar.x"
            :y="bar.y"
            :width="bar.width"
            :height="bar.height"
          />
          <line
            v-if="medianLineXPercent != null"
            class="median-line"
            :x1="medianLineXPercent"
            :x2="medianLineXPercent"
            y1="0"
            y2="100"
            vector-effect="non-scaling-stroke"
          />
          <line
            class="axis-line"
            x1="0"
            x2="0"
            y1="0"
            y2="100"
            vector-effect="non-scaling-stroke"
          />
          <line
            class="axis-line"
            x1="0"
            x2="100"
            y1="100"
            y2="100"
            vector-effect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div class="x-axis-ticks">
        <span
          v-for="(tick, index) in xAxisTickLabels"
          :key="`x-tick-${index}`"
          class="x-tick"
        >{{ tick.value }}</span>
      </div>
      <div class="x-axis-title">Age at iEEG implant (years)</div>
    </div>
    <div v-else class="histogram-wrap-empty">No data</div>
    <div v-if="hasData" class="widget-footer">
      median {{ medianAgeRounded }} · IQR {{ q1AgeRounded }}–{{ q3AgeRounded }} ·
      range {{ minAgeRounded }}–{{ maxAgeRounded }} · N = {{ totalCount }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  binCounts: { type: Array, required: true },
  binStartAge: { type: Number, default: 0 },
  binWidthYears: { type: Number, default: 10 },
  medianAge: { type: Number, default: null },
  q1Age: { type: Number, default: null },
  q3Age: { type: Number, default: null },
  minAge: { type: Number, default: null },
  maxAge: { type: Number, default: null },
  totalCount: { type: Number, required: true },
})

const barGapPercent = 1.5

const hasData = computed(
  () => props.totalCount > 0 && props.binCounts.length > 0,
)

function computeNiceTickInterval(maxValue) {
  if (maxValue <= 5) return 1
  if (maxValue <= 10) return 2
  if (maxValue <= 50) return 5
  if (maxValue <= 100) return 10
  return Math.ceil(maxValue / 50) * 5
}

const yAxisTickInterval = computed(() =>
  computeNiceTickInterval(Math.max(...props.binCounts, 1)),
)

const yAxisMaxCount = computed(() => {
  const maxBinCount = Math.max(...props.binCounts, 1)
  return Math.ceil(maxBinCount / yAxisTickInterval.value) * yAxisTickInterval.value
})

const yAxisTicks = computed(() => {
  if (!hasData.value) return []
  const ticks = []
  for (
    let tickValue = yAxisMaxCount.value;
    tickValue >= 0;
    tickValue -= yAxisTickInterval.value
  ) {
    ticks.push({ value: tickValue })
  }
  return ticks
})

const histogramBars = computed(() => {
  if (!hasData.value) return []
  const binCount = props.binCounts.length
  const totalGapPercent = barGapPercent * (binCount - 1)
  const barWidthPercent = (100 - totalGapPercent) / binCount
  return props.binCounts.map((countInBin, binIndex) => {
    const barHeightPercent = (countInBin / yAxisMaxCount.value) * 100
    return {
      x: binIndex * (barWidthPercent + barGapPercent),
      y: 100 - barHeightPercent,
      width: barWidthPercent,
      height: barHeightPercent,
    }
  })
})

const xAxisTickLabels = computed(() => {
  if (!hasData.value) return []
  return props.binCounts.map((_, binIndex) => {
    const binLowerEdge = props.binStartAge + binIndex * props.binWidthYears
    const binUpperEdge = binLowerEdge + props.binWidthYears
    return { value: `${binLowerEdge}–${binUpperEdge}` }
  })
})

const medianLineXPercent = computed(() => {
  if (!hasData.value || props.medianAge == null) return null
  const binCount = props.binCounts.length
  const totalAgeSpan = binCount * props.binWidthYears
  if (totalAgeSpan === 0) return 50
  const fractionOfRange = (props.medianAge - props.binStartAge) / totalAgeSpan
  return Math.min(Math.max(fractionOfRange, 0), 1) * 100
})

const medianAgeRounded = computed(() => Math.round(props.medianAge ?? 0))
const q1AgeRounded = computed(() => Math.round(props.q1Age ?? 0))
const q3AgeRounded = computed(() => Math.round(props.q3Age ?? 0))
const minAgeRounded = computed(() => Math.round(props.minAge ?? 0))
const maxAgeRounded = computed(() => Math.round(props.maxAge ?? 0))
</script>

<style scoped lang="scss">
.age-implant-widget {
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

.histogram-wrap {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: auto auto 1fr;
  grid-template-rows: 1fr auto auto;
  column-gap: 6px;
  row-gap: 4px;
}

.histogram-wrap-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $lightGrey;
  font-size: 13px;
}

.y-axis-title {
  grid-column: 1;
  grid-row: 1;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  white-space: nowrap;
  font-size: 11px;
  font-weight: 500;
  color: $gray_6;
  align-self: center;
  justify-self: center;
}

.y-axis-ticks {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 10px;
  line-height: 1;
  color: $gray_5;
  min-width: 22px;
  padding-right: 4px;
}

.y-tick {
  display: block;
}

.plot-area {
  grid-column: 3;
  grid-row: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
}

.plot-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.histogram-bar {
  fill: $es-primary-color;
}

.median-line {
  stroke: $orange_1;
  stroke-width: 1.5;
}

.axis-line {
  stroke: $gray_5;
  stroke-width: 1;
}

.x-axis-ticks {
  grid-column: 3;
  grid-row: 2;
  display: flex;
}

.x-tick {
  flex: 1;
  text-align: center;
  font-size: 10px;
  color: $gray_5;
}

.x-axis-title {
  grid-column: 3;
  grid-row: 3;
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  color: $gray_6;
  margin-top: 2px;
}

.widget-footer {
  margin-top: 12px;
  font-size: 12px;
  color: $lightGrey;
}
</style>
