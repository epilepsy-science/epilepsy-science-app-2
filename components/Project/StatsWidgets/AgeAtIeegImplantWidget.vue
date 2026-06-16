<template>
  <div class="age-implant-widget">
    <h3 class="widget-title">Age at iEEG implant</h3>
    <div v-if="hasData" class="histogram-wrap">
      <svg
        class="histogram-chart"
        :viewBox="`0 0 ${chartViewBoxWidth} ${chartViewBoxHeight}`"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect
          v-for="(bar, index) in histogramBars"
          :key="index"
          class="histogram-bar"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          rx="1.5"
        />
        <line
          v-if="medianLineX != null"
          class="median-line"
          :x1="medianLineX"
          :x2="medianLineX"
          y1="0"
          :y2="chartViewBoxHeight"
        />
      </svg>
    </div>
    <div v-else class="histogram-wrap histogram-wrap-empty">No data</div>
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
  medianAge: { type: Number, default: null },
  q1Age: { type: Number, default: null },
  q3Age: { type: Number, default: null },
  minAge: { type: Number, default: null },
  maxAge: { type: Number, default: null },
  totalCount: { type: Number, required: true },
})

const chartViewBoxWidth = 100
const chartViewBoxHeight = 100
const barGap = 1.5

const hasData = computed(
  () => props.totalCount > 0 && props.binCounts.length > 0 && props.maxAge != null,
)

const histogramBars = computed(() => {
  if (!hasData.value) return []
  const maxBinCount = Math.max(...props.binCounts, 1)
  const binCount = props.binCounts.length
  const totalBarSpace = chartViewBoxWidth - barGap * (binCount - 1)
  const barWidth = totalBarSpace / binCount
  return props.binCounts.map((countInBin, binIndex) => {
    const barHeight = (countInBin / maxBinCount) * chartViewBoxHeight
    return {
      x: binIndex * (barWidth + barGap),
      y: chartViewBoxHeight - barHeight,
      width: barWidth,
      height: barHeight,
    }
  })
})

const medianLineX = computed(() => {
  if (!hasData.value || props.medianAge == null) return null
  const ageSpan = props.maxAge - props.minAge
  if (ageSpan === 0) return chartViewBoxWidth / 2
  return ((props.medianAge - props.minAge) / ageSpan) * chartViewBoxWidth
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
}

.widget-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #1c1c1c;
}

.histogram-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
}

.histogram-wrap-empty {
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 13px;
}

.histogram-chart {
  width: 100%;
  height: 100%;
  display: block;
}

.histogram-bar {
  fill: #5b8fe8;
}

.median-line {
  stroke: #e26a3c;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

.widget-footer {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}
</style>
