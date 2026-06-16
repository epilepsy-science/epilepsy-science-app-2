<template>
  <div class="section-header-widget">
    <span class="accent-bar" />
    <span class="section-title">{{ title }}</span>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
})
</script>

<style scoped lang="scss">
.section-header-widget {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 0 4px;
  box-sizing: border-box;
}

.accent-bar {
  width: 4px;
  height: 16px;
  background-color: #3eaf7c;
  border-radius: 2px;
  flex-shrink: 0;
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #666;
}
</style>
