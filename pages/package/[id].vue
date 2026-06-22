<script setup>
import { useMainStore } from "~/store/index.js";
import { ref, onMounted, computed, shallowRef, nextTick } from "vue";
import { Markdown, TextViewer, CSVViewer } from "@pennsieve-viz/core";
import "@pennsieve-viz/core/style.css";

// Dynamic imports for browser-only viewers
const TSViewer = shallowRef(null);
const viewerStore = shallowRef(null);
const tsViewerReady = ref(false);
const tsViewerError = ref("");

const OrthogonalFrame = shallowRef(null);

let tsViewerLoaded = Promise.resolve();
if (import.meta.client) {
  import("@pennsieve-viz/tsviewer/style.css");
  tsViewerLoaded = import("@pennsieve-viz/tsviewer").then((module) => {
    TSViewer.value = module.TSViewer;
    viewerStore.value = module.createViewerStore("package-viewer");
  });
  import("@pennsieve-viz/core").then((module) => {
    OrthogonalFrame.value = module.OrthogonalFrame;
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

// Orthogonal (Zarr) viewer state
const NEUROGLANCER_ASSET_TYPES = ["ome-zarr", "neuroglancer-precomputed"];
const orthogonalAssets = ref([]);
const selectedAssetIndex = ref(0);
const orthogonalEmbedUrl = runtimeConfig.public.orthogonal_viewer_url;

const selectedOrthogonalAsset = computed(
  () => orthogonalAssets.value[selectedAssetIndex.value] || null
);
const hasOrthogonalAssets = computed(() => orthogonalAssets.value.length > 0);

const timeseriesFileTypes = ["MEF", "EDF", "BDF", "NWB"]
const csvFileTypes = ["CSV", "TSV"]
const textFileTypes = ["TXT", "JSON", "XML", "LOG", "YAML", "YML"]
const markdownFileTypes = ["MD", "MARKDOWN"]
const imageFileTypes = ["PNG", "JPG", "JPEG", "GIF", "SVG", "WEBP", "BMP", "ICO"]
const neuroglancerFileTypes = ["NII", "NII.GZ", "ZARR", "OME.TIFF", "OME.TIF"]

const isReady = computed(() => !isLoading.value && !!fileType.value)
const isLoadingAssets = ref(false)

const resolvedFileType = computed(() => {
  const type = fileType.value.toUpperCase()
  const uri = fileUri.value.toLowerCase()
  // Handle compound extensions
  if (type === "GZ" && uri.endsWith(".nii.gz")) return "NII.GZ"
  if ((type === "TIFF" || type === "TIF") && uri.match(/\.ome\.tiff?$/)) return "OME.TIFF"
  return type
})

const viewerType = computed(() => {
  if (!isReady.value) return null
  const type = resolvedFileType.value
  if (timeseriesFileTypes.includes(type)) return "timeseries"
  if (csvFileTypes.includes(type)) return "csv"
  if (markdownFileTypes.includes(type)) return "markdown"
  if (textFileTypes.includes(type)) return "text"
  if (imageFileTypes.includes(type)) return "image"
  if (neuroglancerFileTypes.includes(type)) return "neuroglancer"
  return "unsupported"
})

async function fetchViewerAssets(sourcePackageId) {
  const url = `${runtimeConfig.public.packages_api_host}/discover/assets?package_id=${encodeURIComponent(sourcePackageId)}`;
  try {
    const response = await useSendXhr(url, { method: "GET" });
    const cloudfront = response?.cloudfront || null;
    const seen = new Set();
    const assets = (response?.assets || [])
      .filter((a) => {
        if (a.status !== "ready") return false;
        if (seen.has(a.asset_url)) return false;
        seen.add(a.asset_url);
        return true;
      })
      .map((a) => ({ ...a, cloudfront }));
    return assets;
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
      ? { viewerAssetId: assetId, packageId: sourcePackageId }
      : { packageId: sourcePackageId };
    await viewerStore.value.fetchAndSetActiveViewer(viewerParams);
    tsViewerReady.value = true;
  } catch (error) {
    console.error("Failed to initialize timeseries viewer:", error);
    tsViewerError.value = "Failed to load timeseries viewer. The data source may be unavailable.";
  }
}

async function processFileData(fileData, datasetId, version) {
  fileType.value = fileData.fileType || "";
  fileUri.value = fileData.uri || fileData.path || "";
  await nextTick();
  const type = resolvedFileType.value;
  if ([...textFileTypes, ...markdownFileTypes].includes(type)) {
    loadFileContent(fileData, datasetId, version);
  }
  if ([...csvFileTypes, ...imageFileTypes].includes(type)) {
    fetchPresignedUrl(fileData.path, datasetId, version);
  }

  // Fetch all viewer assets and categorize them
  const sourcePackageId = fileData.sourcePackageId || route.params.id;
  isLoadingAssets.value = true;
  fetchViewerAssets(sourcePackageId).then((assets) => {
    const tsAssets = assets.filter((a) => a.asset_type === "timeseries");
    const ngAssets = assets.filter((a) => NEUROGLANCER_ASSET_TYPES.includes(a.asset_type));

    if (ngAssets.length > 0) {
      orthogonalAssets.value = ngAssets;
      selectedAssetIndex.value = 0;
    }

    if (timeseriesFileTypes.includes(type) && tsAssets.length > 0) {
      initTimeseriesViewer(sourcePackageId, tsAssets[0].id);
    } else if (timeseriesFileTypes.includes(type)) {
      initTimeseriesViewer(sourcePackageId, undefined);
    }
  }).finally(() => {
    isLoadingAssets.value = false;
  });
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
      <h3 v-if="isReady || hasOrthogonalAssets" class="viewer-title">
        {{ hasOrthogonalAssets ? 'Orthogonal Viewer' : 'File Viewer' }}
      </h3>

      <!-- Asset tabs when multiple orthogonal assets -->
      <div v-if="hasOrthogonalAssets && orthogonalAssets.length > 1" class="viewer-tabs">
        <button
          v-for="(asset, idx) in orthogonalAssets"
          :key="asset.asset_url"
          class="viewer-tab"
          :class="{ 'viewer-tab--active': idx === selectedAssetIndex }"
          type="button"
          @click="selectedAssetIndex = idx"
        >
          {{ asset.name }}
        </button>
      </div>

      <div class="viewer-wrapper">
        <!-- Orthogonal (Zarr) Viewer -->
        <client-only v-if="hasOrthogonalAssets && selectedOrthogonalAsset">
          <component
            v-if="OrthogonalFrame"
            :is="OrthogonalFrame"
            :key="selectedOrthogonalAsset.asset_url"
            :source="selectedOrthogonalAsset.asset_url"
            :embed-url="orthogonalEmbedUrl"
            :cloudfront="selectedOrthogonalAsset.cloudfront || null"
          />
          <div v-else class="viewer-message">Loading orthogonal viewer...</div>
        </client-only>

        <!-- Loading State -->
        <div v-else-if="!isReady" class="viewer-message">
          Loading viewer...
        </div>

        <!-- Timeseries Viewer -->
        <client-only v-else-if="viewerType === 'timeseries'">
          <component :is="TSViewer" v-if="TSViewer && tsViewerReady" instance-id="package-viewer" style="min-height: 100vh;" />
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

        <!-- Neuroglancer file type waiting for assets -->
        <div v-else-if="viewerType === 'neuroglancer' && isLoadingAssets" class="viewer-message">
          Loading viewer...
        </div>
        <div v-else-if="viewerType === 'neuroglancer' && !hasOrthogonalAssets" class="viewer-message">
          No viewer assets available for this file.
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

.viewer-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 1rem;
  border-bottom: 1px solid $gray_2;
}

.viewer-tab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: $gray_4;
  cursor: pointer;

  &:hover {
    color: $purple_1;
  }

  &--active {
    color: $purple_1;
    border-bottom-color: $purple_1;
  }
}

.viewer-wrapper {
  min-height: 85vh;
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
