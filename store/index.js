import { defineStore } from 'pinia'
import { mockPageStats } from '~/data/mockData';

export const useMainStore = defineStore('main', {
  state: () => ({
    datasetInfo: {},
    datasetTypeName: "",
    datasetFacetsData: [],
    pageStats: {
      datasets: '-',
      totalDatasetSize: '-',
      publicUsers: 0,
      universities: 0,
      files: 0,
      labs: 0,
    },
    selectedPackage: {},
  }),
  actions: {
    setDatasetInfo(value) {
      this.datasetInfo = value
    },
    setDatasetTypeName(value) {
      this.datasetTypeName = value
    },
    setDatasetFacetsData(value) {
      this.datasetFacetsData = value
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
    async fetchDatasetStats() {
      try {
        const { $algoliaClient } = useNuxtApp()
        const config = useRuntimeConfig()
        const index = $algoliaClient.initIndex(config.public.ALGOLIA_INDEX)
        const { nbHits, facets_stats } = await index.search('', {
          hitsPerPage: 0,
          analytics: false,
          facets: ['size'],
        })
        this.pageStats.datasets = nbHits
        this.pageStats.totalDatasetSize = facets_stats?.size?.sum ?? '-'
      } catch (e) {
        this.pageStats.datasets = '-'
        this.pageStats.totalDatasetSize = '-'
        console.error('Failed to fetch dataset stats from Algolia:', e)
      }
    },
    setSelectedPackage(pkg) {
      this.selectedPackage = pkg
    },
  },
})
