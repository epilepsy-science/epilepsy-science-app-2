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
const { $contentfulClient } = useNuxtApp()

const { data: contentfulProjects, error, status } = useLazyAsyncData("projects", () => {
  return $contentfulClient.getEntries({
    content_type: "project",
  });
})

const projects = computed(() => {
  return contentfulProjects.value?.items || []
})

const totalCount = computed(() => {
  return contentfulProjects.value?.total || 0
})

const isLoading = computed(() => status.value === 'pending')
</script>

<style scoped lang="scss">
.projects-page {
  max-width: 1024px;
  margin: 0 auto;

  .body-wrapper {
    padding-inline: 32px;
    margin-block: 64px;
    text-align: center;

    h1 {
      color: #297fca;
      margin-bottom: 32px;
    }

    p {
      font-size: 18px;
      color: #333;
    }
  }
}
</style>

