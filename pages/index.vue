<template>
  <section class="hero-section">
    <h1 class="hero-heading">
      Help Us Accelerate Epilepsy Research
    </h1>
    <p class="hero-subheading">
      <span class="highlight-text">EPILEPSY.SCIENCE</span> is a new cloud-based platform for managing, analyzing, publishing, and sharing scientific datasets.
    </p>
  </section>
  <section class="main-content">
        <div class="main-content-item">
          <custom-accordion></custom-accordion>
        </div>
        <div class="main-content-item">
          <stats-banner></stats-banner>
        </div>
        <div class="main-content-item">
          <subscription-banner></subscription-banner>
        </div>
  </section>
</template>

<script setup lang="ts">
import { useMainStore } from '~/store/index';

const pageStore = useMainStore();
pageStore.loadMockPageStats();
</script>

<style scoped lang="scss">
.hero-section {
  text-align: center;
  padding: 40px 20px;

  .hero-heading {
    font-size: 2.5rem;
    font-weight: 500;
    color: #000;
    margin-bottom: 15px;
    text-transform: uppercase;
  }

  .hero-subheading {
    font-size: 1.2rem;
    font-weight: 400;
    color: #333;
    line-height: 1.6;
    max-width: 700px;
    margin: 0 auto;

    .highlight-text {
      color: #88b980;
    }
  }
}
.main-content {
    max-width: 1024px;
    margin: 32px auto;
    .main-content-item {
      margin-bottom: 64px;
    }
}
</style>