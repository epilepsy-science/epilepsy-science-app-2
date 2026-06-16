<template>
  <div class="modality-coverage-widget">
    <div class="widget-header">
      <p class="widget-subtitle">
        % of N = {{ totalPatientCount }} patients with a record in each table
      </p>
    </div>
    <div class="bar-list">
      <div
        v-for="modality in modalityCoverage"
        :key="modality.key"
        class="bar-row"
      >
        <span class="bar-label">{{ modality.label }}</span>
        <div class="bar-track">
          <div
            class="bar-fill"
            :style="{ width: `${modality.coveragePercent}%` }"
          />
        </div>
        <span class="bar-value">
          {{ modality.coveredPatientCount }} / {{ totalPatientCount }}
          ({{ modality.coveragePercent }}%)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modalityCoverage: { type: Array, required: true },
  totalPatientCount: { type: Number, required: true },
})
</script>

<style scoped lang="scss">
.modality-coverage-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  color: $gray_5;
}

.widget-header {
  margin-bottom: 16px;
}

.widget-subtitle {
  margin: 0;
  font-size: 12px;
  color: $neutralGrey;
}

.bar-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.bar-row {
  display: grid;
  grid-template-columns: 140px 1fr 160px;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.bar-label {
  font-weight: 500;
  color: $gray_6;
}

.bar-track {
  height: 14px;
  background-color: $background;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: $es-primary-color;
  transition: width 0.3s ease;
}

.bar-value {
  text-align: right;
  color: $gray_5;
  font-variant-numeric: tabular-nums;
}
</style>
