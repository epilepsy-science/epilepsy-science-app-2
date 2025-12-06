<script setup>
import { ref, watch, nextTick } from "vue";
import BfButton from "~/components/Shared/BfButton/BfButton.vue";
import IconUpload from "~/components/Icons/IconUpload.vue";
import IconXCircle from "~/components/Icons/IconXCircle.vue";
import IconRemove from "~/components/Icons/IconRemove.vue";
import IconEyeball from "~/components/Icons/IconEyeball.vue";
import { useMainStore } from "~/store/index.js";
import DatasetFilesFooter from "~/components/Datasets/DatasetFilesFooter/DatasetFilesFooter.vue";
import DatasetFilesHeader from "~/components/Datasets/DatasetFilesHeader/DatasetFilesHeader.vue";

const store = useMainStore();
const DEFAULT_ARCHIVE_NAME = "pennsieve-discover-data";
const runtimeConfig = useRuntimeConfig();

const props = defineProps({
  datasetType: { type: String, default: "research" },
  datasetId: { type: Number, default: 0 },
  version: { type: Number, default: 0 },
  isEmbargoed: { type: Boolean, default: false },
  embargoedReleaseDate: { type: String, default: "" },
});

const isLoading = ref(true);
const hasError = ref(false);

// ---- Get and Manage Files ----
const getFilesUrl = computed(() => {
  const filesType = props.datasetType === "research" ? "files" : "assets";

  return props.version === 0
    ? ""
    : `${runtimeConfig.public.discover_api_host}/datasets/${props.datasetId}/versions/${props.version}/${filesType}/browse`;
});

watch(getFilesUrl, () => {
  getDatasetFiles();
});

onMounted(() => {
  getDatasetFiles();
});

const isLoggedin = ref(false);
const offset = ref(0);
const limit = ref(100);
const datasetFiles = ref([]);
const totalFileCount = ref(0);
const directoryPath = ref("");

function handleNavigateBreadcrumb(directoryPath) {
  getDatasetFiles(directoryPath);
}

function getDatasetFiles(selectedDirectoryPath = "", loadMoreFiles = false) {
  if (!loadMoreFiles) {
    offset.value = 0;
  }
  directoryPath.value = selectedDirectoryPath;
  const url = `${getFilesUrl.value}?path=${selectedDirectoryPath}&limit=${limit.value}&offset=${offset.value}`;
  useSendXhr(url)
    .then((response) => {
      switch (props.datasetType) {
        case "research":
          if (offset.value > 0) {
            response.files.forEach((resp) => {
              datasetFiles.value.push(resp);
            });
          } else {
            totalFileCount.value = response.totalCount;
            datasetFiles.value = response.files;
          }
          break;
        case "release":
          if (offset.value > 0) {
            response.assets.forEach((resp) => {
              datasetFiles.value.push(resp);
            });
          } else {
            totalFileCount.value = response.totalCount;
            datasetFiles.value = response.assets;
          }
          break;
      }
    })
    .catch((error) => {
      console.log("error", error);
      hasError.value = true;
    })
    .finally(() => {
      isLoading.value = false;
    });
}

const loadedFileCount = computed(() => {
  return datasetFiles.value.length || 0;
});

function loadMore() {
  offset.value = offset.value + limit.value;
  getDatasetFiles(directoryPath.value, true);
}

// ---- Table Functions ----
const checkAll = ref(false);
const selectedFiles = ref([]);
const fileTable = useTemplateRef("table");

const selectionCountLabel = computed(() => {
  const count = selectedFiles.value.length;
  return `${count} row${count > 1 ? "s" : ""} selected`;
});

const isIndeterminate = computed(() => {
  return (
    selectedFiles.value.length > 0 &&
    selectedFiles.value.length < datasetFiles.value.length
  );
});

function handleTableSelectionChange(files) {
  checkAll.value = files.length === loadedFileCount.value;
  selectedFiles.value = files;
}

function onCheckAllChange(shouldCheckAll) {
  if (shouldCheckAll) {
    fileTable.value.toggleAllSelection();
  } else {
    fileTable.value.clearSelection();
  }
}

function formatType(row) {
  const type = row.type.toLowerCase();
  if (type === "directory" || type === "folder") {
    return "Folder";
  } else if (type === "file") {
    return row.fileType ? row.fileType : "Not available";
  }
  return "";
}

function formatStorage(row) {
  return useFormatMetric(row.size);
}

function getFilePropertyVal(properties, key, category) {
  const prop = properties.find((p) => p.key === key && p.category === category);
  return prop ? prop.value : "";
}

function isCollectionWithViewer(row) {
  const packageType = row.packageType || "";
  if (packageType !== "Collection") {
    return false;
  }
  const packageProperties = row.properties || [];
  const collectionSubtype = getFilePropertyVal(
    packageProperties,
    "subtype",
    "Viewer"
  );
  return collectionSubtype.toLowerCase() === "pennsieve_timeseries";
}

function removeSelection(row) {
  selectedFiles.value = selectedFiles.value.filter((f) => f.path !== row.path);

  const selectedPaths = selectedFiles.value.map((s) => s.path);
  datasetFiles.value.forEach((r) => {
    fileTable.value.toggleRowSelection(r, selectedPaths.includes(r.path));
  });
}

function setPackage(data) {
  store.setSelectedPackage({
    datasetId: props.datasetId,
    version: props.version,
    files: [data],
  });
}

// ---- ZIPIT ----

const zipitUrl = computed(() => {
  return `${runtimeConfig.public.zipit_host}`;
});

// ---- DOWNLOAD ----

const downloadConfirmed = ref(false);
const showReduceSize = ref(false);
const archiveName = ref(DEFAULT_ARCHIVE_NAME);
const zipData = ref("");
const zipForm = useTemplateRef("zipForm");
const confirmDownloadVisible = ref(false);

/**
 * download is disabled if the total size is greater than the threshold, or no rows are selected
 */
const downloadDisabled = computed(() => {
  if (selectedFiles.value.length === 0) return true;
  const totalSize = selectedFiles.value.reduce(
    (total, node) => total + node.size || 0,
    0
  );

  return totalSize > runtimeConfig.public.max_download_size;
});

/**
 * determines whether the confirm download dialog should open
 */
const shouldConfirmDownload = computed(() => {
  return (
    downloadDisabled.value ||
    (selectedFiles.value.length > 1 && !downloadConfirmed.value)
  );
});

const maxDownloadSize = computed(() => {
  return useFormatMetric(runtimeConfig.public.max_download_size);
});

function onDownloadClick() {
  if (shouldConfirmDownload.value) {
    showReduceSize.value = downloadDisabled.value;
    confirmDownloadVisible.value = true;
  } else {
    executeDownload();
  }
}

async function executeDownload() {
  let token = await useGetToken();
  if (!token) {
    token = {};
  }

  const mainPayload = {
    paths: selectedFiles.value.map((f) => {
      return f.path;
    }),
    datasetId: props.datasetId,
    version: props.version,
    userToken: token,
  };

  const rootPathPayload = directoryPath.value
    ? { rootPath: directoryPath.value }
    : {};
  const archiveNamePayload =
    archiveName.value && selectedFiles.value.length > 1
      ? { archiveName: archiveName.value }
      : {};

  const payload = {
    ...mainPayload,
    ...rootPathPayload,
    ...archiveNamePayload,
  };
  zipData.value = JSON.stringify(payload);

  await nextTick();

  zipForm.value.submit(); // eslint-disable-line no-undef

  closeConfirmDownload();
}

function confirmDownload() {
  downloadConfirmed.value = true;
  onDownloadClick();
}

function closeConfirmDownload() {
  archiveName.value = DEFAULT_ARCHIVE_NAME;
  downloadConfirmed.value = false;
  showReduceSize.value = false;
  confirmDownloadVisible.value = false;
}

// ---- ROUTING ----
function getRouteParams(data) {
  const sourcePackageId = data.sourcePackageId
    ? data.sourcePackageId
    : "details";
  return { name: "package-id", params: { id: sourcePackageId } };
}
</script>

<template>
  <div class="dataset-files">
    <h3>Files</h3>
    <p v-if="isEmbargoed" class="dataset-files__message">
      This dataset is currently under embargo. Files are only visible to those
      with access to this dataset.
    </p>
    <p v-else-if="isEmbargoed && !isLoggedin" class="dataset-files__message">
      This dataset is currently under embargo. Files will be made publicly
      available on {{ embargoedReleaseDate }}.
    </p>
    <dataset-files-header
      v-if="!isEmbargoed"
      :total-file-count="totalFileCount"
      :loaded-file-count="loadedFileCount"
      :directory-path="directoryPath"
      :limit="limit"
      @navigate-breadcrumb="handleNavigateBreadcrumb"
      @load-more-files="loadMore"
    />
    <div v-if="selectedFiles.length > 0" class="selection-menu-wrap mb-16">
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
            <IconUpload class="mr-8" :height="16" :width="16" />
            <span>Download</span>
          </button>
        </li>
      </ul>
    </div>
    <el-table
      v-if="!hasError"
      ref="table"
      class="table"
      v-loading="isLoading"
      :data="datasetFiles"
      @selection-change="handleTableSelectionChange"
    >
      <el-table-column
        v-if="props.datasetType === 'research'"
        type="selection"
        align="center"
      />
      <el-table-column label="File Name">
        <template #default="scope">
          <div class="file-name-container">
            <div class="icon-wrapper">
              <img
                :src="useFileIcon(scope.row.icon, scope.row.type)"
                alt="Icon"
              />
              <IconEyeball
                v-if="isCollectionWithViewer(scope.row)"
                class="eyeball-overlay"
                :width="16"
                :height="16"
              />
            </div>
            <div v-if="formatType(scope.row) === 'Folder'" class="name">
              <ClientOnly>
                <a
                  href="#"
                  @click.prevent="
                    getDatasetFiles(scope.row.path, scope.row.name)
                  "
                >
                  {{ scope.row.name }}
                </a>
              </ClientOnly>
            </div>
            <div v-else class="name" @click="setPackage(scope.row)">
              <NuxtLink
                v-if="props.datasetType === 'research'"
                :to="getRouteParams(scope.row)"
              >
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
      <el-table-column :formatter="formatStorage" prop="size" label="Size" />

      <template #empty>
        <div class="empty-table">No files found.</div>
      </template>
    </el-table>

    <div v-if="hasError && !isEmbargoed">
      <p>Sorry, an error has occurred</p>
      <bf-button @click="getDatasetFiles"> Try again </bf-button>
    </div>

    <dataset-files-footer
      v-if="!isEmbargoed || (isEmbargoed && isLoggedin)"
      :limit="limit"
      :total-file-count="totalFileCount"
      :loaded-file-count="loadedFileCount"
      :files="datasetFiles"
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
          <el-table :show-header="false" :border="false" :data="selectedFiles">
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
        <div v-if="selectedFiles.length > 1" class="download-name">
          <label for="downloadName"> File Name </label>
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
@use "@/assets/scss/variables";

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

  :deep(.el-table::before, .el-table--group::after, .el-table--border::after) {
    background-color: variables.$cortex;
    width: 0;
  }

  .table {
    .file-name-container {
      display: flex;

      .icon-wrapper {
        position: relative;
        width: 20px;
        height: 20px;
        margin: 2px 5px 0 0;

        img {
          height: 20px;
          width: 20px;
        }

        .eyeball-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.2s ease;
          background-color: white;
          border-radius: 50%;
        }

        &:hover .eyeball-overlay {
          opacity: 1;
        }
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
