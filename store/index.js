import { defineStore } from 'pinia'
import { propOr } from 'ramda'
import { mockPageStats } from '~/data/mockData';

export const useMainStore = defineStore('main', {
  state: () => ({
    footerData: {},
    portalNotification: {},
    userProfile: null,
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
    profile: {},
    workspaces: [],
    tags: [],
    isLoadingTags: true,
    selectedPackage: {},
  }),
  getters: {
    userToken(state) {
      return propOr('', 'token', state.userProfile)
    },
    isSignedIn: (state) => {
      return Object.keys(state.profile).length > 0
    },
  },
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
    setUserProfile(value) {
      this.userProfile = value
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
    clearState() {
      this.profile = {}
      this.workspaces = []
      this.tags = []
      this.isLoadingTags = true
      this.selectedPackage = {}
    },

    updateProfile(profile) {
        this.profile = profile
    },
    setSelectedPackage(pkg) {
        this.selectedPackage = pkg
    },
    updateWorkspaces(workspaces) {
        this.workspaces = workspaces.organizations
    }
  },
  persist: {
    storage: persistedState.localStorage,
  }
})
