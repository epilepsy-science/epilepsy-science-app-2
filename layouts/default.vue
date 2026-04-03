<template>
  <div id="epilepsy-science-app" >
    <!-- Use this to show any custom announcements on the homepage -->
    <!-- <AnnouncementBanner /> -->
    <AppHeader />
    <slot />
    <AppFooter/>
    <cookie-notice v-if="!hasAcceptedGDPR" />
  </div>
</template>

<script>
import CookieNotice from '@/components/CookieNotice/CookieNotice.vue'
export default {
  components: {
    CookieNotice,
  },
  computed: {
    hasAcceptedGDPR() {
      return useCookie('GDPR:accepted').value
    }
  },
}
</script>

<style lang="scss">
@use '~/node_modules/flexboxgrid/css/flexboxgrid.min.css';

.discover-content {
  box-sizing: border-box;
  max-width: calc(936px + 4rem);
}
</style>