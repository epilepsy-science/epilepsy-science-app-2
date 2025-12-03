<template>
  <div class="projects-list">
    <div v-if="isLoading" class="loading-state">
      Loading projects...
    </div>

    <div v-else-if="projects && projects.length > 0" class="projects-container">
      <div class="projects-grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.sys?.id"
          :project="project"
          :image-url="getProjectImage(project)"
        />
      </div>
    </div>

    <div v-else class="empty-state">
      No projects found.
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  projects: {
    type: Array,
    required: true,
    default: () => []
  },
  totalCount: {
    type: Number,
    default: 0
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

function getProjectImage(project) {
  if (project.fields?.bannerImage?.fields?.file?.url) {
    return `https://${project.fields.bannerImage.fields.file.url}`
  }
  return null
}
</script>

<style scoped lang="scss">
.projects-list {
  width: 100%;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.projects-container {
  width: 100%;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>

