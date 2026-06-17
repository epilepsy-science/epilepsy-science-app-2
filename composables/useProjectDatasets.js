import { ref, computed } from 'vue'

export function useProjectDatasets(project) {
  const runtimeConfig = useRuntimeConfig()

  const datasets = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const datasetsUrl = computed(() => {
    const collectionId = project.value?.fields?.collectionIds?.[0]
    if (!collectionId) return null
    return `${runtimeConfig.public.discover_api_host}/datasets/${collectionId}/versions/1/dois?limit=200&offset=0`
  })

  async function fetchDatasets() {
    if (!datasetsUrl.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await useSendXhr(datasetsUrl.value, { header: {}, method: 'GET' })
      datasets.value = Array.isArray(response?.dois)
        ? response.dois.map((item) => item.data || item)
        : []
    } catch (fetchError) {
      console.error('Failed to fetch datasets:', fetchError)
      error.value = fetchError.message || 'Failed to load datasets'
      datasets.value = []
    } finally {
      isLoading.value = false
    }
  }

  return { datasets, isLoading, error, fetchDatasets }
}
