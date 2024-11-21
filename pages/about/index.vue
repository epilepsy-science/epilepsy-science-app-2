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
  </div>
</template>

<script setup>
// Content data for the page
const content = {
  mission: {
    title: "Our mission is to open epilepsy science and share it for public & scientific collaboration.",
  },
  stats: [
    { value: "2M", label: "Files" },
    { value: "200+", label: "Labs" },
    { value: "351", label: "Datasets" },
    { value: "1,000+", label: "Public Users" },
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
};
</script>

<style scoped lang="scss">
.about-page {
  max-width: 1024px;
  margin: 0 auto;
}

.body-wrapper {
  padding-inline: 32px;
  margin-top: 72px;
  &:last-of-type {
    margin-bottom: 72px;
  }
}

.mission-section {
  text-align: left;

  .mission-title {
    color: #297FCA;
    text-transform: none;
  }
}

.stats-section {
  background-color: #F0F0F0;
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
  color: #297FCA;

  .section-title {
    text-align: center;
  }

  .what-we-do-container {
    margin-top: 24px;
  }
}

@media (min-width: 1024px) {
  .mission-section {
    text-align: center;
    padding-inline: 0px;
    margin-top: 72px
  }

  .stat-box {
    padding: 30px;
  }
}
</style>