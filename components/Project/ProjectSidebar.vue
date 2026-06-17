<template>
  <aside class="overview-sidebar">
    <div v-if="bannerImageUrl" class="sidebar-logo-wrapper">
      <img :src="bannerImageUrl" alt="Project banner" class="sidebar-logo" />
    </div>

    <div v-if="description" class="sidebar-item">
      <h3 class="sidebar-label">Description</h3>
      <div class="sidebar-text" v-html="formattedDescription"></div>
    </div>

    <div v-if="investigators.length > 0" class="sidebar-item">
      <h3 class="sidebar-label">Investigators</h3>
      <p class="sidebar-text">{{ investigators.join(', ') }}</p>
    </div>

    <div v-if="funding.length > 0" class="sidebar-item">
      <h3 class="sidebar-label">Funding</h3>
      <p class="sidebar-text">{{ funding.join(', ') }}</p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import markedMixin from '@/mixins/marked/index'

const props = defineProps({
  project: { type: Object, default: null },
})

const parseMarkdown = markedMixin.methods.parseMarkdown

const bannerImageUrl = computed(() => {
  const fileUrl = props.project?.fields?.bannerImage?.fields?.file?.url
  return fileUrl ? `https://${fileUrl}` : null
})

const description = computed(() => props.project?.fields?.description || null)
const investigators = computed(() => props.project?.fields?.investigators || [])
const funding = computed(() => props.project?.fields?.funding || [])

const formattedDescription = computed(() => {
  if (!description.value) return 'No description available.'
  return parseMarkdown(description.value)
})
</script>

<style scoped lang="scss">
.overview-sidebar {
  width: 380px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.sidebar-logo-wrapper {
  padding: 1rem;
  display: flex;
  justify-content: center;

  .sidebar-logo {
    width: 240px;
    height: 240px;
    display: block;
    object-fit: contain;
  }
}

.sidebar-item {
  padding: 1rem 1.25rem;
  border-top: 1px solid #f0f0f0;
}

.sidebar-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #999;
  margin: 0 0 0.35rem 0;
}

.sidebar-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #444;
  margin: 0;
}

@media (max-width: 768px) {
  .overview-sidebar {
    width: 100%;
  }
}
</style>
