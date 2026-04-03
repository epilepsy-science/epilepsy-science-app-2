import { defineNuxtPlugin } from '#app'
import { useMainStore } from '~/store/index'

export default defineNuxtPlugin(async (nuxtApp) => {
  const store = useMainStore(nuxtApp.$pinia)
  return {
    provide: {
      store: store
    }
  }
})
