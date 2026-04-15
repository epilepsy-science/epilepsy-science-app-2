<script setup>
import { useMainStore } from "~/store/index.js";
import { ref, onMounted, computed, shallowRef } from "vue";
import { Markdown, TextViewer, CSVViewer } from "@pennsieve-viz/core";
import "@pennsieve-viz/core/style.css";

// Dynamic imports for browser-only tsviewer
const TSViewer = shallowRef(null);
const viewerStore = shallowRef(null);

if (import.meta.client) {
  import("tsviewer/style");
  import("tsviewer").then((module) => {
    TSViewer.value = module.TSViewer;
    viewerStore.value = module.useViewerStore();
  });
}

const runtimeConfig = useRuntimeConfig();
const store = useMainStore();
const fileType = ref("");
const fileUri = ref("");
const presignedUrl = ref("");
const isLoading = ref(true);
const fileContent = ref("");
const isLoadingContent = ref(false);
const contentError = ref("");
const { fetchFileContent } = useFileContent();

const timeseriesFileTypes = ["MEF", "EDF", "BDF", "NWB"]
const csvFileTypes = ["CSV", "TSV"]
const textFileTypes = ["TXT", "JSON", "XML", "LOG", "YAML", "YML"]
const markdownFileTypes = ["MD", "MARKDOWN"]

const isReady = computed(() => !isLoading.value && !!fileType.value)

const viewerType = computed(() => {
  if (!isReady.value) return null
  const type = fileType.value.toUpperCase()
  if (timeseriesFileTypes.includes(type)) return "timeseries"
  if (csvFileTypes.includes(type)) return "csv"
  if (markdownFileTypes.includes(type)) return "markdown"
  if (textFileTypes.includes(type)) return "text"
  return "unsupported"
})

async function fetchPresignedUrl(filePath, datasetId, version) {
  const manifestUrl = `${runtimeConfig.public.discover_api_host}/datasets/${datasetId}/versions/${version}/files/download-manifest`;
  try {
    const response = await useSendXhr(manifestUrl, {
      method: "POST",
      body: { paths: [filePath] },
    });
    presignedUrl.value = response?.data?.[0]?.url || "";
  } catch {
    // presignedUrl stays empty; CSVViewer won't render
  }
}

async function loadFileContent(file, datasetId, version) {
  isLoadingContent.value = true;
  contentError.value = "";
  try {
    fileContent.value = await fetchFileContent(file, datasetId, version);
  } catch (error) {
    contentError.value = error.message || "Failed to load file content";
  } finally {
    isLoadingContent.value = false;
  }
}

function fetchFileDetails() {
  const selectedPackage = store.selectedPackage;
  if (!selectedPackage || !selectedPackage.files || selectedPackage.files.length === 0) {
    isLoading.value = false;
    return;
  }

  const fileData = selectedPackage.files[0];
  const { datasetId, version } = selectedPackage;
  const filePath = fileData.path;

  const fileDetailUrl = `${runtimeConfig.public.discover_api_host}/datasets/${datasetId}/versions/${version}/files?path=${encodeURIComponent(filePath)}`;

  useSendXhr(fileDetailUrl, { method: "GET" })
    .then((response) => {
      fileType.value = response.fileType || "";
      fileUri.value = response.uri || "";
      store.setSelectedPackage({
        datasetId,
        version,
        files: [response],
      });
      const type = (response.fileType || "").toUpperCase();
      if ([...textFileTypes, ...markdownFileTypes].includes(type)) {
        loadFileContent(response, datasetId, version);
      }
      if (csvFileTypes.includes(type)) {
        fetchPresignedUrl(response.path, datasetId, version);
      }
    })
    .catch(() => {
      fileType.value = fileData.fileType || "";
      fileUri.value = fileData.uri || "";
      const type = (fileData.fileType || "").toUpperCase();
      if ([...textFileTypes, ...markdownFileTypes].includes(type)) {
        loadFileContent(fileData, datasetId, version);
      }
      if (csvFileTypes.includes(type)) {
        fetchPresignedUrl(fileData.path, datasetId, version);
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
}

onMounted(() => {
  fetchFileDetails();
});
</script>

<template>
  <div class="package-details">
    <package-details class="package-details-content" />

    <div class="package-viewer">
      <h3 v-if="isReady" class="viewer-title">File Viewer</h3>
      <div class="viewer-wrapper">
        <!-- Loading State -->
        <div v-if="!isReady" class="viewer-message">
          Loading viewer...
        </div>

        <!-- Timeseries Viewer -->
        <client-only v-else-if="viewerType === 'timeseries'">
          <component :is="TSViewer" v-if="TSViewer" />
          <div v-else class="viewer-message">Loading viewer...</div>
        </client-only>

        <!-- CSV/TSV Viewer -->
        <div v-else-if="viewerType === 'csv'" class="csv-viewer-container">
          <CSVViewer
            v-if="presignedUrl"
            :src-url="presignedUrl"
            :file-type="fileType"
            :rows-per-page="25"
          />
        </div>

        <!-- Markdown Viewer -->
        <div
          v-else-if="viewerType === 'markdown'"
          class="markdown-viewer-container"
        >
          <div v-if="isLoadingContent" class="viewer-message">Loading markdown file...</div>
          <div v-else-if="contentError" class="viewer-message viewer-message--error">{{ contentError }}</div>
          <Markdown v-else :markdownText="fileContent" :disabled="true" />
        </div>

        <!-- Text/CSV/JSON Viewer -->
        <div
          v-else-if="viewerType === 'text'"
          class="text-viewer-container"
        >
          <div v-if="isLoadingContent" class="viewer-message">Loading file...</div>
          <div v-else-if="contentError" class="viewer-message viewer-message--error">{{ contentError }}</div>
          <div v-else class="text-viewer-id">
            <TextViewer
              :content="fileContent"
              :file-type="fileType.toLowerCase()"
              :show-line-numbers="true"
              max-height="70vh"
            />
          </div>
        </div>

        <!-- Unsupported -->
        <div v-else class="viewer-message">
          Viewer is not available for this file type.
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.package-details {
  display: flex;
  flex-direction: column;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 2rem 64px;
}

.package-details-content {
  margin-bottom: 48px;
}

.package-viewer {
  margin-top: 0;
}

.viewer-title {
  color: $gray_4;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin: 0 0 12px;
}

.viewer-wrapper {
  min-height: 200px;
}

.viewer-message {
  padding: 2rem;
  text-align: center;
  color: $gray_4;

  &--error {
    color: #cf222e;
    background-color: #ffebe9;
    border-radius: 6px;
  }
}

.csv-viewer-container,
.markdown-viewer-container,
.text-viewer-container {
  width: 100%;
}

.text-viewer-id {
  width: 100%;
}
</style>
