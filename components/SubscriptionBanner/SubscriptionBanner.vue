<template>
  <div class="subscribe-section">
    <div class="content">
      <h2 class="title">Subscribe to Epilepsy.Science newsletter</h2>
      <p class="subtitle">
        We will update you when new features or data is available
      </p>
      <el-button
        class="cta-button"
        type="default"
        size="large"
        plain="true"
        href="https://forms.google.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        Subscribe here
      </el-button>
    </div>
    <div class="image-container">
      <img
        src="https://images.ctfassets.net/erzgaqq17mnz/46BUPtc8c1AJXcI8kpHrN4/8b2a49b4f55525c675330c6f4c9a55a9/epilepsy.science.png"
        alt="Brain illustration"
        class="subscription-banner-image"
      />
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped lang="scss">
.subscribe-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 1px solid black;
  background-color: #fff;
  max-width: 1200px;
  margin: 0 auto;

  .content {
    max-width: 100%;
    text-align: center;
    margin-bottom: 20px;
  }

  .title {
    font-size: 1.6rem;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .subtitle {
    font-size: 1rem;
    margin-bottom: 20px;
  }

  .cta-button {
    font-weight: bold;
  }

  .image-container {
    max-width: 100%;
    text-align: center;

    .subscription-banner-image {
      max-width: 100%;
      height: auto;
    }
  }

  // Tablet and larger screens
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;

    .content {
      max-width: 60%;
      text-align: left;
      margin-bottom: 0;
    }

    .image-container {
      max-width: 35%;
      text-align: right;
    }
  }

  // Desktop and larger screens
  @media (min-width: 1024px) {
    padding: 40px;

    .title {
      font-size: 1.8rem;
    }

    .subtitle {
      font-size: 1.2rem;
    }
  }
}
</style>