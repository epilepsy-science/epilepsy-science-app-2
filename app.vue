<template>
  <NuxtLayout>
    <div class="loading-container" v-if="loading">
      Loading...
    </div>
    <NuxtPage />
  </NuxtLayout>
</template>

<script>
import { ref } from 'vue'
import { successMessage } from './utils/notification-messages'

export default {
  async setup() {
    const nuxtApp = useNuxtApp()
    const loading = ref(false)
    const loaded = ref(false)
    nuxtApp.hook("page:start", () => {
      setTimeout(() => {
        if (!loaded.value) {
          loading.value = true
        }
      }, 1000)
    })
    nuxtApp.hook("page:finish", () => {
      loading.value = false
      loaded.value = true
    })
    const config = useRuntimeConfig()
    return {
      loading
    }
  },
  mounted() {
    const internalTrafficCookie = useCookie(this.$config.public.INTERNAL_TRAFFIC_KEY, { default: () => 'false' })
    const internalTrafficCookieIsSet = internalTrafficCookie.value == this.$config.public.INTERNAL_TRAFFIC_VALUE
    const internalTrafficNotificationShown = useCookie('InternalTrafficNotificationShown', { default: () => false })
    if (internalTrafficCookieIsSet) {
      if (!internalTrafficNotificationShown.value) {
        successMessage('You are now recognized as an internal user and your metrics are not being tracked!')
        internalTrafficNotificationShown.value = true
      }
    } else {
      internalTrafficNotificationShown.value = false
    }
  }
}
</script>
<style lang="scss" scoped>
.loading-container {
  position: fixed;
  top: 0;
  z-index: 1;
  background-color: white;
  opacity: .5;
  width: 100vw;
  height: 100vh;
}
</style>
