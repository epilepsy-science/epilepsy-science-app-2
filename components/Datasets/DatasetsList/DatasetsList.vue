<script setup>
import {computed} from "vue";
const runtimeConfig = useRuntimeConfig()

const emit = defineEmits(['clear-filters'])

const props = defineProps({
  datasetType: {
    type: String,
    default: 'research'
  },
})

defineExpose({
  getDatasets
})




onMounted((to, from) => {
  // getTags()
  getDatasets({
    publicFilter: true,
    embargoedFilter: false,
    tags: []
  })
})

const embargoedFilter = ref(false)
const publicFilter = ref(true)
const filteredTags = ref([])

const isLoading = ref(true)
const datasets = ref([])
const showSignupFooter = ref(false)

// Parameters for getDataset
const pageSize = ref(25)
const offset = ref(0)
const page = ref(1)
const totalDatasetCount = ref(0)
const getDatasetUrl = computed(() => {
  return `${runtimeConfig.public.discover_api_host}/datasets?limit=${pageSize.value}&offset=${offset.value}&datasetType=${props.datasetType}`
})

function setListOptions(options) {
  page.value = 1
  getDatasets({
    publicFilter: publicFilter.value,
    embargoedFilter: embargoedFilter.value,
    tags: filteredTags.value
  })
}

function getDatasetsPage() {
  getDatasets({
    publicFilter: publicFilter.value,
    embargoedFilter: embargoedFilter.value,
    tags: filteredTags.value
  })
}


function getDatasets(options) {

  embargoedFilter.value = options.embargoedFilter
  publicFilter.value = options.publicFilter
  filteredTags.value = options.tags

  if (!getDatasetUrl) {
    return
  }
  isLoading.value = true

  offset.value = (page.value - 1) * pageSize.value

  let url = ''
  if (
    (options.publicFilter && options.embargoedFilter) ||
    (!options.publicFilter && !options.embargoedFilter)
  ) {
    // if both are checked, apply no filters
    url = getDatasetUrl.value
  } else {
    // if either filter is checked, apply url with filters
    let filter = false
    if (options.embargoedFilter) {
      filter = options.embargoedFilter
    }
    url = getDatasetUrl.value + `&embargo=${filter}`
  }

  if (options.tags.length !== 0) {
    url = url + `&tags=${options.tags}`
  }


  useSendXhr(url,{
    header: {},
    method: 'GET',
  }).then((response) => {
    totalDatasetCount.value = response.totalCount
    datasets.value = response.datasets
    isLoading.value = false
  })
}


</script>

<template>
  <div>
    <div
      v-if="datasets.length > 0"
      class="dataset-list-controls-wrap mb-24"
    >
      <dataset-list-controls
        :total="totalDatasetCount"
        v-model:page-size="pageSize"
        @set-list-options="setListOptions"
      />

      <div class="hidden-sm-and-down">
        <el-pagination
          v-show="totalDatasetCount > pageSize"
          :page-size="pageSize"
          :pager-count="5"
          v-model:current-page="page"
          layout="prev, pager, next"
          :total="totalDatasetCount"
          @current-change="getDatasetsPage"
        />
      </div>

    </div>

    <template v-if="isLoading" >
      <dataset-list-item-loader v-for="n in 5" :key="n" />
    </template>

    <div v-else class="dataset-list">
      <template v-if="datasets.length > 0">
        <dataset-card
          v-for="dataset in datasets"
          :key="dataset.id"
          class="mb-16"
          :dataset="dataset"
        />
      </template>

      <no-search-results v-else @back="emit('clear-filters')" />
    </div>

    <div class="bottom-pagination-wrap hidden-md-and-up">
      <el-pagination
        v-show="totalDatasetCount > pageSize"
        :page-size="pageSize"
        :pager-count="5"
        v-model:current-page="page"
        layout="prev, pager, next"
        :total="totalDatasetCount"
        @current-change="getDatasetsPage"
      />
    </div>
  </div>

</template>

<style scoped lang="scss">
  .dataset-list-controls-wrap {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>