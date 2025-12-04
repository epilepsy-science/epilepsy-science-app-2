<template>
  <div class="project-detail-page">
    <div v-if="isLoading" class="loading-state">
      Loading project...
    </div>

    <div v-else-if="error" class="error-state">
      <h2>Error loading project</h2>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="project" class="project-detail">
      <div class="project-header">
        <h1 class="project-title">{{ projectName }}</h1>
      </div>

      <div class="tabs-navigation">
        <button
          :class="['tab-button', { active: activeTab === 'overview' }]"
          @click="activeTab = 'overview'"
        >
          Overview
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'datasets' }]"
          @click="activeTab = 'datasets'"
        >
          Datasets
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'overview'" class="overview-section">
          <el-card class="project-info-card" shadow="never">
            <div class="project-header-content">
              <div v-if="projectDescription" class="project-description">
                <h2>Description</h2>
                <div class="description-text" v-html="formattedDescription"></div>
              </div>

              <div v-if="projectBannerImage" class="project-banner">
                <img :src="projectBannerImage" alt="Project banner" class="banner-image" />
              </div>
            </div>

            <el-divider v-if="projectDescription && (projectInvestigators.length > 0 || projectFunding.length > 0)" />

            <div class="project-details">
              <div class="details-grid">
                <div v-if="projectInvestigators.length > 0" class="detail-item">
                  <span class="detail-label">Investigators:</span>
                  <span class="detail-value">{{ formattedInvestigators }}</span>
                </div>

                <div v-if="projectFunding.length > 0" class="detail-item">
                  <span class="detail-label">Funding:</span>
                  <span class="detail-value">{{ formattedFunding }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <div v-if="activeTab === 'datasets'" class="datasets-section">
          <div v-if="datasetsLoading" class="loading-state">
            Loading datasets...
          </div>

          <div v-else-if="datasetsError" class="error-state">
            <h2>Error loading datasets</h2>
            <p>{{ datasetsError }}</p>
          </div>

          <div v-else-if="datasets && datasets.length > 0" class="datasets-list">
            <DatasetCard
              v-for="dataset in datasets"
              :key="dataset.id"
              class="mb-16"
              :dataset="dataset"
            />
          </div>

          <div v-else class="no-datasets">
            <p>No datasets found in this project.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import DatasetCard from '~/components/Datasets/DatasetCard/DatasetCard.vue'
import markedMixin from '@/mixins/marked/index'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { $contentfulClient } = useNuxtApp()

// The mixin sets up marked globally, so we can just use its parseMarkdown method
const parseMarkdown = markedMixin.methods.parseMarkdown

const activeTab = ref('overview')
const datasets = ref([])
const datasetsLoading = ref(false)
const datasetsError = ref(null)

const { data: project, error, status } = useLazyAsyncData(`project-${route.params.id}`, () => {
  return $contentfulClient.getEntry(route.params.id)
})

const isLoading = computed(() => status.value === 'pending')

const projectName = computed(() => {
  return project.value?.fields?.name || ''
})

const projectSummary = computed(() => {
  return project.value?.fields?.summary || ''
})

const projectDescription = computed(() => {
  return project.value?.fields?.description || null
})

const projectBannerImage = computed(() => {
  if (project.value?.fields?.bannerImage?.fields?.file?.url) {
    return `https://${project.value.fields.bannerImage.fields.file.url}`
  }
  return null
})

const projectInvestigators = computed(() => {
  return project.value?.fields?.investigators || []
})

const projectFunding = computed(() => {
  return project.value?.fields?.funding || []
})

const formattedDescription = computed(() => {
  if (!projectDescription.value) return 'No description available.'
  return parseMarkdown(projectDescription.value)
})

const formattedInvestigators = computed(() => {
  if (projectInvestigators.value.length === 0) return ''
  return projectInvestigators.value.join(', ')
})

const formattedFunding = computed(() => {
  if (projectFunding.value.length === 0) return ''
  return projectFunding.value.join(', ')
})

const seoTitle = computed(() => {
  return project.value ? `${projectName.value} - Projects` : 'Project'
})

useHead({
  title: seoTitle,
  meta: [
    {
      name: 'description',
      content: projectSummary.value || 'Project details'
    }
  ]
})

const datasetsUrl = computed(() => {
  if (!project.value?.fields?.collectionIds?.[0]) return null
  
  const collectionId = project.value.fields.collectionIds[0]
  return `${runtimeConfig.public.discover_api_host}/datasets/${collectionId}/versions/1/dois?limit=25&offset=0`
})

function fetchDatasets() {
  if (!datasetsUrl.value) return
  
  datasetsLoading.value = true
  datasetsError.value = null

  useSendXhr(datasetsUrl.value, {
    header: {},
    method: 'GET',
  })
    .then((response) => {
      // Extract data from the dois array
      if (response.dois && Array.isArray(response.dois)) {
        datasets.value = response.dois.map(item => item.data || item)
      } else {
        datasets.value = []
      }
      datasetsLoading.value = false
    })
    .catch((err) => {
      console.error('Failed to fetch datasets:', err)
      datasetsError.value = err.message || 'Failed to load datasets'
      datasetsLoading.value = false
      datasets.value = []
    })
}

// Watch for tab changes to fetch datasets when datasets tab is opened
watch([activeTab, project], ([newTab, projectData]) => {
  if (newTab === 'datasets' && projectData && datasets.value.length === 0 && !datasetsLoading.value) {
    fetchDatasets()
  }
}, { immediate: false })
</script>

<style scoped lang="scss">
.project-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error-state {
  color: #d32f2f;
}

.project-detail {
  width: 100%;
}

.project-header {
  margin-bottom: 2rem;

  .project-title {
    font-size: 2rem;
    font-weight: 600;
    color: #297fca;
    margin: 0;
  }
}

.tabs-navigation {
  display: flex;
  gap: 2rem;
  margin-bottom: 0;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0;
}

.tab-button {
  background: none;
  border: none;
  padding: 0.75rem 0;
  font-size: 1rem;
  color: #999;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
  font-family: inherit;

  &:hover {
    color: #297fca;
  }

  &.active {
    color: #297fca;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #297fca;
    }
  }
}

.tab-content {
  margin-top: 2rem;
}

.overview-section,
.datasets-section {
  width: 100%;
}

.datasets-list {
  width: 100%;
}

.no-datasets {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.project-info-card {
  :deep(.el-card__body) {
    padding: 2rem;
  }
}

.project-header-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-bottom: 2rem;

  .project-description {
    flex: 1;
  }
}

.project-banner {
  flex-shrink: 0;
  width: 400px;
  height: 400px;

  .banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
}

.project-description {
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #333;
  }

  .description-text {
    font-size: 1rem;
    line-height: 1.6;
    color: #555;
    margin: 0;
  }
}

.project-details {
  margin: 1.5rem 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #333;
  font-size: 1rem;
}

:deep(.el-divider) {
  margin: 1.5rem 0;
}

@media (max-width: 768px) {
  .project-detail-page {
    padding: 1rem;
  }

  .project-header .project-title {
    font-size: 1.5rem;
  }

  .project-header-content {
    flex-direction: column;
  }

  .project-banner {
    width: 100%;
    height: 300px;
    order: -1;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .project-info-card {
    :deep(.el-card__body) {
      padding: 1.5rem;
    }
  }
}
</style>

