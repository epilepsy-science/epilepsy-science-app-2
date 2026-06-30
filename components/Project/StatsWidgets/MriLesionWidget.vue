<template>
  <div class="mri-lesion-widget">
    <h3 class="widget-title">Lesional Status based on Preimplant MRI</h3>
    <div v-if="hasData" class="widget-body">
      <div class="donut-wrap">
        <svg
          class="donut-chart"
          :viewBox="`0 0 ${chartSize} ${chartSize}`"
          aria-hidden="true"
        >
          <circle
            v-for="arc in donutArcs"
            :key="`arc-${arc.label}`"
            :cx="chartCenter"
            :cy="chartCenter"
            :r="donutRadius"
            fill="none"
            :stroke="arc.color"
            :stroke-width="donutStrokeWidth"
            :stroke-dasharray="arc.dashArray"
            :stroke-dashoffset="arc.dashOffset"
            :transform="`rotate(-90 ${chartCenter} ${chartCenter})`"
          />
        </svg>
        <div class="donut-center">
          <div class="donut-center-total">{{ totalPatientCount }}</div>
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
            <span class="legend-label">{{ segment.label }} (%):</span>
            <span class="legend-count">{{ segment.count }}</span>
            <span class="legend-percent">({{ segment.percent }}%)</span>
          </span>
        </li>
      </ul>
    </div>
    <div v-else class="widget-body widget-body-empty">No data</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  segments: { type: Array, required: true },
  totalKnownCount: { type: Number, required: true },
  unknownCount: { type: Number, required: true },
  totalPatientCount: { type: Number, required: true },
})

const chartSize = 140
const chartCenter = chartSize / 2
const donutStrokeWidth = 20
const donutRadius = (chartSize - donutStrokeWidth) / 2
const donutCircumference = 2 * Math.PI * donutRadius

const hasData = computed(
  () => props.totalPatientCount > 0 && props.segments.length > 0,
)

const donutArcs = computed(() => {
  const totalForDonut = props.segments.reduce((sum, segment) => sum + segment.count, 0)
  if (totalForDonut === 0) return []
  let cumulativeFraction = 0
  return props.segments.map((segment) => {
    const segmentFraction = segment.count / totalForDonut
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
.mri-lesion-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  color: $neutralGrey;
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
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.widget-body-empty {
  justify-content: center;
  color: $neutralGrey;
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
  color: $gray_6;
  line-height: 1;
}

.donut-center-caption {
  margin-top: 4px;
  font-size: 12px;
  color: $neutralGrey;
}

.legend {
  list-style: none;
  margin: 0;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid $lineColor2;
  border-radius: 4px;
  background-color: $background;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: $neutralGrey;
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

.legend-label {
  color: $gray_6;
}

.legend-count {
  font-weight: 600;
  color: $gray_6;
}

.legend-percent {
  color: $neutralGrey;
}
</style>
