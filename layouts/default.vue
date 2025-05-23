<template>
  <div id="epilepsy-science-app" >
    <AnnouncementBanner />
    <AppHeader />
    <slot />
    <AppFooter/>
    <cookie-notice v-if="!hasAcceptedGDPR" />
  </div>
</template>

<script>
import CookieNotice from '@/components/CookieNotice/CookieNotice.vue'
import { propOr } from 'ramda'
import DOMPurify from 'isomorphic-dompurify'
import { useMainStore } from '../store/index.js'
import { mapState } from 'pinia'

export default {
  components: {
    CookieNotice,
  },
  data() {
    return {
      store: useMainStore()
    }
  },
  computed: {
    ...mapState(useMainStore, ['portalNotification']),
    hasAcceptedGDPR() {
      return useCookie('GDPR:accepted').value
    }
  },
  mounted() {
    this.showPortalNotification()
  },
  methods: {
    showPortalNotification() {
      const displayOnHomePageOnly = propOr("", 'displayOn', this.portalNotification) === 'Homepage Only'
      const currentlyOnHomePage = this.$route.fullPath === "/"
      const message = DOMPurify.sanitize(propOr("", 'message', this.portalNotification).trim(), {
        ALLOWED_TAGS: ['a', 'br', 'sup'], // We allow links, line breaks, and sup tags
        ALLOWED_ATTR: ['href'], // We allow the href attribute for links
      })
      const messageType = propOr("", 'messageType', this.portalNotification)
      const onlyShowOnce = propOr(true, 'showOnce', this.portalNotification)
      const stopShowingDate = propOr(undefined, 'stopShowingDate', this.portalNotification)
      // If the stop showing time is not set then always display message, otherwise check if the date has passed
      const stopShowing = stopShowingDate === undefined ? false : new Date(stopShowingDate).getTime() < new Date().getTime()
      if (message != "" && !stopShowing) {
        if (!onlyShowOnce || !useCookie('PortalNotification:hasBeenSeen').value || (useCookie('PortalNotification:message').value != this.portalNotification.message)) {
          if (!displayOnHomePageOnly || (displayOnHomePageOnly && currentlyOnHomePage)) {
            switch (messageType) {
              case 'Error': {
                this.$message({
                  message: message,
                  showClose: true,
                  iconClass: 'el-icon-circle-close',
                  customClass: 'el-message--error',
                  dangerouslyUseHTMLString: true,
                  duration: 0
                })
                break
              }
              case 'Success': {
                this.$message({
                  message: message,
                  showClose: true,
                  iconClass: 'el-icon-circle-check',
                  customClass: 'el-message--success',
                  dangerouslyUseHTMLString: true,
                  duration: 0
                })
                break
              }
              case 'Information': {
                this.$message({
                  message: message,
                  showClose: true,
                  iconClass: 'about-icon',
                  customClass: 'el-message--info',
                  dangerouslyUseHTMLString: true,
                  duration: 0
                })
                break
              }
            }
            const today = new Date()
            const expirationDate = new Date(today.setDate(today.getDate() + 30))
            const hasBeenSeenCookie = useCookie('PortalNotification:hasBeenSeen', { expires: expirationDate })
            hasBeenSeenCookie.value = true
            const portalNotificationMessageCookie = useCookie('PortalNotification:message')
            portalNotificationMessageCookie.value = this.portalNotification.message
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
@use '~/node_modules/flexboxgrid/css/flexboxgrid.min.css';

.discover-content {
  box-sizing: border-box;
  max-width: calc(936px + 4rem);
}
</style>