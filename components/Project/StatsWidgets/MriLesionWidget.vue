<template>
  <div class="mri-lesion-widget">
    <div class="widget-header">
      <div class="title-block">
        <h3 class="widget-title">MRI lesional?</h3>
        <p class="widget-subtitle">Lesionality on preimplant MRI (if available).</p>
      </div>
      <span class="n-badge">N = {{ totalKnownCount }} of {{ totalPatientCount }}</span>
    </div>
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
          <g
            v-for="arc in donutArcs"
            :key="`label-${arc.label}`"
            class="donut-label"
          >
            <text
              :x="arc.labelX"
              :y="arc.labelY - 3"
              class="donut-label-count"
              :text-anchor="arc.textAnchor"
            >{{ arc.count }}</text>
            <text
              :x="arc.labelX"
              :y="arc.labelY + 9"
              class="donut-label-percent"
              :text-anchor="arc.textAnchor"
            >({{ arc.percent }}%)</text>
          </g>
        </svg>
      </div>
      <ul class="legend">
        <li
          v-for="segment in displaySegments"
          :key="segment.label"
          class="legend-row"
        >
          <span
            class="legend-swatch"
            :style="{ backgroundColor: segment.color }"
          />
          <span class="legend-text">{{ segment.label }}</span>
        </li>
      </ul>
    </div>
    <div v-else class="widget-body widget-body-empty">No data</div>
    <div v-if="hasData" class="widget-footer">
      N = {{ totalKnownCount }} of {{ totalPatientCount }};
      {{ unknownCount }} patients without MRI data shown as Unknown
    </div>
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

const chartSize = 200
const chartCenter = chartSize / 2
const donutStrokeWidth = 24
const donutRadius = 60
const donutCircumference = 2 * Math.PI * donutRadius
const labelRingRadius = donutRadius + donutStrokeWidth / 2 + 12

const displaySegments = computed(() => props.segments)

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
    const midFraction = cumulativeFraction + segmentFraction / 2
    const labelAngle = -Math.PI / 2 + midFraction * 2 * Math.PI
    const labelX = chartCenter + labelRingRadius * Math.cos(labelAngle)
    const labelY = chartCenter + labelRingRadius * Math.sin(labelAngle)
    const horizontalOffset = labelX - chartCenter
    const textAnchor =
      Math.abs(horizontalOffset) < 12 ? 'middle' : horizontalOffset > 0 ? 'start' : 'end'
    const arc = {
      label: segment.label,
      color: segment.color,
      count: segment.count,
      percent: segment.percent,
      dashArray: `${segmentLength} ${donutCircumference}`,
      dashOffset: -donutCircumference * cumulativeFraction,
      labelX,
      labelY,
      textAnchor,
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
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
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
  align-items: center;
  gap: 28px;
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
  width: 200px;
  height: 200px;
}

.donut-chart {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.donut-label-count {
  font-size: 12px;
  font-weight: 700;
  fill: #1c1c1c;
}

.donut-label-percent {
  font-size: 10px;
  fill: #555;
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
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.widget-footer {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}
</style>
