<template>
  <div class="projects-page">
    <div class="body-wrapper">
      <h1>Projects</h1>
      
      <ProjectsList 
        v-if="projects && projects.length > 0"
        :projects="projects"
        :total-count="totalCount"
        :is-loading="isLoading"
      />
      
      <div v-else-if="isLoading" class="loading">
        Loading projects...
      </div>
      
      <div v-else-if="error" class="error">
        Error loading projects: {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
// Fetch projects data in the page component using useSendXhr (matches codebase pattern)
const runtimeConfig = useRuntimeConfig()

// Reactive state
const projects = ref([])
const totalCount = ref(0)
const isLoading = ref(true)
const error = ref(null)

// Build projects URL - using discover API datasets endpoint with collection type
const projectsUrl = `${runtimeConfig.public.discover_api_host}/datasets?limit=24&offset=0&datasetType=collection&orderBy=relevance&orderDirection=desc`

// Fetch projects function
function fetchProjects() {
  isLoading.value = true
  error.value = null
  
  useSendXhr(projectsUrl, {
    header: {},
    method: 'GET',
  })
    .then((response) => {
      // API returns { datasets: [], totalCount: number, limit: number, offset: number }
      const allProjects = response.datasets || []
      
      // Filter projects to only include those with "publisher:epilepsy" tag
      projects.value = allProjects.filter(project => {
        return project.tags && project.tags.includes('publisher:epilepsy')
      })
      
      totalCount.value = projects.value.length
      isLoading.value = false
    })
    .catch((err) => {
      console.error('Failed to fetch projects:', err)
      error.value = err.message || 'Failed to load projects'
      isLoading.value = false
      projects.value = []
      totalCount.value = 0
    })
}

// Fetch on mount
onMounted(() => {
  fetchProjects()
})
</script>

<style scoped lang="scss">
.projects-page {
  max-width: 1024px;
  margin: 0 auto;

  .body-wrapper {
    padding-inline: 32px;
    margin-top: 72px;
    margin-bottom: 72px;
    text-align: center;

    h1 {
      color: #297fca;
      margin-bottom: 20px;
    }

    p {
      font-size: 18px;
      color: #333;
    }
  }
}
</style>

