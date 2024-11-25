<template>
  <div class="content-section">
    <div class="text-content">
      <div class="text">
        <div
        class="title"
        role="heading"
        :aria-level="headingLevel"
      >
        {{ contentData.title }}
      </div>
      <p class="description" v-html="contentData.description"></p>
      </div>
      <div class="cta-buttons">
        <el-button type="default" class="cta-button">{{ contentData.redirectLink1Text }}</el-button>
        <el-link :underline="false" :href="contentData.redirectLink2Url" class="cta-link">
          {{ contentData.redirectLink2Text }} >
        </el-link>
      </div>
    </div>
    <img :src="contentData.imgSrc" :alt="contentData.title" class="image" /> 
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  contentData: {
    type: Object,
    default: () => ({
      title: 'Review Abstracts, Overviews, File Types, & Usage Notes',
      description: `
        <p>
          Epilepsy research has focused on understanding neural mechanisms and developing innovative therapies to manage seizures. Recent studies explore gene mutations linked to epilepsy, seeking insights into brain electrical activities and seizure triggers. Advanced imaging techniques now allow researchers to map abnormal brain regions, offering hope for targeted interventions and improved patient outcomes.
        </p>
        <p>
          New treatments in epilepsy research aim to reduce seizure frequency through personalized medicine and neurostimulation techniques. Scientists are examining the potential of CRISPR gene editing to modify seizure-related genes. Additionally, clinical trials on anti-inflammatory drugs could reveal new therapeutic options, addressing the needs of patients unresponsive to traditional medication.
        </p>`,
      imgSrc: '/assets/rejoin.jpg',
      redirectLink1Text: 'More about scalable data',
      redirectLink2Text: 'Explore Epilepsy.Science',
      redirectLink1Url: '/about',
      redirectLink2Url: '/about'
    })
  },
  headingLevel: {
    type: Number,
    default: 3
  }
});
</script>

<style scoped lang="scss">
.content-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .text-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 20px;

    .title {
      font-size: 1rem;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .description {
      font-size: 1rem;
      line-height: 1.4;
      color: #333;
      margin-bottom: 20px;
    }

    .cta-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: center;

      .cta-button {
        // font-size: 0.9rem;
        width: 100%;
        max-width: 250px;
      }

      .cta-link {
        width: 100% ;
        &:hover,
        &:focus {
          color: #0066cc;
          text-decoration: underline;
        }
      }
      .cta-button, .cta-link {
        font-size: 0.9rem; // can be standardized by setting --el-link-font-size
        font-weight: bold;
        color: black; // can be standardized by setting --el-button-text-color
      }
    }
  }

  .image {
    margin: 24px;
    width: 100%;
    max-width: 300px;
    object-fit: cover;
    border-radius: 8px;
    align-self: center;
  }

  // Larger screens
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: stretch;

    .text-content {
      align-items: flex-start;
      justify-content: space-between;
      text-align: left;
      margin-bottom: 0;
      margin-right: 120px;

      .cta-buttons {
        flex-direction: row;
        justify-content: flex-start;
      }
    }

    .image {
      align-self: flex-start;
    }

    .cta-button + .cta-link {
      margin-left: 24px;
    }
  }
}
</style>