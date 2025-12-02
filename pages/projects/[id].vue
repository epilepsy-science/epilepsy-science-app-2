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
        <h1 class="project-title">{{ project.name }}</h1>
      </div>

      <el-card class="project-info-card" shadow="never">
        <div class="project-description">
          <h2>Description</h2>
          <p class="description-text">{{ formattedDescription }}</p>
        </div>

        <el-divider />

        <div class="project-details">
          <div class="details-grid">
            <div v-if="ownerName" class="detail-item">
              <span class="detail-label">Owner:</span>
              <span class="detail-value">{{ ownerName }}</span>
            </div>

            <div v-if="project.size" class="detail-item">
              <span class="detail-label">Size:</span>
              <span class="detail-value">{{ useFormatMetric(project.size) }}</span>
            </div>

            <div v-if="publishedDate" class="detail-item">
              <span class="detail-label">Published:</span>
              <span class="detail-value">{{ publishedDate }}</span>
            </div>

            <div v-if="project.doi" class="detail-item">
              <span class="detail-label">DOI:</span>
              <span class="detail-value">
                <a :href="`https://doi.org/${project.doi}`" target="_blank" rel="noopener noreferrer">
                  {{ project.doi }}
                </a>
              </span>
            </div>

            <div v-if="project.license" class="detail-item">
              <span class="detail-label">License:</span>
              <span class="detail-value">{{ project.license }}</span>
            </div>

            <div v-if="project.version" class="detail-item">
              <span class="detail-label">Version:</span>
              <span class="detail-value">{{ project.version }}</span>
            </div>

            <div v-if="project.status" class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-value">{{ project.status }}</span>
            </div>
          </div>
        </div>

        <el-divider v-if="project.tags && project.tags.length > 0" />

        <div v-if="project.tags && project.tags.length > 0" class="project-tags">
          <h3>Tags</h3>
          <div class="tags-container">
            <el-tag
              v-for="tag in project.tags"
              :key="tag"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <el-divider v-if="project.contributors && project.contributors.length > 0" />

        <div v-if="project.contributors && project.contributors.length > 0" class="project-contributors">
          <h3>Contributors</h3>
          <div class="contributors-list">
            <div
              v-for="(contributor, index) in project.contributors"
              :key="index"
              class="contributor-item"
            >
              {{ contributor.firstName }} {{ contributor.lastName }}
              <span v-if="contributor.degree">, {{ contributor.degree }}</span>
              <span v-if="contributor.orcid" class="orcid-link">
                <a :href="`https://orcid.org/${contributor.orcid}`" target="_blank" rel="noopener noreferrer">
                  (ORCID)
                </a>
              </span>
            </div>
          </div>
        </div>

        <el-divider v-if="project.externalPublications && project.externalPublications.length > 0" />

        <div v-if="project.externalPublications && project.externalPublications.length > 0" class="project-publications">
          <h3>External Publications</h3>
          <div class="publications-list">
            <div
              v-for="(publication, index) in project.externalPublications"
              :key="index"
              class="publication-item"
            >
              <a :href="`https://doi.org/${publication.doi}`" target="_blank" rel="noopener noreferrer">
                {{ publication.doi }}
              </a>
              <span v-if="publication.relationshipType" class="relationship-type">
                ({{ publication.relationshipType }})
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { propOr } from 'ramda'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

// Reactive state
const project = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Build project URL
const projectUrl = `${runtimeConfig.public.discover_api_host}/datasets/${route.params.id}`

// Fetch project function
function fetchProject() {
  isLoading.value = true
  error.value = null

  useSendXhr(projectUrl, {
    header: {},
    method: 'GET',
  })
    .then((response) => {
      project.value = response
      isLoading.value = false
    })
    .catch((err) => {
      console.error('Failed to fetch project:', err)
      error.value = err.message || 'Failed to load project'
      isLoading.value = false
      project.value = null
    })
}

// Computed properties
const ownerName = computed(() => {
  if (!project.value) return null
  const firstName = propOr('', 'ownerFirstName', project.value)
  const lastName = propOr('', 'ownerLastName', project.value)
  if (firstName || lastName) {
    return `${firstName} ${lastName}`.trim()
  }
  return null
})

const publishedDate = computed(() => {
  if (!project.value) return null
  const date = project.value.firstPublishedAt || project.value.createdAt
  return date ? useFormatDate(date) : null
})

const formattedDescription = computed(() => {
  if (!project.value || !project.value.description) return 'No description available.'
  // Handle newlines in description
  return project.value.description.replace(/\n/g, '\n')
})

// SEO
const seoTitle = computed(() => {
  return project.value ? `${project.value.name} - Projects` : 'Project'
})

useHead({
  title: seoTitle,
  meta: [
    {
      name: 'description',
      content: project.value?.description || 'Project details'
    }
  ]
})

// Fetch on mount
onMounted(() => {
  fetchProject()
})
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
    margin: 0 0 0.5rem 0;
  }
}

.project-info-card {
  :deep(.el-card__body) {
    padding: 2rem;
  }
}

.project-description {
  margin-bottom: 1.5rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #333;
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    color: #555;
    margin: 0;
  }

  .description-text {
    white-space: pre-line;
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

  a {
    color: #297fca;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.project-tags,
.project-contributors,
.project-publications {
  margin-top: 1.5rem;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: #333;
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  margin: 0;
}

.contributors-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contributor-item {
  font-size: 1rem;
  color: #555;
  padding: 0.5rem 0;

  .orcid-link {
    margin-left: 0.5rem;

    a {
      color: #297fca;
      text-decoration: none;
      font-size: 0.875rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.publications-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.publication-item {
  font-size: 1rem;
  color: #555;
  padding: 0.5rem 0;

  a {
    color: #297fca;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .relationship-type {
    margin-left: 0.5rem;
    color: #888;
    font-style: italic;
    font-size: 0.875rem;
  }
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

