<template>
  <div class="stats-section">
    <div class="stats-content">
      <h2 class="stats-title">Epilepsy.Science</h2>
      <p class="stats-subtitle">
        Aims to transform epilepsy research around the world by making data
        available to scientists.
      </p>
    </div>

    <div class="stats-boxes">
      <el-row :gutter="20" class="stats-row">
        <el-col :span="8" class="stats-box datasets-stats">
          <div class="stats-value">{{ stats.datasets }}</div>
          <div class="stats-label">Datasets</div>
        </el-col>
        <el-col :span="8" class="stats-box">
          <div class="stats-value">{{ stats.publicUsers + '+'}}</div>
          <div class="stats-label">Public Users</div>
        </el-col>
        <el-col :span="8" class="stats-box">
          <div class="stats-value">{{ stats.universities + '+'}}</div>
          <div class="stats-label">Universities</div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '~/store/index';

const pageStore = useMainStore();

const stats = pageStore.pageStats;
</script>

<style scoped lang="scss">
.stats-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 1px solid #000;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 168px;
  background-color: white;

  .stats-content {
    text-align: center;
    margin-bottom: 20px;
  }

  .stats-title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .stats-subtitle {
    font-size: 1rem;
    margin-bottom: 20px;
  }

  .stats-boxes {
    width: 100%;
  }

  .stats-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }

  .stats-box {
    border: 1px solid black;
    padding: 20px;
    text-align: center;
    flex: 1;
    &:not(:last-of-type) {
      border-right: 0px;
    }

    .stats-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stats-label {
      font-size: 1rem;
      color: #555; // TODO: update color from assets
    }
  }

  // Tablet and larger screens
  @media (min-width: 768px) {
    padding: 40px;
  }

  // Desktop and larger screens
  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: flex-start;
    gap: 40px;

    .stats-content {
      flex: 1;
      text-align: left;
    }

    .stats-boxes {
      flex: 1;
    }

    .stats-row {
      justify-content: space-between;
    }

    .stats-title {
      font-size: 1.8rem;
    }

    .stats-subtitle {
      font-size: 1.2rem;
    }

    .stats-box {
      .stats-label {
        font-size: 1.2rem;
      }
    }
  }
}
</style>

<style lang="scss">
.el-col.datasets-stats::after {
  content: "coming soon!";
  background-color: #f9f9f9;
  color: #666;
  font-size: 0.75rem;
  font-weight: bold;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  padding: 2px 6px;
  margin-left: 5px;
}
</style>