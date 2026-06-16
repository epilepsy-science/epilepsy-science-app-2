<template>
  <div class="sex-breakdown-widget">
    <h3 class="widget-title">Sex</h3>
    <div v-if="hasData" class="widget-body">
      <div class="donut-wrap">
        <svg
          class="donut-chart"
          :viewBox="`0 0 ${chartSize} ${chartSize}`"
          aria-hidden="true"
        >
          <circle
            v-for="arc in donutArcs"
            :key="arc.label"
            :cx="chartSize / 2"
            :cy="chartSize / 2"
            :r="donutRadius"
            fill="none"
            :stroke="arc.color"
            :stroke-width="donutStrokeWidth"
            :stroke-dasharray="arc.dashArray"
            :stroke-dashoffset="arc.dashOffset"
            :transform="`rotate(-90 ${chartSize / 2} ${chartSize / 2})`"
          />
        </svg>
        <div class="donut-center">
          <div class="donut-center-total">{{ totalCount }}</div>
          <div class="donut-center-caption">patients</div>
        </div>
      </div>
      <ul class="legend">
        <li
          v-for="segment in segments"
          :key="segment.label"
          class="legend-row"
        >
          <span
            class="legend-swatch"
            :style="{ backgroundColor: segment.color }"
          />
          <span class="legend-text">
            {{ segment.label }}
            <span class="legend-count">{{ segment.count }}</span>
            <span class="legend-percent">({{ segment.percent }}%)</span>
          </span>
        </li>
      </ul>
    </div>
    <div v-else class="widget-body widget-body-empty">No data</div>
    <div v-if="hasData" class="widget-footer">
      N = {{ totalCount }} patients{{ sourceLabel ? ` (${sourceLabel})` : '' }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  segments: { type: Array, required: true },
  totalCount: { type: Number, required: true },
  sourceLabel: { type: String, default: '' },
})

const chartSize = 140
const donutStrokeWidth = 20
const donutRadius = (chartSize - donutStrokeWidth) / 2
const donutCircumference = 2 * Math.PI * donutRadius

const hasData = computed(() => props.totalCount > 0 && props.segments.length > 0)

const donutArcs = computed(() => {
  let cumulativeFraction = 0
  return props.segments.map((segment) => {
    const segmentFraction = props.totalCount > 0 ? segment.count / props.totalCount : 0
    const segmentLength = donutCircumference * segmentFraction
    const arc = {
      label: segment.label,
      color: segment.color,
      dashArray: `${segmentLength} ${donutCircumference}`,
      dashOffset: -donutCircumference * cumulativeFraction,
    }
    cumulativeFraction += segmentFraction
    return arc
  })
})
</script>

<style scoped lang="scss">
.sex-breakdown-widget {
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

.widget-body {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.widget-body-empty {
  justify-content: center;
  color: #999;
  font-size: 13px;
}

.donut-wrap {
  position: relative;
  flex-shrink: 0;
  width: 140px;
  height: 140px;
}

.donut-chart {
  width: 100%;
  height: 100%;
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.donut-center-total {
  font-size: 22px;
  font-weight: 700;
  color: #1c1c1c;
  line-height: 1;
}

.donut-center-caption {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #333;
}

.legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

.legend-text {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.legend-count {
  font-weight: 600;
  color: #1c1c1c;
}

.legend-percent {
  color: #555;
}

.widget-footer {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}
</style>
