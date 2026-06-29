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
        <NuxtLink :to="{ name: 'projects' }" class="header-link">
          <IconArrowLeft class="header-link-icon" />
          View all Projects
        </NuxtLink>
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
          <div class="overview-layout">
            <div class="overview-main">
              <ProjectStatsDashboard :project="project" />
            </div>
            <ProjectSidebar :project="project" />
          </div>
        </div>

        <div v-if="activeTab === 'datasets'" class="datasets-section">
          <div v-if="datasetsLoading" class="loading-state">
            Loading datasets...
          </div>

          <div v-else-if="datasetsError" class="error-state">
            <h2>Error loading datasets</h2>
            <p>{{ datasetsError }}</p>
          </div>

          <div v-else-if="datasets.length > 0" class="datasets-list">
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

const route = useRoute()
const { $contentfulClient } = useNuxtApp()

const activeTab = ref('overview')

const { data: project, error, status } = useLazyAsyncData(
  `project-${route.params.id}`,
  () => $contentfulClient.getEntry(route.params.id),
)

const isLoading = computed(() => status.value === 'pending')
const projectName = computed(() => project.value?.fields?.name || '')
const projectSummary = computed(() => project.value?.fields?.summary || '')

const {
  datasets,
  isLoading: datasetsLoading,
  error: datasetsError,
  fetchDatasets,
} = useProjectDatasets(project)

watch([activeTab, project], ([currentTab, currentProject]) => {
  const shouldFetch =
    currentTab === 'datasets' &&
    currentProject &&
    datasets.value.length === 0 &&
    !datasetsLoading.value
  if (shouldFetch) fetchDatasets()
})

useHead({
  title: computed(() => (project.value ? `${projectName.value} - Projects` : 'Project')),
  meta: [
    { name: 'description', content: projectSummary.value || 'Project details' },
  ],
})
</script>

<style scoped lang="scss">
.project-detail-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem 2rem 2rem;
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
  .header-link {
    color: #4d628c;
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;

    &:focus {
      color: #4d628c;
    }

    .header-link-icon {
      color: #4d628c;
      height: 10px;
      width: 10px;
      margin-right: 4px;
    }
  }

  .project-title {
    font-size: 2rem;
    font-weight: 600;
    color: #297fca;
    margin: 0;
    margin-top: 1rem;
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

.overview-section {
  width: 100%;
}

.overview-layout {
  display: flex;
  gap: 1.5rem;
}

.overview-main {
  flex: 1;
  min-width: 0;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 24px;

  --dash-widget-border: 1px solid #d0d4dc;
  --dash-widget-radius: 8px;
}

.datasets-section,
.datasets-list {
  width: 100%;
}

.no-datasets {
  text-align: center;
  padding: 3rem;
  color: #666;
}

@media (max-width: 768px) {
  .project-detail-page {
    padding: 1rem 1rem 2rem 1rem;
  }

  .project-header .project-title {
    font-size: 1.5rem;
  }

  .overview-layout {
    flex-direction: column;
  }
}
</style>
