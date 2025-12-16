import { defineStore } from 'pinia'
import { mockPageStats } from '~/data/mockData';

export const useMainStore = defineStore('main', {
  state: () => ({
    footerData: {},
    portalNotification: {},
    datasetInfo: {},
    datasetTypeName: "",
    datasetFacetsData: [],
    pageStats: {
      datasets: 0,
      publicUsers: 0,
      universities: 0,
      files: 0,
      labs: 0,
    },
    selectedPackage: {},
  }),
  actions: {
    async init() {
      await Promise.all([, this.fetchFooterData(), this.fetchPortalNotification()])
    },
    setFooterData(value) {
      this.footerData = value
    },
    setPortalNotification(value) {
      this.portalNotification = value
    },
    setDatasetInfo(value) {
      this.datasetInfo = value
    },
    setDatasetTypeName(value) {
      this.datasetTypeName = value
    },
    setDatasetFacetsData(value) {
      this.datasetFacetsData = value
    },
    async fetchPortalNotification() {
      try {
        const response = await useNuxtApp().$contentfulClient.getEntry(useRuntimeConfig().public.ctf_portal_notification_entry_id)
        this.setPortalNotification(response.fields)
      } catch (e) {
        console.error(e)
      }
    },
    async fetchFooterData() {
      try {
        const response = await useNuxtApp().$contentfulClient.getEntry(useRuntimeConfig().public.ctf_home_page_id)
        const { footerDescription, learnMoreLinks, policiesLinks, helpUsImproveLinks, stayUpdatedLinks } = response.fields
        this.setFooterData({ footerDescription, learnMoreLinks, policiesLinks, helpUsImproveLinks, stayUpdatedLinks })
      } catch (e) {
        console.error(e)
      }
    },
    setPageStats(value) {
      this.pageStats = {
        datasets: value.datasets,
        publicUsers: value.publicUsers,
        universities: value.universities,
        files: value.files,
        labs: value.labs,
      }
    },
    loadMockPageStats() {
      this.setPageStats(mockPageStats);
    },
    setSelectedPackage(pkg) {
      this.selectedPackage = pkg
    },
  },
  persist: {
    storage: persistedState.localStorage,
  }
})
