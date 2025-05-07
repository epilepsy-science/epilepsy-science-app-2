<script setup>

import {ref} from 'vue'
import {pathOr, propOr} from "ramda";
const runtimeConfig = useRuntimeConfig()


import {useMainStore} from '~/store/index.js'
import BfButton from "~/components/Shared/BfButton/BfButton.vue";

const store = useMainStore()

const headerContent = computed(() => {
  const files = propOr(store.selectedPackage,'files',[])
  return files.length > 1 ? "Package Files": "File Details"
})

const downloadContent = computed(() => {
  const files = propOr(store.selectedPackage,'files',[])
  return files.length > 1 ? "Download Package": "Download File"
})

const zipitUrl = computed(() => {
  return `${runtimeConfig.public.zipit_host}`
})

const zipData = ref({})

function formatType(row) {
  return row.fileType
}

function formatHeader(row, index) {
  return "background-color: red;"
}

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

  console.log(zipData.value)

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
    <div class="container-fluid">
      <div class="row between-mb">
        <div class="col-xs-8 header-link">
          <nuxt-link :to="{ name: 'datasets-datasetId', params: { datasetId: store.selectedPackage.datasetId } }">
            <IconArrowLeft class="header-link-icon" />
            Back to dataset
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
<!--        <div class="button-row">-->
<!--          <h3 class="package-content-title">-->
<!--            {{headerContent}}-->
<!--          </h3>-->



        <div class="file-info">
          <el-table
            ref="table"
            class="table"
            :data="store.selectedPackage.files"
            :highlight-current-row="false"
            border
            header-row-class-name="header-class"
          >
            <el-table-column label="File Name">
              <template #default="scope">
                <div class="file-name-container">
                  <img :src="useFileIcon(scope.row.icon, scope.row.type)" alt="Icon" />
                  <div class="name">
                      {{ scope.row.name }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column :formatter="formatType" label="Type" />
            <el-table-column prop="size" label="Size" :formatter="formatStorage" />
            <el-table-column prop="uri" label="URI" min-width="200px" align="right"/>

          </el-table>
        </div>

        <h3 class="package-content-title">
          Viewer
        </h3>

      </div>
    </div>


<!--    <form ref="zipFormRef" id="zipForm" method="POST" :action="downloadFile">-->
<!--      <input v-model="zipData" type="hidden" name="data" />-->
<!--    </form>-->
  </div>
</template>

<style lang="scss" scoped>

.file-info {
  margin-top: 24px;
}
.el-table--border {
  border: 1px solid $gray_2;
}



.table {
  .file-name-container {
    display: flex;

    img {
      height: 20px;
      width: 20px;
      margin: 2px 5px 0px 0px;
    }

    .name {
      margin-top: 0px;
    }
  }
}

:deep(.el-table) {
  .el-table--border {
    border:none
  }
  .el-table__header-wrapper {
    height: 40px;

    .el-table__header {
    }
  }

}

.dataset-details {
  margin-top: 24px;
}

.header-link {
  color: $purple_1;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;

  &:focus {
    color: $purple_2;

  }
  &:hover {
    text-decoration: underline;
  }

  .header-link-icon {
    color: $purple_1;
    height: 10px;
    width: 10px;
    margin-bottom: 3px;
    margin-right: 8px;
  }
}

.package-content {
  display:flex;
  flex-direction: column ;
  justify-content: space-between;

  .button-row {
    display:flex;
    flex-direction: row;
    justify-content: space-between;
  }
}

.package-content-title {
  color: $gray_4;
  font-size: 16px;
  font-weight: 500;
  line-height: 40px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


</style>
