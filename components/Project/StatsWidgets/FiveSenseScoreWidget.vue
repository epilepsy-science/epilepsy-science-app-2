<template>
  <div class="five-sense-widget">
    <h3 class="widget-title">Distribution of 5-SENSE Scores</h3>
    <div v-if="hasData" class="histogram-wrap">
      <div class="y-axis-title">Number of patients</div>
      <div class="y-axis-ticks">
        <span
          v-for="tick in yAxisTicks"
          :key="`y-tick-${tick.value}`"
          class="y-tick"
          :style="{ bottom: `${tick.bottomPercent}%` }"
        >{{ tick.value }}</span>
      </div>
      <div class="plot-area">
        <div
          v-for="tick in gridlineTicks"
          :key="`grid-${tick.value}`"
          class="gridline"
          :style="{ bottom: `${tick.bottomPercent}%` }"
        ></div>
        <div class="bars">
          <div
            v-for="(bar, index) in histogramBars"
            :key="`bar-${index}`"
            class="bar-slot"
          >
            <div class="bar" :style="{ height: `${bar.heightPercent}%` }"></div>
          </div>
        </div>
      </div>
      <div class="x-axis-ticks">
        <span
          v-for="(tick, index) in xAxisTicks"
          :key="`x-tick-${index}`"
          class="x-tick"
          :style="{ left: `${tick.leftPercent}%` }"
        >{{ tick.value.toFixed(1) }}</span>
      </div>
      <div class="x-axis-title">5-SENSE score</div>
    </div>
    <div v-else class="histogram-wrap-empty">No data</div>
    <div v-if="hasData" class="widget-footer">
      Median <span class="footer-value">{{ medianScoreFormatted }}</span>
      <span class="footer-sep">·</span>
      IQR <span class="footer-value">{{ q1ScoreFormatted }}–{{ q3ScoreFormatted }}</span>
      <span class="footer-sep">·</span>
      N <span class="footer-value">{{ totalScoredCount }}</span> of
      <span class="footer-value">{{ totalPatientCount }}</span>
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
  if (!hasData.value) return []
  const ticks = []
  for (
    let tickValue = yAxisNiceMax.value;
    tickValue >= 0;
    tickValue -= yAxisStep.value
  ) {
    ticks.push({
      value: tickValue,
      bottomPercent: (tickValue / yAxisNiceMax.value) * 100,
    })
  }
  return ticks
})

// Gridlines for every tick above the baseline (the 0 line is the axis itself).
const gridlineTicks = computed(() =>
  yAxisTicks.value.filter((tick) => tick.value > 0),
)

const histogramBars = computed(() => {
  if (!hasData.value) return []
  return props.binCounts.map((countInBin) => ({
    heightPercent: (countInBin / yAxisNiceMax.value) * 100,
  }))
})

// Ticks sit at the bin edges of the continuous score scale (e.g. 0.0 … 1.0).
const xAxisTicks = computed(() => {
  if (!hasData.value) return []
  const ticks = []
  const tickCount = props.binCounts.length + 1
  for (let tickIndex = 0; tickIndex < tickCount; tickIndex++) {
    const tickFraction = tickIndex / (tickCount - 1)
    ticks.push({
      value: props.scoreMin + tickFraction * (props.scoreMax - props.scoreMin),
      leftPercent: tickFraction * 100,
    })
  }
  return ticks
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
  margin: 0 0 18px;
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
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $gray_4;
  align-self: center;
  justify-self: center;
}

.y-axis-ticks {
  grid-column: 2;
  grid-row: 1;
  position: relative;
  min-width: 22px;
}

.y-tick {
  position: absolute;
  right: 4px;
  transform: translateY(50%);
  font-size: 10px;
  line-height: 1;
  color: $gray_4;
  font-variant-numeric: tabular-nums;
}

.plot-area {
  grid-column: 3;
  grid-row: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
  border-left: 1.5px solid $gray_3;
  border-bottom: 1.5px solid $gray_3;
}

.gridline {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: $gray_2;
}

.bars {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
}

.bar-slot {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 3px;
}

.bar {
  width: 100%;
  min-height: 2px;
  background: $es-primary-color;
  border-radius: 5px 5px 0 0;
}

.x-axis-ticks {
  grid-column: 3;
  grid-row: 2;
  position: relative;
  height: 14px;
}

.x-tick {
  position: absolute;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 600;
  color: $gray_5;
  font-variant-numeric: tabular-nums;
}

.x-axis-title {
  grid-column: 3;
  grid-row: 3;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $gray_4;
  margin-top: 2px;
}

.widget-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid $gray_2;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  color: $gray_5;
  font-variant-numeric: tabular-nums;
}

.footer-value {
  color: $gray_6;
  font-weight: 700;
}

.footer-sep {
  margin: 0 6px;
  color: $gray_3;
}
</style>
