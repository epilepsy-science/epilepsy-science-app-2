<script setup>

import {ref} from 'vue'
import {pathOr, propOr} from "ramda";
const runtimeConfig = useRuntimeConfig()


import {useMainStore} from '~/store/index.js'
import BfButton from "~/components/Shared/BfButton/BfButton.vue";

const store = useMainStore()

const parentFolderPath = computed(() => {
  const files = store.selectedPackage?.files || []
  if (files.length === 0) return ''
  const filePath = files[0].path || ''
  const lastSlash = filePath.lastIndexOf('/')
  return lastSlash > 0 ? filePath.substring(0, lastSlash) : ''
})

const backToFilesRoute = computed(() => {
  const datasetId = store.selectedPackage?.datasetId
  const route = {
    name: 'datasets-datasetId',
    params: { datasetId },
    hash: '#files'
  }
  if (parentFolderPath.value) {
    route.query = { path: parentFolderPath.value }
  }
  return route
})

const backLinkLabel = 'Back to files'

const headerContent = computed(() => {
  const files = propOr(store.selectedPackage,'files',[])
  return files.length > 1 ? "Package Files": "File Details"
})

const downloadContent = computed(() => {
  const files = propOr(store.selectedPackage,'files',[])
  return files.length > 1 ? "Download Package": "Download File"
})

const zipitUrl = computed(() => {
  return `${runtimeConfig.public.zipit_api_host}`
})

const zipData = ref({})

function formatStorage(row, column, cellValue) {
  return useFormatMetric(cellValue)
}

function sizeString(sizeInBytes) {
  return useFormatMetric(sizeInBytes)
}

function onDownloadClick() {
  executeDownload()
}

const archiveName = ref('')
const selected = ref([])
const zipFormRef = ref(null)


async function executeDownload() {


  const mainPayload = {
    paths: store.selectedPackage.files.map((f) => {
      return f.path
    }),
    datasetId: store.selectedPackage.datasetId,
    version: store.selectedPackage.version,
  }

  const rootPathPayload = {} // path ? { rootPath: path.join('/') } : {}
  const archiveNamePayload =
    archiveName && selected.length > 1
      ? { archiveName: archiveName.value }
      : {}

  const payload = {
    ...mainPayload,
    ...rootPathPayload,
    ...archiveNamePayload
  }
  zipData.value = JSON.stringify(payload, undefined)

  zipFormRef.value.submit() // eslint-disable-line no-undef
}

function downloadFile(event) {
  event.preventDefault();

  const datasetId = store.selectedPackage.datasetId
  const version = store.selectedPackage.version
  const filePath = store.selectedPackage.files.map((f) => {
    return f.path
  })

  // Get PresignedUrl
  const manifestUrl = `${runtimeConfig.public.discover_api_host}/datasets/${datasetId}/versions/${version}/files/download-manifest`
  useSendXhr(manifestUrl,{
    method:"POST",
    body:{
      paths: filePath
    }
  })
    .then(response => {
      const presignedUrl = pathOr('',['data',[0],'url'], response)
      if (presignedUrl) {
        const link = document.createElement('a');
        link.href = presignedUrl;
        link.setAttribute('download',true);
        link.setAttribute('target','_blank')
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    })
}



</script>

<template>
  <div class="dataset-details">
    <div class="row between-mb action-row">
        <div class="col-xs-8 back-link-col">
          <nuxt-link :to="backToFilesRoute" class="back-link">
            <IconArrowLeft class="back-link-icon" />
            <span>{{ backLinkLabel }}</span>
          </nuxt-link>
        </div>
        <div class="col-xs row end-xs">
          <bf-button
            key="btn-get-dataset"
            class="get-dataset-button"
            @click="downloadFile"
          >
            {{downloadContent}}
          </bf-button>
        </div>
      </div>
      <div class="package-content">
        <el-table
          class="table"
          :data="store.selectedPackage.files"
          :highlight-current-row="false"
        >
          <el-table-column label="File Name">
            <template #default="scope">
              <div class="file-name-container">
                <img :src="useFileIcon(scope.row.icon, scope.row.type)" alt="" />
                <span class="name">{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="fileType" label="Type" width="120" />
          <el-table-column prop="size" label="Size" :formatter="formatStorage" width="120" />
          <el-table-column prop="uri" label="URI" min-width="240" />
        </el-table>
      </div>
  </div>
</template>

<style lang="scss" scoped>
.get-dataset-button {
  font-weight: 600;
  line-height: 16px;
  font-size: 14px;
  background-color: $purple_3;

  &:focus {
    background-color: $purple_3;
  }
}

.table {
  margin-top: 24px;

  .file-name-container {
    display: flex;
    align-items: center;
    gap: 8px;

    img {
      height: 18px;
      width: 18px;
      flex-shrink: 0;
    }

    .name {
      color: $text-color;
      word-break: break-word;
    }
  }
}

:deep(.el-table) {
  width: 100%;
  table-layout: fixed;

  .el-table__body-wrapper {
    border: solid 1px $cortex;
    border-top: none;
  }

  &::before {
    display: none;
  }

  th.is-leaf {
    background-color: $axon;
    color: #000;
    font-size: 14px;
    font-weight: 500;
    border-top: solid 1px $cortex;
    border-left: solid 1px $cortex;

    &:last-child {
      border-right: solid 1px $cortex;
    }
  }

  .el-table__header-wrapper {
    height: 40px;
  }

  td.el-table__cell {
    border-color: $cortex;
    border-right: none;
    font-size: 14px;
    color: $text-color;

    .cell {
      word-break: break-all;
      white-space: normal;
    }
  }
}

.action-row {
  align-items: center;
}

.back-link-col {
  display: flex;
  align-items: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: $purple_2;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  text-decoration: none;

  &:focus {
    color: $purple_2;
  }

  .back-link-icon {
    color: $purple_2;
    height: 10px;
    width: 10px;
    margin-right: 4px;
  }
}

.package-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
