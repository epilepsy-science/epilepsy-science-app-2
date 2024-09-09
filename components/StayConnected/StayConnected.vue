<template>
  <div class="container py-32">
    <h2 class="heading2 subheader mb-32 mt-0">Stay Connected</h2>
    <div class="subpage py-16">
      <el-row :gutter="32">
        <el-col :xs="24" :sm="12" class="newsletter-wrap">
          <div class="heading2">Sign up for the epilepsy.science Newsletter</div>
          <div class="body1 mb-16 mt-8">Keep up to date with all the latest news and events from the epilepsy.science Portal.</div>
          <newsletter-form />
        </el-col>
        <el-col class="connect-with-us-column" :xs="24" :sm="12">
          <div class="heading2">Connect with our team</div>
          <div class="body1 mb-16 mt-8">Reach out to our team to see how your dataset can be included in the repository.</div>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSf4fzc1JysckHNI7RYLe3F5T8W2-0Nreb18JfZ3GaRqOdOpNQ/viewform" target="_blank">
            <el-button class="secondary">
              Find Out More
            </el-button>
          </a>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import NewsletterForm from '@/components/NewsletterForm/NewsletterForm.vue';

export default {
  name: 'StayConnected',
  components: {
    NewsletterForm
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.newsletter-wrap {
  font-size: 1.125rem;
  line-height: 1.5rem;
  margin-bottom: 2rem;
  @media (min-width: 48em) {
    margin-bottom: 0;
  }
  p {
    color: #e76f51
  }
}
.subpage {
  margin: 0 !important;
}
.subheader {
  text-align: center;
}
.connect-with-us-column {
  border-left: 2px solid $lineColor2;
  @media screen and (max-width: 767px) {
    border-left: none;
  }
}
</style>
