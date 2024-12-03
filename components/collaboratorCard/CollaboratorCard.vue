<template>
  <div class="collaborator-card">
    <div class="card-content">
      <h4 class="card-title">{{ title }}</h4>
      <p class="card-description">{{ description }}</p>
    </div>
    <div class="card-cta">
      <NuxtLink :to="link.url">{{ link.text }}</NuxtLink>
    </div>
  </div>
</template>

<script setup>

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  link: {
    type: Object,
    required: true
  },
});
</script>

<style scoped lang="scss">
.collaborator-card {
  background-color: #f0f0f0;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
  color: #297fca;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 250px;

  .card-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .card-description {
    margin-bottom: 16px;
    color: black;
  }

  .card-subtext {
    font-size: 0.9rem;
    margin-bottom: 15px;
    color: #555;
  }

  .card-cta a {
    color: #297fca;
    text-decoration: none;
    
    :hover {
      text-decoration: underline;
    }
  }
}
</style>