<template>
  <div class="projects-list">
    <div v-if="isLoading" class="loading-state">
      Loading projects...
    </div>

    <div v-else-if="projects && projects.length > 0" class="projects-container">
      <div class="projects-grid">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
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

// Get project image from doiCollection.banners or banner field
function getProjectImage(project) {
  // Check for banner images in doiCollection
  if (project.doiCollection && project.doiCollection.banners && project.doiCollection.banners.length > 0) {
    return project.doiCollection.banners[0]
  }
  // Fallback to banner field if available
  if (project.banner) {
    return project.banner
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

