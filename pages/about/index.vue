<template>
  <div class="about-page">
    <section class="body-wrapper mission-section">
      <h1 class="mission-title">{{ content.mission.title }}</h1>
    </section>

    <section class="body-wrapper stats-section">
      <div class="stats-container">
        <el-row class="stats-row">
          <el-col v-for="(stat, index) in content.stats" :key="index" :span="6" :xs="12" :md="6" class="stat-box">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </el-col>
        </el-row>
        <hr>
        <p class="stats-description">{{ content.statsDescription }}</p>
      </div>
    </section>

    <section class="body-wrapper what-we-do-section">
      <h2 class="section-title">{{ content.whatWeDo.title }}</h2>
      <div class="what-we-do-container">
        <el-row :gutter="20" class="stats-row">
          <el-col v-for="(text, index) in content.whatWeDo.textItems" :key="index" :span="12" :xs="24">
            <p class="text-section">{{ text }}</p>
          </el-col>
        </el-row>
      </div>
    </section>

    <section class="body-wrapper mission-details-section">
      <h2 class="section-title">{{ content.missionDetails.title }}</h2>
      <p class="section-subtitle">{{ content.missionDetails.subtitle }}</p>
      <div class="content-container">
        <div class="text-column">
          <p class="bold-text mb-8">{{ content.missionDetails.additionalInfo }}</p>
          <p class="mb-8">{{ content.missionDetails.introduction }}</p>
          <p class="bold-text mb-8">{{ content.missionDetails.highlightsTitle }}</p>
          <ul class="highlights">
            <li v-for="(highlight, index) in content.missionDetails.highlights" :key="index">
              {{ highlight }}
            </li>
          </ul>
          <p class="bold-text">{{ content.missionDetails.footer }}</p>
        </div>

        <div class="image-column">
          <img :src="content.missionDetails.imageSrc" alt="Epilepsy data platform" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useMainStore } from '~/store/index';

const stats = useMainStore().pageStats
const content = {
  mission: {
    title: "Our mission is to open epilepsy science and share it for public & scientific collaboration.",
  },
  stats: [
    { value: `${stats.files}`, label: "Files" },
    { value: `${stats.labs}+`, label: "Labs" },
    { value: `${stats.datasets}`, label: "Datasets" },
    { value: `${stats.publicUsers}+`, label: "Public Users" },
  ],
  statsDescription:
    "The platform provides over 200,000 EEG recordings from diverse contexts including routine outpatient EEGs, critically ill patients, and epilepsy monitoring unit evaluations.",
  whatWeDo: {
    title: "What are we doing here at Epilepsy.Science?",
    textItems: [
      "Epilepsy.Science is a new cloud-based platform for managing, analyzing, publishing, and sharing scientific datasets to accelerate epilepsy research.",
      "Led by PennSieve and the Brain Data Science Platform (BDSP) and with support from the AWS Open Data Sponsorship Program, we are creating an unparalleled open data resource for the epilepsy community.",
    ],
  },
  missionDetails: {
    title: "Driving Progress is our Mission",
    subtitle:
      "We strive to understand, treat, and ultimately cure epilepsy through open access to multidimensional epilepsy data at scale. The platform provides over 200,000 EEG recordings from diverse contexts including routine outpatient EEGs, critically ill patients, and epilepsy monitoring unit evaluations.",
    additionalInfo:
      "As the platform grows, it will also include extensive accompanying clinical data like medications, imaging, genetics, and more from institutions worldwide.",
    introduction:
      "Researchers can use Epilepsy.Science to easily build customized cohorts by connecting data points across datasets.The platform enables scientists to publish -- at no cost -- high quality datasets for citation, reuse, and reproducible research.By promoting open science, Epilepsy.Science aims to accelerate discoveries and improve patient outcomes.",
    highlightsTitle: "This collaboration brings together:",
    highlights: [
      "PennSieve's scalable data management and sharing capabilities.",
      "BDSP's extensive data resources including over 200,000 EEG recordings.",
      "The AWS Open Data Sponsorship Program covers the cost of storage.",
      "Epilepsy.Science offers unprecedented opportunities for open, collaborative epilepsy research.",
    ],
    imageSrc: "https://images.ctfassets.net/erzgaqq17mnz/25miXcUrrPaHjdX0dJ4ce6/8efe96f5a3723a404f4a6a33dbb70d18/mission-details-image.png",
    footer: "Epilepsy.Science offers unprecedented opportunities for open, collaborative epilepsy research through its powerful data resources, analytics tools, and cloud-based platform."
  },
};
</script>

<style scoped lang="scss">
.about-page {
  max-width: 1024px;
  margin: 0 auto;

  .section-title {
    text-align: center;
  }
}

.body-wrapper {
  padding-inline: 32px;
  margin-top: 72px;

  &:last-of-type {
    margin-bottom: 72px;
  }
}

.mission-section {
  text-align: center;

  .mission-title {
    color: #297fca;
    text-transform: none;
  }
}

.stats-section {
  background-color: #f0f0f0;
  border-radius: 10px;

  .stats-container {
    text-align: center;
    padding: 20px;
  }

  .stats-row {
    justify-content: center;
  }

  .stat-box {
    text-align: center;
    padding: 20px;

    .stat-value {
      font-size: 40px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
    }

    .stat-label {
      font-size: 16px;
    }
  }
}

.what-we-do-section {
  padding: 20px;
  color: #297fca;

  .what-we-do-container {
    margin-top: 24px;
  }
}

.mission-details-section {
  background-color: #297fca;
  color: white;
  padding: 40px;

  .section-subtitle {
    font-size: 16px;
    margin-bottom: 32px;
    line-height: 1.5;
    text-align: center;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .text-column {
    flex: 1;

    .bold-text {
      font-weight: bold;
    }

    .mb-8 {
      margin-bottom: 8px
    }

    .highlights {
      list-style-type: disc;
      font-size: 14px;

      li {
        margin-bottom: 8px;
      }
    }
  }

  .image-column {
    flex: 1;
    text-align: center;

    img {
      width: 250px;
      height: 500px;
    }
  }
}

@media (min-width: 1024px) {
  .mission-section {
    text-align: center;
    padding-inline: 0;
    margin-top: 72px;
  }

  .stat-box {
    padding: 30px;
  }

  .mission-details-section .content-container {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>