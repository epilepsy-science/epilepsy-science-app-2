<script setup>
import {ref, watch, nextTick} from "vue";
import BfButton from "~/components/Shared/BfButton/BfButton.vue";
import IconUpload from "~/components/Icons/IconUpload.vue";
import IconXCircle from "~/components/Icons/IconXCircle.vue";
import IconRemove from "~/components/Icons/IconRemove.vue";



import {useMainStore} from '~/store/index.js'

const store = useMainStore()



const ROOT_PATH_NAME = 'Root Directory'
const DEFAULT_ARCHIVE_NAME = 'pennsieve-discover-data'
const runtimeConfig = useRuntimeConfig()

const props = defineProps({
  datasetType: {type: String, default: 'research'},
  datasetId: {type: Number, default:0},
  version: {type: Number, default:0},
  isEmbargoed: {type: Boolean, default:false},
  embargoedReleaseDate: {type: String, default:''}
})

const isLoading = ref(true)
const hasError = ref(false)

// ---- Get and Manage Files ----
const getFilesUrl= computed( () => {
  const t = props.datasetType === 'research' ? "files" : "assets"

  return props.version === 0
    ? ''
    : `${runtimeConfig.public.discover_api_host}/datasets/${props.datasetId}/versions/${props.version}/${t}/browse`
})

watch(getFilesUrl, (url) => {
  getDatasetFiles()
})

onMounted(() => {
  getDatasetFiles()

})

const isLoggedin = ref(false)
const offset = ref(0)
const filePath = ref([ROOT_PATH_NAME])
const limit = ref(100)
const results = ref([])
const totalFileCount = ref(0)

function getDatasetFiles(directoryPath = '',
                         directoryName = '',
                         index = null,
                         loadMoreFiles = false,
                         breadcrumbList = []) {
  selected.value = []
  if (!loadMoreFiles) {
    offset.value = 0
  }
  if (directoryPath === ROOT_PATH_NAME) {
    // this is when going back to the root folder
    // need to reset everything
    filePath.value = [ROOT_PATH_NAME]
    directoryPath = '' // overwriting this for the endpoint call
  } else if (directoryName !== '' && !loadMoreFiles) {
    // this is when clicking a new folder
    buildDirectoryPath(directoryName, index, breadcrumbList)
  }
  const url = `${getFilesUrl.value}?path=${directoryPath}&limit=${limit.value}&offset=${offset.value}`

  useSendXhr(url)
    .then((response) => {
      switch (props.datasetType) {
        case 'research':
          if (offset > 0) {
            response.files.forEach((resp) => {
              results.value.push(resp)
            })
          } else {
            totalFileCount.value = response.totalCount
            results.value = response.files
          }
          break;
        case 'release':
          if (offset > 0) {
            response.assets.forEach((resp) => {
              results.value.push(resp)
            })
          } else {
            totalFileCount.value = response.totalCount
            results.value = response.assets
          }
      }


    })
    .catch(() => {
      hasError.value = true
    })
    .finally(() => {
      isLoading.value = false
    })
}


const loadedFileCount = computed(() => {
  // cases:
  // if the total file count is < 100, just display 1 - 10 of 10 files
  // if the file count is > 100, just display 1 - 100 of 300 files
  // when loading more, it becomes 1 - 200 of 300 files etc
  // if there are no files show as 0 - 0 of 0 files unless directed otherwise
  let msg = ''
  if (!results.value) {
    return "0"

  }else if (results.value.length === 0) {
    msg = '0 - 0'
  } else if (
    (totalFileCount.value < limit.value && totalFileCount.value > 0) ||
    results.value.length === totalFileCount.value
  ) {
    msg = `1 - ${totalFileCount.value}`
  } else {
    msg = returnLengthOrLimit
  }
  return msg
})

const returnLengthOrLimit = computed(()=> {
  if (results.value.length > 0) {
    return `1 - ${results.value.length}`
  }
  return `1 - ${limit.value}`
})

function loadMore() {
  offset.value = offset.value + limit.value
  const [, ...filePathCopy] = filePath.value
  const loadMorePath = filePathCopy.join('/')
  getDatasetFiles(loadMorePath, '', '', true)
}

// ---- Table Functions ----
const checkAll = ref(false)
const selected = ref([])

/**
 * Helps build the directory path based on
 * selection in the file route
 * @param {String} pathName
 * @param {Number} index
 * @param {Array} breadcrumbList
 */
function buildDirectoryPath(pathName, index, breadcrumbList) {
  if (index === null) {
    filePath.value.push(pathName)
    return
  }

  // this means we clicked on an item already in the array path
  if (breadcrumbList.length > 0) {
    if (!breadcrumbList.includes(ROOT_PATH_NAME)) {
      if (index === 0) {
        // this means this was the first item in that path
        // and we need to tack on Root to it
        filePath.value = [ROOT_PATH_NAME, ...breadcrumbList]
      } else {
        const currentDirectory = this.filePath.indexOf(pathName)
        filePath.value = filePath.value.slice(0, currentDirectory + 1)
      }
    } else {
      // this is coming from the dropdwon list
      filePath.value = breadcrumbList.slice(index, breadcrumbList.length)
      filePath.value.reverse()
    }
  } else {
    filePath.value = filePath.value.slice(0, index + 1)
  }
}

function handleTableSelectionChange(selection) {
  checkAll.value = selection.length === results.value.length
  selected.value = selection
}

const selectionCountLabel = computed(()=> {
  return `${selected.value.length} row${
    selected.value.length > 1 ? 's' : ''
  } selected`
})

const isIndeterminate = computed(() => {
  return (
    selected.value.length > 0 && selected.value.length < results.value.length
  )
})

const fileTable = useTemplateRef('table')

function onCheckAllChange(shouldCheckAll) {
  if (shouldCheckAll) {
    fileTable.value.toggleAllSelection()
  } else {
    fileTable.value.clearSelection()
  }
}

function formatType(row) {
  return row.type === 'Directory' || row.type === 'folder' ? 'Folder' : row.fileType
}

/**
 * Format storage column
 * @param {Object} row
 * @param {Object} column
 * @param {Number} cellValue
 * @returns {String}
 */
function formatStorage(row, column, cellValue) {
  return useFormatMetric(cellValue)
}

function removeSelection(row) {
  selected.value = selected.value.filter((f) => f.path !== row.path)

  const selectedPaths = selected.value.map((s) => s.path)
  results.value.forEach((r) => {
    fileTable.value.toggleRowSelection(r, selectedPaths.includes(r.path))
  })
}

function setPackage(data) {
  store.setSelectedPackage({datasetId: props.datasetId, version: props.version, files: [data]})
}

// ---- ZIPIT ----

const zipitUrl = computed(() => {
  return `${runtimeConfig.public.zipit_host}`
})

// ---- DOWNLOAD ----

const downloadConfirmed = ref(false)
const showReduceSize = ref(false)
const archiveName = ref(DEFAULT_ARCHIVE_NAME)
const zipData = ref('')
const zipForm = useTemplateRef('zipForm')
const confirmDownloadVisible = ref(false)

/**
 * download is disabled if the total size is greater than the threshold, or no rows are selected
 */
const downloadDisabled = computed(() => {
  if (selected.value.length === 0) return true
  const totalSize = selected.value.reduce(
    (total, node) => total + node.size || 0,
    0
  )

  return totalSize > runtimeConfig.public.max_download_size
})

/**
 * determines whether the confirm download dialog should open
 */
const shouldConfirmDownload = computed(() => {
  return (
    downloadDisabled.value ||
    (selected.value.length > 1 && !downloadConfirmed.value)
  )
})

const maxDownloadSize = computed(() => {
  return useFormatMetric(runtimeConfig.public.max_download_size)
})

function onDownloadClick() {
  if (shouldConfirmDownload.value) {
    showReduceSize.value = downloadDisabled.value
    confirmDownloadVisible.value = true
  } else {
    executeDownload()
  }
}

async function executeDownload() {

  const mainPayload = {
    paths: selected.value.map((f) => {
      return f.path
    }),
    datasetId: props.datasetId,
    version: props.version,
  }

  const [, ...path] = filePath.value
  const rootPathPayload = path ? { rootPath: path.join('/') } : {}
  const archiveNamePayload =
    archiveName.value && selected.value.length > 1
      ? { archiveName: archiveName.value }
      : {}

  const payload = {
    ...mainPayload,
    ...rootPathPayload,
    ...archiveNamePayload
  }
  zipData.value = JSON.stringify(payload, undefined)

  await nextTick()

  zipForm.value.submit() // eslint-disable-line no-undef

  closeConfirmDownload()
}

function confirmDownload() {
  downloadConfirmed.value = true
  onDownloadClick()
}

function closeConfirmDownload() {
  archiveName.value = DEFAULT_ARCHIVE_NAME
  downloadConfirmed.value = false
  showReduceSize.value = false
  confirmDownloadVisible.value = false
}

// ---- ROUTING ----
function getRouteParams(data) {
  const  sourcePackageId  = data.sourcePackageId ? data.sourcePackageId : "details"
  return { name: 'package-id',
    params: { id: sourcePackageId } }
}




</script>

<template>
  <div class="dataset-files">
    <h3>Files</h3>
    <p v-if="isEmbargoed" class="dataset-files__message">
      This dataset is currently under embargo. Files are only visible to those
      with access to this dataset.
    </p>
    <p v-if="isEmbargoed && !isLoggedin" class="dataset-files__message">
      This dataset is currently under embargo. Files will be made publicly
      available on {{ embargoedReleaseDate }}.
    </p>
    <dataset-files-header
      v-if="!isEmbargoed || (isEmbargoed && isLoggedin)"
      :file-path="filePath"
      :file-count="totalFileCount"
      :files="results"
      :limit="limit"
      :loaded-count="loadedFileCount"
      @load-more-files="loadMore"
      @get-path-dataset-files="getDatasetFiles"
    />
    <div v-if="selected.length > 0" class="selection-menu-wrap mb-16">
      <el-checkbox
        id="check-all"
        v-model="checkAll"
        :indeterminate="isIndeterminate"
        @change="onCheckAllChange"
      />

      <span id="selection-count-label">
        {{ selectionCountLabel }}
      </span>
      <ul class="selection-actions unstyled">
        <li>
          <button class="linked btn-selection-action" @click="onDownloadClick">
            <IconUpload
              class="mr-8"
              :height="16"
              :width="16"
            />
            <span>Download</span>
          </button>
        </li>
      </ul>
    </div>
    <el-table
      v-if="!hasError"
      ref="table"
      class="table"
      :v-loading="isLoading"
      :data="results"
      @selection-change="handleTableSelectionChange"
    >
      <el-table-column v-if="props.datasetType === 'research'" type="selection" align="center" />
      <el-table-column label="File Name">
        <template #default="scope">
          <div class="file-name-container">
            <img :src="useFileIcon(scope.row.icon, scope.row.type)" alt="Icon" />
            <div v-if="formatType(scope.row) === 'Folder'" class="name">
              <ClientOnly>
                <a
                  href="#"
                  @click.prevent="getDatasetFiles(scope.row.path, scope.row.name)"
                >
                  {{ scope.row.name }}
                </a>
              </ClientOnly>

            </div>
            <div v-else  class="name" @click="setPackage(scope.row)">
              <NuxtLink v-if="props.datasetType ==='research'" :to="getRouteParams(scope.row)">
                {{ scope.row.name }}
              </NuxtLink>
              <div v-else>
                {{ scope.row.name }}
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :formatter="formatType" label="Type" />
      <el-table-column prop="size" label="Size" :formatter="formatStorage" />

      <template #empty>
        <div class="empty-table">
          No files found.
        </div>
      </template>

    </el-table>

    <div v-if="hasError && !isEmbargoed">
      <p>Sorry, an error has occurred</p>
      <bf-button @click="getDatasetFiles">
        Try again
      </bf-button>
    </div>

    <dataset-files-footer
      v-if="!isEmbargoed || (isEmbargoed && isLoggedin)"
      :limit="limit"
      :file-count="totalFileCount"
      :loaded-count="loadedFileCount"
      :files="results"
      @load-more-files="loadMore"
    />

    <form ref="zipForm" method="POST" :action="zipitUrl">
      <input v-model="zipData" type="hidden" name="data" />
    </form>

    <el-dialog
      v-model="confirmDownloadVisible"
      :show-close="false"
      @close="closeConfirmDownload"
    >
      <template #header>
        <div class="bf-dialog-header">
          <span class="bf-dialog-header-title">Confirm Download</span>
          <button class="icon-close" @click="closeConfirmDownload">
            <IconRemove :height="12" :width="12" />
          </button>
        </div>
      </template>


      <div class="bf-dialog-body">
        <div v-if="showReduceSize" class="mb-24">
          <p>
            The file(s) you are trying to download exceed the limit of
            {{ maxDownloadSize }}. Please reduce the number of files selected
            and try again.
          </p>
          <el-table :show-header="false" :border="false" :data="selected">
            <el-table-column prop="name" />
            <el-table-column align="right">
              <template #default="scope">
                {{ useFormatMetric(scope.row.size) }}
                <button>
                  <IconXCircle
                    color="#bdbdbd #404554"
                    :height="28"
                    :width="28"
                    @click="removeSelection(scope.row)"
                  />
                </button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="selected.length > 1" class="download-name">
          <label for="downloadName">
            File Name
          </label>
          <el-input id="downloadName" v-model="archiveName" />
          <span>.zip</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <bf-button class="secondary" @click="closeConfirmDownload">
            Cancel
          </bf-button>
          <bf-button :disabled="downloadDisabled" @click="confirmDownload">
            Download
          </bf-button>
        </div>
      </template>

    </el-dialog>
  </div>
</template>


<style lang="scss" scoped>
@use '@/assets/scss/variables';

.dataset-files {
  position: relative;
  margin-bottom: 94px;

  &__message {
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    margin-top: 14px;
  }

  h3 {
    color: variables.$myelin;
    font-size: 16px;
    font-weight: 500;
    line-height: 40px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0;
  }

  :deep(.el-table) {
    .el-table__empty-block {
      border-left: solid 1px variables.$cortex;
      border-right: solid 1px variables.$cortex;
      border-bottom: solid 1px variables.$cortex;
    }

    .el-table__header-wrapper {
      height: 40px;
      .el-table__header {
        border-right: solid 2px variables.$axon;
        .el-table_1_column_1 {
          :deep(.el-checkbox__input) {
            margin-left: 1px;
          }
        }
        .el-table_1_column_2 {
          .cell {
            text-align: left;
          }
        }
        .el-table_1_column_3 {
          text-align: right;
        }
      }
    }

    .el-table__row {
      .el-table_1_column_2 {
        .cell {
          text-align: center;
        }
      }

      .el-table_1_column_3 {
        .cell {
          text-align: right;
        }
      }
    }

    th {
      padding: 9px 0;
    }

    .el-table__body-wrapper {
      border-bottom: none;

      .el-table__body {
        border: solid 1px variables.$cortex;
        border-bottom: none;
      }

      .el-table__row {
        border-right: solid 1px variables.$cortex;
      }
    }

    .el-table__header {
      .el-table_1_column_2 {
        text-align: center;
      }
    }

    th.is-leaf {
      background-color: variables.$axon;
      color: #000;
      font-size: 14px;
      font-weight: 500;
      margin-top: 16px;
    }

    ::before {
      height: 0;
    }

    td {
      padding: 5px 0 5px 0;
      border-color: variables.$cortex;
    }

    .el-table__empty-block {
      width: 99% !important;
      padding-right: 7px;
      margin-top: -1px;
      border-top: solid 1px variables.$cortex;
    }
  }

  :deep(.el-table .el-table__body-wrapper .el-table__body) {
    width: auto !important;
    min-width: 0;
  }

  :deep(.el-table::before,
  .el-table--group::after,
  .el-table--border::after) {
    background-color: variables.$cortex;
    width: 0;
  }

  .table {
    .file-name-container {
      display: flex;

      img {
        height: 20px;
        width: 20px;
        margin: 2px 5px 0 0;
      }

      .name {
        margin-top: 0;
      }
    }
  }

  .selection-menu-wrap {
    background: #e9edf6;
    border: 1px solid variables.$cortex;
    box-sizing: border-box;
    border-radius: 3px 3px 0 0;
    display: flex;
    padding: 11px 15px 10px;
    position: absolute;
    width: 100%;
    justify-content: space-between;
    z-index: 10;
  }

  .selection-actions {
    display: flex;
    flex: 1;
    justify-content: flex-end;
  }

  #check-all {
    margin-left: 2px;
    margin-right: 26px;
  }

  #selection-count-label {
    font-size: 12px;
    font-weight: 700;
    transform: translateY(1px);
  }

  .btn-selection-action {
    align-items: center;
    display: flex;
    font-size: 14px;
  }

  .bf-dialog-header {
    align-items: center;
    display: flex;
    position: relative;
    .icon-close {
      color: variables.$glial;
      cursor: pointer;
    }
  }

  .bf-dialog-header-title {
    flex: 1;
    font-size: 18px;
    font-weight: 400;
    line-height: 1;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #000;
  }

  .bf-dialog-body {
    word-break: normal;
  }

  .download-name {
    display: flex;
    align-items: center;
    label {
      min-width: 64px;
    }
    :deep(.el-input) {
      margin: 0 8px;
    }
  }
}
</style>
