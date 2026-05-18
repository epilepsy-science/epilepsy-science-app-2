<script setup>
import { useMainStore } from "~/store/index.js";
import { ref, onMounted, computed, shallowRef } from "vue";
import { Markdown, TextViewer, CSVViewer } from "@pennsieve-viz/core";
import "@pennsieve-viz/core/style.css";

// Dynamic imports for browser-only tsviewer
const TSViewer = shallowRef(null);
const viewerStore = shallowRef(null);
const tsViewerReady = ref(false);
const tsViewerError = ref("");

let tsViewerLoaded = Promise.resolve();
if (import.meta.client) {
  import("@pennsieve-viz/tsviewer/style.css");
  tsViewerLoaded = import("@pennsieve-viz/tsviewer").then((module) => {
    TSViewer.value = module.TSViewer;
    viewerStore.value = module.createViewerStore("package-viewer");
  });
}

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
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
const imageFileTypes = ["PNG", "JPG", "JPEG", "GIF", "SVG", "WEBP", "BMP", "ICO"]

const isReady = computed(() => !isLoading.value && !!fileType.value)

const viewerType = computed(() => {
  if (!isReady.value) return null
  const type = fileType.value.toUpperCase()
  if (timeseriesFileTypes.includes(type)) return "timeseries"
  if (csvFileTypes.includes(type)) return "csv"
  if (markdownFileTypes.includes(type)) return "markdown"
  if (textFileTypes.includes(type)) return "text"
  if (imageFileTypes.includes(type)) return "image"
  return "unsupported"
})

async function fetchViewerAssets(sourcePackageId) {
  const url = `${runtimeConfig.public.packages_api_host}/discover/assets?package_id=${encodeURIComponent(sourcePackageId)}`;
  try {
    const response = await useSendXhr(url, { method: "GET" });
    return response?.assets || [];
  } catch {
    return [];
  }
}

async function fetchPresignedUrl(filePath, datasetId, version) {
  const manifestUrl = `${runtimeConfig.public.discover_api_host}/datasets/${datasetId}/versions/${version}/files/download-manifest`;
  try {
    const response = await useSendXhr(manifestUrl, {
      method: "POST",
      body: { paths: [filePath] },
    });
    presignedUrl.value = response?.data?.[0]?.url || "";
  } catch {
    // presignedUrl stays empty; viewer won't render
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

async function initTimeseriesViewer(sourcePackageId, assetId) {
  if (!sourcePackageId && !assetId) return;
  await tsViewerLoaded;
  if (!viewerStore.value) return;
  tsViewerError.value = "";
  try {
    const apiHost = runtimeConfig.public.pennsieve_api_host;
    const wsHost = apiHost.replace(/^https?:\/\//, "wss://");
    viewerStore.value.setViewerConfig({
      timeseriesDiscoverApi: `${wsHost}/streaming/discover/ts/query`,
      apiUrl: apiHost,
    });
    const viewerParams = assetId
      ? { viewerAssetId: assetId }
      : { packageId: sourcePackageId };
    await viewerStore.value.fetchAndSetActiveViewer(viewerParams);
    tsViewerReady.value = true;
  } catch (error) {
    console.error("Failed to initialize timeseries viewer:", error);
    tsViewerError.value = "Failed to load timeseries viewer. The data source may be unavailable.";
  }
}

function processFileData(fileData, datasetId, version) {
  fileType.value = fileData.fileType || "";
  fileUri.value = fileData.uri || "";
  const type = fileType.value.toUpperCase();
  if ([...textFileTypes, ...markdownFileTypes].includes(type)) {
    loadFileContent(fileData, datasetId, version);
  }
  if ([...csvFileTypes, ...imageFileTypes].includes(type)) {
    fetchPresignedUrl(fileData.path, datasetId, version);
  }
  if (timeseriesFileTypes.includes(type)) {
    const sourcePackageId = fileData.sourcePackageId || route.params.id;
    fetchViewerAssets(sourcePackageId).then((assets) => {
      const assetId = assets.length > 0 ? assets[0].id : undefined;
      console.log('asset id is' , assetId)
      initTimeseriesViewer(sourcePackageId, assetId);
    });
  }
}

async function fetchFromSourcePackageId(sourcePackageId, datasetId, version) {
  const url = `${runtimeConfig.public.discover_api_host}/packages/${sourcePackageId}/files`;
  const response = await useSendXhr(url, { method: "GET" });
  const files = response.files || [];
  store.setSelectedPackage({ datasetId, version, files });
  if (files.length > 0) {
    processFileData(files[0], datasetId, version);
  }
}

async function fetchFromPath(datasetId, version, path) {
  const url = `${runtimeConfig.public.discover_api_host}/datasets/${datasetId}/versions/${version}/files?path=${encodeURIComponent(path)}`;
  const response = await useSendXhr(url, { method: "GET" });
  store.setSelectedPackage({ datasetId, version, files: [response] });
  processFileData(response, datasetId, version);
}

async function fetchFileDetails() {
  const selectedPackage = store.selectedPackage;
  const datasetId = Number(selectedPackage?.datasetId || route.query.datasetId);
  const version = Number(selectedPackage?.version || route.query.version);
  const path = selectedPackage?.files?.[0]?.path || route.query.path;
  const sourcePackageId = route.params.id;

  try {
    if (selectedPackage?.files?.length) {
      // Store has data (normal navigation)
      const fileData = selectedPackage.files[0];
      const existingType = (fileData.fileType || "").toUpperCase();
      if (timeseriesFileTypes.includes(existingType)) {
        processFileData(fileData, datasetId, version);
      } else {
        try {
          await fetchFromPath(datasetId, version, path);
        } catch {
          processFileData(fileData, datasetId, version);
        }
      }
    } else {
      // Store is empty (page reload) — try sourcePackageId, fall back to path
      try {
        await fetchFromSourcePackageId(sourcePackageId, datasetId, version);
      } catch {
        if (datasetId && version && path) {
          await fetchFromPath(datasetId, version, path);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch package details:", error);
  } finally {
    isLoading.value = false;
  }
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
          <component :is="TSViewer" v-if="TSViewer && tsViewerReady" instance-id="package-viewer" />
          <div v-else-if="tsViewerError" class="viewer-message viewer-message--error">{{ tsViewerError }}</div>
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

        <!-- Image Viewer -->
        <div
          v-else-if="viewerType === 'image'"
          class="image-viewer-container"
        >
          <div v-if="!presignedUrl" class="viewer-message">Loading image...</div>
          <img
            v-else
            :src="presignedUrl"
            :alt="fileType"
            class="image-viewer"
          />
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
.text-viewer-container,
.image-viewer-container {
  width: 100%;
}

.text-viewer-id {
  width: 100%;
}

.image-viewer {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
  object-fit: contain;
}
</style>
