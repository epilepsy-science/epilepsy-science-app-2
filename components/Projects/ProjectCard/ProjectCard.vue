<template>
  <div class="project-card">
    <div class="project-image-container">
      <div class="image-placeholder">
        <img 
          v-if="imageUrl" 
          :src="imageUrl" 
          alt="Project banner"
          class="project-image"
        />
        <div v-else class="placeholder-image">
          <span>Image Placeholder</span>
        </div>
      </div>
    </div>

    <div class="project-info">
      <h3 class="project-title">
        <NuxtLink :to="projectLink">
          {{ project.name }}
        </NuxtLink>
      </h3>
    </div>

    <div class="project-footer">
      <div v-if="updatedDate" class="footer-content">
        Last updated on {{ updatedDate }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: '',
      updatedAt: '',
      firstPublishedAt: '',
      createdAt: ''
    })
  },
  imageUrl: {
    type: String,
    default: null
  }
})

const updatedDate = computed(() => {
  const date = props.project.updatedAt || props.project.firstPublishedAt || props.project.createdAt
  return date ? useFormatDate(date) : null
})

const projectLink = computed(() => {
  return {
    name: 'projects-id',
    params: { id: props.project.id }
  }
})
</script>

<style scoped lang="scss">
.project-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.project-image-container {
  width: 100%;
  display: flex;
}

.image-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  border: 1px solid #e0e0e0;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
  background-color: #f5f5f5;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
  font-size: 0.75rem;
  text-align: center;
  padding: 0.5rem;
}

.project-info {
  padding: 1.5rem;
  padding-bottom: 1rem;
}

.project-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;

  a {
    color: #297fca;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #1c5a9a;
      text-decoration: underline;
    }
  }
}

.project-footer {
  padding: 0.75rem 1.5rem;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  font-size: 0.75rem;
  color: #666;
}

.footer-content {
  text-align: center;
}

@media (max-width: 768px) {
  .image-placeholder {
    height: 150px;
  }
}
</style>

